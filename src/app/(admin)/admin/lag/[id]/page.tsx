"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  campaignStatusNb,
  orderStatusNb,
  segmentLabel,
} from "@/lib/admin/labels";
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

export default function AdminLagDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";

  const { data, isLoading, isError } = trpc.admin.getOrganization.useQuery(
    { id },
    { enabled: id.length > 0 }
  );

  if (!id) {
    return <p className="text-sm text-destructive">Ugyldig id.</p>;
  }

  if (isLoading) {
    return <Skeleton className="h-96 w-full rounded-xl" />;
  }

  if (isError || !data) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-destructive">Lag ikke funnet.</p>
        <Link
          href="/admin/lag"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "border-[var(--brand-pine)]/20"
          )}
        >
          Tilbake til lag
        </Link>
      </div>
    );
  }

  const { organization: o, stats, recentCampaigns, recentOrders } = data;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/admin/lag"
            className="text-sm font-medium text-[var(--brand-pine)] underline-offset-2 hover:underline"
          >
            ← Alle lag
          </Link>
          <h2 className="font-heading mt-2 text-2xl font-semibold tracking-tight text-[var(--brand-pine)] sm:text-3xl">
            {o.name}
          </h2>
          <p className="mt-1 text-sm text-neutral-600">
            Type: {segmentLabel(o.segment)} · Kommune:{" "}
            {o.municipality?.trim() ? o.municipality : "—"}
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            Registrert {dtf.format(new Date(o.createdAt))}
          </p>
        </div>
        <span
          className={
            o.isActive
              ? "inline-flex w-fit rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-900"
              : "inline-flex w-fit rounded-full border border-neutral-200 bg-neutral-100 px-3 py-1 text-sm font-medium text-neutral-700"
          }
        >
          {o.isActive ? "Aktiv" : "Inaktiv"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="border-[var(--brand-pine)]/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-neutral-500">
              Søknader
            </CardTitle>
          </CardHeader>
          <CardContent className="font-heading text-2xl font-semibold text-[var(--brand-pine)]">
            {stats.campaignCount}
          </CardContent>
        </Card>
        <Card className="border-[var(--brand-pine)]/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-neutral-500">
              Ordrer
            </CardTitle>
          </CardHeader>
          <CardContent className="font-heading text-2xl font-semibold text-[var(--brand-pine)]">
            {stats.orderCount}
          </CardContent>
        </Card>
      </div>

      <section>
        <h3 className="font-heading mb-3 text-lg font-semibold text-[var(--brand-pine)]">
          Siste søknader
        </h3>
        {recentCampaigns.length === 0 ? (
          <p className="text-sm text-neutral-500">Ingen søknader.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {recentCampaigns.map((c) => (
              <li
                key={c.id}
                className="rounded-lg border border-[var(--brand-pine)]/10 bg-white px-4 py-3 text-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium text-[var(--brand-pine)]">
                    {c.title}
                  </span>
                  <span className="text-xs text-neutral-500">
                    {campaignStatusNb(c.status)}
                  </span>
                </div>
                <div className="mt-1 text-neutral-600">
                  {nok.format(c.amountOre / 100)} ·{" "}
                  {dtf.format(new Date(c.updatedAt))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3 className="font-heading mb-3 text-lg font-semibold text-[var(--brand-pine)]">
          Siste ordrer
        </h3>
        {recentOrders.length === 0 ? (
          <p className="text-sm text-neutral-500">Ingen ordrer.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {recentOrders.map((ord) => (
              <li
                key={ord.id}
                className="rounded-lg border border-[var(--brand-pine)]/10 bg-white px-4 py-3 text-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="tabular-nums font-medium text-[var(--brand-pine)]">
                    {nok.format(ord.totalOre / 100)}
                  </span>
                  <span className="text-xs">{orderStatusNb(ord.status)}</span>
                </div>
                <div className="mt-1 text-xs text-neutral-500">
                  {dtf.format(new Date(ord.createdAt))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
