import { Resend } from "resend";

function escHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type ShopBookingEmailPayload = {
  organizationName: string;
  contactEmail: string;
  productName: string;
  dozens: number;
  unitPriceKrFormatted: string;
  discountPercent: number;
  subtotalKrFormatted: string;
  /** Line total after volume discount, excluding VAT. */
  totalNetKrFormatted: string;
  mvaKrFormatted: string;
  totalInklMvaKrFormatted: string;
  supplierNotes: string | null;
  supplierLine: string;
};

export async function sendShopBookingEmails(
  payload: ShopBookingEmailPayload
): Promise<{ ok: boolean; skippedReason?: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from =
    process.env.FROM_EMAIL?.trim() ?? "post@støttespillet.no";
  const to = [
    process.env.BESTILLING_EMAIL_1?.trim(),
    process.env.BESTILLING_EMAIL_2?.trim(),
  ].filter((e): e is string => Boolean(e?.length));

  if (!apiKey) {
    return { ok: false, skippedReason: "RESEND_API_KEY mangler" };
  }
  if (to.length === 0) {
    return {
      ok: false,
      skippedReason: "BESTILLING_EMAIL_1 / BESTILLING_EMAIL_2 mangler",
    };
  }

  const discountLine =
    payload.discountPercent > 0
      ? `<p><strong>Volumrabatt:</strong> ${payload.discountPercent}%</p>
         <p><strong>Sum før rabatt (eks. MVA):</strong> ${escHtml(payload.subtotalKrFormatted)}</p>`
      : "";

  const html = `
  <h1>Ny shop-forespørsel (golf)</h1>
  <p><strong>Lag:</strong> ${escHtml(payload.organizationName)}</p>
  <p><strong>Kontakt (innlogget):</strong> ${escHtml(payload.contactEmail)}</p>
  <p><strong>Produkt:</strong> ${escHtml(payload.productName)}</p>
  <p><strong>Antall dusin:</strong> ${payload.dozens}</p>
  <p><strong>Pris per dusin (eks. MVA):</strong> ${escHtml(payload.unitPriceKrFormatted)}</p>
  ${discountLine}
  <p><strong>Pris eks. MVA (etter rabatt):</strong> ${escHtml(payload.totalNetKrFormatted)}</p>
  <p><strong>MVA (25%):</strong> ${escHtml(payload.mvaKrFormatted)}</p>
  <p><strong>Total inkl. MVA:</strong> ${escHtml(payload.totalInklMvaKrFormatted)}</p>
  <p><strong>Leverandør:</strong> ${escHtml(payload.supplierLine)}</p>
  ${
    payload.supplierNotes
      ? `<p><strong>Notat / kommentar:</strong><br/>${escHtml(payload.supplierNotes).replace(/\n/g, "<br/>")}</p>`
      : ""
  }
  `;

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to,
    subject: `Shop-forespørsel: ${payload.productName} — ${payload.organizationName}`,
    html,
  });

  if (error) {
    throw new Error(error.message);
  }
  return { ok: true };
}
