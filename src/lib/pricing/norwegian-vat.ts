/** Standard Norwegian VAT; list prices for B2B are stored and shown ex. this rate. */
export const NORWEGIAN_VAT_RATE = 0.25;

export const PRICE_EX_VAT_SUFFIX = "eks. MVA";

/** Short hint shown under business-facing prices. */
export const VAT_HINT_SHORT = "+ 25% MVA";

export function mvaOreFromNetOre(netOre: number): number {
  return Math.round(netOre * NORWEGIAN_VAT_RATE);
}

export function grossOreFromNetOre(netOre: number): number {
  return netOre + mvaOreFromNetOre(netOre);
}
