import { LagShopClient } from "@/components/lag/lag-shop-client";

export default function LagShopPage() {
  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-[var(--brand-pine)] sm:text-3xl">
          Giveaway-shop
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-neutral-600 sm:text-base">
          Aktive produkter fra Støttespillet. Priser vises som veiledende
          «fra»-pris per enhet. Du får bekreftelse når bestillingen er mottatt.
        </p>
      </header>

      <LagShopClient />
    </div>
  );
}
