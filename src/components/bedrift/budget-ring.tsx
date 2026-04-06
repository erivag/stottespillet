"use client";

import { cn } from "@/lib/utils";

const nok = new Intl.NumberFormat("nb-NO", {
  style: "currency",
  currency: "NOK",
  maximumFractionDigits: 0,
});

type BudgetRingProps = {
  usedOre: number;
  totalOre: number | null;
  className?: string;
};

const R = 44;
const C = 2 * Math.PI * R;

export function BudgetRing({ usedOre, totalOre, className }: BudgetRingProps) {
  const hasBudget = totalOre != null && totalOre > 0;
  const pct = hasBudget
    ? Math.min(100, Math.round((usedOre / totalOre) * 100))
    : 0;
  const dash = (pct / 100) * C;
  const remainingOre = hasBudget ? Math.max(0, totalOre - usedOre) : null;

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-8",
        className
      )}
    >
      <div className="relative size-36 shrink-0 sm:size-40">
        <svg
          className="size-full -rotate-90"
          viewBox="0 0 100 100"
          aria-hidden
        >
          <circle
            cx="50"
            cy="50"
            r={R}
            fill="none"
            className="stroke-neutral-200/90"
            strokeWidth="10"
          />
          <circle
            cx="50"
            cy="50"
            r={R}
            fill="none"
            className="stroke-[var(--brand-gold)] transition-[stroke-dashoffset] duration-500"
            strokeWidth="10"
            strokeDasharray={`${hasBudget ? dash : 0} ${C}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-muted-foreground text-xs font-medium">
            Brukt
          </span>
          <span className="font-heading text-lg font-semibold tabular-nums sm:text-xl">
            {hasBudget ? `${pct}%` : "—"}
          </span>
        </div>
      </div>
      <div className="grid w-full max-w-xs gap-3 text-sm sm:max-w-none">
        <div className="flex justify-between gap-4 border-b border-border/60 pb-2">
          <span className="text-muted-foreground">Brukt i år</span>
          <span className="font-medium tabular-nums">
            {nok.format(usedOre / 100)}
          </span>
        </div>
        <div className="flex justify-between gap-4 border-b border-border/60 pb-2">
          <span className="text-muted-foreground">Gjenstående</span>
          <span className="font-medium tabular-nums">
            {remainingOre != null
              ? nok.format(remainingOre / 100)
              : "Ikke satt"}
          </span>
        </div>
        {!hasBudget ? (
          <p className="text-muted-foreground text-xs leading-relaxed">
            Når årsbudsjett er registrert på bedriften, vises fordelingen her.
          </p>
        ) : null}
      </div>
    </div>
  );
}
