import Link from "next/link";
import {
  ArrowRight,
} from "lucide-react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const GOLF_BALL_PRODUCTS = [
  { name: "Vice Drive", priceKrPerDusin: 319 },
  { name: "Vice Tour", priceKrPerDusin: 473 },
  { name: "Callaway Super Soft", priceKrPerDusin: 429 },
  { name: "Callaway Chrome Soft", priceKrPerDusin: 759 },
  { name: "Titleist True Feel", priceKrPerDusin: 407 },
  { name: "Titleist Velocity", priceKrPerDusin: 462 },
  { name: "Titleist Tour Soft", priceKrPerDusin: 506 },
  { name: "Titleist Pro V1x", priceKrPerDusin: 759 },
  { name: "Titleist Pro V1", priceKrPerDusin: 759 },
] as const;

const kr = new Intl.NumberFormat("nb-NO", {
  style: "currency",
  currency: "NOK",
  maximumFractionDigits: 0,
});

const navLinkClass =
  "rounded-lg px-3 py-2 text-sm font-medium text-white/90 transition-colors hover:bg-white/10 hover:text-[#FFBE4A]";
const btnGold =
  "inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#FFBE4A] px-6 text-sm font-semibold text-[#0A2E1A] shadow-lg shadow-black/20 transition hover:brightness-105 sm:min-w-[220px]";
const btnOutlineHero =
  "inline-flex h-12 items-center justify-center rounded-lg border border-white/25 bg-white/5 px-6 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10 sm:min-w-[200px]";
const btnOutline =
  "inline-flex h-12 items-center justify-center rounded-lg border border-[#0A2E1A]/20 bg-white px-6 text-sm font-semibold text-[#0A2E1A] transition hover:bg-[#0A2E1A]/5";

export default function Home() {
  return (
    <div className="min-h-dvh bg-[#f7f5f0] text-neutral-900">
      {/* ——— Nav ——— */}
      <nav
        className="absolute left-0 right-0 top-0 z-20 mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 pt-6 sm:px-6"
        aria-label="Hovedmeny"
      >
        <Link
          href="/"
          className="font-heading text-xl font-semibold tracking-tight text-white drop-shadow-sm sm:text-2xl"
        >
          Støttespillet<span className="text-[#FFBE4A]">.</span>
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-1 sm:gap-2">
          <Link href="/login" className={navLinkClass}>
            Logg inn
          </Link>
          <Link href="/registrer" className={navLinkClass}>
            <span className="hidden sm:inline">Registrer laget</span>
            <span className="sm:hidden">Registrer</span>
          </Link>
        </div>
      </nav>

      {/* ——— Hero ——— */}
      <header className="relative overflow-hidden bg-[#0A2E1A] pb-20 pt-24 text-white sm:pb-28 sm:pt-28 lg:pb-32 lg:pt-32">
        <div
          className="pointer-events-none absolute inset-0 opacity-100 auth-grid-bg"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-32 top-0 h-80 w-80 rounded-full blur-3xl"
          style={{ background: "rgba(255, 190, 74, 0.14)" }}
          aria-hidden
        />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <p className="auth-animate-in mb-5 inline-flex max-w-full items-center rounded-full border border-[#FFBE4A]/35 bg-white/5 px-3 py-1 text-xs font-medium text-[#ffd175] backdrop-blur-sm sm:text-sm">
            Norges sponsorplattform for lokalidretten
          </p>

          <h1 className="auth-animate-in auth-animate-delay-1 font-heading max-w-3xl text-3xl font-semibold leading-[1.12] tracking-tight sm:text-5xl lg:text-[3.25rem] lg:leading-[1.08]">
            Få sponset golfballene{" "}
            <span className="text-[#FFBE4A]">til neste turnering</span>
          </h1>
          <p className="auth-animate-in auth-animate-delay-2 mt-5 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
            Vi finner lokale bedrifter, skriver e-posten og ordner leveransen.
            Klubben gjør ingenting.
          </p>

          <div className="auth-animate-in auth-animate-delay-3 mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="/registrer" className={btnGold}>
              Registrer klubben gratis →
              <ArrowRight className="size-4 shrink-0" aria-hidden />
            </Link>
            <Link href="/registrer" className={btnOutlineHero}>
              For bedrifter
            </Link>
          </div>
        </div>
      </header>

      {/* ——— To måter å bestille på ——— */}
      <section
        className="mx-auto max-w-6xl px-4 pb-4 sm:px-6 lg:pb-8"
        aria-labelledby="order-ways-heading"
      >
        <h2
          id="order-ways-heading"
          className="font-heading text-2xl font-semibold tracking-tight text-[#0A2E1A] sm:text-3xl"
        >
          To måter å bestille på
        </h2>
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <Card className="border-[#0A2E1A]/10 bg-white shadow-sm">
            <CardContent className="flex h-full flex-col gap-5 p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#0A2E1A] text-xl text-[#FFBE4A]">
                  ⛳
                </div>
                <div className="min-w-0">
                  <h3 className="font-heading text-xl font-semibold text-[#0A2E1A]">
                    Sponsor en golfklubb
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                    Vi finner en lokal golfklubb som trenger sponsor. Du betaler
                    for ballene – klubben bruker dem i turneringer med ditt
                    logo.
                  </p>
                </div>
              </div>

              <ul className="space-y-2 text-sm text-neutral-700">
                <li>✓ God lokal synlighet</li>
                <li>✓ Vi ordner alt</li>
                <li>✓ Klubben er takknemlig</li>
              </ul>

              <div className="mt-auto">
                <Link
                  href="/registrer?type=bedrift"
                  className={cn(btnGold, "w-full sm:w-auto")}
                >
                  Bli sponsor →
                  <ArrowRight className="size-4 shrink-0" aria-hidden />
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#0A2E1A]/10 bg-white shadow-sm">
            <CardContent className="flex h-full flex-col gap-5 p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#0A2E1A] text-xl text-[#FFBE4A]">
                  🏢
                </div>
                <div className="min-w-0">
                  <h3 className="font-heading text-xl font-semibold text-[#0A2E1A]">
                    Bestill direkte
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                    Vil du ha golfballer med firmaets logo til egne events,
                    kundepleie eller ansattgaver? Bestill direkte – ingen
                    mellomledd.
                  </p>
                </div>
              </div>

              <ul className="space-y-2 text-sm text-neutral-700">
                <li>✓ Leveres direkte til deg</li>
                <li>✓ Samme lave priser</li>
                <li>✓ Minimum 6 dusin</li>
              </ul>

              <div className="mt-auto">
                <Link href="/bestill" className={cn(btnOutline, "w-full sm:w-auto")}>
                  Bestill nå →
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ——— Produktet ——— */}
      <section
        className="border-t border-[#0A2E1A]/10 bg-white py-16 sm:py-20"
        aria-labelledby="product-heading"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2
            id="product-heading"
            className="font-heading text-2xl font-semibold tracking-tight text-[#0A2E1A] sm:text-3xl"
          >
            Velg dine golfballer
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-neutral-600 sm:text-base">
            Alle priser er per dusin inkl. logo-trykk og frakt. Minimum 6 dusin
            per bestilling.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {GOLF_BALL_PRODUCTS.map((p) => (
              <Card
                key={p.name}
                className="border-[#0A2E1A]/10 bg-[#f7f5f0]/70 shadow-sm transition-shadow hover:shadow-md"
              >
                <CardContent className="flex h-full flex-col gap-2 p-6">
                  <div className="flex items-start gap-3">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#0A2E1A] text-lg text-[#FFBE4A]">
                      ⛳
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-heading text-base font-semibold leading-snug text-[#0A2E1A]">
                        {p.name}
                      </h3>
                      <p className="mt-1 text-sm font-medium text-[#FFBE4A]">
                        {kr.format(p.priceKrPerDusin)} / dusin
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-neutral-600">inkl. logo-trykk</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="mt-8 text-sm text-neutral-700">
            🎯 Volum-rabatter: 30 dusin –5% · 50 dusin –10% · 70 dusin –12% · 100
            dusin –15%
          </p>

          <div className="mt-10">
            <Link
              href="/lag/shop"
              className={cn(btnGold, "w-full sm:w-auto")}
            >
              Bestill til neste turnering →
              <ArrowRight className="size-4 shrink-0" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      {/* ——— For bedrifter ——— */}
      <section
        className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20"
        aria-labelledby="for-bedrifter-heading"
      >
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h2
              id="for-bedrifter-heading"
              className="font-heading text-2xl font-semibold tracking-tight text-[#0A2E1A] sm:text-3xl"
            >
              Er du lokal bedrift?
            </h2>
            <p className="mt-3 max-w-xl text-neutral-600">
              Logo på golfballer brukt i turneringer hele sesongen. Synlig for
              alle deltakere.
            </p>
          </div>

          <Card className="border-[#0A2E1A]/10 bg-white shadow-sm">
            <CardContent className="p-6 sm:p-8">
              <ul className="space-y-3 text-sm text-neutral-700">
                <li>✓ Logo på Titleist-baller</li>
                <li>✓ Nevnt i sosiale medier</li>
                <li>✓ Støtter lokalt idrettsliv</li>
                <li>✓ Fra kr 1 914 per turnering (6 dusin × kr 319)</li>
              </ul>
              <p className="mt-3 text-xs text-neutral-500">
                Minimum 6 dusin per bestilling
              </p>
              <Link
                href="/registrer"
                className={cn(btnGold, "mt-8 inline-flex w-full sm:w-auto")}
              >
                Bli sponsor →
                <ArrowRight className="size-4 shrink-0" aria-hidden />
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ——— CTA ——— */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="rounded-3xl bg-[#0A2E1A] px-6 py-12 text-center text-white sm:px-12 sm:py-16">
          <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
            Klar for å prøve?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-white/75 sm:text-base">
            Registrer klubben gratis. Vi tar kontakt og hjelper dere i gang med
            første turnering.
          </p>
          <Link href="/registrer" className={cn(btnGold, "mt-8 inline-flex")}>
            Registrer klubben →
            <ArrowRight className="size-4 shrink-0" aria-hidden />
          </Link>
        </div>
      </section>

      {/* ——— Footer ——— */}
      <footer className="border-t border-[#0A2E1A]/10 bg-[#f7f5f0] py-12">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="font-heading text-lg font-semibold text-[#0A2E1A]">
              Støttespillet<span className="text-[#FFBE4A]">.</span>
            </p>
            <p className="mt-1 text-sm text-neutral-600">
              Sponsorplattform for idrett, komiteer og barnehager.
            </p>
            <p className="mt-3 text-xs text-neutral-500">
              © 2026 Støttespillet · Driftet av UTEbygg AS i samarbeid med Bodø
              Golfsenter AS
            </p>
          </div>
          <nav
            className="flex flex-col gap-2 text-sm sm:items-end"
            aria-label="Footer"
          >
            <a
              href="https://stottespillet.no"
              className="font-medium text-[#0A2E1A] underline decoration-[#FFBE4A] decoration-2 underline-offset-2 transition hover:text-[#123d24]"
            >
              stottespillet.no
            </a>
            <Link
              href="/login"
              className="text-neutral-600 transition hover:text-[#0A2E1A]"
            >
              Logg inn
            </Link>
            <Link
              href="/registrer"
              className="text-neutral-600 transition hover:text-[#0A2E1A]"
            >
              Registrer laget
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
