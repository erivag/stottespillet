"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { orderStatusBadgeClass, orderStatusNb } from "@/lib/admin/labels";
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

export default function AdminOrdrerPage() {
  const { data, isLoading, isError } = trpc.admin.listOrders.useQuery();

  if (isError) {
    return (
      <p className="text-sm text-destructive">Kunne ikke laste ordrer.</p>
    );
  }

  const items = data?.items ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-heading text-2xl font-semibold tracking-tight text-[var(--brand-pine)] sm:text-3xl">
          Ordrer
        </h2>
        <p className="mt-1 text-sm text-neutral-600">
          Produkt og antall hentes fra shop-bestillinger når ordren er knyttet
          til et produkt.
        </p>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--brand-pine)]/25 bg-white px-6 py-12 text-center text-sm text-neutral-600">
          Ingen ordrer ennå.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[var(--brand-pine)]/10 bg-white shadow-sm">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-[var(--brand-pine)]/10 bg-[var(--brand-cream)]/50">
              <tr>
                <th className="px-4 py-3 font-medium text-[var(--brand-pine)]">
                  Lag
                </th>
                <th className="px-4 py-3 font-medium text-[var(--brand-pine)]">
                  Produkt
                </th>
                <th className="px-4 py-3 font-medium text-[var(--brand-pine)]">
                  Antall
                </th>
                <th className="px-4 py-3 font-medium text-[var(--brand-pine)]">
                  Beløp (eks. MVA)
                </th>
                <th className="px-4 py-3 font-medium text-[var(--brand-pine)]">
                  Status
                </th>
                <th className="px-4 py-3 font-medium text-[var(--brand-pine)]">
                  Dato
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
                  <td className="px-4 py-3 text-neutral-700">
                    {row.productName?.trim() ? row.productName : "—"}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-neutral-600">
                    {row.quantity}
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {nok.format(row.totalOre / 100)}{" "}
                    <span className="text-xs font-normal text-neutral-500">
                      eks. MVA
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex rounded-full border px-2 py-0.5 text-xs font-medium",
                        orderStatusBadgeClass(row.status)
                      )}
                    >
                      {orderStatusNb(row.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-neutral-500">
                    {dtf.format(new Date(row.createdAt))}
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
