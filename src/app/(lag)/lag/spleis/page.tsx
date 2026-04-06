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
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc/react";

const nok = new Intl.NumberFormat("nb-NO", {
  style: "currency",
  currency: "NOK",
  maximumFractionDigits: 0,
});

const dtf = new Intl.DateTimeFormat("nb-NO", {
  dateStyle: "medium",
});

function spleisStatusNb(s: string): string {
  switch (s) {
    case "draft":
      return "Utkast";
    case "active":
      return "Aktiv";
    case "funded":
      return "Finansiert";
    case "delivered":
      return "Levert";
    default:
      return s;
  }
}

const INSPIRATION = [
  {
    emoji: "🧖",
    title: "Badstue",
    line: "5 sponsorer à kr 24 000",
  },
  {
    emoji: "🏕️",
    title: "Gapahuk",
    line: "4 sponsorer à kr 12 500",
  },
  {
    emoji: "📦",
    title: "Starterbod",
    line: "3 sponsorer à kr 13 000",
  },
] as const;

export default function LagSpleisPage() {
  const { data, isLoading, isError, refetch } = trpc.lag.mySpleises.useQuery();

  const items = data?.items ?? [];
  const activeItems = items.filter((i) => i.status === "active");

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-[var(--brand-pine)] sm:text-3xl">
            Spleis
          </h1>
          <p className="mt-1 text-sm text-neutral-600 sm:text-base">
            Samle lokale sponsorer om noe stort.
          </p>
        </div>
        <Link
          href="/lag/spleis/ny"
          className={cn(
            buttonVariants(),
            "w-full bg-[var(--brand-pine)] text-white hover:bg-[var(--brand-pine-light)] sm:w-auto"
          )}
        >
          + Opprett ny spleis
        </Link>
      </header>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      ) : isError ? (
        <p className="text-sm text-destructive">
          Kunne ikke laste spleiser.{" "}
          <button
            type="button"
            className="font-medium underline"
            onClick={() => void refetch()}
          >
            Prøv igjen
          </button>
        </p>
      ) : (
        <section aria-labelledby="mine-spleiser-heading">
          <h2
            id="mine-spleiser-heading"
            className="font-heading mb-4 text-lg font-semibold text-[var(--brand-pine)]"
          >
            Mine aktive spleiser
          </h2>

          {activeItems.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {activeItems.map((s) => (
                <li key={s.id}>
                  <Card className="border-[var(--brand-pine)]/10 transition-shadow hover:shadow-md">
                    <CardHeader className="pb-2">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <CardTitle className="text-lg text-[var(--brand-pine)]">
                            {s.title}
                          </CardTitle>
                          <CardDescription>{s.typeLabel}</CardDescription>
                        </div>
                        <span className="inline-flex w-fit shrink-0 rounded-full border border-[var(--brand-pine)]/15 bg-[var(--brand-cream)] px-2.5 py-0.5 text-xs font-medium text-[var(--brand-pine)]">
                          {spleisStatusNb(s.status)}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-1 text-sm text-neutral-600 sm:flex-row sm:justify-between">
                      <span className="font-medium tabular-nums text-[var(--brand-pine)]">
                        Mål: {nok.format(s.targetAmountOre / 100)}
                      </span>
                      <span className="tabular-nums text-neutral-500">
                        Oppdatert {dtf.format(new Date(s.updatedAt))}
                      </span>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          ) : (
            <div className="grid gap-4 sm:grid-cols-3">
              {INSPIRATION.map((ex) => (
                <Card
                  key={ex.title}
                  className="border-[var(--brand-pine)]/12 bg-white"
                >
                  <CardHeader className="pb-2 text-center">
                    <span className="text-4xl" aria-hidden>
                      {ex.emoji}
                    </span>
                    <CardTitle className="pt-2 text-base text-[var(--brand-pine)]">
                      {ex.title}
                    </CardTitle>
                    <CardDescription className="text-sm font-medium text-neutral-700">
                      {ex.line}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 text-center">
                    <p className="text-xs text-neutral-500">
                      Slik fungerer spleis-modellen
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {items.length > 0 && activeItems.length === 0 ? (
            <p className="mt-6 rounded-lg border border-amber-200/80 bg-amber-50 px-4 py-3 text-sm text-amber-950">
              Du har ingen aktive spleiser akkurat nå. Opprett en ny eller se
              tidligere spleiser i listen under når de finnes.
            </p>
          ) : null}

          {items.length > 0 && items.some((i) => i.status !== "active") ? (
            <div className="mt-8">
              <h3 className="font-heading mb-3 text-base font-semibold text-[var(--brand-pine)]">
                Alle spleiser
              </h3>
              <ul className="flex flex-col gap-3">
                {items.map((s) => (
                  <li key={s.id}>
                    <Card className="border-[var(--brand-pine)]/10 bg-white/90">
                      <CardHeader className="pb-2">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <CardTitle className="text-base text-[var(--brand-pine)]">
                              {s.title}
                            </CardTitle>
                            <CardDescription>{s.typeLabel}</CardDescription>
                          </div>
                          <span className="inline-flex w-fit shrink-0 rounded-full border border-[var(--brand-pine)]/15 bg-[var(--brand-cream)] px-2.5 py-0.5 text-xs font-medium text-[var(--brand-pine)]">
                            {spleisStatusNb(s.status)}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="text-sm text-neutral-600">
                        Mål {nok.format(s.targetAmountOre / 100)} · oppdatert{" "}
                        {dtf.format(new Date(s.updatedAt))}
                      </CardContent>
                    </Card>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      )}
    </div>
  );
}
