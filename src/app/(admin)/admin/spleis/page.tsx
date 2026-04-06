"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { spleisStatusNb, spleisTypeNb } from "@/lib/admin/labels";
import { trpc } from "@/lib/trpc/react";

const nok = new Intl.NumberFormat("nb-NO", {
  style: "currency",
  currency: "NOK",
  maximumFractionDigits: 0,
});

const dtf = new Intl.DateTimeFormat("nb-NO", {
  dateStyle: "medium",
});

export default function AdminSpleisPage() {
  const { data, isLoading, isError } = trpc.admin.listSpleises.useQuery();

  if (isError) {
    return (
      <p className="text-sm text-destructive">Kunne ikke laste spleiser.</p>
    );
  }

  const items = data?.items ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-heading text-2xl font-semibold tracking-tight text-[var(--brand-pine)] sm:text-3xl">
          Spleiser
        </h2>
        <p className="mt-1 text-sm text-neutral-600">
          Alle spleiskampanjer koblet til lag i databasen.
        </p>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--brand-pine)]/25 bg-white px-6 py-12 text-center text-sm text-neutral-600">
          Ingen spleiser ennå.
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
                  Målbeløp
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
                    {spleisTypeNb(row.type)}
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {nok.format(row.targetAmountOre / 100)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full border border-[var(--brand-pine)]/15 bg-[var(--brand-cream)]/60 px-2 py-0.5 text-xs font-medium text-[var(--brand-pine)]">
                      {spleisStatusNb(row.status)}
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
