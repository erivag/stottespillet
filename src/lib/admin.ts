/**
 * UTEbygg admin access — comma-separated Supabase user UUIDs in ADMIN_USER_IDS.
 */
export function getAdminUserIds(): Set<string> {
  const raw = process.env.ADMIN_USER_IDS ?? "";
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  );
}

export function isAdminUserId(userId: string): boolean {
  return getAdminUserIds().has(userId);
}
