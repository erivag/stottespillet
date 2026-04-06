"use client";

import Link from "next/link";
import { useState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";

type LoginFormProps = {
  initialError?: string;
};

export function LoginForm({ initialError }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(initialError ?? null);

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
      },
    });

    setLoading(false);

    if (signError) {
      setError(signError.message);
      return;
    }

    setMessage(
      "Sjekk e-posten din — vi har sendt deg en innloggingslenke."
    );
  }

  const showTestButtons =
    process.env.NODE_ENV === "development" ||
    process.env.NEXT_PUBLIC_SHOW_TEST_BUTTONS === "true";

  return (
    <>
    <Card className="border border-brand-pine/10 bg-white shadow-lg shadow-brand-pine/5">
      <CardHeader className="space-y-1 pb-2">
        <CardTitle className="font-heading text-2xl font-semibold tracking-tight text-brand-pine">
          Logg inn
        </CardTitle>
        <CardDescription className="text-base text-neutral-600">
          Skriv inn e-postadressen din. Du får en magisk lenke — uten passord.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pt-2">
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
          <div className="space-y-2">
            <Label htmlFor="email" className="text-brand-pine">
              E-post
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="deg@eksempel.no"
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
            {loading ? "Sender …" : "Send innloggingslenke"}
          </Button>
          <p className="text-center text-sm text-neutral-600 sm:text-right">
            Ny bruker?{" "}
            <Link
              href="/registrer"
              className="font-medium text-brand-pine underline decoration-brand-gold decoration-2 underline-offset-[3px] transition-colors hover:text-brand-pine-light"
            >
              Registrer deg
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>

    {showTestButtons ? (
      <div className="mt-8 w-full space-y-4">
        <div className="border-t border-neutral-200" aria-hidden />
        <div>
          <p className="text-xs font-medium text-amber-700/90">Kun for testing</p>
          <h2 className="font-heading mt-1 text-sm font-semibold text-brand-pine">
            Rask test-innlogging
          </h2>
          <div className="mt-3 flex flex-col gap-2">
            <Link
              href="/admin/dashboard"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-10 w-full justify-center border-brand-pine/20 text-brand-pine hover:bg-brand-cream/80"
              )}
            >
              🏆 Admin
            </Link>
            <Link
              href="/lag/dashboard"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-10 w-full justify-center border-brand-pine/20 text-brand-pine hover:bg-brand-cream/80"
              )}
            >
              ⚽ Idrettslag
            </Link>
            <Link
              href="/bedrift/dashboard"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-10 w-full justify-center border-brand-pine/20 text-brand-pine hover:bg-brand-cream/80"
              )}
            >
              🏢 Bedrift
            </Link>
          </div>
        </div>
      </div>
    ) : null}
    </>
  );
}
