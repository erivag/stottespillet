import { and, eq, ne } from "drizzle-orm";

import { db } from "@/lib/db";
import { campaigns, organizations } from "@db/schema";

export type SponsorLandingData = {
  organizationName: string;
  title: string;
  amountOre: number;
  exposureDescription: string | null;
  campaignType: string;
  quantity: number | null;
  eventDate: string | null;
  status: string;
};

export async function loadSponsorLandingByToken(
  token: string
): Promise<SponsorLandingData | null> {
  const tok = token.trim();
  if (tok.length < 16) return null;

  const [row] = await db
    .select({
      organizationName: organizations.name,
      title: campaigns.title,
      amountOre: campaigns.amountOre,
      exposureDescription: campaigns.exposureDescription,
      campaignType: campaigns.campaignType,
      quantity: campaigns.quantity,
      eventDate: campaigns.eventDate,
      status: campaigns.status,
    })
    .from(campaigns)
    .innerJoin(
      organizations,
      eq(campaigns.organizationId, organizations.id)
    )
    .where(
      and(
        eq(campaigns.sponsorShareToken, tok),
        ne(campaigns.status, "cancelled")
      )
    )
    .limit(1);

  return row ?? null;
}
