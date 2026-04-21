import { sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { slugifyName } from "@/lib/slug";
import { products } from "@db/schema";

import {
  golfProductsConfig,
  type GolfProductConfig,
} from "./golf-products-config";

export type { GolfProductConfig as GolfProductSeed } from "./golf-products-config";

function buildDescription(g: GolfProductConfig): string | null {
  const parts = [
    g.description?.trim(),
    `${g.emoji} Golfequipment.`,
    `Minimum ${g.minQty} dusin per ordre. Levering: ${g.deliveryDays}.`,
    g.logoTrykk ? "Logo-trykk kan bestilles." : null,
  ].filter(Boolean) as string[];
  const text = parts.join("\n\n");
  return text.length > 0 ? text : null;
}

/**
 * Inserts the 9 golf products when `products` is empty (idempotent).
 */
export async function seedGolfProductsIfEmpty(): Promise<{
  inserted: number;
  skipped: boolean;
}> {
  const [cntRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(products);

  if (Number(cntRow?.count ?? 0) > 0) {
    return { inserted: 0, skipped: true };
  }

  await db.insert(products).values(
    golfProductsConfig.map((g) => ({
      name: g.name,
      slug: slugifyName(g.name),
      description: buildDescription(g),
      priceOre: g.priceOre,
      supplier: g.supplier,
      isActive: true,
    }))
  );

  return { inserted: golfProductsConfig.length, skipped: false };
}
