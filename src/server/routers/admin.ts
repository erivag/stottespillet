import { TRPCError } from "@trpc/server";
import { and, desc, eq, ilike, inArray, sql } from "drizzle-orm";
import { z } from "zod";

import { isAdminUserId } from "@/lib/admin";
import { EMPTY_ADMIN_DASHBOARD } from "@/lib/dashboard-fallbacks";
import { db } from "@/lib/db";
import {
  adminProductFormSchema,
  adminProductUpdateSchema,
} from "@/lib/shop/product-zod";
import { supplierDisplayLine } from "@/lib/shop/catalog-labels";
import { randomSlugSuffix, slugifyName } from "@/lib/slug";
import {
  campaigns,
  matches,
  orders,
  organizations,
  outreachEmails,
  products,
  spleises,
  sponsors,
} from "@db/schema";

import { protectedProcedure, router } from "../trpc";

const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (!isAdminUserId(ctx.user.id)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Du har ikke administrator-tilgang.",
    });
  }
  return next({ ctx });
});

export const adminRouter = router({
  dashboard: adminProcedure.query(async () => {
    try {
    const [orgCountRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(organizations);

    const [sponsorCountRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(sponsors);

    const [sponsoredRow] = await db
      .select({
        total: sql<number>`coalesce(sum(${matches.amountOre}), 0)::bigint`,
      })
      .from(matches)
      .where(eq(matches.status, "paid"));

    const [activeSpleisRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(spleises)
      .where(eq(spleises.status, "active"));

    const [newOrgs7Row] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(organizations)
      .where(
        sql`${organizations.createdAt} >= (now() - interval '7 days')`
      );

    const [emailsSent7Row] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(outreachEmails)
      .where(
        and(
          eq(outreachEmails.status, "sent"),
          sql`coalesce(${outreachEmails.sentAt}, ${outreachEmails.createdAt}) >= (now() - interval '7 days')`
        )
      );

    const [ordersPendingRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(orders)
      .where(inArray(orders.status, ["draft", "pending"]));

    const recentOrganizations = await db
      .select({
        id: organizations.id,
        name: organizations.name,
        type: organizations.type,
        createdAt: organizations.createdAt,
      })
      .from(organizations)
      .orderBy(desc(organizations.createdAt))
      .limit(5);

    const recentOrderRows = await db
      .select({
        id: orders.id,
        totalOre: orders.totalOre,
        status: orders.status,
        createdAt: orders.createdAt,
        organizationName: organizations.name,
      })
      .from(orders)
      .innerJoin(
        organizations,
        eq(orders.organizationId, organizations.id)
      )
      .orderBy(desc(orders.createdAt))
      .limit(5);

    return {
      organizationsCount: orgCountRow?.count ?? 0,
      sponsorsCount: sponsorCountRow?.count ?? 0,
      totalSponsoredOre: Number(sponsoredRow?.total ?? 0),
      activeSpleisesCount: activeSpleisRow?.count ?? 0,
      newOrganizationsLast7Days: newOrgs7Row?.count ?? 0,
      emailsSentLast7Days: emailsSent7Row?.count ?? 0,
      ordersPendingTreatment: ordersPendingRow?.count ?? 0,
      recentOrganizations,
      recentOrders: recentOrderRows.map((r) => ({
        id: r.id,
        organizationName: r.organizationName,
        totalOre: r.totalOre,
        status: r.status,
        createdAt: r.createdAt,
        productLabel: null as string | null,
      })),
    };
    } catch (err) {
      console.error("[admin.dashboard] database error", err);
      return EMPTY_ADMIN_DASHBOARD;
    }
  }),

  listOrganizations: adminProcedure
    .input(
      z.object({
        search: z.string().optional(),
        segment: z.string().optional().nullable(),
      })
    )
    .query(async ({ input }) => {
      const search = input.search?.trim();
      const conditions = [];

      if (search && search.length > 0) {
        const safe = search.replace(/[%_]/g, "\\$&");
        conditions.push(ilike(organizations.name, `%${safe}%`));
      }
      if (input.segment && input.segment.length > 0) {
        conditions.push(eq(organizations.type, input.segment));
      }

      const whereClause =
        conditions.length > 0 ? and(...conditions) : undefined;

      const orgRows = await db
        .select({
          id: organizations.id,
          name: organizations.name,
          type: organizations.type,
          municipality: organizations.municipality,
          createdAt: organizations.createdAt,
        })
        .from(organizations)
        .where(whereClause)
        .orderBy(desc(organizations.createdAt));

      if (orgRows.length === 0) {
        return { items: [] };
      }

      const orgIds = orgRows.map((o) => o.id);

      const campaignAgg = await db
        .select({
          organizationId: campaigns.organizationId,
          count: sql<number>`count(*)::int`,
        })
        .from(campaigns)
        .where(inArray(campaigns.organizationId, orgIds))
        .groupBy(campaigns.organizationId);

      const orderAgg = await db
        .select({
          organizationId: orders.organizationId,
          count: sql<number>`count(*)::int`,
        })
        .from(orders)
        .where(inArray(orders.organizationId, orgIds))
        .groupBy(orders.organizationId);

      const activeOrgRows = await db
        .select({ organizationId: campaigns.organizationId })
        .from(campaigns)
        .where(
          and(
            inArray(campaigns.organizationId, orgIds),
            eq(campaigns.status, "active")
          )
        )
        .groupBy(campaigns.organizationId);

      const campaignMap = new Map(
        campaignAgg.map((r) => [r.organizationId, Number(r.count)])
      );
      const orderMap = new Map(
        orderAgg.map((r) => [r.organizationId, Number(r.count)])
      );
      const activeSet = new Set(activeOrgRows.map((r) => r.organizationId));

      const items = orgRows.map((o) => ({
        id: o.id,
        name: o.name,
        type: o.type,
        municipality: o.municipality,
        createdAt: o.createdAt,
        campaignCount: campaignMap.get(o.id) ?? 0,
        orderCount: orderMap.get(o.id) ?? 0,
        isActive: activeSet.has(o.id),
      }));

      return { items };
    }),

  getOrganization: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      const [org] = await db
        .select()
        .from(organizations)
        .where(eq(organizations.id, input.id))
        .limit(1);

      if (!org) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Lag ikke funnet.",
        });
      }

      const [campCount] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(campaigns)
        .where(eq(campaigns.organizationId, org.id));

      const [ordCount] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(orders)
        .where(eq(orders.organizationId, org.id));

      const recentCampaigns = await db
        .select({
          id: campaigns.id,
          title: campaigns.title,
          status: campaigns.status,
          amountOre: campaigns.amountOre,
          updatedAt: campaigns.updatedAt,
        })
        .from(campaigns)
        .where(eq(campaigns.organizationId, org.id))
        .orderBy(desc(campaigns.updatedAt))
        .limit(8);

      const recentOrders = await db
        .select({
          id: orders.id,
          status: orders.status,
          totalOre: orders.totalOre,
          createdAt: orders.createdAt,
        })
        .from(orders)
        .where(eq(orders.organizationId, org.id))
        .orderBy(desc(orders.createdAt))
        .limit(8);

      const hasActive = await db
        .select({ id: campaigns.id })
        .from(campaigns)
        .where(
          and(
            eq(campaigns.organizationId, org.id),
            eq(campaigns.status, "active")
          )
        )
        .limit(1);

      return {
        organization: {
          id: org.id,
          name: org.name,
          type: org.type,
          municipality: org.municipality,
          createdAt: org.createdAt,
          updatedAt: org.updatedAt,
          isActive: hasActive.length > 0,
        },
        stats: {
          campaignCount: campCount?.count ?? 0,
          orderCount: ordCount?.count ?? 0,
        },
        recentCampaigns,
        recentOrders,
      };
    }),

  listSponsors: adminProcedure.query(async () => {
    const sponsorRows = await db
      .select({
        id: sponsors.id,
        companyName: sponsors.companyName,
        organizationNumber: sponsors.organizationNumber,
        contactName: sponsors.contactName,
        createdAt: sponsors.createdAt,
      })
      .from(sponsors)
      .orderBy(desc(sponsors.createdAt));

    if (sponsorRows.length === 0) {
      return { items: [] };
    }

    const sponsorIds = sponsorRows.map((s) => s.id);

    const paidAgg = await db
      .select({
        sponsorId: matches.sponsorId,
        total: sql<number>`coalesce(sum(${matches.amountOre}), 0)::bigint`,
      })
      .from(matches)
      .where(
        and(
          inArray(matches.sponsorId, sponsorIds),
          eq(matches.status, "paid")
        )
      )
      .groupBy(matches.sponsorId);

    const activeAgg = await db
      .select({
        sponsorId: matches.sponsorId,
        count: sql<number>`count(*)::int`,
      })
      .from(matches)
      .where(
        and(
          inArray(matches.sponsorId, sponsorIds),
          inArray(matches.status, ["checkout", "paid"])
        )
      )
      .groupBy(matches.sponsorId);

    const paidMap = new Map(paidAgg.map((r) => [r.sponsorId, Number(r.total)]));
    const activeMap = new Map(
      activeAgg.map((r) => [r.sponsorId, Number(r.count)])
    );

    const items = sponsorRows.map((r) => ({
      id: r.id,
      companyName: r.companyName,
      organizationNumber: r.organizationNumber,
      contactName: r.contactName,
      createdAt: r.createdAt,
      totalSponsoredOre: paidMap.get(r.id) ?? 0,
      activeSponsoratsCount: activeMap.get(r.id) ?? 0,
    }));

    return { items };
  }),

  listCampaigns: adminProcedure
    .input(
      z.object({
        statusFilter: z
          .enum(["all", "active", "closed", "draft", "cancelled"])
          .default("all"),
      })
    )
    .query(async ({ input }) => {
      let statusCond:
        | ReturnType<typeof eq>
        | ReturnType<typeof inArray>
        | undefined;
      switch (input.statusFilter) {
        case "active":
          statusCond = eq(campaigns.status, "active");
          break;
        case "draft":
          statusCond = eq(campaigns.status, "draft");
          break;
        case "cancelled":
          statusCond = eq(campaigns.status, "cancelled");
          break;
        case "closed":
          statusCond = inArray(campaigns.status, ["completed", "cancelled"]);
          break;
        default:
          statusCond = undefined;
      }

      const base = db
        .select({
          id: campaigns.id,
          title: campaigns.title,
          campaignType: campaigns.campaignType,
          amountOre: campaigns.amountOre,
          status: campaigns.status,
          updatedAt: campaigns.updatedAt,
          organizationName: organizations.name,
        })
        .from(campaigns)
        .innerJoin(
          organizations,
          eq(campaigns.organizationId, organizations.id)
        );

      const rows = statusCond
        ? await base.where(statusCond).orderBy(desc(campaigns.updatedAt))
        : await base.orderBy(desc(campaigns.updatedAt));

      return { items: rows };
    }),

  listOrders: adminProcedure.query(async () => {
    const rows = await db
      .select({
        id: orders.id,
        organizationName: organizations.name,
        productName: products.name,
        quantity: orders.quantity,
        totalOre: orders.totalOre,
        status: orders.status,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .innerJoin(
        organizations,
        eq(orders.organizationId, organizations.id)
      )
      .leftJoin(products, eq(orders.productId, products.id))
      .orderBy(desc(orders.createdAt));

    return { items: rows };
  }),

  listProducts: adminProcedure.query(async () => {
    const rows = await db
      .select()
      .from(products)
      .orderBy(desc(products.createdAt));

    return { items: rows };
  }),

  getProduct: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      const [row] = await db
        .select()
        .from(products)
        .where(eq(products.id, input.id))
        .limit(1);

      if (!row) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Produkt ikke funnet.",
        });
      }

      return row;
    }),

  createProduct: adminProcedure
    .input(adminProductFormSchema)
    .mutation(async ({ input }) => {
      const now = new Date().toISOString();
      const base = slugifyName(input.name);
      let slug = base;
      let slugOk = false;
      for (let i = 0; i < 20; i++) {
        const [hit] = await db
          .select({ id: products.id })
          .from(products)
          .where(eq(products.slug, slug))
          .limit(1);
        if (!hit) {
          slugOk = true;
          break;
        }
        slug = `${base}-${randomSlugSuffix()}`;
      }
      if (!slugOk) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Kunne ikke generere unik lenke (slug) for produktet.",
        });
      }

      const supplierOther =
        input.supplierKey === "other"
          ? (input.supplierOther?.trim() ?? null)
          : null;

      await db.insert(products).values({
        name: input.name.trim(),
        slug,
        description: input.description?.trim() || null,
        emoji: input.emoji?.trim() || null,
        imageStoragePath: input.imageStoragePath?.trim() || null,
        category: input.category,
        priceOre: input.priceKr * 100,
        purchasePriceOre:
          input.purchasePriceKr != null ? input.purchasePriceKr * 100 : null,
        supplier: supplierDisplayLine(input.supplierKey, supplierOther),
        supplierKey: input.supplierKey,
        supplierOther,
        allowsLogoPrint: input.allowsLogoPrint,
        minOrderQty: input.minOrderQty,
        deliveryTimeText: input.deliveryTimeText?.trim() || null,
        stockStatus: input.stockStatus,
        isActive: input.isActive,
        updatedAt: now,
      });

      return { ok: true as const };
    }),

  updateProduct: adminProcedure
    .input(adminProductUpdateSchema)
    .mutation(async ({ input }) => {
      const now = new Date().toISOString();
      const [existing] = await db
        .select({ id: products.id })
        .from(products)
        .where(eq(products.id, input.id))
        .limit(1);

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Produkt ikke funnet.",
        });
      }

      const supplierOther =
        input.supplierKey === "other"
          ? (input.supplierOther?.trim() ?? null)
          : null;

      await db
        .update(products)
        .set({
          name: input.name.trim(),
          description: input.description?.trim() || null,
          emoji: input.emoji?.trim() || null,
          imageStoragePath: input.imageStoragePath?.trim() || null,
          category: input.category,
          priceOre: input.priceKr * 100,
          purchasePriceOre:
            input.purchasePriceKr != null ? input.purchasePriceKr * 100 : null,
          supplier: supplierDisplayLine(input.supplierKey, supplierOther),
          supplierKey: input.supplierKey,
          supplierOther,
          allowsLogoPrint: input.allowsLogoPrint,
          minOrderQty: input.minOrderQty,
          deliveryTimeText: input.deliveryTimeText?.trim() || null,
          stockStatus: input.stockStatus,
          isActive: input.isActive,
          updatedAt: now,
        })
        .where(eq(products.id, input.id));

      return { ok: true as const };
    }),

  deleteProduct: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      const [cntRow] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(orders)
        .where(eq(orders.productId, input.id));

      const cnt = Number(cntRow?.count ?? 0);
      if (cnt > 0) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message:
            "Produktet kan ikke slettes fordi det finnes ordrer som refererer til det.",
        });
      }

      await db.delete(products).where(eq(products.id, input.id));
      return { ok: true as const };
    }),

  listEmails: adminProcedure.query(async () => {
    const rows = await db
      .select({
        id: outreachEmails.id,
        toEmail: outreachEmails.toEmail,
        subject: outreachEmails.subject,
        status: outreachEmails.status,
        sentAt: outreachEmails.sentAt,
        createdAt: outreachEmails.createdAt,
        campaignTitle: campaigns.title,
        organizationName: organizations.name,
        sponsorName: sql<string>`coalesce(${sponsors.companyName}, ${outreachEmails.prospectCompanyName})`,
      })
      .from(outreachEmails)
      .innerJoin(campaigns, eq(outreachEmails.campaignId, campaigns.id))
      .innerJoin(
        organizations,
        eq(campaigns.organizationId, organizations.id)
      )
      .leftJoin(sponsors, eq(outreachEmails.sponsorId, sponsors.id))
      .orderBy(desc(outreachEmails.createdAt))
      .limit(200);

    return { items: rows };
  }),

  listSpleises: adminProcedure.query(async () => {
    const rows = await db
      .select({
        id: spleises.id,
        title: spleises.title,
        type: spleises.type,
        status: spleises.status,
        targetAmountOre: spleises.targetAmountOre,
        updatedAt: spleises.updatedAt,
        organizationName: organizations.name,
      })
      .from(spleises)
      .innerJoin(
        organizations,
        eq(spleises.organizationId, organizations.id)
      )
      .orderBy(desc(spleises.updatedAt));

    return { items: rows };
  }),
});
