import { z } from "zod";

const PRODUCT_CATEGORIES = [
  "profile_clothing",
  "prizes_medals",
  "sports_equipment",
  "outdoor_safety",
  "other",
] as const;

const SUPPLIER_KEYS = [
  "better_workwear",
  "pokalbutikk",
  "promo_nordic",
  "maritim_nabo",
  "other",
] as const;

const STOCK_STATUSES = ["in_stock", "low_stock", "out_of_stock"] as const;

const categoryEnum = z.enum(PRODUCT_CATEGORIES);
const supplierEnum = z.enum(SUPPLIER_KEYS);
const stockEnum = z.enum(STOCK_STATUSES);

function supplierOtherRefine(
  data: { supplierKey: string; supplierOther?: string | null },
  ctx: z.RefinementCtx
) {
  if (data.supplierKey === "other") {
    const t = data.supplierOther?.trim() ?? "";
    if (t.length < 1) {
      ctx.addIssue({
        code: "custom",
        message: "Fyll inn leverandørnavn når du velger «Annen».",
        path: ["supplierOther"],
      });
    }
  }
}

export const adminProductFormBase = z.object({
  name: z.string().min(1, "Navn er påkrevd").max(200),
  description: z.string().max(5000).optional().nullable(),
  emoji: z.string().max(32).optional().nullable(),
  imageStoragePath: z.string().max(500).optional().nullable(),
  category: categoryEnum,
  priceKr: z.number().int().min(1).max(1_000_000),
  purchasePriceKr: z.number().int().min(0).max(1_000_000).optional().nullable(),
  supplierKey: supplierEnum,
  supplierOther: z.string().max(200).optional().nullable(),
  allowsLogoPrint: z.boolean(),
  minOrderQty: z.number().int().min(1).max(100_000),
  deliveryTimeText: z.string().max(120).optional().nullable(),
  stockStatus: stockEnum,
  isActive: z.boolean(),
});

export const adminProductFormSchema = adminProductFormBase.superRefine(
  supplierOtherRefine
);

export const adminProductUpdateSchema = z
  .object({ id: z.string().uuid() })
  .merge(adminProductFormBase)
  .superRefine(supplierOtherRefine);

export type AdminProductFormInput = z.infer<typeof adminProductFormBase>;
