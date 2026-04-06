import { Resend } from "resend";

import { storagePublicObjectUrl } from "@/lib/supabase/storage-public-url";

function escHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type AdminOrderEmailPayload = {
  organizationName: string;
  contactEmail: string;
  productName: string;
  quantity: number;
  totalKrFormatted: string;
  deliveryAddress: string;
  supplierNotes: string | null;
  logoStoragePath: string | null;
  supplierLine: string;
};

export async function sendAdminOrderNotification(
  payload: AdminOrderEmailPayload
): Promise<{ ok: boolean; skippedReason?: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const adminTo = process.env.ADMIN_EMAIL?.trim();
  const from =
    process.env.FROM_EMAIL?.trim() ?? "post@støttespillet.no";

  if (!apiKey) {
    return { ok: false, skippedReason: "RESEND_API_KEY mangler" };
  }
  if (!adminTo) {
    return { ok: false, skippedReason: "ADMIN_EMAIL mangler" };
  }

  const logoUrl = payload.logoStoragePath
    ? storagePublicObjectUrl("shop-logos", payload.logoStoragePath)
    : null;

  const logoBlock =
    payload.logoStoragePath != null && payload.logoStoragePath.length > 0
      ? logoUrl
        ? `<p><strong>Logo:</strong> <a href="${escHtml(logoUrl)}">Åpne fil</a></p>`
        : `<p><strong>Logo (lagringssti):</strong> ${escHtml(payload.logoStoragePath)}</p>`
      : "<p><strong>Logo:</strong> Ikke vedlagt</p>";

  const html = `
  <h1>Ny shop-bestilling</h1>
  <p><strong>Lag:</strong> ${escHtml(payload.organizationName)}</p>
  <p><strong>Kontakt (innlogget):</strong> ${escHtml(payload.contactEmail)}</p>
  <p><strong>Produkt:</strong> ${escHtml(payload.productName)}</p>
  <p><strong>Antall:</strong> ${payload.quantity}</p>
  <p><strong>Totalt:</strong> ${escHtml(payload.totalKrFormatted)}</p>
  <p><strong>Leverandør (produkt):</strong> ${escHtml(payload.supplierLine)}</p>
  <p><strong>Leveringsadresse:</strong><br/>${escHtml(payload.deliveryAddress).replace(/\n/g, "<br/>")}</p>
  ${
    payload.supplierNotes
      ? `<p><strong>Kommentar til leverandør:</strong><br/>${escHtml(payload.supplierNotes).replace(/\n/g, "<br/>")}</p>`
      : ""
  }
  ${logoBlock}
  `;

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to: adminTo,
    subject: `Ny shop-forespørsel: ${payload.productName} — ${payload.organizationName}`,
    html,
  });

  if (error) {
    throw new Error(error.message);
  }
  return { ok: true };
}
