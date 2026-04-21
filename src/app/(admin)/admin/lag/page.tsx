"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { segmentLabel } from "@/lib/admin/labels";
import { trpc } from "@/lib/trpc/react";

const TYPE_FILTER = [
  { value: "", label: "Alle typer" },
  { value: "idrettslag", label: "Idrettslag" },
  { value: "golfklubb", label: "Golfklubb" },
  { value: "17mai", label: "17. mai-komité" },
  { value: "barnehage", label: "Barnehage" },
  { value: "annet", label: "Annet" },
] as const;

const dtf = new Intl.DateTimeFormat("nb-NO", {
  dateStyle: "medium",
});

export default function AdminLagPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [segment, setSegment] = useState("");

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => window.clearTimeout(t);
  }, [search]);

  const { data, isLoading, isError } = trpc.admin.listOrganizations.useQuery({
    search: debouncedSearch || undefined,
    segment: segment || null,
  });

  if (isError) {
    return (
      <p className="text-sm text-destructive">Kunne ikke laste lagliste.</p>
    );
  }

  const items = data?.items ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-heading text-2xl font-semibold tracking-tight text-[var(--brand-pine)] sm:text-3xl">
          Lag
        </h2>
        <p className="mt-1 text-sm text-neutral-600">
          Registrerte organisasjoner med aggregerte tall fra databasen.
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-2">
          <Label htmlFor="lag-search" className="text-[var(--brand-pine)]">
            Søk på navn
          </Label>
          <Input
            id="lag-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Skriv for å filtrere …"
            className="border-[var(--brand-pine)]/15 focus-visible:ring-[var(--brand-gold)]/40"
          />
        </div>
        <div className="w-full space-y-2 sm:w-52">
          <Label htmlFor="lag-type" className="text-[var(--brand-pine)]">
            Type
          </Label>
          <select
            id="lag-type"
            value={segment}
            onChange={(e) => setSegment(e.target.value)}
            className="border-input bg-background flex h-10 w-full rounded-md border px-3 text-sm focus-visible:ring-2 focus-visible:ring-[var(--brand-gold)]/40 focus-visible:outline-none"
          >
            {TYPE_FILTER.map((o) => (
              <option key={o.value || "all"} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--brand-pine)]/25 bg-white px-6 py-12 text-center text-sm text-neutral-600">
          Ingen lag registrert ennå.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[var(--brand-pine)]/10 bg-white shadow-sm">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-[var(--brand-pine)]/10 bg-[var(--brand-cream)]/50">
              <tr>
                <th className="px-4 py-3 font-medium text-[var(--brand-pine)]">
                  Navn
                </th>
                <th className="px-4 py-3 font-medium text-[var(--brand-pine)]">
                  Type
                </th>
                <th className="px-4 py-3 font-medium text-[var(--brand-pine)]">
                  Kommune
                </th>
                <th className="px-4 py-3 font-medium text-[var(--brand-pine)]">
                  Registrert
                </th>
                <th className="px-4 py-3 font-medium text-[var(--brand-pine)]">
                  Søknader
                </th>
                <th className="px-4 py-3 font-medium text-[var(--brand-pine)]">
                  Ordrer
                </th>
                <th className="px-4 py-3 font-medium text-[var(--brand-pine)]">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr
                  key={row.id}
                  className="cursor-pointer border-b border-[var(--brand-pine)]/5 transition-colors last:border-0 hover:bg-[var(--brand-cream)]/40"
                  onClick={() => router.push(`/admin/lag/${row.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      router.push(`/admin/lag/${row.id}`);
                    }
                  }}
                  tabIndex={0}
                  role="link"
                  aria-label={`Detaljer for ${row.name}`}
                >
                  <td className="px-4 py-3 font-medium text-[var(--brand-pine)]">
                    <Link
                      href={`/admin/lag/${row.id}`}
                      className="underline-offset-2 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {row.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {segmentLabel(row.type)}
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {row.municipality?.trim() ? row.municipality : "—"}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-neutral-500">
                    {dtf.format(new Date(row.createdAt))}
                  </td>
                  <td className="px-4 py-3 tabular-nums">{row.campaignCount}</td>
                  <td className="px-4 py-3 tabular-nums">{row.orderCount}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        row.isActive
                          ? "rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-900"
                          : "rounded-full border border-neutral-200 bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-700"
                      }
                    >
                      {row.isActive ? "Aktiv" : "Inaktiv"}
                    </span>
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
