"use server";

import { z } from "zod";

import { db } from "@/lib/db";
import {
  grossOreFromNetOre,
  mvaOreFromNetOre,
} from "@/lib/pricing/norwegian-vat";
import { sendAdminDirectOrderNotification } from "@/lib/resend/send-admin-direct-order-notification";
import {
  golfBallOptions,
  golfProductsConfig,
} from "@/lib/shop/golf-products-config";
import { orders } from "@db/schema";

const pricesKrPerDusinExVat = Object.fromEntries(
  golfProductsConfig.map((p) => [p.name, p.priceOre / 100])
) as Record<(typeof golfBallOptions)[number], number>;

const schema = z.object({
  companyName: z.string().min(2).max(200),
  contactName: z.string().min(2).max(200),
  email: z.string().email().max(200),
  phone: z.string().min(4).max(50),
  ballName: z.enum(golfBallOptions),
  dozens: z.coerce.number().int().min(6).max(10_000),
  imprintText: z.string().min(2).max(4000),
  comment: z.string().max(4000).optional().nullable(),
});

export type DirectOrderFormState =
  | { ok: true; email: string }
  | { ok: false; message: string };

function discountRateForDozens(dozens: number): number {
  if (dozens >= 100) return 0.15;
  if (dozens >= 70) return 0.12;
  if (dozens >= 50) return 0.1;
  if (dozens >= 30) return 0.05;
  return 0;
}

function safeFileName(name: string): string {
  const trimmed = name.trim();
  return trimmed.length > 0 ? trimmed.replace(/[^\w.\- ()\[\]]+/g, "_") : "logo";
}

export async function submitDirectOrder(
  prevState: DirectOrderFormState,
  formData: FormData
): Promise<DirectOrderFormState> {
  void prevState;
  const parsed = schema.safeParse({
    companyName: formData.get("companyName"),
    contactName: formData.get("contactName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    ballName: formData.get("ballName"),
    dozens: formData.get("dozens"),
    imprintText: formData.get("imprintText"),
    comment: formData.get("comment"),
  });

  if (!parsed.success) {
    return { ok: false, message: "Sjekk at alle felter er fylt ut korrekt." };
  }

  const v = parsed.data;
  const unitPriceOre = pricesKrPerDusinExVat[v.ballName] * 100;
  const subtotalOre = unitPriceOre * v.dozens;
  const discountRate = discountRateForDozens(v.dozens);
  const discountOre = Math.round(subtotalOre * discountRate);
  const totalNetOre = subtotalOre - discountOre;
  const mvaOre = mvaOreFromNetOre(totalNetOre);
  const totalOre = totalNetOre;
  const now = new Date().toISOString();

  const file = formData.get("logoFile");
  let attachment:
    | { filename: string; content: Buffer; contentType?: string }
    | null = null;

  if (file instanceof File && file.size > 0) {
    if (file.size > 10 * 1024 * 1024) {
      return { ok: false, message: "Logo-filen kan maks være 10MB." };
    }

    const filename = safeFileName(file.name);
    const ext = filename.toLowerCase().split(".").pop() ?? "";
    const allowedExt = new Set(["png", "jpg", "jpeg", "svg", "pdf", "ai"]);
    if (!allowedExt.has(ext)) {
      return { ok: false, message: "Ugyldig filtype. Bruk PNG, JPG, SVG, PDF eller AI." };
    }

    const buf = Buffer.from(await file.arrayBuffer());
    attachment = {
      filename,
      content: buf,
      contentType: file.type || undefined,
    };
  }

  try {
    await db.insert(orders).values({
      organizationId: null,
      matchId: null,
      productId: null,
      directCompanyName: v.companyName.trim(),
      directContactName: v.contactName.trim(),
      directEmail: v.email.trim(),
      directPhone: v.phone.trim(),
      directBallName: v.ballName,
      directDozens: v.dozens,
      directImprintText: v.imprintText.trim(),
      directComment: v.comment?.trim() || null,
      quantity: v.dozens,
      unitPriceOre,
      supplierNotes: null,
      logoStoragePath: null,
      deliveryAddress: null,
      status: "pending",
      totalOre,
      createdAt: now,
      updatedAt: now,
    });

    try {
      await sendAdminDirectOrderNotification({
        companyName: v.companyName.trim(),
        contactName: v.contactName.trim(),
        email: v.email.trim(),
        phone: v.phone.trim(),
        ballName: v.ballName,
        dozens: v.dozens,
        unitPriceKrPerDusinExVat: pricesKrPerDusinExVat[v.ballName],
        discountRate,
        totalNetKr: totalNetOre / 100,
        mvaKr: mvaOre / 100,
        totalInklMvaKr: grossOreFromNetOre(totalNetOre) / 100,
        imprintText: v.imprintText.trim(),
        comment: v.comment?.trim() || null,
        logoAttachment: attachment,
      });
    } catch (e) {
      console.error("sendAdminDirectOrderNotification failed", e);
    }

    return { ok: true, email: v.email.trim() };
  } catch (e) {
    console.error("[bestill.submit] database error", e);
    return {
      ok: false,
      message: "Kunne ikke sende bestillingen. Prøv igjen om litt.",
    };
  }
}

