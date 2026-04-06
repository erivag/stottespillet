"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const NAV = [
  { href: "/lag/dashboard", label: "Hjem", emoji: "🏠" },
  { href: "/lag/kampanje", label: "Mine søknader", emoji: "📋" },
  { href: "/lag/shop", label: "Shop", emoji: "🛍️" },
  { href: "/lag/spleis", label: "Spleis", emoji: "🏗️" },
  { href: "/lag/social", label: "Sosiale medier", emoji: "📱" },
  { href: "/lag/innstillinger", label: "Innstillinger", emoji: "⚙️" },
] as const;

function NavLink({
  href,
  label,
  emoji,
  mobile,
}: {
  href: string;
  label: string;
  emoji: string;
  mobile?: boolean;
}) {
  const pathname = usePathname();
  const active =
    href === "/lag/dashboard"
      ? pathname === "/lag/dashboard"
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
        mobile
          ? "flex-col gap-1 px-2 py-2 text-xs"
          : "hover:bg-[color-mix(in_srgb,var(--brand-pine)_8%,transparent)]",
        active
          ? "bg-[color-mix(in_srgb,var(--brand-pine)_12%,transparent)] text-[var(--brand-pine)]"
          : "text-neutral-600 hover:text-[var(--brand-pine)]",
        mobile && active && "text-[var(--brand-pine)]"
      )}
    >
      <span className="text-lg leading-none" aria-hidden>
        {emoji}
      </span>
      <span className={cn(mobile && "max-w-[4.5rem] truncate text-center")}>
        {label}
      </span>
    </Link>
  );
}

export function LagAppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-[var(--brand-cream)] pb-[4.5rem] lg:pb-0">
      <aside className="fixed left-0 top-0 z-40 hidden h-full w-56 flex-col border-r border-[var(--brand-pine)]/10 bg-white shadow-sm lg:flex">
        <div className="border-b border-[var(--brand-pine)]/10 px-5 py-6">
          <Link
            href="/"
            className="font-heading text-lg font-semibold tracking-tight text-[var(--brand-pine)]"
          >
            Støttespillet
            <span className="text-[var(--brand-gold)]">.</span>
          </Link>
          <p className="mt-1 text-xs text-neutral-500">Lag</p>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 p-3" aria-label="Hovedmeny">
          {NAV.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </nav>
      </aside>

      <main className="lg:pl-56">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </div>
      </main>

      <nav
        className="fixed bottom-0 left-0 right-0 z-40 flex justify-around border-t border-[var(--brand-pine)]/10 bg-white/95 px-1 py-1 backdrop-blur-md lg:hidden"
        aria-label="Hovedmeny mobil"
      >
        {NAV.map((item) => (
          <NavLink key={item.href} {...item} mobile />
        ))}
      </nav>
    </div>
  );
}
