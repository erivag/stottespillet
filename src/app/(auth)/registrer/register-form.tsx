"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { createClient } from "@/utils/supabase/client";

export type AccountType = "lag" | "bedrift";

export function RegisterForm() {
  const [email, setEmail] = useState("");
  const [accountType, setAccountType] = useState<AccountType>("lag");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const supabase = createClient();
    const origin = window.location.origin;

    const { error: signError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
        data: {
          account_type: accountType,
        },
      },
    });

    setLoading(false);

    if (signError) {
      setError(signError.message);
      return;
    }

    setMessage(
      "Sjekk e-posten din — vi har sendt deg en lenke for å fullføre registreringen."
    );
  }

  return (
    <Card className="border border-brand-pine/10 bg-white shadow-lg shadow-brand-pine/5">
      <CardHeader className="space-y-1 pb-2">
        <CardTitle className="font-heading text-2xl font-semibold tracking-tight text-brand-pine">
          Opprett konto
        </CardTitle>
        <CardDescription className="text-base text-neutral-600">
          Velg type og e-post. Du logger inn med magisk lenke.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6 pt-2">
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          {message ? (
            <p className="text-sm text-brand-pine-mid" role="status">
              {message}
            </p>
          ) : null}

          <div className="space-y-3">
            <Label className="text-base font-medium text-brand-pine">
              Jeg representerer
            </Label>
            <RadioGroup
              value={accountType}
              onValueChange={(value) => setAccountType(value as AccountType)}
              className="gap-3"
              disabled={loading}
            >
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-brand-pine/12 bg-brand-cream/40 p-3.5 transition-colors has-[[data-checked]]:border-brand-gold has-[[data-checked]]:bg-white has-[[data-checked]]:shadow-sm">
                <RadioGroupItem
                  value="lag"
                  className="mt-0.5 border-brand-pine/30 text-brand-pine"
                />
                <span>
                  <span className="font-medium text-brand-pine">
                    Lag, komité eller barnehage
                  </span>
                  <span className="mt-0.5 block text-sm text-neutral-600">
                    Søk sponsorer og bestill produkter til deres aktivitet.
                  </span>
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-brand-pine/12 bg-brand-cream/40 p-3.5 transition-colors has-[[data-checked]]:border-brand-gold has-[[data-checked]]:bg-white has-[[data-checked]]:shadow-sm">
                <RadioGroupItem
                  value="bedrift"
                  className="mt-0.5 border-brand-pine/30 text-brand-pine"
                />
                <span>
                  <span className="font-medium text-brand-pine">Bedrift</span>
                  <span className="mt-0.5 block text-sm text-neutral-600">
                    Motta søknader, godkjenn og betal som sponsor.
                  </span>
                </span>
              </label>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="register-email" className="text-brand-pine">
              E-post
            </Label>
            <Input
              id="register-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="deg@bedrift.no"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="h-11 border-brand-pine/15 bg-white focus-visible:ring-brand-gold/40"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="submit"
            disabled={loading}
            className="h-11 w-full bg-brand-pine text-white hover:bg-brand-pine-light focus-visible:ring-2 focus-visible:ring-brand-gold/50 sm:w-auto sm:min-w-[200px]"
          >
            {loading ? "Sender …" : "Send registreringslenke"}
          </Button>
          <p className="text-center text-sm text-neutral-600 sm:text-right">
            Har du allerede konto?{" "}
            <Link
              href="/login"
              className="font-medium text-brand-pine underline decoration-brand-gold decoration-2 underline-offset-[3px] transition-colors hover:text-brand-pine-light"
            >
              Logg inn
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
