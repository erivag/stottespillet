"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin/dashboard", label: "Oversikt", emoji: "📊" },
  { href: "/admin/lag", label: "Lag", emoji: "👥" },
  { href: "/admin/bedrifter", label: "Bedrifter", emoji: "🏢" },
  { href: "/admin/soknader", label: "Søknader", emoji: "📋" },
  { href: "/admin/ordrer", label: "Ordrer", emoji: "💰" },
  { href: "/admin/spleis", label: "Spleiser", emoji: "🏗️" },
  { href: "/admin/produkter", label: "Produkter", emoji: "📦" },
  { href: "/admin/eposter", label: "E-poster", emoji: "📧" },
  { href: "/admin/innstillinger", label: "Innstillinger", emoji: "⚙️" },
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
    href === "/admin/dashboard"
      ? pathname === "/admin/dashboard"
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={cn(
        "flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
        mobile
          ? "min-w-[4.75rem] flex-col gap-1 px-2 py-2 text-[0.65rem] leading-tight"
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
      <span className={cn(mobile && "text-center")}>{label}</span>
    </Link>
  );
}

type AdminAppShellProps = {
  children: ReactNode;
  userEmail: string | null;
};

export function AdminAppShell({ children, userEmail }: AdminAppShellProps) {
  return (
    <div className="min-h-dvh bg-[var(--brand-cream)] pb-16 lg:pb-0">
      <aside className="fixed left-0 top-0 z-40 hidden h-full w-56 flex-col border-r border-[var(--brand-pine)]/10 bg-white shadow-sm lg:flex">
        <div className="border-b border-[var(--brand-pine)]/10 px-5 py-5">
          <Link
            href="/"
            className="font-heading text-lg font-semibold tracking-tight text-[var(--brand-pine)]"
          >
            Støttespillet
            <span className="text-[var(--brand-gold)]">.</span>
          </Link>
          <p className="mt-1 text-xs font-medium text-[var(--brand-pine)]/70">
            Admin
          </p>
        </div>
        <nav
          className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3"
          aria-label="Admin-meny"
        >
          {NAV.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </nav>
      </aside>

      <div className="lg:pl-56">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-[var(--brand-pine)]/10 bg-white/95 px-4 py-3 backdrop-blur-md sm:px-6">
          <h1 className="font-heading text-base font-semibold tracking-tight text-[var(--brand-pine)] sm:text-lg">
            Admin – Støttespillet
          </h1>
          <p
            className="max-w-[50%] truncate text-right text-xs text-neutral-600 sm:text-sm"
            title={userEmail ?? undefined}
          >
            {userEmail ?? "Innlogget"}
          </p>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </main>
      </div>

      <nav
        className="fixed bottom-0 left-0 right-0 z-40 flex gap-1 overflow-x-auto border-t border-[var(--brand-pine)]/10 bg-white/95 px-2 py-2 backdrop-blur-md lg:hidden"
        aria-label="Admin-meny mobil"
      >
        {NAV.map((item) => (
          <NavLink key={item.href} {...item} mobile />
        ))}
      </nav>
    </div>
  );
}
