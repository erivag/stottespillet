"use client";

import type { ComponentType } from "react";
import { useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  Building2,
  Inbox,
  Sparkles,
} from "lucide-react";

import { BudgetRing } from "@/components/bedrift/budget-ring";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EMPTY_BEDRIFT_DASHBOARD } from "@/lib/dashboard-fallbacks";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc/react";

const nok = new Intl.NumberFormat("nb-NO", {
  style: "currency",
  currency: "NOK",
  maximumFractionDigits: 0,
});

const dtf = new Intl.DateTimeFormat("nb-NO", {
  dateStyle: "short",
  timeStyle: "short",
});

export default function BedriftDashboardPage() {
  const utils = trpc.useUtils();
  const { data, isLoading, isError } = trpc.bedrift.dashboard.useQuery();
  const respond = trpc.bedrift.respondToMatch.useMutation({
    onSuccess: () => {
      void utils.bedrift.dashboard.invalidate();
    },
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (isLoading) {
    return <BedriftSkeleton />;
  }

  const d = data ?? EMPTY_BEDRIFT_DASHBOARD;

  const hasBudget =
    d.annualBudgetOre != null && d.annualBudgetOre > 0;

  return (
    <div className="flex flex-col gap-8">
      {isError ? (
        <p className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-center text-xs text-neutral-500">
          Data kunne ikke lastes akkurat nå. Visningen under kan være tom.
        </p>
      ) : null}
      <header className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-[var(--brand-pine)] sm:text-3xl">
          Bedriftsdashboard
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg">
          {d.companyName ? (
            <>
              Innlogget som{" "}
              <span className="font-medium text-[var(--brand-pine)]">
                {d.companyName}
              </span>
            </>
          ) : (
            "Vi finner ingen bedrift knyttet til kontoen din ennå."
          )}
        </p>
      </header>

      {errorMsg ? (
        <p className="text-destructive text-sm" role="alert">
          {errorMsg}
        </p>
      ) : null}

      <Card className="border-[var(--brand-pine)]/10 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-base text-[var(--brand-pine)]">
            Budsjett
          </CardTitle>
          <CardDescription>
            Brukt og gjenstående sponsormidler (fra registrerte betalinger og
            oppsatt årsbudsjett)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!hasBudget ? (
            <div className="flex flex-col items-start gap-4 rounded-xl border border-dashed border-[var(--brand-pine)]/20 bg-[var(--brand-cream)]/50 p-6">
              <p className="text-sm text-neutral-600">
                Sett opp sponsorbudsjett for å se fordeling mellom brukt og
                gjenstående.
              </p>
              <Link
                href="/bedrift/budsjett"
                className={cn(
                  buttonVariants(),
                  "bg-[var(--brand-pine)] text-white hover:bg-[var(--brand-pine-light)]"
                )}
              >
                Sett opp sponsorbudsjett
              </Link>
            </div>
          ) : (
            <BudgetRing
              usedOre={d.usedBudgetOre}
              totalOre={d.annualBudgetOre}
            />
          )}
        </CardContent>
      </Card>

      <section
        aria-label="Nøkkeltall"
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        <StatCard
          title="Nye forespørsler"
          description="Sponsorater som venter på svar"
          value={String(d.newRequestsCount)}
          icon={Inbox}
        />
        <StatCard
          title="Aktive sponsorat"
          description="I betaling eller betalt"
          value={String(d.activeSponsoratsCount)}
          icon={Sparkles}
        />
        <StatCard
          title="Lag støttet totalt"
          description="Unike lag med minst ett betalt sponsorat"
          value={String(d.supportedOrganizationsCount)}
          icon={Building2}
        />
      </section>

      <section aria-label="Innboks-forhåndsvisning">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-heading text-lg font-semibold text-[var(--brand-pine)]">
            Innboks
          </h2>
          <Link
            href="/bedrift/rapporter"
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--brand-pine)] underline decoration-[var(--brand-gold)] decoration-2 underline-offset-2 transition hover:text-[var(--brand-pine-light)]"
          >
            <BarChart3 className="size-4 text-[var(--brand-gold)]" aria-hidden />
            Synlighetsrapport
          </Link>
        </div>
        {d.pendingMatches.length === 0 ? (
          <Card className="border-dashed border-[var(--brand-pine)]/20 bg-white">
            <CardContent className="text-muted-foreground py-10 text-center text-sm">
              Ingen nye forespørsler.
            </CardContent>
          </Card>
        ) : (
          <ul className="flex flex-col gap-3">
            {d.pendingMatches.map((m) => (
              <li key={m.id}>
                <Card className="border-[var(--brand-pine)]/10 transition-shadow hover:shadow-md">
                  <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 space-y-1">
                      <p className="font-medium text-[var(--brand-pine)]">
                        {m.campaignTitle}
                      </p>
                      <p className="text-muted-foreground text-sm tabular-nums">
                        {nok.format(m.amountOre / 100)} ·{" "}
                        {dtf.format(new Date(m.updatedAt))}
                      </p>
                    </div>
                    <div className="flex w-full shrink-0 gap-2 sm:w-auto">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 border-[var(--brand-pine)]/20 sm:flex-none"
                        disabled={respond.isPending}
                        onClick={async () => {
                          setErrorMsg(null);
                          try {
                            await respond.mutateAsync({
                              matchId: m.id,
                              action: "decline",
                            });
                          } catch {
                            setErrorMsg(
                              "Kunne ikke avslå forespørselen. Prøv igjen senere."
                            );
                          }
                        }}
                      >
                        Avslå
                      </Button>
                      <Button
                        type="button"
                        className="flex-1 bg-[var(--brand-pine)] text-white hover:bg-[var(--brand-pine-light)] sm:flex-none"
                        disabled={respond.isPending}
                        onClick={async () => {
                          setErrorMsg(null);
                          try {
                            await respond.mutateAsync({
                              matchId: m.id,
                              action: "approve",
                            });
                          } catch {
                            setErrorMsg(
                              "Kunne ikke godkjenne forespørselen. Prøv igjen senere."
                            );
                          }
                        }}
                      >
                        Godkjenn
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="text-center text-xs text-neutral-500 sm:text-left">
        <Link
          href="/bedrift/innboks"
          className="font-medium text-[var(--brand-pine)] underline-offset-4 hover:underline"
        >
          Åpne full innboks
        </Link>
      </p>
    </div>
  );
}

function StatCard({
  title,
  description,
  value,
  icon: Icon,
}: {
  title: string;
  description: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="border-[var(--brand-pine)]/10 bg-white transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-sm font-medium leading-tight text-[var(--brand-pine)]">
            {title}
          </CardTitle>
          <CardDescription className="text-xs leading-snug">
            {description}
          </CardDescription>
        </div>
        <Icon
          className="size-5 shrink-0 text-[var(--brand-gold)] opacity-90"
          aria-hidden
        />
      </CardHeader>
      <CardContent>
        <p className="font-heading text-2xl font-semibold tabular-nums text-[var(--brand-pine)] sm:text-3xl">
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

function BedriftSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-5 w-full max-w-md" />
      </div>
      <Skeleton className="h-52 w-full rounded-xl" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-36 w-full rounded-xl" />
    </div>
  );
}
