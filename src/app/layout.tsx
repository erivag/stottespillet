import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Syne } from "next/font/google";

/* Tailwind + design tokens — må lastes i rot-layout */
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Støttespillet",
  description: "Sponsorplattform for idrettslag, 17. mai-komiteer og barnehager",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="nb"
      className={`${plusJakarta.variable} ${syne.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh bg-background font-sans text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
