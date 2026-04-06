import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const btnPrimary =
  "inline-flex h-10 items-center justify-center rounded-md bg-[var(--brand-pine)] px-4 text-sm font-medium text-white transition-colors hover:bg-[var(--brand-pine-light)]";
const btnOutline =
  "inline-flex h-10 items-center justify-center rounded-md border border-[var(--brand-pine)]/20 bg-background px-4 text-sm font-medium transition-colors hover:bg-neutral-50";

export default function LagKampanjeNyPage() {
  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <div>
        <Link
          href="/lag/kampanje"
          className="text-sm font-medium text-[var(--brand-pine)] underline-offset-2 hover:underline"
        >
          ← Tilbake til mine søknader
        </Link>
        <h1 className="font-heading mt-4 text-2xl font-semibold tracking-tight text-[var(--brand-pine)] sm:text-3xl">
          Ny søknad
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          Skjema for nye sponsorsøknader kommer i neste steg (kampanje-type,
          beløp, dato og eksponering).
        </p>
      </div>

      <Card className="border-[var(--brand-pine)]/10 bg-white">
        <CardHeader>
          <CardTitle className="text-lg text-[var(--brand-pine)]">
            Under utvikling
          </CardTitle>
          <CardDescription>
            Logg inn og fullfør lagprofil under Innstillinger mens vi bygger
            veiviseren.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link href="/lag/innstillinger" className={btnPrimary}>
            Gå til Innstillinger
          </Link>
          <Link href="/lag/kampanje" className={btnOutline}>
            Avbryt
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
