"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  grossOreFromNetOre,
  mvaOreFromNetOre,
  PRICE_EX_VAT_SUFFIX,
  VAT_HINT_SHORT,
} from "@/lib/pricing/norwegian-vat";
import { stockStatusNb } from "@/lib/shop/catalog-labels";
import {
  dozenVolumeDiscountPercent,
  subtotalOreForDozenOrder,
  totalOreForDozenOrder,
} from "@/lib/shop/volume-discount";
import { storagePublicObjectUrl } from "@/lib/supabase/storage-public-url";
import { trpc } from "@/lib/trpc/react";

const nok = new Intl.NumberFormat("nb-NO", {
  style: "currency",
  currency: "NOK",
  maximumFractionDigits: 0,
});

type ShopProduct = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  emoji: string | null;
  imageStoragePath: string | null;
  priceOre: number;
  allowsLogoPrint: boolean;
  minOrderQty: number;
  deliveryTimeText: string | null;
  stockStatus: string;
};

export function LagShopClient() {
  const { data, isLoading, isError } = trpc.lag.listShopProducts.useQuery();
  const placeOrder = trpc.lag.placeShopOrder.useMutation();

  const [dialogProduct, setDialogProduct] = useState<ShopProduct | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [comment, setComment] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [step, setStep] = useState<"form" | "done">("form");

  const items = (data?.items ?? []) as ShopProduct[];

  const discountPct = useMemo(
    () => (dialogProduct ? dozenVolumeDiscountPercent(quantity) : 0),
    [dialogProduct, quantity]
  );

  const subtotalOre = useMemo(() => {
    if (!dialogProduct) return 0;
    return subtotalOreForDozenOrder(dialogProduct.priceOre, quantity);
  }, [dialogProduct, quantity]);

  const totalNetOre = useMemo(() => {
    if (!dialogProduct) return 0;
    return totalOreForDozenOrder(dialogProduct.priceOre, quantity);
  }, [dialogProduct, quantity]);

  const mvaOre = useMemo(
    () => mvaOreFromNetOre(totalNetOre),
    [totalNetOre]
  );

  const totalInklMvaOre = useMemo(
    () => grossOreFromNetOre(totalNetOre),
    [totalNetOre]
  );

  function openFor(p: ShopProduct) {
    setDialogProduct(p);
    setQuantity(Math.max(p.minOrderQty, 1));
    setComment("");
    setFormError(null);
    setStep("form");
  }

  function closeDialog() {
    setDialogProduct(null);
    setStep("form");
  }

  async function submitInquiry() {
    if (!dialogProduct) return;
    setFormError(null);
    if (quantity < dialogProduct.minOrderQty) {
      setFormError(`Minimum antall er ${dialogProduct.minOrderQty}.`);
      return;
    }

    try {
      await placeOrder.mutateAsync({
        productId: dialogProduct.id,
        quantity,
        supplierNotes: comment.trim() || null,
      });
      setStep("done");
    } catch (e) {
      setFormError(
        e instanceof Error ? e.message : "Kunne ikke sende forespørselen."
      );
    }
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        Kunne ikke laste produkter. Prøv igjen senere.
      </p>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-64 animate-pulse rounded-xl border border-[var(--brand-pine)]/10 bg-white"
          />
        ))}
      </div>
    );
  }

  return (
    <>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.length === 0 ? (
          <li className="col-span-full rounded-xl border border-dashed border-[var(--brand-pine)]/25 bg-white px-6 py-12 text-center text-sm text-neutral-600">
            Ingen produkter i shop akkurat nå.
          </li>
        ) : (
          items.map((p) => {
            const img =
              p.imageStoragePath &&
              storagePublicObjectUrl("product-images", p.imageStoragePath);
            const out = p.stockStatus === "out_of_stock";
            return (
              <li key={p.id}>
                <Card className="flex h-full flex-col border-[var(--brand-pine)]/10 bg-white transition-all hover:-translate-y-0.5 hover:border-[var(--brand-gold)]/35 hover:shadow-md">
                  <CardHeader className="pb-3 text-center sm:text-left">
                    <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={img}
                          alt=""
                          className="h-20 w-20 shrink-0 rounded-xl border border-[var(--brand-pine)]/10 object-cover"
                        />
                      ) : (
                        <span
                          className="flex h-20 w-20 shrink-0 items-center justify-center text-5xl leading-none"
                          aria-hidden
                        >
                          {p.emoji?.trim() || "📦"}
                        </span>
                      )}
                      <div className="min-w-0 flex-1 text-center sm:text-left">
                        <CardTitle className="text-lg leading-snug text-[var(--brand-pine)]">
                          {p.name}
                        </CardTitle>
                        <CardDescription className="mt-2">
                          {stockStatusNb(p.stockStatus)}
                          {p.deliveryTimeText?.trim()
                            ? ` · Levering: ${p.deliveryTimeText.trim()}`
                            : ""}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="mt-auto flex flex-col items-center gap-3 pt-0 sm:items-stretch">
                    <div className="text-center sm:text-left">
                      <p className="text-base font-semibold tabular-nums text-[var(--brand-gold)]">
                        {nok.format(p.priceOre / 100)} per dusin{" "}
                        <span className="font-normal text-neutral-600">
                          {PRICE_EX_VAT_SUFFIX}
                        </span>
                      </p>
                      <p className="mt-0.5 text-xs text-neutral-500">
                        {VAT_HINT_SHORT}
                      </p>
                    </div>
                    {p.allowsLogoPrint ? (
                      <span className="mx-auto w-fit rounded-full border border-[var(--brand-gold)]/50 bg-[var(--brand-gold)]/15 px-3 py-1 text-xs font-medium text-[var(--brand-pine)] sm:mx-0">
                        Logo-trykk inkludert
                      </span>
                    ) : null}
                    <Button
                      type="button"
                      disabled={out}
                      onClick={() => openFor(p)}
                      className="w-full bg-[var(--brand-pine)] text-white hover:bg-[var(--brand-pine-light)]"
                    >
                      {out ? "Utsolgt" : "Bestill"}
                    </Button>
                  </CardContent>
                </Card>
              </li>
            );
          })
        )}
      </ul>

      <p className="text-center text-sm text-neutral-600">
        Du må være innlogget med lagprofil for å sende forespørsel.{" "}
        <Link
          href="/lag/innstillinger"
          className="font-medium text-[var(--brand-pine)] underline-offset-2 hover:underline"
        >
          Opprett lag under Innstillinger
        </Link>{" "}
        eller{" "}
        <Link
          href="/login?next=%2Flag%2Fshop"
          className="font-medium text-[var(--brand-pine)] underline-offset-2 hover:underline"
        >
          logg inn
        </Link>
        .
      </p>

      <Dialog
        open={dialogProduct != null}
        onOpenChange={(o) => {
          if (!o) closeDialog();
        }}
      >
        <DialogContent
          className="max-h-[90vh] overflow-y-auto sm:max-w-lg"
          showCloseButton
        >
          {dialogProduct && step === "done" ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-[var(--brand-pine)]">
                  Bestilling mottatt!
                </DialogTitle>
                <DialogDescription>
                  Takk! Vi har registrert forespørselen på{" "}
                  <strong>{dialogProduct.name}</strong> og tar kontakt med
                  laget så snart vi kan.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="border-0 bg-transparent p-0 pt-2 sm:justify-end">
                <Button
                  type="button"
                  onClick={closeDialog}
                  className="bg-[var(--brand-pine)] text-white hover:bg-[var(--brand-pine-light)]"
                >
                  Lukk
                </Button>
              </DialogFooter>
            </>
          ) : dialogProduct ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-[var(--brand-pine)]">
                  {dialogProduct.name}
                </DialogTitle>
                <DialogDescription>
                  {nok.format(dialogProduct.priceOre / 100)} per dusin{" "}
                  {PRICE_EX_VAT_SUFFIX} · min. {dialogProduct.minOrderQty} dusin.
                  <span className="mt-1 block text-xs text-neutral-500">
                    {VAT_HINT_SHORT}
                  </span>
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="qty">Antall dusin</Label>
                  <Input
                    id="qty"
                    type="number"
                    min={dialogProduct.minOrderQty}
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(
                        Math.max(
                          dialogProduct.minOrderQty,
                          Math.floor(Number(e.target.value)) ||
                            dialogProduct.minOrderQty
                        )
                      )
                    }
                  />
                </div>

                <div className="rounded-lg border border-[var(--brand-pine)]/15 bg-[var(--brand-pine)]/5 px-3 py-2 text-xs text-neutral-700">
                  <p className="font-medium text-[var(--brand-pine)]">
                    Volumrabatt (dusin)
                  </p>
                  <ul className="mt-1 list-inside list-disc space-y-0.5">
                    <li>30+ dusin: −5 %</li>
                    <li>50+ dusin: −10 %</li>
                    <li>70+ dusin: −12 %</li>
                    <li>100+ dusin: −15 %</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comment">Kommentar</Label>
                  <Textarea
                    id="comment"
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Valgfritt: logo, frist, spesielle ønsker …"
                  />
                </div>

                <div className="space-y-1 text-sm tabular-nums text-[var(--brand-pine)]">
                  <p>
                    Sum før rabatt ({PRICE_EX_VAT_SUFFIX}):{" "}
                    <span className="font-medium">
                      {nok.format(subtotalOre / 100)}
                    </span>
                  </p>
                  {discountPct > 0 ? (
                    <p>
                      Rabatt ({discountPct}%):{" "}
                      <span className="font-medium">
                        −{nok.format((subtotalOre - totalNetOre) / 100)}
                      </span>
                    </p>
                  ) : null}
                  <p>
                    Pris eks. MVA:{" "}
                    <span className="font-medium">
                      {nok.format(totalNetOre / 100)}
                    </span>
                  </p>
                  <p>
                    MVA (25%):{" "}
                    <span className="font-medium">
                      {nok.format(mvaOre / 100)}
                    </span>
                  </p>
                  <p className="font-semibold">
                    Total inkl. MVA: {nok.format(totalInklMvaOre / 100)}
                  </p>
                  <p className="text-xs font-normal text-neutral-500">
                    {VAT_HINT_SHORT}
                  </p>
                </div>

                {formError ? (
                  <p className="text-sm text-destructive">{formError}</p>
                ) : null}
              </div>

              <DialogFooter className="border-0 bg-transparent p-0 pt-2 sm:justify-end">
                <Button type="button" variant="outline" onClick={closeDialog}>
                  Avbryt
                </Button>
                <Button
                  type="button"
                  disabled={placeOrder.isPending}
                  onClick={submitInquiry}
                  className="bg-[var(--brand-pine)] text-white hover:bg-[var(--brand-pine-light)]"
                >
                  {placeOrder.isPending ? "Sender …" : "Send forespørsel"}
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
