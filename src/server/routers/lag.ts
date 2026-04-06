import { TRPCError } from "@trpc/server";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { z } from "zod";

import { SPLEIS_TYPES } from "@/lib/catalog/spleis-types";
import { db } from "@/lib/db";
import { sendAdminOrderNotification } from "@/lib/resend/send-admin-order-notification";
import { supplierDisplayLine } from "@/lib/shop/catalog-labels";
import {
  campaigns,
  matches,
  orders,
  organizations,
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

export const lagRouter = router({
  dashboard: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

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
    const [org] = await db
      .select({
        name: organizations.name,
        segment: organizations.segment,
        municipality: organizations.municipality,
      })
      .from(organizations)
      .where(eq(organizations.userId, ctx.user.id))
      .limit(1);

    return {
      email: ctx.user.email ?? "",
      organization: org
        ? {
            name: org.name,
            segment: org.segment,
            municipality: org.municipality,
          }
        : null,
    };
  }),

  updateOrganization: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Navn er påkrevd").max(200),
        segment: z.string().max(100).optional().nullable(),
        municipality: z.string().max(100).optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const now = new Date().toISOString();
      const [existing] = await db
        .select({ id: organizations.id })
        .from(organizations)
        .where(eq(organizations.userId, ctx.user.id))
        .limit(1);

      const segment =
        input.segment?.trim() === "" ? null : input.segment?.trim() ?? null;
      const municipality =
        input.municipality?.trim() === ""
          ? null
          : input.municipality?.trim() ?? null;

      if (existing) {
        await db
          .update(organizations)
          .set({
            name: input.name.trim(),
            segment,
            municipality,
            updatedAt: now,
          })
          .where(eq(organizations.id, existing.id));
      } else {
        await db.insert(organizations).values({
          userId: ctx.user.id,
          name: input.name.trim(),
          segment,
          municipality,
        });
      }

      return { ok: true as const };
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
      const totalOre = unitPriceOre * input.quantity;
      const now = new Date().toISOString();

      const notes = input.supplierNotes?.trim() || null;
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
        supplierNotes: notes,
        status: "pending",
        totalOre,
        createdAt: now,
        updatedAt: now,
      });

      const totalKrFormatted = new Intl.NumberFormat("nb-NO", {
        style: "currency",
        currency: "NOK",
        maximumFractionDigits: 0,
      }).format(totalOre / 100);

      try {
        await sendAdminOrderNotification({
          organizationName: org.name,
          contactEmail: ctx.user.email ?? "(ikke tilgjengelig)",
          productName: product.name,
          quantity: input.quantity,
          totalKrFormatted,
          deliveryAddress: deliveryLine,
          supplierNotes: notes,
          logoStoragePath: null,
          supplierLine: supplierDisplayLine(
            product.supplierKey,
            product.supplierOther,
            product.supplier
          ),
        });
      } catch (e) {
        console.error("sendAdminOrderNotification failed", e);
      }

      return { ok: true as const };
    }),
});
