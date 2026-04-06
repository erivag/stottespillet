import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AdminAppShell } from "@/components/layout/admin-app-shell";
import { isAdminUserId } from "@/lib/admin";
import { TrpcProvider } from "@/lib/trpc/react";
import { createClient } from "@/utils/supabase/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminUserId(user.id)) {
    redirect(`/login?next=${encodeURIComponent("/admin/dashboard")}`);
  }

  return (
    <TrpcProvider>
      <AdminAppShell userEmail={user.email ?? null}>
        {children}
      </AdminAppShell>
    </TrpcProvider>
  );
}
