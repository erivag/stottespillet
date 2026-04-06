"use client";

import Link from "next/link";
import { useState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  productCategoryNb,
  stockStatusNb,
  supplierDisplayLine,
} from "@/lib/shop/catalog-labels";
import { storagePublicObjectUrl } from "@/lib/supabase/storage-public-url";
import { trpc } from "@/lib/trpc/react";
import { cn } from "@/lib/utils";

const nok = new Intl.NumberFormat("nb-NO", {
  style: "currency",
  currency: "NOK",
  maximumFractionDigits: 0,
});

const dtf = new Intl.DateTimeFormat("nb-NO", {
  dateStyle: "medium",
});

export default function AdminProdukterPage() {
  const utils = trpc.useUtils();
  const { data, isLoading, isError } = trpc.admin.listProducts.useQuery();
  const deleteMut = trpc.admin.deleteProduct.useMutation({
    onSuccess: async () => {
      await utils.admin.listProducts.invalidate();
    },
  });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (isError) {
    return (
      <p className="text-sm text-destructive">Kunne ikke laste produkter.</p>
    );
  }

  const items = data?.items ?? [];

  function confirmDelete(id: string, name: string) {
    if (
      !window.confirm(
        `Slette produktet «${name}»? Dette kan ikke angres. Produktet må ikke ha tilknyttede ordrer.`
      )
    ) {
      return;
    }
    setDeletingId(id);
    deleteMut.mutate(
      { id },
      {
        onSettled: () => setDeletingId(null),
      }
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-2xl font-semibold tracking-tight text-[var(--brand-pine)] sm:text-3xl">
            Produkter
          </h2>
          <p className="mt-1 text-sm text-neutral-600">
            Administrer katalogen som vises for lag i shop (når produktet er
            aktivt).
          </p>
        </div>
        <Link
          href="/admin/produkter/ny"
          className={cn(
            buttonVariants(),
            "bg-[var(--brand-pine)] text-white hover:bg-[var(--brand-pine-light)]"
          )}
        >
          Legg til produkt
        </Link>
      </div>

      {deleteMut.error ? (
        <p className="text-sm text-destructive">{deleteMut.error.message}</p>
      ) : null}

      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--brand-pine)]/25 bg-white px-6 py-12 text-center text-sm text-neutral-600">
          Ingen produkter i katalogen ennå.{" "}
          <Link
            href="/admin/produkter/ny"
            className="font-medium text-[var(--brand-pine)] underline-offset-2 hover:underline"
          >
            Legg til første produkt
          </Link>
          .
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[var(--brand-pine)]/10 bg-white shadow-sm">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead className="border-b border-[var(--brand-pine)]/10 bg-[var(--brand-cream)]/50">
              <tr>
                <th className="px-4 py-3 font-medium text-[var(--brand-pine)]">
                  Bilde
                </th>
                <th className="px-4 py-3 font-medium text-[var(--brand-pine)]">
                  Navn
                </th>
                <th className="px-4 py-3 font-medium text-[var(--brand-pine)]">
                  Kategori
                </th>
                <th className="px-4 py-3 font-medium text-[var(--brand-pine)]">
                  Pris
                </th>
                <th className="px-4 py-3 font-medium text-[var(--brand-pine)]">
                  Innkjøp
                </th>
                <th className="px-4 py-3 font-medium text-[var(--brand-pine)]">
                  Leverandør
                </th>
                <th className="px-4 py-3 font-medium text-[var(--brand-pine)]">
                  Lager
                </th>
                <th className="px-4 py-3 font-medium text-[var(--brand-pine)]">
                  Aktiv
                </th>
                <th className="px-4 py-3 font-medium text-[var(--brand-pine)]">
                  Opprettet
                </th>
                <th className="px-4 py-3 font-medium text-[var(--brand-pine)]">
                  Handlinger
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => {
                const img =
                  row.imageStoragePath &&
                  storagePublicObjectUrl(
                    "product-images",
                    row.imageStoragePath
                  );
                return (
                  <tr
                    key={row.id}
                    className="border-b border-[var(--brand-pine)]/5 last:border-0"
                  >
                    <td className="px-4 py-3">
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={img}
                          alt=""
                          className="h-10 w-10 rounded-md border border-[var(--brand-pine)]/10 object-cover"
                        />
                      ) : (
                        <span className="text-2xl" aria-hidden>
                          {row.emoji?.trim() || "—"}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-[var(--brand-pine)]">
                      {row.name}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">
                      {productCategoryNb(row.category)}
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {nok.format(row.priceOre / 100)}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-neutral-600">
                      {row.purchasePriceOre != null
                        ? nok.format(row.purchasePriceOre / 100)
                        : "—"}
                    </td>
                    <td className="max-w-[160px] truncate px-4 py-3 text-neutral-600">
                      {supplierDisplayLine(
                        row.supplierKey,
                        row.supplierOther,
                        row.supplier
                      )}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">
                      {stockStatusNb(row.stockStatus)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          row.isActive
                            ? "rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-900"
                            : "rounded-full border border-neutral-200 bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-700"
                        }
                      >
                        {row.isActive ? "Ja" : "Nei"}
                      </span>
                    </td>
                    <td className="px-4 py-3 tabular-nums text-neutral-500">
                      {dtf.format(new Date(row.createdAt))}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/admin/produkter/${row.id}`}
                          className={cn(
                            buttonVariants({ variant: "outline", size: "sm" }),
                            "border-[var(--brand-pine)]/20"
                          )}
                        >
                          Rediger
                        </Link>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="border-red-200 text-red-800 hover:bg-red-50"
                          disabled={deleteMut.isPending && deletingId === row.id}
                          onClick={() => confirmDelete(row.id, row.name)}
                        >
                          Slett
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
