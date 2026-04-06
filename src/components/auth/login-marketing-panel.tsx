import { AuthLogo } from "./auth-logo";
import { SuccessTicker } from "./success-ticker";

export function LoginMarketingPanel() {
  return (
    <>
      <div
        className="auth-grid-bg pointer-events-none absolute inset-0 -z-10"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 top-1/4 h-72 w-72 rounded-full bg-[rgba(255,190,74,0.14)] blur-3xl"
        aria-hidden
      />

      <div className="relative z-10 flex flex-1 flex-col lg:justify-center">
        <AuthLogo />

        <div className="mt-10 max-w-xl sm:mt-14 lg:mt-0 lg:pt-10">
          <h1 className="auth-animate-in auth-animate-delay-1 font-heading text-3xl font-semibold leading-[1.15] tracking-tight text-white sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
            Finn sponsorer{" "}
            <span className="text-brand-gold-bright">til laget ditt</span>
          </h1>
          <p className="auth-animate-in auth-animate-delay-2 mt-4 max-w-md text-base leading-relaxed text-white/75 sm:text-lg">
            Koble laget med lokale bedrifter — fra refleksvester til badstue og
            toalettbygg.
          </p>
          <SuccessTicker />
        </div>
      </div>
    </>
  );
}
