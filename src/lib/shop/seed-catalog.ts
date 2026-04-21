import { seedGolfProductsIfEmpty } from "./seed-golf-products";

/**
 * Inserts default shop products when the table is empty (golf catalog).
 */
export async function ensureShopProductsSeeded(): Promise<void> {
  await seedGolfProductsIfEmpty();
}
