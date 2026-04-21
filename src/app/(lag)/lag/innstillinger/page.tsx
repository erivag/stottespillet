"use client";

import {
  Component,
  type FormEvent,
  type ReactNode,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc/react";

const ORG_TYPES = [
  { value: "", label: "Velg type …" },
  { value: "golfklubb", label: "Golfklubb" },
  { value: "idrettslag", label: "Idrettslag" },
  { value: "17mai", label: "17. mai-komité" },
  { value: "barnehage", label: "Barnehage" },
  { value: "annet", label: "Annet" },
] as const;

class InnstillingerErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; message?: string }
> {
  state = { hasError: false as boolean, message: undefined as string | undefined };

  static getDerivedStateFromError(error: unknown) {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : "Ukjent feil",
    };
  }

  componentDidCatch(error: unknown, info: { componentStack?: string }) {
    console.error("[lag/innstillinger] render error", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto max-w-lg space-y-4 py-6">
          <Card className="border-destructive/30 bg-white">
            <CardHeader>
              <CardTitle className="text-destructive text-base">
                Noe gikk galt
              </CardTitle>
              <CardDescription className="text-neutral-700">
                {this.state.message ??
                  "Siden kunne ikke vises. Prøv å laste på nytt."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                type="button"
                className="bg-[var(--brand-pine)] text-white hover:bg-[var(--brand-pine-light)]"
                onClick={() => window.location.reload()}
              >
                Last siden på nytt
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }
    return this.props.children;
  }
}

function LagInnstillingerInner() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [showProfileHint, setShowProfileHint] = useState(false);
  const [submitCaughtError, setSubmitCaughtError] = useState<string | null>(
    null
  );

  const { data, isLoading, isError, isFetching } =
    trpc.lag.organizationSettings.useQuery(undefined, {
      retry: 1,
      throwOnError: false,
      refetchOnWindowFocus: true,
    });

  const updateOrg = trpc.lag.updateOrganization.useMutation({
    onSuccess: async () => {
      setSubmitCaughtError(null);
      await utils.lag.organizationSettings.invalidate();
      await utils.lag.dashboard.invalidate();
      router.push("/lag/dashboard");
    },
  });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [orgType, setOrgType] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("manglerProfil") === "1") {
      setShowProfileHint(true);
      router.replace("/lag/innstillinger", { scroll: false });
    }
  }, [router]);

  useEffect(() => {
    if (!data) return;
    try {
      setEmail(data.email);
      if (data.organization) {
        setName(data.organization.name);
        setMunicipality(data.organization.municipality ?? "");
        setOrgType(data.organization.type ?? "");
        setContactName(data.organization.contactName ?? "");
        setPhone(data.organization.phone ?? "");
      } else {
        setName("");
        setMunicipality("");
        setOrgType("");
        setContactName("");
        setPhone("");
      }
    } catch (err) {
      console.error("[lag/innstillinger] apply settings to form", err);
    }
  }, [data]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitCaughtError(null);
    try {
      await updateOrg.mutateAsync({
        name: name.trim(),
        type: orgType.trim(),
        municipality: municipality.trim(),
        contactName: contactName.trim(),
        phone: phone.trim() === "" ? null : phone.trim(),
      });
    } catch (err) {
      console.error("[lag/innstillinger] lagre profil", err);
      setSubmitCaughtError(
        err instanceof Error ? err.message : "Kunne ikke lagre. Prøv igjen."
      );
    }
  }

  const showLoadHint = isLoading && data === undefined;
  const showFetchWarning = isError;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      {showProfileHint ? (
        <p
          className="rounded-lg border border-[var(--brand-gold)]/40 bg-amber-50 px-4 py-3 text-sm text-neutral-800"
          role="status"
        >
          Fullfør profilen din for å komme i gang
        </p>
      ) : null}

      {showLoadHint ? (
        <p className="text-sm text-neutral-500" aria-live="polite">
          Laster tidligere lagring …
        </p>
      ) : null}

      {showFetchWarning ? (
        <p
          className="rounded-lg border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-neutral-800"
          role="status"
        >
          Kunne ikke hente lagret profil fra serveren. Fyll ut skjemaet under
          og trykk Lagre — data lagres når tilkoblingen fungerer.
          {isFetching ? " (prøver på nytt …)" : null}
        </p>
      ) : null}

      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-[var(--brand-pine)] sm:text-3xl">
          Innstillinger
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          Lagrede data brukes på dashbord og i søknader.
        </p>
      </div>

      <Card className="border-[var(--brand-pine)]/10 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-[var(--brand-pine)]">Lagprofil</CardTitle>
          <CardDescription>
            E-post kommer fra innloggingen og kan ikke endres her.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="org-name" className="text-[var(--brand-pine)]">
                Lagnavn
              </Label>
              <Input
                id="org-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={200}
                className="border-[var(--brand-pine)]/15 focus-visible:ring-[var(--brand-gold)]/40"
                placeholder="F.eks. Osterøy IL"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="org-email" className="text-[var(--brand-pine)]">
                E-post
              </Label>
              <Input
                id="org-email"
                type="email"
                value={email}
                readOnly
                disabled
                placeholder="(hentes ved innlogging)"
                className="border-[var(--brand-pine)]/10 bg-neutral-50 text-neutral-600"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="org-type" className="text-[var(--brand-pine)]">
                Type
              </Label>
              <select
                id="org-type"
                value={orgType}
                onChange={(e) => setOrgType(e.target.value)}
                required
                className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-[var(--brand-gold)]/40 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                {ORG_TYPES.map((o) => (
                  <option key={o.value || "empty"} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="org-municipality"
                className="text-[var(--brand-pine)]"
              >
                Kommune
              </Label>
              <Input
                id="org-municipality"
                value={municipality}
                onChange={(e) => setMunicipality(e.target.value)}
                required
                maxLength={100}
                className="border-[var(--brand-pine)]/15 focus-visible:ring-[var(--brand-gold)]/40"
                placeholder="F.eks. Osterøy"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="org-contact"
                className="text-[var(--brand-pine)]"
              >
                Kontaktperson
              </Label>
              <Input
                id="org-contact"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                required
                maxLength={200}
                className="border-[var(--brand-pine)]/15 focus-visible:ring-[var(--brand-gold)]/40"
                placeholder="Navn på kontaktperson"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="org-phone" className="text-[var(--brand-pine)]">
                Telefon
              </Label>
              <Input
                id="org-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={50}
                className="border-[var(--brand-pine)]/15 focus-visible:ring-[var(--brand-gold)]/40"
                placeholder="Valgfritt"
              />
            </div>

            {submitCaughtError ? (
              <p className="text-sm text-destructive" role="alert">
                {submitCaughtError}
              </p>
            ) : null}
            {updateOrg.error ? (
              <p className="text-sm text-destructive" role="alert">
                {updateOrg.error.message}
              </p>
            ) : null}

            <Button
              type="submit"
              disabled={updateOrg.isPending}
              className="w-full bg-[var(--brand-pine)] text-white hover:bg-[var(--brand-pine-light)] sm:w-auto"
            >
              {updateOrg.isPending ? "Lagrer …" : "Lagre"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LagInnstillingerPage() {
  try {
    return (
      <InnstillingerErrorBoundary>
        <LagInnstillingerInner />
      </InnstillingerErrorBoundary>
    );
  } catch (err) {
    console.error("[lag/innstillinger] page mount", err);
    return (
      <div className="mx-auto max-w-lg p-6 text-sm text-destructive">
        Kunne ikke åpne siden.{" "}
        <button
          type="button"
          className="underline"
          onClick={() => window.location.reload()}
        >
          Last på nytt
        </button>
      </div>
    );
  }
}
