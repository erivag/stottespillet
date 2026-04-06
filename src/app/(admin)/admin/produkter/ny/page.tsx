import Link from "next/link";

import { AdminProductForm } from "@/components/admin/admin-product-form";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AdminProduktNyPage() {
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
          Nytt produkt
        </h2>
        <p className="mt-1 text-sm text-neutral-600">
          Produktet lagres i databasen og kan vises i lag-shop når det er
          aktivt.
        </p>
      </div>
      <AdminProductForm mode="create" />
    </div>
  );
}
