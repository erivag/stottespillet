"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { emailStatusNb } from "@/lib/admin/labels";
import { trpc } from "@/lib/trpc/react";

const dtf = new Intl.DateTimeFormat("nb-NO", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default function AdminEposterPage() {
  const { data, isLoading, isError } = trpc.admin.listEmails.useQuery();

  if (isError) {
    return (
      <p className="text-sm text-destructive">Kunne ikke laste e-poster.</p>
    );
  }

  const items = data?.items ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-heading text-2xl font-semibold tracking-tight text-[var(--brand-pine)] sm:text-3xl">
          E-poster
        </h2>
        <p className="mt-1 text-sm text-neutral-600">
          Siste 200 outreach-e-poster med kobling til kampanje, lag og bedrift.
        </p>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--brand-pine)]/25 bg-white px-6 py-12 text-center text-sm text-neutral-600">
          Ingen e-poster registrert ennå.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[var(--brand-pine)]/10 bg-white shadow-sm">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-[var(--brand-pine)]/10 bg-[var(--brand-cream)]/50">
              <tr>
                <th className="px-4 py-3 font-medium text-[var(--brand-pine)]">
                  Til
                </th>
                <th className="px-4 py-3 font-medium text-[var(--brand-pine)]">
                  Emne
                </th>
                <th className="px-4 py-3 font-medium text-[var(--brand-pine)]">
                  Bedrift
                </th>
                <th className="px-4 py-3 font-medium text-[var(--brand-pine)]">
                  Lag / kampanje
                </th>
                <th className="px-4 py-3 font-medium text-[var(--brand-pine)]">
                  Status
                </th>
                <th className="px-4 py-3 font-medium text-[var(--brand-pine)]">
                  Sendt / opprettet
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-[var(--brand-pine)]/5 last:border-0"
                >
                  <td className="max-w-[200px] truncate px-4 py-3 text-neutral-800">
                    {row.toEmail}
                  </td>
                  <td className="max-w-[220px] truncate px-4 py-3 text-neutral-700">
                    {row.subject}
                  </td>
                  <td className="px-4 py-3 font-medium text-[var(--brand-pine)]">
                    {row.sponsorName}
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    <span className="block font-medium text-[var(--brand-pine)]">
                      {row.organizationName}
                    </span>
                    <span className="text-xs text-neutral-500">
                      {row.campaignTitle}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full border border-[var(--brand-pine)]/15 bg-[var(--brand-cream)]/60 px-2 py-0.5 text-xs font-medium text-[var(--brand-pine)]">
                      {emailStatusNb(row.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-neutral-500">
                    {row.sentAt
                      ? dtf.format(new Date(row.sentAt))
                      : dtf.format(new Date(row.createdAt))}
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
