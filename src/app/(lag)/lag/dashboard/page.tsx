"use client";

import type { ComponentType } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ClipboardList,
  Coins,
  Handshake,
  Inbox,
  Package,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EMPTY_LAG_DASHBOARD } from "@/lib/dashboard-fallbacks";
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

export default function LagDashboardPage() {
  const router = useRouter();
  const [profilLagret, setProfilLagret] = useState(false);

  const { data, isLoading, isError } = trpc.lag.dashboard.useQuery(undefined, {
    retry: false,
    throwOnError: false,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("profilLagret") !== "1") return;
    setProfilLagret(true);
    router.replace("/lag/dashboard", { scroll: false });
  }, [router]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError) {
    return (
      <Card className="border-dashed border-[var(--brand-pine)]/20 bg-white">
        <CardHeader>
          <CardTitle className="text-base text-[var(--brand-pine)]">
            Dashboard
          </CardTitle>
          <CardDescription>
            Vi fikk ikke lastet data akkurat nå. Prøv igjen om litt.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-neutral-600">
          Dashbordet viser foreløpig ingen data.
        </CardContent>
      </Card>
    );
  }

  const d = data ?? EMPTY_LAG_DASHBOARD;

  const showEmptyApplications = d.activeApplications === 0;
  const needsProfile = d.organizationName === null;

  return (
    <div className="flex flex-col gap-8">
      {profilLagret ? (
        <p
          className="rounded-lg border border-[var(--brand-pine)]/20 bg-[var(--brand-pine)]/5 px-4 py-3 text-sm font-medium text-[var(--brand-pine)]"
          role="status"
        >
          Profil lagret!
        </p>
      ) : null}

      {needsProfile ? (
        <Card className="border-[var(--brand-gold)]/35 bg-gradient-to-br from-amber-50 to-white shadow-sm">
          <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="min-w-0 space-y-1">
              <p className="font-heading text-lg font-semibold text-[var(--brand-pine)]">
                Velkommen! Fullfør profilen din
              </p>
              <p className="text-sm text-neutral-600">
                Legg til lagnavn og kommune for å komme i gang.
              </p>
            </div>
            <Link
              href="/lag/innstillinger"
              className={cn(
                buttonVariants(),
                "shrink-0 bg-[var(--brand-pine)] text-white hover:bg-[var(--brand-pine-light)]"
              )}
            >
              Fullfør profil →
            </Link>
          </CardContent>
        </Card>
      ) : null}

      <Card className="border-[var(--brand-pine)]/12 bg-gradient-to-br from-[var(--brand-pine)] to-[var(--brand-pine-mid)] text-white shadow-md">
        <CardContent className="p-6 sm:p-8">
          <p className="text-sm font-medium text-[var(--brand-gold)]">
            Velkommen tilbake
          </p>
          <h1 className="font-heading mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            {d.organizationName ?? "Ditt lag"}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-white/80 sm:text-base">
            {d.organizationName
              ? "Her ser du status for søknader, ordrer og svar fra sponsorer."
              : "Koble et lag til kontoen din ved å fullføre registrering og opprette en søknad."}
          </p>
        </CardContent>
      </Card>

      {showEmptyApplications ? (
        <Card className="border-dashed border-[var(--brand-pine)]/25 bg-white">
          <CardContent className="flex flex-col items-center gap-4 py-10 text-center sm:py-12">
            <p className="max-w-md text-neutral-600">
              Du har ingen aktive søknader ennå. Opprett en søknad for å starte
              sponsorsøk.
            </p>
            <Link
              href="/kampanje/ny"
              className={cn(
                buttonVariants(),
                "bg-[var(--brand-pine)] text-white hover:bg-[var(--brand-pine-light)]"
              )}
            >
              Opprett din første søknad
            </Link>
          </CardContent>
        </Card>
      ) : null}

      <section
        aria-label="Oversikt"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <StatCard
          title="Sponsormidler mottatt"
          description="Betalte sponsorater (totalt)"
          value={nok.format(d.sponsorFundsOre / 100)}
          icon={Coins}
        />
        <StatCard
          title="Aktive søknader"
          description="Kampanjer med status aktiv"
          value={String(d.activeApplications)}
          icon={ClipboardList}
        />
        <StatCard
          title="Produktordrer"
          description="Registrerte ordrelinjer"
          value={String(d.productOrdersCount)}
          icon={Package}
        />
        <StatCard
          title="Uleste svar"
          description="Venter på deg (pending / betaling)"
          value={String(d.unreadResponses)}
          icon={Inbox}
        />
      </section>

      <section aria-label="Snarveier">
        <h2 className="font-heading mb-3 text-lg font-semibold text-[var(--brand-pine)]">
          Snarveier
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <ShortcutCard
            href="/kampanje/ny"
            title="Søk sponsor"
            text="Start en ny sponsorsøknad."
            icon={Handshake}
          />
          <ShortcutCard
            href="/lag/shop"
            title="Bestill"
            text="Produkter med sponsor-logo i giveaway-shop."
            icon={ShoppingBag}
          />
          <ShortcutCard
            href="/lag/spleis"
            title="Spleis"
            text="Flere bedrifter finansierer større anskaffelser."
            icon={Sparkles}
          />
        </div>
      </section>

      <section aria-label="Siste aktivitet">
        <h2 className="font-heading mb-3 text-lg font-semibold text-[var(--brand-pine)]">
          Siste aktivitet
        </h2>
        {d.recentActivity.length === 0 ? (
          <Card className="border-dashed border-[var(--brand-pine)]/20 bg-white">
            <CardContent className="text-muted-foreground py-10 text-center text-sm">
              Ingen aktivitet å vise ennå.
            </CardContent>
          </Card>
        ) : (
          <ul className="flex flex-col gap-2">
            {d.recentActivity.map((a) => (
              <li key={a.id}>
                <Card className="border-[var(--brand-pine)]/10 transition-shadow hover:shadow-md">
                  <CardContent className="flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-medium text-[var(--brand-pine)]">
                        {a.title}
                      </p>
                      <p className="text-muted-foreground text-sm">{a.detail}</p>
                    </div>
                    <span className="text-muted-foreground shrink-0 text-xs tabular-nums sm:text-sm">
                      {dtf.format(new Date(a.occurredAt))}
                    </span>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
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

function ShortcutCard({
  href,
  title,
  text,
  icon: Icon,
}: {
  href: string;
  title: string;
  text: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <Link href={href}>
      <Card className="h-full border-[var(--brand-pine)]/10 bg-white transition-all hover:-translate-y-0.5 hover:border-[var(--brand-gold)]/40 hover:shadow-md">
        <CardHeader className="pb-2">
          <Icon
            className="mb-1 size-5 text-[var(--brand-gold)]"
            aria-hidden
          />
          <CardTitle className="text-base text-[var(--brand-pine)]">
            {title}
          </CardTitle>
          <CardDescription>{text}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <Skeleton className="h-36 w-full rounded-xl" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-6 w-32" />
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-40 w-full rounded-xl" />
    </div>
  );
}
