import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { organizations, sponsors } from "@db/schema";
import { db } from "@/lib/db";
import { createClient } from "@/utils/supabase/server";

/**
 * Route groups (lag)/(bedrift) cannot both own `/dashboard`.
 * Canonical URLs: `/lag/dashboard` and `/bedrift/dashboard`.
 * This page sends users to the right one.
 */
export default async function DashboardPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=%2Fdashboard");
  }

  const [org] = await db
    .select({ id: organizations.id })
    .from(organizations)
    .where(eq(organizations.userId, user.id))
    .limit(1);

  const [sponsor] = await db
    .select({ id: sponsors.id })
    .from(sponsors)
    .where(eq(sponsors.userId, user.id))
    .limit(1);

  if (org) {
    redirect("/lag/dashboard");
  }

  if (sponsor) {
    redirect("/bedrift/dashboard");
  }

  redirect("/lag/innstillinger?manglerProfil=1");
}
