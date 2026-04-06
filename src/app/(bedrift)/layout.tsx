import { BedriftAppShell } from "@/components/layout/bedrift-app-shell";
import { TrpcProvider } from "@/lib/trpc/react";

export default function BedriftLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TrpcProvider>
      <BedriftAppShell>{children}</BedriftAppShell>
    </TrpcProvider>
  );
}
