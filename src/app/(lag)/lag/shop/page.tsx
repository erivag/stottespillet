import { LagShopClient } from "@/components/lag/lag-shop-client";

export default function LagShopPage() {
  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-[var(--brand-pine)] sm:text-3xl">
          Golfball-shop
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-neutral-600 sm:text-base">
          Priser er veiledende per dusin (12 baller) inkl. logo-trykk hos Promo
          Nordic. Velg modell og send forespørsel – vi registrerer ordren og
          svarer laget.
        </p>
      </header>

      <LagShopClient />
    </div>
  );
}
