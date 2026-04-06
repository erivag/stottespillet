import { LagAppShell } from "@/components/layout/lag-app-shell";
import { TrpcProvider } from "@/lib/trpc/react";

export default function LagLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TrpcProvider>
      <LagAppShell>{children}</LagAppShell>
    </TrpcProvider>
  );
}
