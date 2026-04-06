"use client";

import { useEffect, useState } from "react";

/** Generelle plattformpoeng — ingen oppdiktede tall eller navn. */
const EXAMPLES = [
  "Lokale bedrifter får personlige henvendelser — generert og sendt for deg.",
  "Du følger svar og status samlet på ett dashbord.",
  "Lag betaler ikke for å registrere seg og søke sponsorer.",
  "Spleis lar flere sponsorer dele på større prosjekter.",
] as const;

export function SuccessTicker() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let swapTimeout: number | undefined;
    const id = window.setInterval(() => {
      setVisible(false);
      swapTimeout = window.setTimeout(() => {
        setIndex((i) => (i + 1) % EXAMPLES.length);
        setVisible(true);
      }, 320);
    }, 4200);
    return () => {
      window.clearInterval(id);
      if (swapTimeout !== undefined) window.clearTimeout(swapTimeout);
    };
  }, []);

  return (
    <div
      className="auth-animate-in auth-animate-delay-3 mt-8 max-w-lg rounded-xl border border-brand-gold-muted bg-brand-pine-mid/60 px-4 py-3 backdrop-blur-sm sm:mt-10 sm:px-5 sm:py-4"
      aria-live="polite"
    >
      <p className="text-brand-gold-bright/90 mb-1 text-xs font-medium uppercase tracking-wider">
        Slik jobber Støttespillet
      </p>
      <p
        className={`text-sm leading-relaxed text-white/95 transition-opacity duration-300 sm:text-base ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      >
        {EXAMPLES[index]}
      </p>
    </div>
  );
}
