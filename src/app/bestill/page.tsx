"use client";

import { useFormState, useFormStatus } from "react-dom";

import { useMemo, useState } from "react";
import Link from "next/link";

import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  grossOreFromNetOre,
  mvaOreFromNetOre,
  PRICE_EX_VAT_SUFFIX,
  VAT_HINT_SHORT,
} from "@/lib/pricing/norwegian-vat";

import { golfProducts } from "@/lib/shop/seed-golf-products";

import { submitDirectOrder, type DirectOrderFormState } from "./actions";

const BALL_OPTIONS = [
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

const BALL_PRICES_KR_EX_VAT_PER_DUSIN = Object.fromEntries(
  golfProducts.map((p) => [p.name, p.priceOre / 100])
) as Record<(typeof BALL_OPTIONS)[number], number>;

const kr = new Intl.NumberFormat("nb-NO", {
  style: "currency",
  currency: "NOK",
  maximumFractionDigits: 0,
});

function discountRateForDozens(dozens: number): number {
  if (dozens >= 100) return 0.15;
  if (dozens >= 70) return 0.12;
  if (dozens >= 50) return 0.1;
  if (dozens >= 30) return 0.05;
  return 0;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      className="w-full bg-[var(--brand-pine)] text-white hover:bg-[var(--brand-pine-light)]"
      disabled={pending}
    >
      {pending ? "Sender..." : "Send bestilling"}
    </Button>
  );
}

export default function BestillPage() {
  const [state, formAction] = useFormState<DirectOrderFormState, FormData>(
    submitDirectOrder,
    { ok: false, message: "" }
  );

  const [ballName, setBallName] = useState<(typeof BALL_OPTIONS)[number]>(
    BALL_OPTIONS[0]
  );
  const [dozens, setDozens] = useState<number>(6);
  const [logoFileName, setLogoFileName] = useState<string | null>(null);

  const priceKrExVatPerDusin = BALL_PRICES_KR_EX_VAT_PER_DUSIN[ballName];
  const subtotalOre = useMemo(() => {
    const safeDozens = Number.isFinite(dozens) ? dozens : 0;
    return priceKrExVatPerDusin * 100 * Math.max(0, safeDozens);
  }, [dozens, priceKrExVatPerDusin]);
  const discountRate = useMemo(
    () => discountRateForDozens(dozens),
    [dozens]
  );
  const discountOre = useMemo(() => {
    if (discountRate <= 0) return 0;
    return Math.round(subtotalOre * discountRate);
  }, [discountRate, subtotalOre]);
  const totalNetOre = subtotalOre - discountOre;
  const mvaOre = mvaOreFromNetOre(totalNetOre);
  const totalInklMvaOre = grossOreFromNetOre(totalNetOre);

  return (
    <div className="min-h-dvh bg-[#f7f5f0] text-neutral-900">
      <header className="border-b border-[#0A2E1A]/10 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Link
            href="/"
            className="font-heading text-lg font-semibold text-[#0A2E1A]"
          >
            Støttespillet<span className="text-[#FFBE4A]">.</span>
          </Link>
          <Link
            href="/registrer?type=bedrift"
            className="text-sm font-medium text-[#0A2E1A] underline decoration-[#FFBE4A] decoration-2 underline-offset-2 transition hover:text-[#123d24]"
          >
            Bli sponsor <ArrowRight className="inline size-4" aria-hidden />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="space-y-2">
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-[#0A2E1A] sm:text-3xl">
            Bestill golfballer med logo
          </h1>
          <p className="text-sm text-neutral-600 sm:text-base">
            Ingen Stripe. Faktura sendes manuelt etter at vi har bekreftet
            detaljer. Alle priser er for bedrifter, vist eksklusiv merverdiavgift
            (25 %).
          </p>
        </div>

        <Card className="mt-8 border-[#0A2E1A]/10 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-base text-[#0A2E1A]">
              Bestillingsskjema
            </CardTitle>
          </CardHeader>
          <CardContent>
            {state.ok ? (
              <div className="rounded-xl border border-[#0A2E1A]/10 bg-[#f7f5f0]/70 p-6 text-sm text-neutral-700">
                <p className="font-medium text-[#0A2E1A]">
                  ✅ Bestilling mottatt!
                </p>
                <p className="mt-2">
                  Vi tar kontakt innen 1 virkedag på{" "}
                  <span className="font-medium">{state.email}</span>.
                  <br />
                  thomas@bodogolfsenter.no og post@utebygg.no har mottatt
                  bestillingen.
                </p>
                <p className="mt-2">
                  Du kan også{" "}
                  <Link
                    href="/"
                    className="font-medium text-[#0A2E1A] underline decoration-[#FFBE4A] decoration-2 underline-offset-2"
                  >
                    gå tilbake til forsiden
                  </Link>
                  .
                </p>
              </div>
            ) : (
              <form
                action={formAction}
                className="space-y-5"
                encType="multipart/form-data"
              >
                {state.message ? (
                  <p className="text-sm text-red-600">{state.message}</p>
                ) : null}

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Firmanavn</Label>
                    <Input
                      id="companyName"
                      name="companyName"
                      autoComplete="organization"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactName">Kontaktperson</Label>
                    <Input
                      id="contactName"
                      name="contactName"
                      autoComplete="name"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-post</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefon</Label>
                    <Input
                      id="phone"
                      name="phone"
                      autoComplete="tel"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="ballName">Hvilken ball</Label>
                    <select
                      id="ballName"
                      name="ballName"
                      required
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      value={ballName}
                      onChange={(e) => {
                        setBallName(e.target.value as (typeof BALL_OPTIONS)[number]);
                      }}
                    >
                      {BALL_OPTIONS.map((o) => (
                        <option key={o} value={o}>
                          {o} – {kr.format(BALL_PRICES_KR_EX_VAT_PER_DUSIN[o])}
                          /dusin {PRICE_EX_VAT_SUFFIX}
                        </option>
                      ))}
                    </select>

                    <div className="rounded-lg border border-[#0A2E1A]/10 bg-[#f7f5f0]/70 p-4 text-sm text-neutral-700">
                      <div className="grid gap-2">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-neutral-600">
                            Pris per dusin ({PRICE_EX_VAT_SUFFIX})
                          </span>
                          <span className="font-medium text-[#0A2E1A]">
                            {kr.format(priceKrExVatPerDusin)}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500">{VAT_HINT_SHORT}</p>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-neutral-600">Antall dusin</span>
                          <span className="font-medium text-[#0A2E1A]">
                            {Number.isFinite(dozens) ? dozens : 0}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-neutral-600">
                            Delsum ({PRICE_EX_VAT_SUFFIX})
                          </span>
                          <span className="font-medium text-[#0A2E1A]">
                            {kr.format(subtotalOre / 100)}
                          </span>
                        </div>
                        {discountRate > 0 ? (
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-neutral-600">
                              Rabatt ({Math.round(discountRate * 100)}%)
                            </span>
                            <span className="font-medium text-[#0A2E1A]">
                              − {kr.format(discountOre / 100)}
                            </span>
                          </div>
                        ) : null}
                        <div className="h-px bg-[#0A2E1A]/10" />
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-neutral-600">Pris eks. MVA</span>
                          <span className="font-medium text-[#0A2E1A]">
                            {kr.format(totalNetOre / 100)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-neutral-600">MVA (25%)</span>
                          <span className="font-medium text-[#0A2E1A]">
                            {kr.format(mvaOre / 100)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="font-medium text-[#0A2E1A]">
                            Total inkl. MVA
                          </span>
                          <span className="font-heading text-base font-semibold text-[#0A2E1A]">
                            {kr.format(totalInklMvaOre / 100)}
                          </span>
                        </div>
                      </div>

                      <p className="mt-3 text-xs text-neutral-600">
                        Faktura sendes etter ordrebekreftelse. Minimum 6 dusin
                        per bestilling.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dozens">Antall dusin (minimum 6)</Label>
                    <Input
                      id="dozens"
                      name="dozens"
                      type="number"
                      min={6}
                      step={1}
                      value={dozens}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        setDozens(Number.isFinite(v) ? v : 0);
                      }}
                      required
                    />

                    <div className="text-xs text-neutral-500">
                      Volum-rabatter: 30 dusin –5% · 50 dusin –10% · 70 dusin
                      –12% · 100 dusin –15%
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imprintText">Ønsket tekst/logo på ball</Label>
                  <Textarea
                    id="imprintText"
                    name="imprintText"
                    required
                    placeholder="Beskriv logo (f.eks. vedlegg via e-post senere) og/eller ønsket tekst."
                    className="min-h-24"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logoFile">Last opp logo (valgfritt)</Label>
                  <Input
                    id="logoFile"
                    name="logoFile"
                    type="file"
                    accept=".png,.jpg,.jpeg,.svg,.pdf,.ai"
                    onChange={(e) => {
                      const f = e.currentTarget.files?.[0] ?? null;
                      if (!f) {
                        setLogoFileName(null);
                        return;
                      }
                      if (f.size > 10 * 1024 * 1024) {
                        setLogoFileName(null);
                        e.currentTarget.value = "";
                        return;
                      }
                      setLogoFileName(f.name);
                    }}
                  />
                  {logoFileName ? (
                    <p className="text-xs text-neutral-600">
                      Valgt fil:{" "}
                      <span className="font-medium text-[#0A2E1A]">
                        {logoFileName}
                      </span>
                    </p>
                  ) : null}
                  <p className="text-xs text-neutral-500">
                    Vi kontakter deg hvis vi trenger høyere oppløsning
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comment">Kommentar</Label>
                  <Textarea
                    id="comment"
                    name="comment"
                    placeholder="Valgfritt"
                    className="min-h-20"
                  />
                </div>

                <SubmitButton />
                <p className="text-xs text-neutral-500">
                  Ved å sende bestilling godtar du at vi kan kontakte deg for å
                  avklare detaljer før fakturering.
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

