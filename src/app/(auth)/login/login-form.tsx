"use client";

import Link from "next/link";
import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

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

type LoginFormProps = {
  initialError?: string;
};

function GoogleGLogo() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 48 48"
      aria-hidden
      focusable="false"
    >
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303C33.668 32.657 29.194 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.963 3.037l5.657-5.657C34.045 6.053 29.236 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917Z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691 12.88 19.51C14.655 15.108 18.955 12 24 12c3.059 0 5.842 1.154 7.963 3.037l5.657-5.657C34.045 6.053 29.236 4 24 4 16.318 4 9.656 8.337 6.306 14.691Z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.134 0 9.86-1.972 13.409-5.181l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.174 0-9.635-3.32-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44Z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.03 12.03 0 0 1-4.084 5.581l.003-.002 6.19 5.238C36.967 39.166 44 34 44 24c0-1.341-.138-2.65-.389-3.917Z"
      />
    </svg>
  );
}

export function LoginForm({ initialError }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(initialError ?? null);

  async function handleGoogle() {
    setGoogleLoading(true);
    setError(null);
    setMessage(null);

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
      if (!supabaseUrl || !supabaseKey) {
        setError("Mangler Supabase-innstillinger. Prøv igjen senere.");
        return;
      }

      const supabase = createBrowserClient(supabaseUrl, supabaseKey);

      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + "/auth/callback",
        },
      });
    } catch {
      setError("Kunne ikke starte Google-innlogging. Prøv igjen senere.");
    } finally {
      setGoogleLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
    if (!supabaseUrl || !supabaseKey) {
      setLoading(false);
      setError("Mangler Supabase-innstillinger. Prøv igjen senere.");
      return;
    }

    const supabase = createBrowserClient(supabaseUrl, supabaseKey);
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

  return (
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

          <Button
            type="button"
            onClick={handleGoogle}
            disabled={loading || googleLoading}
            className="h-11 w-full justify-center gap-3 rounded-lg border border-[#e2e8f0] bg-white text-neutral-900 shadow-none hover:bg-neutral-50"
            variant="outline"
          >
            <GoogleGLogo />
            {googleLoading ? "Åpner Google…" : "Fortsett med Google"}
          </Button>

          <div className="flex items-center gap-3">
            <hr className="flex-1 border-[#e2e8f0]" />
            <span className="text-xs text-gray-400">eller</span>
            <hr className="flex-1 border-[#e2e8f0]" />
          </div>

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
            disabled={loading || googleLoading}
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
  );
}
