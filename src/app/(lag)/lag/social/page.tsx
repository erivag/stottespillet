"use client";

import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
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

const dtf = new Intl.DateTimeFormat("nb-NO", {
  dateStyle: "medium",
  timeStyle: "short",
});

function postStatusNb(s: string): string {
  switch (s) {
    case "draft":
      return "Utkast";
    case "published":
      return "Publisert";
    default:
      return s;
  }
}

export default function LagSocialPage() {
  const { data, isLoading, isError, refetch } =
    trpc.lag.mySocialPosts.useQuery();

  const items = data?.items ?? [];
  const published = items.filter((p) => p.status === "published");
  const drafts = items.filter((p) => p.status === "draft");

  return (
    <div className="flex flex-col gap-10">
      <header>
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-[var(--brand-pine)] sm:text-3xl">
          Sosiale medier
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-neutral-600 sm:text-base">
          AI genererer innlegg til Facebook og Instagram basert på kampanjene
          dine.
        </p>
      </header>

      <section aria-labelledby="koble-heading">
        <h2
          id="koble-heading"
          className="font-heading mb-4 text-lg font-semibold text-[var(--brand-pine)]"
        >
          Koble til sosiale medier
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-[var(--brand-pine)]/10 bg-white">
            <CardHeader>
              <CardTitle className="text-[var(--brand-pine)]">Facebook</CardTitle>
              <CardDescription>
                Koble lagets Facebook-side for å forberede publisering.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                type="button"
                variant="outline"
                className="border-[var(--brand-pine)]/25"
                disabled
              >
                Koble til
              </Button>
            </CardContent>
          </Card>
          <Card className="border-[var(--brand-pine)]/10 bg-white">
            <CardHeader>
              <CardTitle className="text-[var(--brand-pine)]">
                Instagram
              </CardTitle>
              <CardDescription>
                Koble Instagram-kontoen som skal brukes til innlegg.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                type="button"
                variant="outline"
                className="border-[var(--brand-pine)]/25"
                disabled
              >
                Koble til
              </Button>
            </CardContent>
          </Card>
        </div>
        <p className="mt-3 text-sm text-neutral-600">
          Kobling til Meta kreves for automatisk publisering.
        </p>
      </section>

      <section aria-labelledby="innlegg-heading">
        <h2
          id="innlegg-heading"
          className="font-heading mb-4 text-lg font-semibold text-[var(--brand-pine)]"
        >
          Innlegg
        </h2>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-28 w-full rounded-xl" />
          </div>
        ) : isError ? (
          <p className="text-sm text-destructive">
            Kunne ikke laste innlegg.{" "}
            <button
              type="button"
              className="font-medium underline"
              onClick={() => void refetch()}
            >
              Prøv igjen
            </button>
          </p>
        ) : published.length === 0 && drafts.length === 0 ? (
          <Card className="border-dashed border-[var(--brand-pine)]/25 bg-white">
            <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
              <p className="text-neutral-600">Ingen innlegg ennå.</p>
              <Button
                type="button"
                disabled
                className="bg-[var(--brand-pine)] text-white hover:bg-[var(--brand-pine-light)]"
              >
                Generer innlegg med AI
              </Button>
              <p className="text-xs text-neutral-500">
                Funksjonen aktiveres når Meta-integrasjonen er på plass.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-6">
            {published.length > 0 ? (
              <ul className="flex flex-col gap-3">
                {published.map((p) => (
                  <li key={p.id}>
                    <Card className="border-[var(--brand-pine)]/10 transition-shadow hover:shadow-md">
                      <CardHeader className="pb-2">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <CardTitle className="text-base text-[var(--brand-pine)]">
                            {p.platform}
                          </CardTitle>
                          <span className="inline-flex w-fit shrink-0 rounded-full border border-[var(--brand-pine)]/15 bg-[var(--brand-cream)] px-2.5 py-0.5 text-xs font-medium text-[var(--brand-pine)]">
                            {postStatusNb(p.status)}
                          </span>
                        </div>
                        <CardDescription className="line-clamp-3 text-neutral-700">
                          {p.content}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="text-xs text-neutral-500">
                        {p.postedAt
                          ? `Publisert ${dtf.format(new Date(p.postedAt))}`
                          : `Opprettet ${dtf.format(new Date(p.createdAt))}`}
                      </CardContent>
                    </Card>
                  </li>
                ))}
              </ul>
            ) : null}

            {drafts.length > 0 ? (
              <div>
                <h3 className="font-heading mb-3 text-base font-semibold text-[var(--brand-pine)]">
                  Utkast
                </h3>
                <ul className="flex flex-col gap-3">
                  {drafts.map((p) => (
                    <li key={p.id}>
                      <Card className="border-dashed border-[var(--brand-pine)]/20 bg-white/80">
                        <CardHeader className="pb-2">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <CardTitle className="text-base text-[var(--brand-pine)]">
                              {p.platform}
                            </CardTitle>
                            <span className="text-xs font-medium text-neutral-500">
                              {postStatusNb(p.status)}
                            </span>
                          </div>
                          <CardDescription className="line-clamp-2">
                            {p.content}
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <Link
              href="/lag/social/ny"
              className={cn(
                buttonVariants(),
                "w-full bg-[var(--brand-pine)] text-white hover:bg-[var(--brand-pine-light)] sm:w-auto"
              )}
            >
              Generer innlegg med AI
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
