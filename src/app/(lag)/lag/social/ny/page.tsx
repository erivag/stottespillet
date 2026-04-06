import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LagSocialNyPage() {
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-[var(--brand-pine)]">
          AI-innlegg
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          Claude + Meta-integrasjon kobles på i neste steg.
        </p>
      </div>
      <Card className="border-[var(--brand-pine)]/10 bg-white">
        <CardHeader>
          <CardTitle className="text-[var(--brand-pine)]">Kommer snart</CardTitle>
          <CardDescription>
            Her genereres forslag til innlegg som du kan redigere og publisere.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href="/lag/social"
            className="inline-flex h-9 items-center justify-center rounded-lg border border-[var(--brand-pine)]/20 bg-background px-4 text-sm font-medium text-[var(--brand-pine)] transition hover:bg-[var(--brand-cream)]"
          >
            Tilbake til Sosiale medier
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
