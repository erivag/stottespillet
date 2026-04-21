/**
 * Canonical public site origin (no trailing slash).
 * Used for sponsor share links and social sharing.
 */
export function getPublicSiteOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (raw) {
    return raw.replace(/\/+$/, "");
  }
  return "http://localhost:3000";
}
