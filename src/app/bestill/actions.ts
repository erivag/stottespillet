"use server";

import { z } from "zod";

import { db } from "@/lib/db";
import { sendAdminDirectOrderNotification } from "@/lib/resend/send-admin-direct-order-notification";
import { orders } from "@db/schema";

const golfBallOptions = [
  "Vice Drive",
  "Vice Tour",
  "Callaway Super Soft",
  "Callaway Chrome Soft",
  "Titleist True Feel",
  "Titleist Velocity",
  "Titleist Tour Soft",
  "Titleist Pro V1x",
  "Titleist Pro V1",
] as const;

const pricesKrPerDusin = {
  "Vice Drive": 319,
  "Vice Tour": 473,
  "Callaway Super Soft": 429,
  "Callaway Chrome Soft": 759,
  "Titleist True Feel": 407,
  "Titleist Velocity": 462,
  "Titleist Tour Soft": 506,
  "Titleist Pro V1x": 759,
  "Titleist Pro V1": 759,
} as const satisfies Record<(typeof golfBallOptions)[number], number>;

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
  | { ok: true }
  | { ok: false; message: string };

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
  const unitPriceOre = pricesKrPerDusin[v.ballName] * 100;
  const totalOre = unitPriceOre * v.dozens;
  const now = new Date().toISOString();

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
        unitPriceKrPerDusin: pricesKrPerDusin[v.ballName],
        imprintText: v.imprintText.trim(),
        comment: v.comment?.trim() || null,
      });
    } catch (e) {
      console.error("sendAdminDirectOrderNotification failed", e);
    }

    return { ok: true };
  } catch (e) {
    console.error("[bestill.submit] database error", e);
    return {
      ok: false,
      message: "Kunne ikke sende bestillingen. Prøv igjen om litt.",
    };
  }
}

