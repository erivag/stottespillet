"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc/react";

const nok = new Intl.NumberFormat("nb-NO", {
  style: "currency",
  currency: "NOK",
  maximumFractionDigits: 0,
});

const dtf = new Intl.DateTimeFormat("nb-NO", {
  dateStyle: "medium",
});

export default function AdminBedrifterPage() {
  const { data, isLoading, isError } = trpc.admin.listSponsors.useQuery();

  if (isError) {
    return (
      <p className="text-sm text-destructive">Kunne ikke laste bedrifter.</p>
    );
  }

  const items = data?.items ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-heading text-2xl font-semibold tracking-tight text-[var(--brand-pine)] sm:text-3xl">
          Bedrifter
        </h2>
        <p className="mt-1 text-sm text-neutral-600">
          Registrerte sponsorer med betalte beløp og aktive sponsorat fra
          databasen.
        </p>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--brand-pine)]/25 bg-white px-6 py-12 text-center text-sm text-neutral-600">
          Ingen bedrifter registrert ennå.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[var(--brand-pine)]/10 bg-white shadow-sm">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="border-b border-[var(--brand-pine)]/10 bg-[var(--brand-cream)]/50">
              <tr>
                <th className="px-4 py-3 font-medium text-[var(--brand-pine)]">
                  Navn
                </th>
                <th className="px-4 py-3 font-medium text-[var(--brand-pine)]">
                  Bransje
                </th>
                <th className="px-4 py-3 font-medium text-[var(--brand-pine)]">
                  Kommune
                </th>
                <th className="px-4 py-3 font-medium text-[var(--brand-pine)]">
                  Registrert
                </th>
                <th className="px-4 py-3 font-medium text-[var(--brand-pine)]">
                  Totalt sponset
                </th>
                <th className="px-4 py-3 font-medium text-[var(--brand-pine)]">
                  Aktive sponsorat
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
                    {row.companyName}
                  </td>
                  <td className="px-4 py-3 text-neutral-500">—</td>
                  <td className="px-4 py-3 text-neutral-500">—</td>
                  <td className="px-4 py-3 tabular-nums text-neutral-500">
                    {dtf.format(new Date(row.createdAt))}
                  </td>
                  <td className="px-4 py-3 tabular-nums font-medium text-[var(--brand-pine)]">
                    {nok.format(row.totalSponsoredOre / 100)}
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {row.activeSponsoratsCount}
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
