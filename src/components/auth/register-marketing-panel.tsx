import { AuthLogo } from "./auth-logo";

const STEPS = [
  { title: "Velg lag eller bedrift", detail: "Én konto per profil." },
  { title: "Bekreft e-post", detail: "Magisk lenke, ingen passord." },
  { title: "Opprett søknad eller svar", detail: "Du er i gang på minutter." },
] as const;

export function RegisterMarketingPanel() {
  return (
    <>
      <div
        className="auth-grid-bg pointer-events-none absolute inset-0 -z-10"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-20 bottom-1/4 h-64 w-64 rounded-full bg-[rgba(255,190,74,0.16)] blur-3xl"
        aria-hidden
      />

      <div className="relative z-10 flex flex-1 flex-col lg:justify-center">
        <AuthLogo />

        <div className="mt-10 max-w-lg sm:mt-14 lg:mt-0 lg:pt-10">
          <h1 className="auth-animate-in auth-animate-delay-1 font-heading text-3xl font-semibold leading-[1.15] tracking-tight text-white sm:text-4xl lg:text-[2.65rem]">
            Kom i gang på{" "}
            <span className="text-brand-gold-bright">3 minutter</span>
          </h1>
          <p className="auth-animate-in auth-animate-delay-2 mt-4 text-base leading-relaxed text-white/75 sm:text-lg">
            Registrer deg gratis. Lag betaler aldri — Støttespillet kobler deg
            med sponsorer som vil støtte lokalt.
          </p>

          <ol className="auth-animate-in auth-animate-delay-3 mt-8 space-y-4 sm:mt-10">
            {STEPS.map((step, i) => (
              <li key={step.title} className="flex gap-4">
                <span
                  className="font-heading flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brand-gold/40 bg-brand-pine-mid/80 text-sm font-semibold text-brand-gold-bright"
                  aria-hidden
                >
                  {i + 1}
                </span>
                <div>
                  <p className="font-medium text-white">{step.title}</p>
                  <p className="mt-0.5 text-sm text-white/65">{step.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </>
  );
}
