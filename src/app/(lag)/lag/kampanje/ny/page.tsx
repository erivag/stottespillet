"use client";

import type { inferRouterOutputs } from "@trpc/server";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import type { AppRouter } from "@/server/routers";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc/react";

type BrregRow = inferRouterOutputs<AppRouter>["lag"]["findSponsors"]["bedrifter"][number];

const PRICE_VICE_DRIVE_PER_DUSIN_KR = 319;

const GOLF_EXPOSURE_DEFAULT = `Logo på golfballer brukt i turneringer
hele sesongen. Synlig for alle deltakere.`;

const CAMPAIGN_TYPES = [
  { value: "golfballer_logo", label: "Golfballer m/logo" },
  { value: "turnering", label: "Turnering/cup" },
  { value: "drakter_utstyr", label: "Drakter og utstyr" },
  { value: "cupreise", label: "Cupreise" },
  { value: "sesongstart", label: "Sesongstart/avslutning" },
  { value: "annet_pengestotte", label: "Annet/pengestøtte" },
] as const;

type CampaignTypeValue = (typeof CAMPAIGN_TYPES)[number]["value"];

export default function LagKampanjeNyPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [campaignId, setCampaignId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [campaignType, setCampaignType] =
    useState<CampaignTypeValue>("golfballer_logo");
  const [amountKr, setAmountKr] = useState("");
  const [dozensStr, setDozensStr] = useState("6");
  const [eventDate, setEventDate] = useState("");
  const [exposureDescription, setExposureDescription] = useState(
    GOLF_EXPOSURE_DEFAULT
  );

  const [naeringsFilter, setNaeringsFilter] = useState("");
  const [bedrifter, setBedrifter] = useState<BrregRow[]>([]);
  const [selected, setSelected] = useState<Record<string, BrregRow>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const createDraft = trpc.lag.createCampaignDraft.useMutation();
  const findSponsors = trpc.lag.findSponsors.useMutation();
  const submitOutreach = trpc.lag.submitCampaignOutreach.useMutation();

  const isGolf = campaignType === "golfballer_logo";

  const dozensNum = useMemo(() => {
    const n = Number(dozensStr.replace(",", ".").replace(/\s/g, ""));
    return Number.isFinite(n) ? Math.floor(n) : 0;
  }, [dozensStr]);

  const golfAmountKr = useMemo(() => {
    if (dozensNum < 6) return 0;
    return dozensNum * PRICE_VICE_DRIVE_PER_DUSIN_KR;
  }, [dozensNum]);

  const selectedList = useMemo(
    () => Object.values(selected),
    [selected]
  );

  function onCampaignTypeChange(next: CampaignTypeValue) {
    setCampaignType(next);
    if (next === "golfballer_logo") {
      setExposureDescription(GOLF_EXPOSURE_DEFAULT);
      setDozensStr((d) => (Number(d) >= 6 ? d : "6"));
    }
  }

  function toggleSelect(row: BrregRow) {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[row.orgNr]) {
        delete next[row.orgNr];
        return next;
      }
      if (Object.keys(next).length >= 20) return prev;
      next[row.orgNr] = row;
      return next;
    });
  }

  async function handleStep1Next(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (isGolf) {
      if (dozensNum < 6) {
        setFormError("Velg minst 6 dusin golfballer.");
        return;
      }
      try {
        const { campaignId: id } = await createDraft.mutateAsync({
          title: title.trim(),
          campaignType: "golfballer_logo",
          quantityDusin: dozensNum,
          exposureDescription: exposureDescription.trim(),
          eventDate: eventDate.trim() || null,
        });
        setCampaignId(id);
        setStep(2);
      } catch (err) {
        setFormError(
          err instanceof Error ? err.message : "Kunne ikke opprette utkast."
        );
      }
      return;
    }

    const kr = Number(amountKr.replace(",", ".").replace(/\s/g, ""));
    if (!Number.isFinite(kr) || kr <= 0) {
      setFormError("Oppgi et gyldig beløp i kroner.");
      return;
    }
    try {
      const { campaignId: id } = await createDraft.mutateAsync({
        title: title.trim(),
        campaignType,
        amountKr: kr,
        eventDate: eventDate.trim() || null,
        exposureDescription: exposureDescription.trim(),
      });
      setCampaignId(id);
      setStep(2);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Kunne ikke opprette utkast."
      );
    }
  }

  async function handleSearchSponsors() {
    if (!campaignId) return;
    setFormError(null);
    try {
      const res = await findSponsors.mutateAsync({
        campaignId,
        industries: naeringsFilter.trim()
          ? [naeringsFilter.trim()]
          : undefined,
        maxResults: 20,
      });
      setBedrifter(res.bedrifter);
      setSelected({});
      if (res.bedrifter.length === 0) {
        setFormError(
          "Ingen bedrifter funnet. Prøv uten næringskode eller annet postnummer i innstillinger."
        );
      }
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Kunne ikke søke i Brønnøysund."
      );
    }
  }

  async function handleFinalSubmit() {
    if (!campaignId) return;
    setFormError(null);
    if (selectedList.length < 5) {
      setFormError("Velg minst 5 bedrifter (maks 20).");
      return;
    }
    if (selectedList.length > 20) {
      setFormError("Maks 20 bedrifter.");
      return;
    }
    try {
      await submitOutreach.mutateAsync({
        campaignId,
        selections: selectedList.map((s) => ({
          orgNr: s.orgNr,
          name: s.name,
          industry: s.industry,
          address: s.address,
          postalCode: s.postalCode,
          municipality: s.municipality,
          email: s.email,
          phone: s.phone,
          employees: s.employees,
        })),
      });
      router.push("/lag/kampanje");
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Kunne ikke lagre utkast."
      );
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 pb-10">
      <div>
        <Link
          href="/lag/kampanje"
          className="text-sm font-medium text-[var(--brand-pine)] underline-offset-2 hover:underline"
        >
          ← Tilbake til mine søknader
        </Link>
        <h1 className="font-heading mt-4 text-2xl font-semibold tracking-tight text-[var(--brand-pine)] sm:text-3xl">
          Ny sponsorsøknad
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          Steg {step} av 3 — fyll inn kampanje, finn lokale bedrifter i
          Brønnøysund, og lagre utkast til henvendelser.
        </p>
      </div>

      <div className="flex gap-2 text-xs font-medium text-neutral-500">
        <span className={step === 1 ? "text-[var(--brand-pine)]" : ""}>
          1. Kampanje
        </span>
        <span aria-hidden>·</span>
        <span className={step === 2 ? "text-[var(--brand-pine)]" : ""}>
          2. Sponsorer
        </span>
        <span aria-hidden>·</span>
        <span className={step === 3 ? "text-[var(--brand-pine)]" : ""}>
          3. Send utkast
        </span>
      </div>

      {formError ? (
        <p className="text-sm text-destructive" role="alert">
          {formError}
        </p>
      ) : null}

      {step === 1 ? (
        <Card className="border-[var(--brand-pine)]/10 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-[var(--brand-pine)]">
              Kampanjedetaljer
            </CardTitle>
            <CardDescription>
              Beskriv arrangementet og hva dere søker midler til.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleStep1Next} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Tittel</Label>
                <Input
                  id="title"
                  required
                  maxLength={200}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="F.eks. Vår Cup 2026"
                  className="border-[var(--brand-pine)]/15"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ctype">Type</Label>
                <select
                  id="ctype"
                  required
                  value={campaignType}
                  onChange={(e) =>
                    onCampaignTypeChange(e.target.value as CampaignTypeValue)
                  }
                  className="border-input flex h-10 w-full rounded-md border bg-background px-3 text-sm"
                >
                  {CAMPAIGN_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              {isGolf ? (
                <div className="space-y-2">
                  <Label htmlFor="dusin">Antall dusin</Label>
                  <Input
                    id="dusin"
                    required
                    inputMode="numeric"
                    value={dozensStr}
                    onChange={(e) =>
                      setDozensStr(e.target.value.replace(/[^\d.,]/g, ""))
                    }
                    className="border-[var(--brand-pine)]/15"
                  />
                  <p className="text-xs text-neutral-500">
                    Minimum 6 dusin. Pris: {PRICE_VICE_DRIVE_PER_DUSIN_KR} kr per
                    dusin (Vice Drive), beregnet automatisk.
                  </p>
                </div>
              ) : null}

              {isGolf ? (
                <div className="rounded-lg border border-[var(--brand-pine)]/15 bg-neutral-50 px-3 py-2 text-sm">
                  <p className="font-medium text-[var(--brand-pine)]">
                    Beløp søkt (beregnet)
                  </p>
                  <p className="tabular-nums text-neutral-800">
                    {dozensNum < 6
                      ? "— (oppgi minst 6 dusin)"
                      : `${golfAmountKr.toLocaleString("nb-NO")} kr (${dozensNum} dusin × ${PRICE_VICE_DRIVE_PER_DUSIN_KR} kr)`}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="amount">Beløp søkt (kr)</Label>
                  <Input
                    id="amount"
                    required
                    inputMode="decimal"
                    value={amountKr}
                    onChange={(e) => setAmountKr(e.target.value)}
                    placeholder="25000"
                    className="border-[var(--brand-pine)]/15"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="event">Dato for arrangement</Label>
                <Input
                  id="event"
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="border-[var(--brand-pine)]/15"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expo">Hva får sponsor igjen?</Label>
                <Textarea
                  id="expo"
                  required
                  maxLength={4000}
                  rows={campaignType === "annet_pengestotte" ? 6 : 5}
                  value={exposureDescription}
                  onChange={(e) => setExposureDescription(e.target.value)}
                  placeholder={
                    campaignType === "annet_pengestotte"
                      ? "Beskriv behovet og hva sponsor kan få igjen (åpent felt)."
                      : "Eksponering, synlighet, profilering …"
                  }
                  className="border-[var(--brand-pine)]/15"
                />
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  disabled={createDraft.isPending}
                  className={cn(
                    buttonVariants(),
                    "bg-[var(--brand-pine)] text-white hover:bg-[var(--brand-pine-light)]"
                  )}
                >
                  {createDraft.isPending ? "Lagrer …" : "Neste: finn sponsorer"}
                </button>
                <Link
                  href="/lag/kampanje"
                  className={cn(buttonVariants({ variant: "outline" }))}
                >
                  Avbryt
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {step === 2 ? (
        <Card className="border-[var(--brand-pine)]/10 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-[var(--brand-pine)]">
              Finn sponsorer
            </CardTitle>
            <CardDescription>
              Vi søker i Brønnøysund i samme kommune som postnummeret på
              lagprofilen din.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="naering">Næringskode (valgfritt)</Label>
              <Input
                id="naering"
                value={naeringsFilter}
                onChange={(e) => setNaeringsFilter(e.target.value)}
                placeholder="F.eks. 47.112"
                className="border-[var(--brand-pine)]/15"
              />
              <p className="text-xs text-neutral-500">
                Filtrer på næringskode fra Brønnøysund (la stå tom for bredere
                treff).
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void handleSearchSponsors()}
                disabled={findSponsors.isPending}
                className={cn(
                  buttonVariants(),
                  "bg-[var(--brand-pine)] text-white hover:bg-[var(--brand-pine-light)]"
                )}
              >
                {findSponsors.isPending ? "Søker …" : "Søk lokale bedrifter"}
              </button>
              <button
                type="button"
                className={cn(buttonVariants({ variant: "outline" }))}
                onClick={() => setStep(1)}
              >
                Tilbake
              </button>
            </div>

            {bedrifter.length > 0 ? (
              <ul className="mt-4 flex flex-col gap-3">
                {bedrifter.map((b) => {
                  const checked = Boolean(selected[b.orgNr]);
                  return (
                    <li key={b.orgNr}>
                      <label className="flex cursor-pointer gap-3 rounded-lg border border-[var(--brand-pine)]/10 bg-neutral-50/80 p-3 has-[:checked]:border-[var(--brand-gold)]/50 has-[:checked]:bg-amber-50/40">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleSelect(b)}
                          className="mt-1 size-4 shrink-0"
                        />
                        <div className="min-w-0 flex-1 text-sm">
                          <p className="font-medium text-[var(--brand-pine)]">
                            {b.name}
                          </p>
                          <p className="text-neutral-600">
                            {b.industry ?? "Ukjent bransje"}
                          </p>
                          <p className="text-neutral-500">
                            {[b.address, b.postalCode, b.municipality]
                              .filter(Boolean)
                              .join(" · ") || "Ingen adresse registrert"}
                          </p>
                          <p className="text-neutral-500">
                            {b.email ? `E-post: ${b.email}` : "E-post: ikke registrert"}{" "}
                            · Ansatte: {b.employees}
                          </p>
                        </div>
                      </label>
                    </li>
                  );
                })}
              </ul>
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
              <p className="text-sm text-neutral-600">
                Valgt: {selectedList.length} / 20 (min. 5 for neste steg)
              </p>
              <button
                type="button"
                disabled={selectedList.length < 5}
                onClick={() => setStep(3)}
                className={cn(
                  buttonVariants(),
                  "bg-[var(--brand-pine)] text-white hover:bg-[var(--brand-pine-light)] disabled:opacity-50"
                )}
              >
                Neste: forhåndsvis
              </button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {step === 3 ? (
        <Card className="border-[var(--brand-pine)]/10 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-[var(--brand-pine)]">
              Forhåndsvis og lagre utkast
            </CardTitle>
            <CardDescription>
              Vi lagrer kampanjen som aktiv og oppretter utkast til e-post per
              valgt bedrift (ingen e-post sendes ennå).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="flex max-h-72 flex-col gap-2 overflow-y-auto text-sm">
              {selectedList.map((b) => (
                <li
                  key={b.orgNr}
                  className="rounded-md border border-[var(--brand-pine)]/10 px-3 py-2"
                >
                  <span className="font-medium text-[var(--brand-pine)]">
                    {b.name}
                  </span>{" "}
                  <span className="text-neutral-500">({b.orgNr})</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void handleFinalSubmit()}
                disabled={submitOutreach.isPending}
                className={cn(
                  buttonVariants(),
                  "bg-[var(--brand-pine)] text-white hover:bg-[var(--brand-pine-light)]"
                )}
              >
                {submitOutreach.isPending
                  ? "Lagrer …"
                  : `Send sponsorsøknad til ${selectedList.length} bedrifter (utkast)`}
              </button>
              <button
                type="button"
                className={cn(buttonVariants({ variant: "outline" }))}
                onClick={() => setStep(2)}
              >
                Tilbake
              </button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
