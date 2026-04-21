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
import {
  PRODUCT_CATEGORY_OPTIONS,
  STOCK_STATUS_OPTIONS,
  SUPPLIER_OPTIONS,
} from "@/lib/shop/catalog-labels";
import { storagePublicObjectUrl } from "@/lib/supabase/storage-public-url";
import type { AppRouter } from "@/server/routers";
import { trpc } from "@/lib/trpc/react";
import { cn } from "@/lib/utils";
import type { inferRouterOutputs } from "@trpc/server";

type ProductRow = inferRouterOutputs<AppRouter>["admin"]["getProduct"];

function rowToForm(row: ProductRow): AdminProductFormInput {
  return {
    name: row.name,
    description: row.description,
    emoji: row.emoji,
    imageStoragePath: row.imageStoragePath,
    category: (row.category as AdminProductFormInput["category"]) ?? "other",
    priceKr: Math.max(1, Math.round(row.priceOre / 100)),
    purchasePriceKr:
      row.purchasePriceOre != null
        ? Math.round(row.purchasePriceOre / 100)
        : null,
    supplierKey: (row.supplierKey as AdminProductFormInput["supplierKey"]) ??
      "other",
    supplierOther: row.supplierOther,
    allowsLogoPrint: row.allowsLogoPrint,
    minOrderQty: row.minOrderQty,
    deliveryTimeText: row.deliveryTimeText,
    stockStatus: (row.stockStatus as AdminProductFormInput["stockStatus"]) ??
      "in_stock",
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
          emoji: "",
          imageStoragePath: null,
          category: "other",
          priceKr: 99,
          purchasePriceKr: null,
          supplierKey: "better_workwear",
          supplierOther: "",
          allowsLogoPrint: false,
          minOrderQty: 1,
          deliveryTimeText: "",
          stockStatus: "in_stock",
          isActive: true,
        };

  const [form, setForm] = useState<AdminProductFormInput>(initial);
  const [fileBusy, setFileBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const imagePreview =
    form.imageStoragePath?.trim() &&
    storagePublicObjectUrl("product-images", form.imageStoragePath.trim());

  async function onPickImage(file: File | null) {
    if (!file) return;
    setFileBusy(true);
    setFormError(null);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const res = await fetch("/api/upload/product-image", {
        method: "POST",
        body: fd,
        credentials: "include",
      });
      const data = (await res.json()) as { path?: string; error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "Opplasting feilet.");
      }
      if (data.path) {
        setForm((f) => ({ ...f, imageStoragePath: data.path }));
      }
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Opplasting feilet.");
    } finally {
      setFileBusy(false);
    }
  }

  function submit() {
    setFormError(null);
    const parsed = adminProductFormSchema.safeParse({
      ...form,
      emoji: form.emoji?.trim() || null,
      description: form.description?.trim() || null,
      imageStoragePath: form.imageStoragePath?.trim() || null,
      deliveryTimeText: form.deliveryTimeText?.trim() || null,
      supplierOther: form.supplierOther?.trim() || null,
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
        <Label htmlFor="emoji">Emoji (valgfritt)</Label>
        <Input
          id="emoji"
          value={form.emoji ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, emoji: e.target.value }))}
          placeholder="f.eks. 🧢"
          maxLength={32}
          className="border-[var(--brand-pine)]/15"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">Produktbilde (valgfritt)</Label>
        <Input
          id="image"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          disabled={fileBusy}
          onChange={(e) => onPickImage(e.target.files?.[0] ?? null)}
          className="border-[var(--brand-pine)]/15"
        />
        {fileBusy ? (
          <p className="text-xs text-neutral-500">Laster opp …</p>
        ) : null}
        {imagePreview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imagePreview}
            alt=""
            className="mt-2 h-24 w-24 rounded-lg border border-[var(--brand-pine)]/10 object-cover"
          />
        ) : null}
      </div>

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
        <Label htmlFor="category">Kategori</Label>
        <select
          id="category"
          value={form.category}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              category: e.target.value as AdminProductFormInput["category"],
            }))
          }
          className="border-input bg-background flex h-10 w-full rounded-md border px-3 text-sm focus-visible:ring-2 focus-visible:ring-[var(--brand-gold)]/40 focus-visible:outline-none"
        >
          {PRODUCT_CATEGORY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
          <Label htmlFor="purchase">
            Innkjøpspris (kr, eks. MVA) — kun admin
          </Label>
          <Input
            id="purchase"
            type="number"
            min={0}
            value={form.purchasePriceKr ?? ""}
            placeholder="Valgfritt"
            onChange={(e) => {
              const v = e.target.value;
              setForm((f) => ({
                ...f,
                purchasePriceKr:
                  v === "" ? null : Math.max(0, Math.floor(Number(v))),
              }));
            }}
            className="border-[var(--brand-pine)]/15"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="supplier">Leverandør</Label>
        <select
          id="supplier"
          value={form.supplierKey}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              supplierKey: e.target
                .value as AdminProductFormInput["supplierKey"],
            }))
          }
          className="border-input bg-background flex h-10 w-full rounded-md border px-3 text-sm focus-visible:ring-2 focus-visible:ring-[var(--brand-gold)]/40 focus-visible:outline-none"
        >
          {SUPPLIER_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {form.supplierKey === "other" ? (
        <div className="space-y-2">
          <Label htmlFor="supplierOther">Leverandørnavn (annen)</Label>
          <Input
            id="supplierOther"
            value={form.supplierOther ?? ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, supplierOther: e.target.value }))
            }
            className="border-[var(--brand-pine)]/15"
          />
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--brand-pine)]/10 bg-white px-4 py-3">
        <div>
          <p className="text-sm font-medium text-[var(--brand-pine)]">
            Kan ha logo-trykk?
          </p>
          <p className="text-xs text-neutral-500">
            Krever logo-opplasting ved bestilling.
          </p>
        </div>
        <Switch
          checked={form.allowsLogoPrint}
          onCheckedChange={(v) =>
            setForm((f) => ({ ...f, allowsLogoPrint: Boolean(v) }))
          }
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="minq">Minimum antall per ordre</Label>
        <Input
          id="minq"
          type="number"
          min={1}
          value={form.minOrderQty}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              minOrderQty: Math.max(1, Math.floor(Number(e.target.value)) || 1),
            }))
          }
          className="border-[var(--brand-pine)]/15"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="delivery">Leveringstid</Label>
        <Input
          id="delivery"
          value={form.deliveryTimeText ?? ""}
          onChange={(e) =>
            setForm((f) => ({ ...f, deliveryTimeText: e.target.value }))
          }
          placeholder="f.eks. 5–7 dager"
          className="border-[var(--brand-pine)]/15"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="stock">Lagerstatus</Label>
        <select
          id="stock"
          value={form.stockStatus}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              stockStatus: e.target
                .value as AdminProductFormInput["stockStatus"],
            }))
          }
          className="border-input bg-background flex h-10 w-full rounded-md border px-3 text-sm focus-visible:ring-2 focus-visible:ring-[var(--brand-gold)]/40 focus-visible:outline-none"
        >
          {STOCK_STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
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
