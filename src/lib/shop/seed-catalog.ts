import { sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { products } from "@db/schema";

import { supplierDisplayLine } from "./catalog-labels";

type SeedDef = {
  name: string;
  slug: string;
  emoji: string;
  category: string;
  priceOre: number;
  supplierKey: string;
  supplierOther: string | null;
  allowsLogoPrint: boolean;
  minOrderQty: number;
  deliveryTimeText: string;
};

const CATALOG_SEED: SeedDef[] = [
  {
    name: "Golfballer m/logo",
    slug: "golfballer-logo",
    emoji: "⛳",
    category: "sports_equipment",
    priceOre: 69_000,
    supplierKey: "promo_nordic",
    supplierOther: null,
    allowsLogoPrint: true,
    minOrderQty: 12,
    deliveryTimeText: "10-14 dager",
  },
  {
    name: "Solbriller m/logo",
    slug: "solbriller-logo",
    emoji: "🕶️",
    category: "sports_equipment",
    priceOre: 12_900,
    supplierKey: "other",
    supplierOther: "Annen leverandør",
    allowsLogoPrint: true,
    minOrderQty: 10,
    deliveryTimeText: "7-10 dager",
  },
  {
    name: "17. mai medaljer m/logo",
    slug: "17-mai-medaljer-logo",
    emoji: "🏅",
    category: "prizes_medals",
    priceOre: 1_200,
    supplierKey: "pokalbutikk",
    supplierOther: null,
    allowsLogoPrint: true,
    minOrderQty: 50,
    deliveryTimeText: "7-14 dager",
  },
  {
    name: "Refleksvester m/logo",
    slug: "refleksvester-logo",
    emoji: "🦺",
    category: "outdoor_safety",
    priceOre: 8_900,
    supplierKey: "other",
    supplierOther: "Annen leverandør",
    allowsLogoPrint: true,
    minOrderQty: 10,
    deliveryTimeText: "10-14 dager",
  },
  {
    name: "T-skjorter m/logo",
    slug: "t-skjorter-logo",
    emoji: "👕",
    category: "profile_clothing",
    priceOre: 18_900,
    supplierKey: "better_workwear",
    supplierOther: null,
    allowsLogoPrint: true,
    minOrderQty: 10,
    deliveryTimeText: "14-21 dager",
  },
  {
    name: "Caps brodert m/logo",
    slug: "caps-brodert-logo",
    emoji: "🧢",
    category: "profile_clothing",
    priceOre: 14_900,
    supplierKey: "better_workwear",
    supplierOther: null,
    allowsLogoPrint: true,
    minOrderQty: 10,
    deliveryTimeText: "14-21 dager",
  },
  {
    name: "Pokaler",
    slug: "pokaler",
    emoji: "🏆",
    category: "prizes_medals",
    priceOre: 19_900,
    supplierKey: "pokalbutikk",
    supplierOther: null,
    allowsLogoPrint: false,
    minOrderQty: 1,
    deliveryTimeText: "5-7 dager",
  },
  {
    name: "Refleksbeger m/logo",
    slug: "refleksbeger-logo",
    emoji: "☕",
    category: "profile_clothing",
    priceOre: 4_500,
    supplierKey: "other",
    supplierOther: "Annen leverandør",
    allowsLogoPrint: true,
    minOrderQty: 20,
    deliveryTimeText: "10-14 dager",
  },
  {
    name: "Ballonger m/trykk",
    slug: "ballonger-trykk",
    emoji: "🎈",
    category: "other",
    priceOre: 400,
    supplierKey: "promo_nordic",
    supplierOther: null,
    allowsLogoPrint: true,
    minOrderQty: 100,
    deliveryTimeText: "7-10 dager",
  },
];

/**
 * Inserts default giveaway products when the table is empty (dev/demo).
 */
export async function ensureShopProductsSeeded(): Promise<void> {
  const [cntRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(products);

  if (Number(cntRow?.count ?? 0) > 0) {
    return;
  }

  const now = new Date().toISOString();

  await db.insert(products).values(
    CATALOG_SEED.map((d) => ({
      name: d.name,
      slug: d.slug,
      description: null,
      emoji: d.emoji,
      imageStoragePath: null,
      category: d.category,
      priceOre: d.priceOre,
      purchasePriceOre: null,
      supplier: supplierDisplayLine(d.supplierKey, d.supplierOther, null),
      supplierKey: d.supplierKey,
      supplierOther: d.supplierOther,
      allowsLogoPrint: d.allowsLogoPrint,
      minOrderQty: d.minOrderQty,
      deliveryTimeText: d.deliveryTimeText,
      stockStatus: "in_stock",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    }))
  );
}
