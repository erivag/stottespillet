"use client";

import type { ComponentType } from "react";
import { Building2, Coins, Mail, Package, Sparkles, Users } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { orderStatusNb, segmentLabel } from "@/lib/admin/labels";
import { EMPTY_ADMIN_DASHBOARD } from "@/lib/dashboard-fallbacks";
import { trpc } from "@/lib/trpc/react";

const nok = new Intl.NumberFormat("nb-NO", {
  style: "currency",
  currency: "NOK",
  maximumFractionDigits: 0,
});

const dtf = new Intl.DateTimeFormat("nb-NO", {
  dateStyle: "medium",
});

export default function AdminDashboardPage() {
  const { data, isLoading, isError } = trpc.admin.dashboard.useQuery();

  if (isLoading) {
    return <AdminDashboardSkeleton />;
  }

  const d = data ?? EMPTY_ADMIN_DASHBOARD;

  return (
    <div className="flex flex-col gap-8">
      {isError ? (
        <p className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-center text-xs text-neutral-500">
          Data kunne ikke lastes akkurat nå. Tallene under kan være tomme.
        </p>
      ) : null}
      <div>
        <h2 className="font-heading text-2xl font-semibold tracking-tight text-[var(--brand-pine)] sm:text-3xl">
          Oversikt
        </h2>
        <p className="mt-1 text-sm text-neutral-600">
          Tall fra databasen — ingen demo-data.
        </p>
      </div>

      <section
        aria-label="Hovedtall"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <StatCard
          title="Registrerte lag"
          value={String(d.organizationsCount)}
          icon={Users}
        />
        <StatCard
          title="Registrerte bedrifter"
          value={String(d.sponsorsCount)}
          icon={Building2}
        />
        <StatCard
          title="Sponsormidler formidlet"
          value={nok.format(d.totalSponsoredOre / 100)}
          icon={Coins}
        />
        <StatCard
          title="Aktive spleiser"
          value={String(d.activeSpleisesCount)}
          icon={Sparkles}
        />
      </section>

      <section
        aria-label="Aktivitet siste 7 dager"
        className="grid grid-cols-1 gap-4 md:grid-cols-3"
      >
        <ActivityCard
          title="Nye lag (7 dager)"
          value={String(d.newOrganizationsLast7Days)}
          icon={Users}
        />
        <ActivityCard
          title="Sendte e-poster (7 dager)"
          value={String(d.emailsSentLast7Days)}
          icon={Mail}
        />
        <ActivityCard
          title="Ordrer til behandling"
          value={String(d.ordersPendingTreatment)}
          icon={Package}
        />
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <section aria-labelledby="recent-orgs-heading">
          <h3
            id="recent-orgs-heading"
            className="font-heading mb-3 text-lg font-semibold text-[var(--brand-pine)]"
          >
            Siste registrerte lag
          </h3>
          {d.recentOrganizations.length === 0 ? (
            <Card className="border-dashed border-[var(--brand-pine)]/20 bg-white">
              <CardContent className="text-muted-foreground py-10 text-center text-sm">
                Ingen lag registrert ennå.
              </CardContent>
            </Card>
          ) : (
            <div className="overflow-hidden rounded-xl border border-[var(--brand-pine)]/10 bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-[var(--brand-pine)]/10 bg-[var(--brand-cream)]/50">
                  <tr>
                    <th className="px-4 py-3 font-medium text-[var(--brand-pine)]">
                      Navn
                    </th>
                    <th className="px-4 py-3 font-medium text-[var(--brand-pine)]">
                      Type
                    </th>
                    <th className="px-4 py-3 font-medium text-[var(--brand-pine)]">
                      Dato
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {d.recentOrganizations.map((o) => (
                    <tr
                      key={o.id}
                      className="border-b border-[var(--brand-pine)]/5 last:border-0"
                    >
                      <td className="px-4 py-3 font-medium text-[var(--brand-pine)]">
                        {o.name}
                      </td>
                      <td className="px-4 py-3 text-neutral-600">
                        {segmentLabel(o.segment)}
                      </td>
                      <td className="px-4 py-3 text-neutral-500 tabular-nums">
                        {dtf.format(new Date(o.createdAt))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section aria-labelledby="recent-orders-heading">
          <h3
            id="recent-orders-heading"
            className="font-heading mb-3 text-lg font-semibold text-[var(--brand-pine)]"
          >
            Siste ordrer
          </h3>
          {d.recentOrders.length === 0 ? (
            <Card className="border-dashed border-[var(--brand-pine)]/20 bg-white">
              <CardContent className="text-muted-foreground py-10 text-center text-sm">
                Ingen ordrer ennå.
              </CardContent>
            </Card>
          ) : (
            <div className="overflow-hidden rounded-xl border border-[var(--brand-pine)]/10 bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-[var(--brand-pine)]/10 bg-[var(--brand-cream)]/50">
                  <tr>
                    <th className="px-4 py-3 font-medium text-[var(--brand-pine)]">
                      Lag
                    </th>
                    <th className="px-4 py-3 font-medium text-[var(--brand-pine)]">
                      Produkt
                    </th>
                    <th className="px-4 py-3 font-medium text-[var(--brand-pine)]">
                      Beløp
                    </th>
                    <th className="px-4 py-3 font-medium text-[var(--brand-pine)]">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {d.recentOrders.map((o) => (
                    <tr
                      key={o.id}
                      className="border-b border-[var(--brand-pine)]/5 last:border-0"
                    >
                      <td className="px-4 py-3 font-medium text-[var(--brand-pine)]">
                        {o.organizationName}
                      </td>
                      <td className="px-4 py-3 text-neutral-500">
                        {o.productLabel ?? "—"}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-neutral-700">
                        {nok.format(o.totalOre / 100)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full border border-[var(--brand-pine)]/15 bg-[var(--brand-cream)] px-2 py-0.5 text-xs font-medium text-[var(--brand-pine)]">
                          {orderStatusNb(o.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="border-t border-[var(--brand-pine)]/10 px-4 py-2 text-xs text-neutral-500">
                Produktnavn per ordre krever ordrelinjer i databasen.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="border-[var(--brand-pine)]/10 bg-white transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
        <CardTitle className="text-sm font-medium leading-tight text-[var(--brand-pine)]">
          {title}
        </CardTitle>
        <Icon
          className="size-5 shrink-0 text-[var(--brand-gold)]"
          aria-hidden
        />
      </CardHeader>
      <CardContent>
        <p className="font-heading text-2xl font-semibold tabular-nums text-[var(--brand-pine)]">
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

function ActivityCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="border-[var(--brand-pine)]/10 bg-white transition-shadow hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardDescription className="text-[var(--brand-pine)]/80">
            {title}
          </CardDescription>
          <Icon className="size-4 text-[var(--brand-gold)]" aria-hidden />
        </div>
        <CardTitle className="font-heading text-3xl font-semibold tabular-nums text-[var(--brand-pine)]">
          {value}
        </CardTitle>
      </CardHeader>
    </Card>
  );
}

function AdminDashboardSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <Skeleton className="h-10 w-48" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    </div>
  );
}
