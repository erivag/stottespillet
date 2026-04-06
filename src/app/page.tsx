import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Flag,
  GraduationCap,
  MousePointerClick,
  Package,
  Sparkles,
  Trees,
  Trophy,
  FileText,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

/** Veiledende katalog (CLAUDE.md §3.2) */
const SHOP_PRODUCTS = [
  {
    name: "Golfballer Titleist m/logo",
    supplier: "Promo Nordic",
    price: "fra kr 690 / 12 stk",
  },
  {
    name: "Solbriller m/logo",
    supplier: "Leverandør etter avtale",
    price: "fra kr 129 / stk",
  },
  {
    name: "17. mai-medaljer m/logo",
    supplier: "Pokalbutikk",
    price: "fra kr 12 / stk",
  },
  {
    name: "Refleksvester m/logo",
    supplier: "Grossist etter avtale",
    price: "fra kr 89 / stk",
  },
  {
    name: "T-skjorter m/logo",
    supplier: "Better WorkWear",
    price: "fra kr 189 / stk",
  },
  {
    name: "Caps brodert m/logo",
    supplier: "Better WorkWear",
    price: "fra kr 149 / stk",
  },
  { name: "Pokaler", supplier: "Pokalbutikk", price: "fra kr 199 / stk" },
  {
    name: "Refleksbeger m/logo",
    supplier: "Grossist etter avtale",
    price: "fra kr 45 / stk",
  },
  {
    name: "Ballonger m/trykk",
    supplier: "Promo Nordic",
    price: "fra kr 4 / stk",
  },
] as const;

const SPLEIS_CARDS = [
  {
    title: "Badstue",
    detail: "Utero Classic · flere sponsorer deler kostnaden",
    hint: "Permanent logo på bygget",
  },
  {
    title: "Gapahuk",
    detail: "Samlingsplass med synlig sponsor på konstruksjonen",
    hint: "Typisk 3–5 sponsorer",
  },
  {
    title: "Starterbod",
    detail: "Synlig på banen – hull 1 og 10",
    hint: "Golf og arrangement",
  },
  {
    title: "Toalettbygg",
    detail: "Off-grid med QR og Vipps (flaggskip)",
    hint: "Passiv inntekt til laget",
  },
] as const;

const STEPS = [
  {
    icon: FileText,
    title: "Laget oppretter søknad",
    detail: "På rundt tre minutter.",
  },
  {
    icon: Sparkles,
    title: "AI finner og kontakter bedrifter",
    detail: "Personlige e-poster automatisk.",
  },
  {
    icon: MousePointerClick,
    title: "Bedrift godkjenner med ett klikk",
    detail: "Enkel flyt med betaling når alt er klart.",
  },
  {
    icon: Package,
    title: "Produkt leveres – sponsor synes",
    detail: "Synlighet på det dere har avtalt.",
  },
] as const;

const AUDIENCE = [
  {
    title: "Golfklubber",
    text: "Utstyr, arrangement og uterom med sponsorlogo.",
    icon: Trophy,
  },
  {
    title: "Idrettslag",
    text: "Drakter, cupreise og felles prosjekter.",
    icon: Building2,
  },
  {
    title: "17. mai-komiteer",
    text: "Medaljer, ballonger og det dere trenger til dagen.",
    icon: Flag,
  },
  {
    title: "Barnehager",
    text: "Refleksvester og trygg synlighet for barna.",
    icon: GraduationCap,
  },
] as const;

const navLinkClass =
  "rounded-lg px-3 py-2 text-sm font-medium text-white/90 transition-colors hover:bg-white/10 hover:text-[#FFBE4A]";
const btnGold =
  "inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#FFBE4A] px-6 text-sm font-semibold text-[#0A2E1A] shadow-lg shadow-black/20 transition hover:brightness-105 sm:min-w-[220px]";
const btnOutlineHero =
  "inline-flex h-12 items-center justify-center rounded-lg border border-white/25 bg-white/5 px-6 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10 sm:min-w-[200px]";

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
            Finn sponsorer til laget ditt{" "}
            <span className="text-[#FFBE4A]">– på minutter</span>
          </h1>
          <p className="auth-animate-in auth-animate-delay-2 mt-5 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
            AI finner lokale bedrifter, skriver personlige e-poster og sender
            dem for deg.
          </p>

          <div className="auth-animate-in auth-animate-delay-3 mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="/registrer" className={btnGold}>
              Registrer laget gratis
              <ArrowRight className="size-4 shrink-0" aria-hidden />
            </Link>
            <Link href="/registrer" className={btnOutlineHero}>
              For bedrifter
            </Link>
          </div>
        </div>
      </header>

      {/* ——— Slik fungerer det ——— */}
      <section
        className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20"
        aria-labelledby="how-heading"
      >
        <h2
          id="how-heading"
          className="font-heading text-2xl font-semibold tracking-tight text-[#0A2E1A] sm:text-3xl"
        >
          Slik fungerer det
        </h2>
        <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <li key={s.title}>
                <Card className="h-full border-[#0A2E1A]/10 bg-white shadow-sm transition-shadow hover:shadow-md">
                  <CardContent className="p-5 pt-6">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0A2E1A] text-[#FFBE4A]">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-[#FFBE4A]">
                      Steg {i + 1}
                    </p>
                    <h3 className="mt-1 font-heading text-lg font-semibold text-[#0A2E1A]">
                      {s.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                      {s.detail}
                    </p>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ol>
      </section>

      {/* ——— Spleis ——— */}
      <section
        className="border-y border-[#0A2E1A]/10 bg-white py-16 sm:py-20"
        aria-labelledby="spleis-heading"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2
                id="spleis-heading"
                className="font-heading text-2xl font-semibold tracking-tight text-[#0A2E1A] sm:text-3xl"
              >
                Spleis – flere bedrifter, ett mål
              </h2>
              <p className="mt-3 max-w-2xl text-neutral-600">
                Når noe koster mer enn én sponsor vil ta alene, kan flere gå inn
                sammen. Når målet er nått, settes prosjektet i gang — med tydelig
                sponsor-synlighet på det som bygges eller kjøpes inn.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-[#0A2E1A]">
              <Trees className="size-5 text-[#FFBE4A]" aria-hidden />
              UTEbygg-produkter blant annet
            </div>
          </div>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SPLEIS_CARDS.map((c) => (
              <li key={c.title}>
                <Card className="h-full border-[#0A2E1A]/10 bg-[#f7f5f0]/80 transition-shadow hover:shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-[#0A2E1A]">
                      {c.title}
                    </CardTitle>
                    <CardDescription className="text-sm text-neutral-600">
                      {c.detail}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs font-medium text-[#FFBE4A]">
                      {c.hint}
                    </p>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ——— For hvem ——— */}
      <section
        className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20"
        aria-labelledby="audience-heading"
      >
        <h2
          id="audience-heading"
          className="font-heading text-2xl font-semibold tracking-tight text-[#0A2E1A] sm:text-3xl"
        >
          For hvem?
        </h2>
        <ul className="mt-10 grid gap-5 sm:grid-cols-2">
          {AUDIENCE.map(({ title, text, icon: Icon }) => (
            <li key={title}>
              <Card className="h-full border-[#0A2E1A]/10 transition-shadow hover:shadow-md">
                <CardContent className="flex gap-4 p-5 sm:p-6">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0A2E1A]/10 text-[#0A2E1A]">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <div>
                    <h3 className="font-heading text-lg font-semibold text-[#0A2E1A]">
                      {title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-neutral-600">
                      {text}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      {/* ——— Produkter (horisontal scroll) ——— */}
      <section
        className="border-t border-[#0A2E1A]/10 bg-white py-16 sm:py-20"
        aria-labelledby="products-heading"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2
            id="products-heading"
            className="font-heading text-2xl font-semibold tracking-tight text-[#0A2E1A] sm:text-3xl"
          >
            Produkter i giveaway-shop
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-neutral-600 sm:text-base">
            Utvalgte produkttyper med sponsor-logo levert til laget — priser er
            veiledende fra leverandør eller katalog.
          </p>
          <div className="mt-8 flex gap-4 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] sm:-mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
            {SHOP_PRODUCTS.map((p) => (
              <Card
                key={p.name}
                className="w-[min(85vw,280px)] shrink-0 snap-start border-[#0A2E1A]/10 transition-transform hover:-translate-y-0.5 hover:shadow-md"
              >
                <CardContent className="flex h-full flex-col p-5">
                  <h3 className="font-heading text-base font-semibold leading-snug text-[#0A2E1A]">
                    {p.name}
                  </h3>
                  <p className="mt-2 text-xs text-neutral-500">{p.supplier}</p>
                  <p className="mt-auto pt-4 text-sm font-medium tabular-nums text-[#FFBE4A]">
                    {p.price}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ——— CTA ——— */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="rounded-3xl bg-[#0A2E1A] px-6 py-12 text-center text-white sm:px-12 sm:py-16">
          <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
            Registrer laget – vi finner sponsorene
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-white/75 sm:text-base">
            Opprett konto med magisk lenke og kom i gang uten bindingstid.
          </p>
          <Link href="/registrer" className={cn(btnGold, "mt-8 inline-flex")}>
            Kom i gang
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
