import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AdminInnstillingerPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-heading text-2xl font-semibold tracking-tight text-[var(--brand-pine)] sm:text-3xl">
          Innstillinger
        </h2>
        <p className="mt-1 text-sm text-neutral-600">
          Administrasjonsområdet er begrenset til brukere med admin-rolle.
        </p>
      </div>

      <Card className="border-[var(--brand-pine)]/10">
        <CardHeader>
          <CardTitle className="text-lg text-[var(--brand-pine)]">
            Tilgang
          </CardTitle>
          <CardDescription>
            Admin-listen styres via miljøvariabel{" "}
            <code className="rounded bg-neutral-100 px-1 py-0.5 text-xs">
              ADMIN_USER_IDS
            </code>{" "}
            (kommaseparerte bruker-ID-er fra Supabase Auth).
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-neutral-600">
          <p>
            Stripe, Resend, Claude og øvrige integrasjoner konfigureres i{" "}
            <code className="rounded bg-neutral-100 px-1 py-0.5 text-xs">
              .env.local
            </code>
            . Varsler om nye shop-bestillinger sendes til{" "}
            <code className="rounded bg-neutral-100 px-1 py-0.5 text-xs">
              ADMIN_EMAIL
            </code>{" "}
            via Resend. Endringer krever omstart av utviklingsserver eller ny
            deploy.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
