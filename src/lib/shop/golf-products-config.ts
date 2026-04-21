/**
 * Static golf shop catalog (no DB). Safe to import from client components.
 */
export type GolfProductConfig = {
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

export const golfProductsConfig = [
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
] as const satisfies readonly GolfProductConfig[];

/** Tuple for `z.enum` (order matches `golfProductsConfig`). */
export const golfBallOptions = [
  golfProductsConfig[0].name,
  golfProductsConfig[1].name,
  golfProductsConfig[2].name,
  golfProductsConfig[3].name,
  golfProductsConfig[4].name,
  golfProductsConfig[5].name,
  golfProductsConfig[6].name,
  golfProductsConfig[7].name,
  golfProductsConfig[8].name,
] as const;

export type GolfBallOptionName = (typeof golfBallOptions)[number];
