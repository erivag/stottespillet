import { Resend } from "resend";

function escHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type AdminDirectOrderEmailPayload = {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  ballName: string;
  dozens: number;
  unitPriceKrPerDusin: number;
  imprintText: string;
  comment: string | null;
};

export async function sendAdminDirectOrderNotification(
  payload: AdminDirectOrderEmailPayload
): Promise<{ ok: boolean; skippedReason?: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const adminTo = process.env.ADMIN_EMAIL?.trim();
  const from = process.env.FROM_EMAIL?.trim() ?? "post@støttespillet.no";

  if (!apiKey) {
    return { ok: false, skippedReason: "RESEND_API_KEY mangler" };
  }
  if (!adminTo) {
    return { ok: false, skippedReason: "ADMIN_EMAIL mangler" };
  }

  const html = `
  <h1>Ny direkte bestilling (bedrift)</h1>
  <p><strong>Firma:</strong> ${escHtml(payload.companyName)}</p>
  <p><strong>Kontaktperson:</strong> ${escHtml(payload.contactName)}</p>
  <p><strong>E-post:</strong> ${escHtml(payload.email)}</p>
  <p><strong>Telefon:</strong> ${escHtml(payload.phone)}</p>
  <hr/>
  <p><strong>Ball:</strong> ${escHtml(payload.ballName)}</p>
  <p><strong>Antall:</strong> ${payload.dozens} dusin</p>
  <p><strong>Pris:</strong> ${payload.unitPriceKrPerDusin} kr per dusin</p>
  <p><strong>Logo/tekst:</strong><br/>${escHtml(payload.imprintText).replace(/\n/g, "<br/>")}</p>
  ${
    payload.comment
      ? `<p><strong>Kommentar:</strong><br/>${escHtml(payload.comment).replace(/\n/g, "<br/>")}</p>`
      : ""
  }
  <p><em>Faktura sendes manuelt (ingen Stripe).</em></p>
  `;

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to: adminTo,
    subject: `Direkte bestilling: ${payload.ballName} — ${payload.companyName}`,
    html,
  });

  if (error) {
    throw new Error(error.message);
  }
  return { ok: true };
}

