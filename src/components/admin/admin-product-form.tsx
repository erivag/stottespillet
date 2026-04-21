"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { VAT_HINT_SHORT } from "@/lib/pricing/norwegian-vat";
import type { AdminProductFormInput } from "@/lib/shop/product-zod";
import { adminProductFormSchema } from "@/lib/shop/product-zod";
import type { AppRouter } from "@/server/routers";
import { trpc } from "@/lib/trpc/react";
import { cn } from "@/lib/utils";
import type { inferRouterOutputs } from "@trpc/server";

type ProductRow = inferRouterOutputs<AppRouter>["admin"]["getProduct"];

function rowToForm(row: ProductRow): AdminProductFormInput {
  return {
    name: row.name,
    description: row.description,
    priceKr: Math.max(1, Math.round(row.priceOre / 100)),
    supplier: row.supplier?.trim() || "",
    isActive: row.isActive,
  };
}

type Props =
  | { mode: "create" }
  | { mode: "edit"; productId: string; initial: ProductRow };

export function AdminProductForm(props: Props) {
  const router = useRouter();
  const utils = trpc.useUtils();
  const createMut = trpc.admin.createProduct.useMutation({
    onSuccess: async () => {
      await utils.admin.listProducts.invalidate();
      router.push("/admin/produkter");
    },
  });
  const updateMut = trpc.admin.updateProduct.useMutation({
    onSuccess: async () => {
      await utils.admin.listProducts.invalidate();
      router.push("/admin/produkter");
    },
  });

  const initial: AdminProductFormInput =
    props.mode === "edit"
      ? rowToForm(props.initial)
      : {
          name: "",
          description: "",
          priceKr: 99,
          supplier: "",
          isActive: true,
        };

  const [form, setForm] = useState<AdminProductFormInput>(initial);
  const [formError, setFormError] = useState<string | null>(null);

  function submit() {
    setFormError(null);
    const parsed = adminProductFormSchema.safeParse({
      ...form,
      description: form.description?.trim() || null,
      supplier: form.supplier?.trim() || "",
    });
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      setFormError(first?.message ?? "Sjekk skjemaet.");
      return;
    }

    if (props.mode === "create") {
      createMut.mutate(parsed.data);
    } else {
      updateMut.mutate({ id: props.productId, ...parsed.data });
    }
  }

  const busy = createMut.isPending || updateMut.isPending;

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <div className="space-y-2">
        <Label htmlFor="name">Navn</Label>
        <Input
          id="name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="border-[var(--brand-pine)]/15"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="desc">Beskrivelse</Label>
        <Textarea
          id="desc"
          value={form.description ?? ""}
          onChange={(e) =>
            setForm((f) => ({ ...f, description: e.target.value }))
          }
          rows={4}
          className="border-[var(--brand-pine)]/15"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="price">Salgspris (kr, eks. MVA)</Label>
        <Input
          id="price"
          type="number"
          min={1}
          value={form.priceKr}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              priceKr: Number(e.target.value) || 0,
            }))
          }
          className="border-[var(--brand-pine)]/15"
        />
        <p className="text-xs text-neutral-500">{VAT_HINT_SHORT}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="supplier">Leverandør</Label>
        <Input
          id="supplier"
          value={form.supplier}
          onChange={(e) =>
            setForm((f) => ({ ...f, supplier: e.target.value }))
          }
          placeholder="f.eks. Promo Nordic"
          className="border-[var(--brand-pine)]/15"
        />
      </div>

      <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--brand-pine)]/10 bg-white px-4 py-3">
        <div>
          <p className="text-sm font-medium text-[var(--brand-pine)]">
            Aktiv i shop for lag
          </p>
        </div>
        <Switch
          checked={form.isActive}
          onCheckedChange={(v) =>
            setForm((f) => ({ ...f, isActive: Boolean(v) }))
          }
        />
      </div>

      {formError ? (
        <p className="text-sm text-destructive">{formError}</p>
      ) : null}
      {(createMut.error || updateMut.error) && (
        <p className="text-sm text-destructive">
          {createMut.error?.message ?? updateMut.error?.message}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          onClick={submit}
          disabled={busy}
          className="bg-[var(--brand-pine)] text-white hover:bg-[var(--brand-pine-light)]"
        >
          {busy ? "Lagrer …" : "Lagre"}
        </Button>
        <Link
          href="/admin/produkter"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "inline-flex h-10 items-center justify-center px-4"
          )}
        >
          Avbryt
        </Link>
      </div>
    </div>
  );
}
