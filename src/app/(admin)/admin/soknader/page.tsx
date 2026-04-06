"use client";

import { useState } from "react";

import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  campaignStatusNb,
  campaignTypeLabel,
} from "@/lib/admin/labels";
import { trpc } from "@/lib/trpc/react";

const nok = new Intl.NumberFormat("nb-NO", {
  style: "currency",
  currency: "NOK",
  maximumFractionDigits: 0,
});

const dtf = new Intl.DateTimeFormat("nb-NO", {
  dateStyle: "medium",
});

const FILTERS = [
  { value: "all" as const, label: "Alle" },
  { value: "active" as const, label: "Aktiv" },
  { value: "closed" as const, label: "Avsluttet" },
  { value: "draft" as const, label: "Utkast" },
];

export default function AdminSoknaderPage() {
  const [statusFilter, setStatusFilter] =
    useState<(typeof FILTERS)[number]["value"]>("all");

  const { data, isLoading, isError } = trpc.admin.listCampaigns.useQuery({
    statusFilter,
  });

  if (isError) {
    return (
      <p className="text-sm text-destructive">Kunne ikke laste søknader.</p>
    );
  }

  const items = data?.items ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-heading text-2xl font-semibold tracking-tight text-[var(--brand-pine)] sm:text-3xl">
          Søknader
        </h2>
        <p className="mt-1 text-sm text-neutral-600">
          Alle sponsorsøknader (kampanjer) med status fra databasen.
        </p>
      </div>

      <div className="w-full max-w-xs space-y-2">
        <Label htmlFor="soknad-filter" className="text-[var(--brand-pine)]">
          Status
        </Label>
        <select
          id="soknad-filter"
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as (typeof FILTERS)[number]["value"])
          }
          className="border-input bg-background flex h-10 w-full rounded-md border px-3 text-sm focus-visible:ring-2 focus-visible:ring-[var(--brand-gold)]/40 focus-visible:outline-none"
        >
          {FILTERS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--brand-pine)]/25 bg-white px-6 py-12 text-center text-sm text-neutral-600">
          Ingen søknader ennå.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[var(--brand-pine)]/10 bg-white shadow-sm">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-[var(--brand-pine)]/10 bg-[var(--brand-cream)]/50">
              <tr>
                <th className="px-4 py-3 font-medium text-[var(--brand-pine)]">
                  Lag
                </th>
                <th className="px-4 py-3 font-medium text-[var(--brand-pine)]">
                  Tittel
                </th>
                <th className="px-4 py-3 font-medium text-[var(--brand-pine)]">
                  Type
                </th>
                <th className="px-4 py-3 font-medium text-[var(--brand-pine)]">
                  Beløp
                </th>
                <th className="px-4 py-3 font-medium text-[var(--brand-pine)]">
                  Status
                </th>
                <th className="px-4 py-3 font-medium text-[var(--brand-pine)]">
                  Oppdatert
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-[var(--brand-pine)]/5 last:border-0"
                >
                  <td className="px-4 py-3 font-medium text-[var(--brand-pine)]">
                    {row.organizationName}
                  </td>
                  <td className="px-4 py-3 text-neutral-700">{row.title}</td>
                  <td className="px-4 py-3 text-neutral-600">
                    {campaignTypeLabel(row.campaignType)}
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {nok.format(row.amountOre / 100)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full border border-[var(--brand-pine)]/15 bg-[var(--brand-cream)]/60 px-2 py-0.5 text-xs font-medium text-[var(--brand-pine)]">
                      {campaignStatusNb(row.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-neutral-500">
                    {dtf.format(new Date(row.updatedAt))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
