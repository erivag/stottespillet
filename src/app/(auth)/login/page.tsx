import Link from "next/link";

import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { LoginMarketingPanel } from "@/components/auth/login-marketing-panel";

import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <AuthSplitLayout
      marketing={<LoginMarketingPanel />}
      form={
        <>
          <LoginForm initialError={error} />
          <div className="mt-4 text-center">
            <p className="mb-2 text-xs text-gray-400">Rask test-navigasjon</p>
            <div className="flex justify-center gap-2">
              <Link
                href="/lag/dashboard"
                className="rounded border px-3 py-1 text-xs"
              >
                ⚽ Idrettslag
              </Link>
              <Link
                href="/bedrift/dashboard"
                className="rounded border px-3 py-1 text-xs"
              >
                🏢 Bedrift
              </Link>
              <Link
                href="/admin/dashboard"
                className="rounded border px-3 py-1 text-xs"
              >
                🏆 Admin
              </Link>
            </div>
          </div>
        </>
      }
    />
  );
}
