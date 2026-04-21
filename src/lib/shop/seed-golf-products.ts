import { sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { slugifyName } from "@/lib/slug";
import { products } from "@db/schema";

import { supplierDisplayLine } from "./catalog-labels";

export type GolfProductSeed = {
  name: string;
  emoji: string;
  /** List price per dozen in øre, excluding Norwegian VAT (25%). */
  priceOre: number;
  supplier: string;
  minQty: number;
  deliveryDays: string;
  logoTrykk: boolean;
  category: string;
  description?: string;
};

export const golfProducts: GolfProductSeed[] = [
  {
    name: "Vice Drive",
    emoji: "⛳",
    priceOre: 25500,
    supplier: "Promo Nordic",
    minQty: 6,
    deliveryDays: "10-14 dager",
    logoTrykk: true,
    category: "Sportsutstyr",
    description: "Populært valg for turneringer",
  },
  {
    name: "Vice Tour",
    emoji: "⛳",
    priceOre: 37800,
    supplier: "Promo Nordic",
    minQty: 6,
    deliveryDays: "10-14 dager",
    logoTrykk: true,
    category: "Sportsutstyr",
  },
  {
    name: "Callaway Super Soft",
    emoji: "⛳",
    priceOre: 34300,
    supplier: "Promo Nordic",
    minQty: 6,
    deliveryDays: "10-14 dager",
    logoTrykk: true,
    category: "Sportsutstyr",
  },
  {
    name: "Callaway Chrome Soft",
    emoji: "⛳",
    priceOre: 60700,
    supplier: "Promo Nordic",
    minQty: 6,
    deliveryDays: "10-14 dager",
    logoTrykk: true,
    category: "Sportsutstyr",
  },
  {
    name: "Titleist True Feel",
    emoji: "⛳",
    priceOre: 29600,
    supplier: "Promo Nordic",
    minQty: 6,
    deliveryDays: "10-14 dager",
    logoTrykk: true,
    category: "Sportsutstyr",
  },
  {
    name: "Titleist Velocity",
    emoji: "⛳",
    priceOre: 37000,
    supplier: "Promo Nordic",
    minQty: 6,
    deliveryDays: "10-14 dager",
    logoTrykk: true,
    category: "Sportsutstyr",
  },
  {
    name: "Titleist Tour Soft",
    emoji: "⛳",
    priceOre: 40500,
    supplier: "Promo Nordic",
    minQty: 6,
    deliveryDays: "10-14 dager",
    logoTrykk: true,
    category: "Sportsutstyr",
  },
  {
    name: "Titleist Pro V1x",
    emoji: "⛳",
    priceOre: 60700,
    supplier: "Promo Nordic",
    minQty: 6,
    deliveryDays: "10-14 dager",
    logoTrykk: true,
    category: "Sportsutstyr",
    description: "Premium",
  },
  {
    name: "Titleist Pro V1",
    emoji: "⛳",
    priceOre: 60700,
    supplier: "Promo Nordic",
    minQty: 6,
    deliveryDays: "10-14 dager",
    logoTrykk: true,
    category: "Sportsutstyr",
    description: "Premium",
  },
];

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
    golfProducts.map((g) => ({
      name: g.name,
      slug: slugifyName(g.name),
      description: g.description?.trim() || null,
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

  return { inserted: golfProducts.length, skipped: false };
}
