export const PRODUCT_CATEGORY_OPTIONS = [
  { value: "profile_clothing", label: "Profilklær" },
  { value: "prizes_medals", label: "Premier og medaljer" },
  { value: "sports_equipment", label: "Sportsutstyr" },
  { value: "outdoor_safety", label: "Friluft og sikkerhet" },
  { value: "other", label: "Annet" },
] as const;

export const SUPPLIER_OPTIONS = [
  { value: "better_workwear", label: "Better WorkWear" },
  { value: "pokalbutikk", label: "Pokalbutikk" },
  { value: "promo_nordic", label: "Promo Nordic" },
  { value: "maritim_nabo", label: "Maritim nabo" },
  { value: "other", label: "Annen" },
] as const;

export const STOCK_STATUS_OPTIONS = [
  { value: "in_stock", label: "På lager" },
  { value: "low_stock", label: "Lav lagerbeholdning" },
  { value: "out_of_stock", label: "Utsolgt" },
] as const;

export type ProductCategoryValue =
  (typeof PRODUCT_CATEGORY_OPTIONS)[number]["value"];
export type SupplierKeyValue = (typeof SUPPLIER_OPTIONS)[number]["value"];
export type StockStatusValue = (typeof STOCK_STATUS_OPTIONS)[number]["value"];

export function productCategoryNb(code: string): string {
  const f = PRODUCT_CATEGORY_OPTIONS.find((o) => o.value === code);
  return f?.label ?? code;
}

export function supplierKeyNb(code: string): string {
  const f = SUPPLIER_OPTIONS.find((o) => o.value === code);
  return f?.label ?? code;
}

export function stockStatusNb(code: string): string {
  const f = STOCK_STATUS_OPTIONS.find((o) => o.value === code);
  return f?.label ?? code;
}

export function supplierDisplayLine(
  supplierKey: string | null | undefined,
  supplierOther: string | null | undefined,
  legacySupplier?: string | null
): string {
  if (supplierKey === "other" && supplierOther?.trim()) {
    return supplierOther.trim();
  }
  if (
    (!supplierKey || supplierKey === "other") &&
    legacySupplier?.trim()
  ) {
    return legacySupplier.trim();
  }
  if (!supplierKey) {
    return "—";
  }
  return supplierKeyNb(supplierKey);
}
