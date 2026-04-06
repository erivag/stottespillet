/** Katalog — CLAUDE.md §3.2 (veiledende priser, ikke brukerdata). */
export type GiveawayProduct = {
  slug: string;
  name: string;
  supplier: string;
  priceLabel: string;
};

export const GIVEAWAY_PRODUCTS: readonly GiveawayProduct[] = [
  {
    slug: "golfballer-titleist",
    name: "Golfballer Titleist m/logo",
    supplier: "Promo Nordic",
    priceLabel: "fra kr 690 / 12 stk",
  },
  {
    slug: "solbriller-logo",
    name: "Solbriller m/logo",
    supplier: "Leverandør etter avtale",
    priceLabel: "fra kr 129 / stk",
  },
  {
    slug: "17mai-medaljer",
    name: "17. mai-medaljer m/logo",
    supplier: "Pokalbutikk",
    priceLabel: "fra kr 12 / stk",
  },
  {
    slug: "refleksvester",
    name: "Refleksvester m/logo",
    supplier: "Grossist etter avtale",
    priceLabel: "fra kr 89 / stk",
  },
  {
    slug: "tskjorter",
    name: "T-skjorter m/logo",
    supplier: "Better WorkWear",
    priceLabel: "fra kr 189 / stk",
  },
  {
    slug: "caps-brodert",
    name: "Caps brodert m/logo",
    supplier: "Better WorkWear",
    priceLabel: "fra kr 149 / stk",
  },
  {
    slug: "pokaler",
    name: "Pokaler",
    supplier: "Pokalbutikk",
    priceLabel: "fra kr 199 / stk",
  },
  {
    slug: "refleksbeger",
    name: "Refleksbeger m/logo",
    supplier: "Grossist etter avtale",
    priceLabel: "fra kr 45 / stk",
  },
  {
    slug: "ballonger",
    name: "Ballonger m/trykk",
    supplier: "Promo Nordic",
    priceLabel: "fra kr 4 / stk",
  },
  {
    slug: "redningsvester",
    name: "Redningsvester barn",
    supplier: "Maritim leverandør",
    priceLabel: "fra kr 299 / stk",
  },
  {
    slug: "krabbeteiner",
    name: "Krabbeteiner (basar)",
    supplier: "Maritim leverandør",
    priceLabel: "Basar / etter avtale",
  },
] as const;
