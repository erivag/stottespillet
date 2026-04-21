"use client";

import { useEffect, useState } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc/react";

const ORG_TYPES = [
  { value: "", label: "Velg type …" },
  { value: "golfklubb", label: "Golfklubb" },
  { value: "idrettslag", label: "Idrettslag" },
  { value: "17mai", label: "17. mai-komité" },
  { value: "barnehage", label: "Barnehage" },
  { value: "annet", label: "Annet" },
] as const;

export default function LagInnstillingerPage() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [showProfileHint, setShowProfileHint] = useState(false);
  const { data, isLoading, isError } = trpc.lag.organizationSettings.useQuery();
  const updateOrg = trpc.lag.updateOrganization.useMutation({
    onSuccess: async () => {
      await utils.lag.organizationSettings.invalidate();
      await utils.lag.dashboard.invalidate();
      router.push("/lag/dashboard");
    },
  });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [segment, setSegment] = useState("");
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
    setEmail(data.email);
    if (data.organization) {
      setName(data.organization.name);
      setMunicipality(data.organization.municipality ?? "");
      setSegment(data.organization.segment ?? "");
      setContactName(data.organization.contactName ?? "");
      setPhone(data.organization.phone ?? "");
    } else {
      setName("");
      setMunicipality("");
      setSegment("");
      setContactName("");
      setPhone("");
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        Kunne ikke laste innstillinger. Prøv igjen senere.
      </p>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await updateOrg.mutateAsync({
      name: name.trim(),
      segment: segment.trim(),
      municipality: municipality.trim(),
      contactName: contactName.trim(),
      phone: phone.trim() === "" ? null : phone.trim(),
    });
  }

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
                className="border-[var(--brand-pine)]/10 bg-neutral-50 text-neutral-600"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="org-type" className="text-[var(--brand-pine)]">
                Type
              </Label>
              <select
                id="org-type"
                value={segment}
                onChange={(e) => setSegment(e.target.value)}
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
