"use client";

import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { campaignTypeLabel } from "@/lib/admin/labels";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc/react";

const nok = new Intl.NumberFormat("nb-NO", {
  style: "currency",
  currency: "NOK",
  maximumFractionDigits: 0,
});

const dtf = new Intl.DateTimeFormat("nb-NO", {
  dateStyle: "medium",
  timeStyle: "short",
});

function campaignStatusNb(s: string): string {
  switch (s) {
    case "draft":
      return "Utkast";
    case "active":
      return "Aktiv";
    case "completed":
      return "Fullført";
    case "cancelled":
      return "Avbrutt";
    default:
      return s;
  }
}

export default function LagKampanjePage() {
  const { data, isLoading, isError, refetch } = trpc.lag.myCampaigns.useQuery();

  const items = data?.items ?? [];

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-[var(--brand-pine)] sm:text-3xl">
            Mine søknader
          </h1>
          <p className="mt-1 text-sm text-neutral-600 sm:text-base">
            Oversikt over sponsorsøknader for laget ditt.
          </p>
        </div>
        {items.length > 0 ? (
          <Link
            href="/lag/kampanje/ny"
            className={cn(
              buttonVariants(),
              "w-full bg-[var(--brand-pine)] text-white hover:bg-[var(--brand-pine-light)] sm:w-auto"
            )}
          >
            + Opprett ny søknad
          </Link>
        ) : null}
      </header>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      ) : isError ? (
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="py-8 text-center text-sm text-red-900">
            <p>Noe gikk galt ved lasting.</p>
            <button
              type="button"
              onClick={() => void refetch()}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "mt-4 border-red-300"
              )}
            >
              Prøv igjen
            </button>
          </CardContent>
        </Card>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-6 rounded-xl border border-dashed border-[var(--brand-pine)]/25 bg-white px-6 py-14 text-center">
          <p className="max-w-md text-neutral-600">
            Du har ingen søknader ennå.
          </p>
          <Link
            href="/lag/kampanje/ny"
            className={cn(
              buttonVariants(),
              "h-12 min-w-[240px] bg-[var(--brand-pine)] px-8 text-base text-white hover:bg-[var(--brand-pine-light)]"
            )}
          >
            + Opprett ny søknad
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((c) => (
            <li key={c.id}>
              <Card className="border-[var(--brand-pine)]/10 transition-shadow hover:shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <CardTitle className="text-lg text-[var(--brand-pine)]">
                        {c.title}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {campaignTypeLabel(c.campaignType)}
                      </CardDescription>
                    </div>
                    <span className="inline-flex w-fit shrink-0 rounded-full border border-[var(--brand-pine)]/15 bg-[var(--brand-cream)] px-2.5 py-0.5 text-xs font-medium text-[var(--brand-pine)]">
                      {campaignStatusNb(c.status)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-1 text-sm text-neutral-600 sm:flex-row sm:justify-between">
                  <span className="font-medium tabular-nums text-[var(--brand-pine)]">
                    {nok.format(c.amountOre / 100)}
                  </span>
                  <span className="tabular-nums text-neutral-500">
                    Oppdatert {dtf.format(new Date(c.updatedAt))}
                  </span>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
