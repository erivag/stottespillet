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
      form={<LoginForm initialError={error} />}
    />
  );
}
