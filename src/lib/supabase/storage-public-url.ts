/**
 * Public bucket URL (krever at bucket er satt til public i Supabase).
 */
export function storagePublicObjectUrl(
  bucket: string,
  path: string
): string | null {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  if (!base || !path.trim()) return null;
  const encoded = path
    .split("/")
    .filter(Boolean)
    .map((s) => encodeURIComponent(s))
    .join("/");
  return `${base}/storage/v1/object/public/${bucket}/${encoded}`;
}
