import { notFound } from "next/navigation";
import Link from "next/link";

import { campaignTypeLabel } from "@/lib/admin/labels";
import { getPublicSiteOrigin } from "@/lib/app-public-url";
import { loadSponsorLandingByToken } from "@/lib/sponsor/load-sponsor-landing";

const nok = new Intl.NumberFormat("nb-NO", {
  style: "currency",
  currency: "NOK",
  maximumFractionDigits: 0,
});

const dtf = new Intl.DateTimeFormat("nb-NO", {
  dateStyle: "long",
});

function sponsorMailto(
  orgName: string,
  campaignTitle: string,
  sponsorUrl: string
): string {
  const contact =
    process.env.BESTILLING_EMAIL_1?.trim() ||
    process.env.ADMIN_EMAIL?.trim() ||
    "post@støttespillet.no";
  const subject = `Sponsorforespørsel: ${orgName} — ${campaignTitle}`;
  const body = `Hei,\n\nJeg vil gjerne vite mer om muligheten for å bli sponsor for denne kampanjen:\n${sponsorUrl}\n\nMvh`;
  return `mailto:${contact}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default async function SponsorPublicPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const row = await loadSponsorLandingByToken(token);
  if (!row) {
    notFound();
  }

  const origin = getPublicSiteOrigin();
  const sponsorUrl = `${origin}/sponsor/${token}`;

  return (
    <div className="min-h-dvh bg-[#f7f5f0] text-neutral-900">
      <header className="border-b border-[#0A2E1A]/10 bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Link
            href="/"
            className="font-heading text-lg font-semibold text-[#0A2E1A]"
          >
            Støttespillet<span className="text-[#FFBE4A]">.</span>
          </Link>
          <Link
            href="/registrer?type=bedrift"
            className="text-sm font-medium text-[#0A2E1A] underline decoration-[#FFBE4A] decoration-2 underline-offset-2"
          >
            Bli bedriftskunde
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
          Sponsormulighet
        </p>
        <h1 className="mt-2 font-heading text-2xl font-semibold tracking-tight text-[#0A2E1A] sm:text-3xl">
          {row.title}
        </h1>
        <p className="mt-2 text-sm text-neutral-600 sm:text-base">
          <span className="font-medium text-[#0A2E1A]">{row.organizationName}</span>{" "}
          søker sponsor · {campaignTypeLabel(row.campaignType)}
        </p>

        <div className="mt-8 space-y-6 rounded-2xl border border-[#0A2E1A]/10 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-sm font-semibold text-[#0A2E1A]">
              Beløp det søkes om
            </h2>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-[#0A2E1A]">
              {nok.format(row.amountOre / 100)}
            </p>
          </div>

          {row.quantity != null && row.quantity > 0 ? (
            <div>
              <h2 className="text-sm font-semibold text-[#0A2E1A]">Mengde</h2>
              <p className="mt-1 text-neutral-700">{row.quantity} dusin</p>
            </div>
          ) : null}

          {row.eventDate ? (
            <div>
              <h2 className="text-sm font-semibold text-[#0A2E1A]">Dato</h2>
              <p className="mt-1 text-neutral-700">
                {dtf.format(new Date(row.eventDate))}
              </p>
            </div>
          ) : null}

          <div>
            <h2 className="text-sm font-semibold text-[#0A2E1A]">
              Hva sponsor får
            </h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-neutral-700">
              {row.exposureDescription?.trim() ||
                "Synlig profilering og takk fra laget — detaljer avtales direkte med laget."}
            </p>
          </div>

          <div className="border-t border-[#0A2E1A]/10 pt-6">
            <a
              href={sponsorMailto(row.organizationName, row.title, sponsorUrl)}
              className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-[#0A2E1A] text-base font-semibold text-white transition hover:bg-[#123d24] sm:w-auto sm:min-w-[240px] sm:px-10"
            >
              Bli sponsor →
            </a>
            <p className="mt-3 text-xs text-neutral-500">
              Åpner e-postprogrammet ditt med forhåndsutfylt melding. Ingen
              betaling her — laget tar kontakt.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
