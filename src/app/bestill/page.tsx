"use client";

import { useFormState, useFormStatus } from "react-dom";

import Link from "next/link";

import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { submitDirectOrder, type DirectOrderFormState } from "./actions";

const BALL_OPTIONS = [
  "Vice Drive",
  "Vice Tour",
  "Callaway Super Soft",
  "Callaway Chrome Soft",
  "Titleist True Feel",
  "Titleist Velocity",
  "Titleist Tour Soft",
  "Titleist Pro V1x",
  "Titleist Pro V1",
] as const;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      className="w-full bg-[var(--brand-pine)] text-white hover:bg-[var(--brand-pine-light)]"
      disabled={pending}
    >
      {pending ? "Sender..." : "Send bestilling"}
    </Button>
  );
}

export default function BestillPage() {
  const [state, formAction] = useFormState<DirectOrderFormState, FormData>(
    submitDirectOrder,
    { ok: false, message: "" }
  );

  return (
    <div className="min-h-dvh bg-[#f7f5f0] text-neutral-900">
      <header className="border-b border-[#0A2E1A]/10 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Link
            href="/"
            className="font-heading text-lg font-semibold text-[#0A2E1A]"
          >
            Støttespillet<span className="text-[#FFBE4A]">.</span>
          </Link>
          <Link
            href="/registrer?type=bedrift"
            className="text-sm font-medium text-[#0A2E1A] underline decoration-[#FFBE4A] decoration-2 underline-offset-2 transition hover:text-[#123d24]"
          >
            Bli sponsor <ArrowRight className="inline size-4" aria-hidden />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="space-y-2">
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-[#0A2E1A] sm:text-3xl">
            Bestill golfballer med logo
          </h1>
          <p className="text-sm text-neutral-600 sm:text-base">
            Ingen Stripe. Faktura sendes manuelt etter at vi har bekreftet
            detaljer.
          </p>
        </div>

        <Card className="mt-8 border-[#0A2E1A]/10 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-base text-[#0A2E1A]">
              Bestillingsskjema
            </CardTitle>
          </CardHeader>
          <CardContent>
            {state.ok ? (
              <div className="rounded-xl border border-[#0A2E1A]/10 bg-[#f7f5f0]/70 p-6 text-sm text-neutral-700">
                <p className="font-medium text-[#0A2E1A]">
                  Takk! Vi tar kontakt innen 1 virkedag.
                </p>
                <p className="mt-2">
                  Du kan også{" "}
                  <Link
                    href="/"
                    className="font-medium text-[#0A2E1A] underline decoration-[#FFBE4A] decoration-2 underline-offset-2"
                  >
                    gå tilbake til forsiden
                  </Link>
                  .
                </p>
              </div>
            ) : (
              <form action={formAction} className="space-y-5">
                {state.message ? (
                  <p className="text-sm text-red-600">{state.message}</p>
                ) : null}

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Firmanavn</Label>
                    <Input
                      id="companyName"
                      name="companyName"
                      autoComplete="organization"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactName">Kontaktperson</Label>
                    <Input
                      id="contactName"
                      name="contactName"
                      autoComplete="name"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-post</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefon</Label>
                    <Input
                      id="phone"
                      name="phone"
                      autoComplete="tel"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="ballName">Hvilken ball</Label>
                    <select
                      id="ballName"
                      name="ballName"
                      required
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      defaultValue={BALL_OPTIONS[0]}
                    >
                      {BALL_OPTIONS.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dozens">Antall dusin (minimum 6)</Label>
                    <Input
                      id="dozens"
                      name="dozens"
                      type="number"
                      min={6}
                      step={1}
                      defaultValue={6}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imprintText">Ønsket tekst/logo på ball</Label>
                  <Textarea
                    id="imprintText"
                    name="imprintText"
                    required
                    placeholder="Beskriv logo (f.eks. vedlegg via e-post senere) og/eller ønsket tekst."
                    className="min-h-24"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comment">Kommentar</Label>
                  <Textarea
                    id="comment"
                    name="comment"
                    placeholder="Valgfritt"
                    className="min-h-20"
                  />
                </div>

                <SubmitButton />
                <p className="text-xs text-neutral-500">
                  Ved å sende bestilling godtar du at vi kan kontakte deg for å
                  avklare detaljer før fakturering.
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

