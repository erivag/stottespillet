import { sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { slugifyName } from "@/lib/slug";
import { products } from "@db/schema";

import { supplierDisplayLine } from "./catalog-labels";
import { golfProductsConfig } from "./golf-products-config";

export type { GolfProductConfig as GolfProductSeed } from "./golf-products-config";

function categoryCode(label: string): string {
  if (label === "Sportsutstyr") return "sports_equipment";
  return "other";
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

  const now = new Date().toISOString();
  const supplierKey = "promo_nordic" as const;

  await db.insert(products).values(
    golfProductsConfig.map((g) => ({
      name: g.name,
      slug: slugifyName(g.name),
      description:
        "description" in g && typeof g.description === "string"
          ? g.description.trim() || null
          : null,
      emoji: g.emoji,
      imageStoragePath: null,
      category: categoryCode(g.category),
      priceOre: g.priceOre,
      purchasePriceOre: null,
      supplier: supplierDisplayLine(supplierKey, null, g.supplier),
      supplierKey,
      supplierOther: null,
      allowsLogoPrint: g.logoTrykk,
      minOrderQty: g.minQty,
      deliveryTimeText: g.deliveryDays,
      stockStatus: "in_stock" as const,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    }))
  );

  return { inserted: golfProductsConfig.length, skipped: false };
}
