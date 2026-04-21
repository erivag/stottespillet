import { randomBytes } from "node:crypto";

import { TRPCError } from "@trpc/server";
import { and, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import { z } from "zod";

import { SPLEIS_TYPES } from "@/lib/catalog/spleis-types";
import { searchBrreg } from "@/lib/brreg/search";
import { EMPTY_LAG_DASHBOARD } from "@/lib/dashboard-fallbacks";
import { db } from "@/lib/db";
import { sendAdminOrderNotification } from "@/lib/resend/send-admin-order-notification";
import { sendShopBookingEmails } from "@/lib/resend/send-shop-booking-emails";
import { supplierDisplayLine } from "@/lib/shop/catalog-labels";
import {
  dozenVolumeDiscountPercent,
  subtotalOreForDozenOrder,
  totalOreForDozenOrder,
} from "@/lib/shop/volume-discount";
import {
  brregCache,
  campaigns,
  matches,
  orders,
  organizations,
  outreachEmails,
  products,
  socialPosts,
  spleises,
  sponsors,
} from "@db/schema";

import { ensureShopProductsSeeded } from "@/lib/shop/seed-catalog";

import { protectedProcedure, publicProcedure, router } from "../trpc";

function spleisTypeLabel(type: string): string {
  const found = SPLEIS_TYPES.find((t) => t.value === type);
  return found?.label ?? type;
}

type ActivityKind = "match" | "order";

async function assertCampaignOwnedByUser(
  campaignId: string,
  userId: string
): Promise<void> {
  const [row] = await db
    .select({ id: campaigns.id })
    .from(campaigns)
    .innerJoin(organizations, eq(campaigns.organizationId, organizations.id))
    .where(
      and(eq(campaigns.id, campaignId), eq(organizations.userId, userId))
    )
    .limit(1);

  if (!row) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Kampanje ikke funnet.",
    });
  }
}

async function upsertBrregCacheRow(
  organizationNumber: string,
  payload: Record<string, unknown>
): Promise<void> {
  const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 7 * 86400000).toISOString();
  await db
    .insert(brregCache)
    .values({
      organizationNumber,
      payload,
      fetchedAt: now,
      expiresAt,
    })
    .onConflictDoUpdate({
      target: brregCache.organizationNumber,
      set: {
        payload: sql`excluded.payload`,
        fetchedAt: sql`excluded.fetched_at`,
        expiresAt: sql`excluded.expires_at`,
      },
    });
}

export const lagRouter = router({
  dashboard: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

    try {
      const [org] = await db
        .select({
          id: organizations.id,
          name: organizations.name,
        })
        .from(organizations)
        .where(eq(organizations.userId, userId))
        .limit(1);

      if (!org) {
        return {
          organizationName: null as string | null,
          sponsorFundsOre: 0,
          activeApplications: 0,
          productOrdersCount: 0,
          unreadResponses: 0,
          recentActivity: [] as {
            id: string;
            kind: ActivityKind;
            title: string;
            detail: string;
            occurredAt: string;
          }[],
        };
      }

      try {
    const [paidRow] = await db
      .select({
        total: sql<number>`coalesce(sum(${matches.amountOre}), 0)::bigint`,
      })
      .from(matches)
      .innerJoin(campaigns, eq(matches.campaignId, campaigns.id))
      .where(
        and(
          eq(campaigns.organizationId, org.id),
          eq(matches.status, "paid")
        )
      );

    const [activeRow] = await db
      .select({
        count: sql<number>`count(*)::int`,
      })
      .from(campaigns)
      .where(
        and(
          eq(campaigns.organizationId, org.id),
          eq(campaigns.status, "active")
        )
      );

    const [ordersRow] = await db
      .select({
        count: sql<number>`count(*)::int`,
      })
      .from(orders)
      .where(eq(orders.organizationId, org.id));

    const [unreadRow] = await db
      .select({
        count: sql<number>`count(*)::int`,
      })
      .from(matches)
      .innerJoin(campaigns, eq(matches.campaignId, campaigns.id))
      .where(
        and(
          eq(campaigns.organizationId, org.id),
          inArray(matches.status, ["pending", "checkout"])
        )
      );

    const matchActivity = await db
      .select({
        id: matches.id,
        campaignTitle: campaigns.title,
        sponsorName: sponsors.companyName,
        status: matches.status,
        updatedAt: matches.updatedAt,
      })
      .from(matches)
      .innerJoin(campaigns, eq(matches.campaignId, campaigns.id))
      .innerJoin(sponsors, eq(matches.sponsorId, sponsors.id))
      .where(eq(campaigns.organizationId, org.id))
      .orderBy(desc(matches.updatedAt))
      .limit(6);

    const orderActivity = await db
      .select({
        id: orders.id,
        status: orders.status,
        totalOre: orders.totalOre,
        updatedAt: orders.updatedAt,
      })
      .from(orders)
      .where(eq(orders.organizationId, org.id))
      .orderBy(desc(orders.updatedAt))
      .limit(6);

    const statusLabel = (
      s: "pending" | "checkout" | "paid" | "cancelled"
    ): string => {
      switch (s) {
        case "pending":
          return "Venter på svar";
        case "checkout":
          return "Klar for betaling";
        case "paid":
          return "Betalt";
        case "cancelled":
          return "Avslått";
      }
    };

    const orderStatusLabel = (
      s: "draft" | "pending" | "paid" | "fulfilled" | "cancelled"
    ): string => {
      switch (s) {
        case "draft":
          return "Utkast";
        case "pending":
          return "Venter";
        case "paid":
          return "Betalt";
        case "fulfilled":
          return "Levert";
        case "cancelled":
          return "Avbrutt";
      }
    };

    type Act = {
      id: string;
      kind: ActivityKind;
      title: string;
      detail: string;
      occurredAt: string;
    };

    const merged: Act[] = [
      ...matchActivity.map((m) => ({
        id: `m-${m.id}`,
        kind: "match" as const,
        title: m.campaignTitle,
        detail: `${m.sponsorName} · ${statusLabel(m.status)}`,
        occurredAt: m.updatedAt,
      })),
      ...orderActivity.map((o) => ({
        id: `o-${o.id}`,
        kind: "order" as const,
        title: "Produktordre",
        detail: `${orderStatusLabel(o.status)} · ${(o.totalOre / 100).toLocaleString("nb-NO")} kr`,
        occurredAt: o.updatedAt,
      })),
    ];

    merged.sort(
      (a, b) =>
        new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
    );

    const recentActivity = merged.slice(0, 10);

        return {
          organizationName: org.name,
          sponsorFundsOre: Number(paidRow?.total ?? 0),
          activeApplications: activeRow?.count ?? 0,
          productOrdersCount: ordersRow?.count ?? 0,
          unreadResponses: unreadRow?.count ?? 0,
          recentActivity,
        };
      } catch (innerErr) {
        console.error(
          "[lag.dashboard] aggregate/activity query failed",
          innerErr
        );
        return {
          organizationName: org.name,
          sponsorFundsOre: 0,
          activeApplications: 0,
          productOrdersCount: 0,
          unreadResponses: 0,
          recentActivity: [] as {
            id: string;
            kind: ActivityKind;
            title: string;
            detail: string;
            occurredAt: string;
          }[],
          loadFailed: true as const,
        };
      }
    } catch (err) {
      console.error("[lag.dashboard] database error", err);
      return { ...EMPTY_LAG_DASHBOARD, loadFailed: true as const };
    }
  }),

  myCampaigns: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      return {
        items: [] as {
          id: string;
          title: string;
          status: string;
          amountOre: number;
          campaignType: string;
          updatedAt: string;
        }[],
      };
    }

    const userId = ctx.user.id;
    const [org] = await db
      .select({ id: organizations.id })
      .from(organizations)
      .where(eq(organizations.userId, userId))
      .limit(1);

    if (!org) {
      return { items: [] as { id: string; title: string; status: string; amountOre: number; campaignType: string; updatedAt: string }[] };
    }

    const rows = await db
      .select({
        id: campaigns.id,
        title: campaigns.title,
        status: campaigns.status,
        amountOre: campaigns.amountOre,
        campaignType: campaigns.campaignType,
        updatedAt: campaigns.updatedAt,
      })
      .from(campaigns)
      .where(eq(campaigns.organizationId, org.id))
      .orderBy(desc(campaigns.updatedAt));

    return { items: rows };
  }),

  mySpleises: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      return {
        items: [] as {
          id: string;
          title: string;
          type: string;
          typeLabel: string;
          status: string;
          targetAmountOre: number;
          updatedAt: string;
        }[],
      };
    }

    const userId = ctx.user.id;
    const [org] = await db
      .select({ id: organizations.id })
      .from(organizations)
      .where(eq(organizations.userId, userId))
      .limit(1);

    if (!org) {
      return {
        items: [] as {
          id: string;
          title: string;
          type: string;
          typeLabel: string;
          status: string;
          targetAmountOre: number;
          updatedAt: string;
        }[],
      };
    }

    const rows = await db
      .select({
        id: spleises.id,
        title: spleises.title,
        type: spleises.type,
        status: spleises.status,
        targetAmountOre: spleises.targetAmountOre,
        updatedAt: spleises.updatedAt,
      })
      .from(spleises)
      .where(eq(spleises.organizationId, org.id))
      .orderBy(desc(spleises.updatedAt));

    return {
      items: rows.map((r) => ({
        ...r,
        typeLabel: spleisTypeLabel(r.type),
      })),
    };
  }),

  mySocialPosts: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      return {
        items: [] as {
          id: string;
          content: string;
          platform: string;
          status: string;
          postedAt: string | null;
          createdAt: string;
        }[],
      };
    }

    const userId = ctx.user.id;
    const [org] = await db
      .select({ id: organizations.id })
      .from(organizations)
      .where(eq(organizations.userId, userId))
      .limit(1);

    if (!org) {
      return {
        items: [] as {
          id: string;
          content: string;
          platform: string;
          status: string;
          postedAt: string | null;
          createdAt: string;
        }[],
      };
    }

    const rows = await db
      .select({
        id: socialPosts.id,
        content: socialPosts.content,
        platform: socialPosts.platform,
        status: socialPosts.status,
        postedAt: socialPosts.postedAt,
        createdAt: socialPosts.createdAt,
      })
      .from(socialPosts)
      .where(eq(socialPosts.organizationId, org.id))
      .orderBy(desc(socialPosts.createdAt));

    return { items: rows };
  }),

  organizationSettings: protectedProcedure.query(async ({ ctx }) => {
    try {
      const [org] = await db
        .select({
          name: organizations.name,
          type: organizations.type,
          municipality: organizations.municipality,
          contactName: organizations.contactName,
          phone: organizations.phone,
          postalCode: organizations.postalCode,
          city: organizations.city,
          orgNr: organizations.orgNr,
        })
        .from(organizations)
        .where(eq(organizations.userId, ctx.user.id))
        .limit(1);

      return {
        email: ctx.user.email ?? "",
        organization: org
          ? {
              name: org.name,
              type: org.type,
              municipality: org.municipality,
              contactName: org.contactName,
              phone: org.phone,
              postalCode: org.postalCode,
              city: org.city,
              orgNr: org.orgNr,
            }
          : null,
      };
    } catch (err) {
      console.error("[lag.organizationSettings] database error", err);
      return {
        email: ctx.user.email ?? "",
        organization: null as null,
      };
    }
  }),

  /** Poststed fra postnummer (Bring shippingguide API). */
  postalCodeLookup: protectedProcedure
    .input(z.object({ postalCode: z.string().regex(/^\d{4}$/) }))
    .mutation(async ({ input }) => {
      try {
        const url = new URL(
          "https://api.bring.com/shippingguide/api/postalCode.json"
        );
        url.searchParams.set("clientUrl", "støttespillet.no");
        url.searchParams.set("pnr", input.postalCode);
        url.searchParams.set("countryCode", "NO");
        const res = await fetch(url.toString());
        if (!res.ok) {
          return { city: null as string | null };
        }
        const json = (await res.json()) as {
          result?: string;
          valid?: boolean;
        };
        if (
          json.valid !== true ||
          typeof json.result !== "string" ||
          json.result.trim().length === 0
        ) {
          return { city: null as string | null };
        }
        const raw = json.result.trim();
        const city = raw
          .split("-")
          .map((segment) =>
            segment
              .split(/\s+/)
              .map((w) =>
                w.length === 0 ? w : w.charAt(0) + w.slice(1).toLowerCase()
              )
              .join(" ")
          )
          .join("-");
        return { city };
      } catch (e) {
        console.error("[lag.postalCodeLookup]", e);
        return { city: null as string | null };
      }
    }),

  updateOrganization: protectedProcedure
    .input(
      z
        .object({
          name: z.string().min(1, "Lagnavn er påkrevd").max(200),
          type: z.string().min(1, "Velg type").max(100),
          municipality: z
            .string()
            .min(1, "Kommune er påkrevd")
            .max(100),
          postalCode: z
            .string()
            .regex(/^\d{4}$/, "Postnummer må være 4 siffer"),
          city: z.string().min(1, "Sted er påkrevd").max(120),
          orgNr: z.string().max(20).optional().nullable(),
          contactName: z
            .string()
            .min(1, "Kontaktperson er påkrevd")
            .max(200),
          phone: z.string().max(50).optional().nullable(),
        })
        .superRefine((data, ctx) => {
          const o = data.orgNr?.trim() ?? "";
          if (o !== "" && !/^\d{9}$/.test(o)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Org.nummer må være nøyaktig 9 siffer",
              path: ["orgNr"],
            });
          }
        })
    )
    .mutation(async ({ ctx, input }) => {
      const now = new Date().toISOString();
      const [existing] = await db
        .select({ id: organizations.id })
        .from(organizations)
        .where(eq(organizations.userId, ctx.user.id))
        .limit(1);

      const orgType = input.type.trim();
      const municipality = input.municipality.trim();
      const postalCode = input.postalCode.trim();
      const city = input.city.trim();
      const orgNrRaw = input.orgNr?.trim() ?? "";
      const orgNr = orgNrRaw === "" ? null : orgNrRaw;
      const contactName = input.contactName.trim();
      const phoneRaw = input.phone?.trim() ?? "";
      const phone = phoneRaw === "" ? null : phoneRaw;

      if (existing) {
        await db
          .update(organizations)
          .set({
            name: input.name.trim(),
            type: orgType,
            municipality,
            postalCode,
            city,
            orgNr,
            contactName,
            phone,
            updatedAt: now,
          })
          .where(eq(organizations.id, existing.id));
      } else {
        await db.insert(organizations).values({
          userId: ctx.user.id,
          name: input.name.trim(),
          type: orgType,
          municipality,
          postalCode,
          city,
          orgNr,
          contactName,
          phone,
        });
      }

      return { ok: true as const };
    }),

  createCampaignDraft: protectedProcedure
    .input(
      z
        .object({
          title: z.string().min(1, "Tittel er påkrevd").max(200),
          campaignType: z.enum([
            "golfballer_logo",
            "turnering",
            "drakter_utstyr",
            "cupreise",
            "sesongstart",
            "annet_pengestotte",
          ]),
          /** Beløp i kr (påkrevd unntatt for golfballer — da beregnes fra dusin). */
          amountKr: z.number().positive().max(50_000_000).optional(),
          /** Antall dusin (golfballer), minst 6. */
          quantityDusin: z.number().int().min(6).max(10_000).optional(),
          eventDate: z.string().optional().nullable(),
          exposureDescription: z
            .string()
            .min(1, "Beskriv hva sponsor får")
            .max(4000),
        })
        .superRefine((data, ctx) => {
          if (data.campaignType === "golfballer_logo") {
            if (data.quantityDusin == null) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Oppgi antall dusin.",
                path: ["quantityDusin"],
              });
            }
          } else if (data.amountKr == null || data.amountKr <= 0) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Oppgi beløp i kroner.",
              path: ["amountKr"],
            });
          }
        })
    )
    .mutation(async ({ ctx, input }) => {
      const [org] = await db
        .select({ id: organizations.id })
        .from(organizations)
        .where(eq(organizations.userId, ctx.user.id))
        .limit(1);

      if (!org) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Opprett lagprofil under Innstillinger først.",
        });
      }

      const PRICE_VICE_DRIVE_PER_DUSIN_KR = 319;
      const isGolf = input.campaignType === "golfballer_logo";
      const amountKr = isGolf
        ? (input.quantityDusin ?? 0) * PRICE_VICE_DRIVE_PER_DUSIN_KR
        : (input.amountKr ?? 0);
      const quantity = isGolf ? (input.quantityDusin ?? null) : null;

      const now = new Date().toISOString();
      const amountOre = Math.round(amountKr * 100);
      const eventRaw = input.eventDate?.trim();
      const eventDate =
        eventRaw && eventRaw.length > 0
          ? new Date(eventRaw).toISOString()
          : null;

      const [row] = await db
        .insert(campaigns)
        .values({
          organizationId: org.id,
          title: input.title.trim(),
          description: null,
          campaignType: input.campaignType,
          amountOre,
          eventDate,
          quantity,
          exposureDescription: input.exposureDescription.trim(),
          status: "draft",
          createdAt: now,
          updatedAt: now,
        })
        .returning({ id: campaigns.id });

      if (!row) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Kunne ikke opprette kampanje.",
        });
      }

      return { campaignId: row.id };
    }),

  findSponsors: protectedProcedure
    .input(
      z.object({
        campaignId: z.string().uuid(),
        industries: z.array(z.string()).optional(),
        maxResults: z.number().int().min(1).max(100).default(20),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await assertCampaignOwnedByUser(input.campaignId, ctx.user.id);

      const [org] = await db
        .select({
          postalCode: organizations.postalCode,
        })
        .from(organizations)
        .where(eq(organizations.userId, ctx.user.id))
        .limit(1);

      const postal = org?.postalCode?.replace(/\D/g, "").slice(0, 4) ?? "";
      if (postal.length !== 4) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Legg til postnummer i innstillinger først.",
        });
      }

      const industry = input.industries?.find((s) => s.trim().length > 0);
      const { companies, rawEnheter } = await searchBrreg({
        postalCode: postal,
        industry: industry?.trim(),
        size: input.maxResults,
        page: 0,
      });

      for (const raw of rawEnheter) {
        const nr = String(raw.organisasjonsnummer ?? "").replace(/\D/g, "");
        if (nr.length !== 9) continue;
        await upsertBrregCacheRow(nr, raw as Record<string, unknown>);
      }

      return { bedrifter: companies, total: companies.length };
    }),

  submitCampaignOutreach: protectedProcedure
    .input(
      z.object({
        campaignId: z.string().uuid(),
        selections: z
          .array(
            z.object({
              orgNr: z.string().regex(/^\d{9}$/),
              name: z.string().min(1),
              industry: z.string().optional().nullable(),
              address: z.string().optional().nullable(),
              postalCode: z.string().optional().nullable(),
              municipality: z.string().optional().nullable(),
              email: z.string().email().optional().nullable(),
              phone: z.string().optional().nullable(),
              employees: z.number().int().nonnegative().optional(),
            })
          )
          .min(5)
          .max(20),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await assertCampaignOwnedByUser(input.campaignId, ctx.user.id);

      const now = new Date().toISOString();

      await db
        .delete(outreachEmails)
        .where(
          and(
            eq(outreachEmails.campaignId, input.campaignId),
            eq(outreachEmails.status, "draft"),
            isNull(outreachEmails.sponsorId)
          )
        );

      for (const s of input.selections) {
        const emailTrim = s.email?.trim() ?? "";
        const toEmail =
          emailTrim.length > 0
            ? emailTrim
            : `utkast+${s.orgNr}@ingen-epost.stottespillet.no`;

        const subject = `Sponsorsøknad — ${s.name}`;
        const bodyParts = [
          "Hei,",
          "",
          "Dette er et utkast til henvendelse fra et idrettslag/komité via Støttespillet.",
          "E-post er ikke sendt ennå.",
          "",
          s.industry ? `Bransje (Brønnøysund): ${s.industry}` : null,
          s.address ? `Adresse: ${s.address}` : null,
          s.postalCode || s.municipality
            ? `Poststed: ${[s.postalCode, s.municipality].filter(Boolean).join(" ")}`
            : null,
          typeof s.employees === "number" ? `Ansatte (registrert): ${s.employees}` : null,
          s.phone ? `Telefon (registrert): ${s.phone}` : null,
          "",
          "Med vennlig hilsen,",
          "Støttespillet",
        ];
        const body = bodyParts.filter(Boolean).join("\n");

        await db.insert(outreachEmails).values({
          campaignId: input.campaignId,
          sponsorId: null,
          prospectOrgNr: s.orgNr,
          prospectCompanyName: s.name,
          toEmail,
          subject,
          body,
          trackingToken: randomBytes(24).toString("hex"),
          status: "draft",
          createdAt: now,
        });
      }

      await db
        .update(campaigns)
        .set({ status: "active", updatedAt: now })
        .where(eq(campaigns.id, input.campaignId));

      return { ok: true as const, count: input.selections.length };
    }),

  listShopProducts: publicProcedure.query(async () => {
    await ensureShopProductsSeeded();

    const rows = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        description: products.description,
        emoji: products.emoji,
        imageStoragePath: products.imageStoragePath,
        priceOre: products.priceOre,
        allowsLogoPrint: products.allowsLogoPrint,
        minOrderQty: products.minOrderQty,
        deliveryTimeText: products.deliveryTimeText,
        stockStatus: products.stockStatus,
      })
      .from(products)
      .where(eq(products.isActive, true))
      .orderBy(desc(products.createdAt));

    return { items: rows };
  }),

  placeShopOrder: protectedProcedure
    .input(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().min(1).max(100_000),
        supplierNotes: z.string().max(2000).optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [org] = await db
        .select({
          id: organizations.id,
          name: organizations.name,
        })
        .from(organizations)
        .where(eq(organizations.userId, ctx.user.id))
        .limit(1);

      if (!org) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Opprett lagprofil under Innstillinger før du bestiller.",
        });
      }

      const [product] = await db
        .select()
        .from(products)
        .where(
          and(eq(products.id, input.productId), eq(products.isActive, true))
        )
        .limit(1);

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Produktet finnes ikke eller er ikke tilgjengelig.",
        });
      }

      if (input.quantity < product.minOrderQty) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Minimum antall er ${product.minOrderQty}.`,
        });
      }

      if (product.stockStatus === "out_of_stock") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Produktet er utsolgt.",
        });
      }

      const unitPriceOre = product.priceOre;
      const discountPct = dozenVolumeDiscountPercent(input.quantity);
      const subtotalOre = subtotalOreForDozenOrder(
        unitPriceOre,
        input.quantity
      );
      const totalOre = totalOreForDozenOrder(unitPriceOre, input.quantity);
      const now = new Date().toISOString();

      const userNote = input.supplierNotes?.trim() || null;
      const metaLines = [
        userNote,
        `Antall dusin: ${input.quantity}`,
        discountPct > 0 ? `Volumrabatt: ${discountPct}%` : null,
        `Sum før rabatt: ${subtotalOre} øre`,
      ].filter(Boolean);
      const combinedNotes = metaLines.join("\n");
      const deliveryLine =
        "Forespørsel via shop – leveringsadresse og logo avtales med laget.";

      await db.insert(orders).values({
        organizationId: org.id,
        matchId: null,
        productId: product.id,
        quantity: input.quantity,
        unitPriceOre,
        logoStoragePath: null,
        deliveryAddress: deliveryLine,
        supplierNotes: combinedNotes,
        status: "pending",
        totalOre,
        createdAt: now,
        updatedAt: now,
      });

      const kr = (ore: number) =>
        new Intl.NumberFormat("nb-NO", {
          style: "currency",
          currency: "NOK",
          maximumFractionDigits: 0,
        }).format(ore / 100);

      const totalKrFormatted = kr(totalOre);
      const subtotalKrFormatted = kr(subtotalOre);
      const unitPriceKrFormatted = kr(unitPriceOre);
      const supplierLine = supplierDisplayLine(
        product.supplierKey,
        product.supplierOther,
        product.supplier
      );

      try {
        await sendShopBookingEmails({
          organizationName: org.name,
          contactEmail: ctx.user.email ?? "(ikke tilgjengelig)",
          productName: product.name,
          dozens: input.quantity,
          unitPriceKrFormatted,
          discountPercent: discountPct,
          subtotalKrFormatted,
          totalKrFormatted,
          supplierNotes: combinedNotes,
          supplierLine,
        });
      } catch (e) {
        console.error("sendShopBookingEmails failed", e);
      }

      try {
        await sendAdminOrderNotification({
          organizationName: org.name,
          contactEmail: ctx.user.email ?? "(ikke tilgjengelig)",
          productName: product.name,
          quantity: input.quantity,
          totalKrFormatted,
          deliveryAddress: deliveryLine,
          supplierNotes: combinedNotes,
          logoStoragePath: null,
          supplierLine,
        });
      } catch (e) {
        console.error("sendAdminOrderNotification failed", e);
      }

      return { ok: true as const };
    }),
});
