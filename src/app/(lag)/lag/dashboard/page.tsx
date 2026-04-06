"use client";

import type { ComponentType } from "react";
import Link from "next/link";
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
  const { data, isLoading, isError } = trpc.lag.dashboard.useQuery();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-white p-6 text-sm text-destructive shadow-sm">
        Noe gikk galt ved lasting av dashbordet. Prøv å oppdatere siden.
      </div>
    );
  }

  if (!data) {
    return <DashboardSkeleton />;
  }

  const showEmptyApplications = data.activeApplications === 0;

  return (
    <div className="flex flex-col gap-8">
      <Card className="border-[var(--brand-pine)]/12 bg-gradient-to-br from-[var(--brand-pine)] to-[var(--brand-pine-mid)] text-white shadow-md">
        <CardContent className="p-6 sm:p-8">
          <p className="text-sm font-medium text-[var(--brand-gold)]">
            Velkommen tilbake
          </p>
          <h1 className="font-heading mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            {data.organizationName ?? "Ditt lag"}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-white/80 sm:text-base">
            {data.organizationName
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
          value={nok.format(data.sponsorFundsOre / 100)}
          icon={Coins}
        />
        <StatCard
          title="Aktive søknader"
          description="Kampanjer med status aktiv"
          value={String(data.activeApplications)}
          icon={ClipboardList}
        />
        <StatCard
          title="Produktordrer"
          description="Registrerte ordrelinjer"
          value={String(data.productOrdersCount)}
          icon={Package}
        />
        <StatCard
          title="Uleste svar"
          description="Venter på deg (pending / betaling)"
          value={String(data.unreadResponses)}
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
        {data.recentActivity.length === 0 ? (
          <Card className="border-dashed border-[var(--brand-pine)]/20 bg-white">
            <CardContent className="text-muted-foreground py-10 text-center text-sm">
              Ingen aktivitet å vise ennå.
            </CardContent>
          </Card>
        ) : (
          <ul className="flex flex-col gap-2">
            {data.recentActivity.map((a) => (
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
