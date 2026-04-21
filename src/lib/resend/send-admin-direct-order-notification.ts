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
  discountRate: number;
  totalKr: number;
  imprintText: string;
  comment: string | null;
  logoAttachment:
    | { filename: string; content: Buffer; contentType?: string }
    | null;
};

export async function sendAdminDirectOrderNotification(
  payload: AdminDirectOrderEmailPayload
): Promise<{ ok: boolean; skippedReason?: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.FROM_EMAIL?.trim() ?? "post@støttespillet.no";
  const to1 = process.env.BESTILLING_EMAIL_1?.trim();
  const to2 = process.env.BESTILLING_EMAIL_2?.trim();
  const adminFallback = process.env.ADMIN_EMAIL?.trim();
  const to = [to1, to2, adminFallback].filter(
    (x, i, arr): x is string => !!x && arr.indexOf(x) === i
  );

  if (!apiKey) {
    return { ok: false, skippedReason: "RESEND_API_KEY mangler" };
  }
  if (to.length === 0) {
    return {
      ok: false,
      skippedReason:
        "BESTILLING_EMAIL_1/BESTILLING_EMAIL_2 (eller ADMIN_EMAIL) mangler",
    };
  }

  const discountPct =
    payload.discountRate > 0 ? Math.round(payload.discountRate * 100) : 0;

  const html = `
  <h1>Ny bestilling</h1>
  <p><strong>Firma:</strong> ${escHtml(payload.companyName)}</p>
  <p><strong>Kontaktperson:</strong> ${escHtml(payload.contactName)}</p>
  <p><strong>E-post:</strong> ${escHtml(payload.email)}</p>
  <p><strong>Telefon:</strong> ${escHtml(payload.phone)}</p>
  <hr/>
  <p><strong>Ball:</strong> ${escHtml(payload.ballName)}</p>
  <p><strong>Antall:</strong> ${payload.dozens} dusin</p>
  <p><strong>Pris:</strong> ${payload.unitPriceKrPerDusin} kr per dusin</p>
  <p><strong>Total pris:</strong> ${escHtml(
    `${Math.round(payload.totalKr).toLocaleString("nb-NO")} kr`
  )}${discountPct > 0 ? ` (inkl. ${discountPct}% rabatt)` : ""}</p>
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
    to,
    subject: `Ny bestilling – ${payload.ballName} – ${payload.companyName}`,
    html,
    attachments: payload.logoAttachment
      ? [
          {
            filename: payload.logoAttachment.filename,
            content: payload.logoAttachment.content,
            contentType: payload.logoAttachment.contentType,
          },
        ]
      : undefined,
  });

  if (error) {
    throw new Error(error.message);
  }
  return { ok: true };
}

