import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { RegisterMarketingPanel } from "@/components/auth/register-marketing-panel";

import { RegisterForm } from "./register-form";

export default function RegistrerPage() {
  return (
    <AuthSplitLayout
      marketing={<RegisterMarketingPanel />}
      form={<RegisterForm />}
    />
  );
}
