"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { AdminProductForm } from "@/components/admin/admin-product-form";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc/react";
import { cn } from "@/lib/utils";

export default function AdminProduktRedigerPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";

  const { data, isLoading, isError } = trpc.admin.getProduct.useQuery(
    { id },
    { enabled: id.length > 0 }
  );

  if (!id) {
    return <p className="text-sm text-destructive">Ugyldig id.</p>;
  }

  if (isLoading) {
    return <Skeleton className="h-[480px] w-full max-w-xl rounded-xl" />;
  }

  if (isError || !data) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-destructive">Produkt ikke funnet.</p>
        <Link
          href="/admin/produkter"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "border-[var(--brand-pine)]/20"
          )}
        >
          Tilbake til produkter
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/produkter"
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "mb-2 -ml-2 text-[var(--brand-pine)]"
          )}
        >
          ← Tilbake
        </Link>
        <h2 className="font-heading text-2xl font-semibold tracking-tight text-[var(--brand-pine)] sm:text-3xl">
          Rediger produkt
        </h2>
        <p className="mt-1 font-mono text-xs text-neutral-500">{data.slug}</p>
      </div>
      <AdminProductForm
        key={data.id}
        mode="edit"
        productId={data.id}
        initial={data}
      />
    </div>
  );
}
