/** Volume discount on golf shop orders (quantity = dusin). */
export function dozenVolumeDiscountPercent(dozens: number): number {
  if (dozens >= 100) return 15;
  if (dozens >= 70) return 12;
  if (dozens >= 50) return 10;
  if (dozens >= 30) return 5;
  return 0;
}

export function subtotalOreForDozenOrder(
  unitPriceOre: number,
  dozens: number
): number {
  return unitPriceOre * dozens;
}

export function totalOreForDozenOrder(
  unitPriceOre: number,
  dozens: number
): number {
  const pct = dozenVolumeDiscountPercent(dozens);
  return Math.round(
    (unitPriceOre * dozens * (100 - pct)) / 100
  );
}
