import { TRPCError } from "@trpc/server";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/lib/db";
import { campaigns, matches, sponsors } from "@db/schema";

import { protectedProcedure, router } from "../trpc";

export const bedriftRouter = router({
  dashboard: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

    const [sponsor] = await db
      .select({
        id: sponsors.id,
        companyName: sponsors.companyName,
        annualBudgetOre: sponsors.annualBudgetOre,
      })
      .from(sponsors)
      .where(eq(sponsors.userId, userId))
      .limit(1);

    if (!sponsor) {
      return {
        companyName: null as string | null,
        annualBudgetOre: null as number | null,
        usedBudgetOre: 0,
        newRequestsCount: 0,
        activeSponsoratsCount: 0,
        supportedOrganizationsCount: 0,
        pendingMatches: [] as {
          id: string;
          campaignTitle: string;
          amountOre: number;
          updatedAt: string;
        }[],
      };
    }

    const [usedRow] = await db
      .select({
        total: sql<number>`coalesce(sum(${matches.amountOre}), 0)::bigint`,
      })
      .from(matches)
      .where(
        and(
          eq(matches.sponsorId, sponsor.id),
          eq(matches.status, "paid")
        )
      );

    const [newReqRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(matches)
      .where(
        and(eq(matches.sponsorId, sponsor.id), eq(matches.status, "pending"))
      );

    const [activeRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(matches)
      .where(
        and(
          eq(matches.sponsorId, sponsor.id),
          inArray(matches.status, ["checkout", "paid"])
        )
      );

    const [supportedRow] = await db
      .select({
        count: sql<number>`count(distinct ${campaigns.organizationId})::int`,
      })
      .from(matches)
      .innerJoin(campaigns, eq(matches.campaignId, campaigns.id))
      .where(
        and(eq(matches.sponsorId, sponsor.id), eq(matches.status, "paid"))
      );

    const pendingRows = await db
      .select({
        id: matches.id,
        campaignTitle: campaigns.title,
        amountOre: matches.amountOre,
        updatedAt: matches.updatedAt,
      })
      .from(matches)
      .innerJoin(campaigns, eq(matches.campaignId, campaigns.id))
      .where(
        and(eq(matches.sponsorId, sponsor.id), eq(matches.status, "pending"))
      )
      .orderBy(desc(matches.updatedAt))
      .limit(12);

    return {
      companyName: sponsor.companyName,
      annualBudgetOre: sponsor.annualBudgetOre,
      usedBudgetOre: Number(usedRow?.total ?? 0),
      newRequestsCount: newReqRow?.count ?? 0,
      activeSponsoratsCount: activeRow?.count ?? 0,
      supportedOrganizationsCount: supportedRow?.count ?? 0,
      pendingMatches: pendingRows.map((r) => ({
        id: r.id,
        campaignTitle: r.campaignTitle,
        amountOre: r.amountOre,
        updatedAt: r.updatedAt,
      })),
    };
  }),

  respondToMatch: protectedProcedure
    .input(
      z.object({
        matchId: z.string().uuid(),
        action: z.enum(["approve", "decline"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      const [sponsor] = await db
        .select({ id: sponsors.id })
        .from(sponsors)
        .where(eq(sponsors.userId, userId))
        .limit(1);

      if (!sponsor) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Ingen bedrift funnet for brukeren.",
        });
      }

      const [row] = await db
        .select({ id: matches.id, status: matches.status })
        .from(matches)
        .where(
          and(
            eq(matches.id, input.matchId),
            eq(matches.sponsorId, sponsor.id)
          )
        )
        .limit(1);

      if (!row || row.status !== "pending") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Forespørselen finnes ikke eller er allerede behandlet.",
        });
      }

      const nextStatus = input.action === "approve" ? "checkout" : "cancelled";

      await db
        .update(matches)
        .set({
          status: nextStatus,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(matches.id, input.matchId));

      return { ok: true as const, status: nextStatus };
    }),
});
