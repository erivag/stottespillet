import { z } from "zod";

export const adminProductFormBase = z.object({
  name: z.string().min(1, "Navn er påkrevd").max(200),
  description: z.string().max(5000).optional().nullable(),
  priceKr: z.number().int().min(1).max(1_000_000),
  supplier: z.string().min(1, "Leverandør er påkrevd").max(200),
  isActive: z.boolean(),
});

export const adminProductFormSchema = adminProductFormBase;

export const adminProductUpdateSchema = z
  .object({ id: z.string().uuid() })
  .merge(adminProductFormBase);

export type AdminProductFormInput = z.infer<typeof adminProductFormBase>;
