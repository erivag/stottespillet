"use client";

import type { inferRouterOutputs } from "@trpc/server";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import type { AppRouter } from "@/server/routers";
import { Button, buttonVariants } from "@/components/ui/button";
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
import { golfProductsConfig } from "@/lib/shop/golf-products-config";
import { trpc } from "@/lib/trpc/react";

type BrregRow = inferRouterOutputs<AppRouter>["lag"]["findSponsors"]["bedrifter"][number];

type OutreachDraftRow =
  inferRouterOutputs<AppRouter>["lag"]["generateOutreach"]["emails"][number];

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
  const [golfBallName, setGolfBallName] = useState<string>(
    golfProductsConfig[0].name
  );
  const [eventDate, setEventDate] = useState("");
  const [exposureDescription, setExposureDescription] = useState(
    GOLF_EXPOSURE_DEFAULT
  );

  const [naeringsFilter, setNaeringsFilter] = useState("");
  const [bedrifter, setBedrifter] = useState<BrregRow[]>([]);
  const [brregSearchStats, setBrregSearchStats] = useState<{
    totalFetched: number;
    totalAfterFilter: number;
    displayed: number;
  } | null>(null);
  const [selected, setSelected] = useState<Record<string, BrregRow>>({});
  const [outreachRows, setOutreachRows] = useState<OutreachDraftRow[]>([]);
  const [genTick, setGenTick] = useState(0);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const createDraft = trpc.lag.createCampaignDraft.useMutation();
  const findSponsors = trpc.lag.findSponsors.useMutation();
  const generateOutreach = trpc.lag.generateOutreach.useMutation();
  const saveOutreachDrafts = trpc.lag.saveOutreachDrafts.useMutation();
  const regenerateOutreachEmail =
    trpc.lag.regenerateOutreachEmail.useMutation();

  const isGolf = campaignType === "golfballer_logo";

  const dozensNum = useMemo(() => {
    const n = Number(dozensStr.replace(",", ".").replace(/\s/g, ""));
    return Number.isFinite(n) ? Math.floor(n) : 0;
  }, [dozensStr]);

  const selectedGolfProduct = useMemo(() => {
    const hit = golfProductsConfig.find((g) => g.name === golfBallName);
    return hit ?? golfProductsConfig[0];
  }, [golfBallName]);

  const golfPricePerDusinKr = useMemo(
    () => Math.round(selectedGolfProduct.priceOre / 100),
    [selectedGolfProduct]
  );

  const golfAmountKr = useMemo(() => {
    if (dozensNum < 6) return 0;
    return dozensNum * golfPricePerDusinKr;
  }, [dozensNum, golfPricePerDusinKr]);

  const golfInklMvaKr = useMemo(
    () => Math.round(golfAmountKr * 1.25),
    [golfAmountKr]
  );

  const selectedList = useMemo(
    () => Object.values(selected),
    [selected]
  );

  useEffect(() => {
    if (!generateOutreach.isPending) {
      setGenTick(0);
      return;
    }
    const id = setInterval(() => setGenTick((t) => t + 1), 400);
    return () => clearInterval(id);
  }, [generateOutreach.isPending]);

  const genProgressLabel = useMemo(() => {
    const y = selectedList.length;
    if (y === 0) return "";
    const estMsPer = 4500;
    const fakeX = generateOutreach.isPending
      ? Math.min(y, Math.max(1, Math.floor((genTick * 400) / estMsPer) + 1))
      : y;
    return `${fakeX} av ${y}`;
  }, [generateOutreach.isPending, genTick, selectedList.length]);

  function onCampaignTypeChange(next: CampaignTypeValue) {
    setCampaignType(next);
    if (next === "golfballer_logo") {
      setExposureDescription(GOLF_EXPOSURE_DEFAULT);
      setDozensStr((d) => (Number(d) >= 6 ? d : "6"));
      setGolfBallName(golfProductsConfig[0].name);
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
          golfPricePerDusinKr,
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
    setBrregSearchStats(null);
    try {
      const res = await findSponsors.mutateAsync({
        campaignId,
        industries: naeringsFilter.trim()
          ? [naeringsFilter.trim()]
          : undefined,
      });
      setBedrifter(res.bedrifter);
      setBrregSearchStats({
        totalFetched: res.totalFetched,
        totalAfterFilter: res.totalAfterFilter,
        displayed: res.displayed,
      });
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

  async function handleGoToStep3() {
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
    setStep(3);
    setOutreachRows([]);
    try {
      const { emails } = await generateOutreach.mutateAsync({
        campaignId,
        bedrifter: selectedList.map((s) => ({
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
      setOutreachRows(emails);
    } catch (err) {
      setStep(2);
      setFormError(
        err instanceof Error ? err.message : "Kunne ikke generere e-poster."
      );
    }
  }

  async function handleSaveDrafts() {
    if (!campaignId || outreachRows.length === 0) return;
    setFormError(null);
    try {
      await saveOutreachDrafts.mutateAsync({
        campaignId,
        rows: outreachRows.map((r) => ({
          id: r.id,
          body: r.body,
          toEmail: r.toEmail,
          subject: r.subject,
        })),
      });
      router.push("/lag/kampanje");
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Kunne ikke lagre utkast."
      );
    }
  }

  async function handleRegenerate(row: OutreachDraftRow) {
    if (!campaignId) return;
    setFormError(null);
    setRegeneratingId(row.id);
    try {
      const res = await regenerateOutreachEmail.mutateAsync({
        campaignId,
        outreachEmailId: row.id,
        industry: row.industry,
      });
      setOutreachRows((prev) =>
        prev.map((r) =>
          r.id === row.id ? { ...r, body: res.body, subject: res.subject } : r
        )
      );
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Kunne ikke regenerere e-post."
      );
    } finally {
      setRegeneratingId(null);
    }
  }

  function updateRow(
    id: string,
    patch: Partial<Pick<OutreachDraftRow, "body" | "toEmail" | "subject">>
  ) {
    setOutreachRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...patch } : r))
    );
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
          Steg {step} av 3 — kampanje, sponsorer i Brønnøysund, og AI-skrevne
          e-poster du kan redigere før lagring.
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
          3. E-poster
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
                    Minimum 6 dusin. Beløp beregnes fra valgt ball-modell.
                  </p>
                </div>
              ) : null}

              {isGolf ? (
                <div className="space-y-2">
                  <Label htmlFor="ballmodell">Velg ball-modell</Label>
                  <select
                    id="ballmodell"
                    required
                    value={golfBallName}
                    onChange={(e) => setGolfBallName(e.target.value)}
                    className="border-input flex h-10 w-full rounded-md border bg-background px-3 text-sm"
                  >
                    {golfProductsConfig.map((g) => (
                      <option key={g.name} value={g.name}>
                        {g.name} – kr {Math.round(g.priceOre / 100)}/dusin eks
                        MVA
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              {isGolf ? (
                <div className="rounded-lg border border-[var(--brand-pine)]/15 bg-neutral-50 px-3 py-2 text-sm">
                  <p className="font-medium text-[var(--brand-pine)]">
                    Beløp søkt (beregnet)
                  </p>
                  <p className="tabular-nums text-neutral-800">
                    {dozensNum < 6 ? (
                      "— (oppgi minst 6 dusin)"
                    ) : (
                      <>
                        {golfAmountKr.toLocaleString("nb-NO")} kr eks MVA ·{" "}
                        {golfInklMvaKr.toLocaleString("nb-NO")} kr ink MVA (25%)
                      </>
                    )}
                  </p>
                  {dozensNum >= 6 ? (
                    <p className="mt-1 text-xs text-neutral-600">
                      {dozensNum} dusin × {golfPricePerDusinKr.toLocaleString("nb-NO")}{" "}
                      kr ({selectedGolfProduct.name})
                    </p>
                  ) : null}
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

            {brregSearchStats ? (
              <p className="text-sm text-neutral-600">
                <span className="font-medium text-[var(--brand-pine)]">
                  {brregSearchStats.totalFetched}
                </span>{" "}
                treff fra Brønnøysund. Etter filtrering:{" "}
                <span className="font-medium text-[var(--brand-pine)]">
                  {brregSearchStats.totalAfterFilter}
                </span>{" "}
                bedrifter. Viser de{" "}
                <span className="font-medium text-[var(--brand-pine)]">
                  {brregSearchStats.displayed}
                </span>{" "}
                beste (sortert etter e-post, antall ansatte og navn).
              </p>
            ) : null}

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
                disabled={selectedList.length < 5 || generateOutreach.isPending}
                onClick={() => void handleGoToStep3()}
                className={cn(
                  buttonVariants(),
                  "bg-[var(--brand-pine)] text-white hover:bg-[var(--brand-pine-light)] disabled:opacity-50"
                )}
              >
                {generateOutreach.isPending
                  ? "Vent …"
                  : "Neste: forhåndsvis e-poster"}
              </button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {step === 3 ? (
        <Card className="border-[var(--brand-pine)]/10 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-[var(--brand-pine)]">
              Forhåndsvis e-poster
            </CardTitle>
            <CardDescription>
              AI har skrevet en personlig e-post til hver valgt bedrift. Du kan
              redigere før sending. Ingen e-post sendes ennå (Resend kobles på
              senere).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {generateOutreach.isPending && outreachRows.length === 0 ? (
              <div className="rounded-lg border border-[var(--brand-pine)]/15 bg-[var(--brand-cream)]/40 px-4 py-6 text-center text-sm text-neutral-700">
                <p className="font-medium text-[var(--brand-pine)]">
                  AI skriver e-poster… ({genProgressLabel})
                </p>
                <p className="mt-2 text-xs text-neutral-500">
                  Claude genererer én e-post om gangen. Dette kan ta litt tid.
                </p>
              </div>
            ) : null}

            {outreachRows.length > 0 ? (
              <ul className="flex flex-col gap-6">
                {outreachRows.map((row) => (
                  <li
                    key={row.id}
                    className="rounded-xl border border-[var(--brand-pine)]/10 bg-neutral-50/60 p-4"
                  >
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-semibold text-[var(--brand-pine)]">
                          {row.name}
                        </p>
                        <p className="text-sm text-neutral-600">
                          {row.industry ?? "Ukjent bransje"} · org.nr{" "}
                          {row.orgNr}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="shrink-0 border-[var(--brand-pine)]/25"
                        disabled={regeneratingId === row.id}
                        onClick={() => void handleRegenerate(row)}
                      >
                        {regeneratingId === row.id
                          ? "Regenererer …"
                          : "Regenerer"}
                      </Button>
                    </div>

                    <div className="mt-3 space-y-2">
                      <Label htmlFor={`subj-${row.id}`}>Emne</Label>
                      <Input
                        id={`subj-${row.id}`}
                        value={row.subject}
                        onChange={(e) =>
                          updateRow(row.id, { subject: e.target.value })
                        }
                        className="border-[var(--brand-pine)]/15"
                      />
                    </div>

                    <div className="mt-3 space-y-2">
                      <Label htmlFor={`body-${row.id}`}>E-posttekst</Label>
                      <Textarea
                        id={`body-${row.id}`}
                        rows={10}
                        value={row.body}
                        onChange={(e) =>
                          updateRow(row.id, { body: e.target.value })
                        }
                        className="min-h-[200px] border-[var(--brand-pine)]/15 font-sans text-sm leading-relaxed"
                      />
                    </div>

                    <div className="mt-3 space-y-2">
                      <Label htmlFor={`to-${row.id}`}>Mottaker (e-post)</Label>
                      <Input
                        id={`to-${row.id}`}
                        type="email"
                        value={row.toEmail}
                        onChange={(e) =>
                          updateRow(row.id, { toEmail: e.target.value })
                        }
                        className="border-[var(--brand-pine)]/15"
                      />
                      {row.toEmail.includes("ingen-epost.stottespillet") ? (
                        <p className="text-xs text-amber-800">
                          Placeholder — erstatt med reell e-post hvis du kjenner
                          kontaktperson.
                        </p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            ) : null}

            {!generateOutreach.isPending && outreachRows.length === 0 ? (
              <p className="text-sm text-neutral-600">
                Ingen e-poster å vise. Gå tilbake og velg bedrifter på nytt.
              </p>
            ) : null}

            <div className="flex flex-col gap-3 border-t border-[var(--brand-pine)]/10 pt-4 sm:flex-row sm:flex-wrap">
              <Button
                type="button"
                disabled
                variant="secondary"
                className="opacity-60"
                title="Resend-utsending kommer i neste versjon"
              >
                Send alle e-poster (kommer)
              </Button>
              <Button
                type="button"
                disabled={
                  saveOutreachDrafts.isPending ||
                  outreachRows.length === 0 ||
                  generateOutreach.isPending
                }
                onClick={() => void handleSaveDrafts()}
                className="bg-[var(--brand-pine)] text-white hover:bg-[var(--brand-pine-light)]"
              >
                {saveOutreachDrafts.isPending
                  ? "Lagrer …"
                  : "Lagre som utkast"}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={generateOutreach.isPending}
                onClick={() => {
                  setOutreachRows([]);
                  setStep(2);
                }}
              >
                Tilbake
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
