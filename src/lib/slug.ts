const FALLBACK = "produkt";

export function slugifyName(name: string): string {
  const base = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return base.length > 0 ? base : FALLBACK;
}

export function randomSlugSuffix(): string {
  return Math.random().toString(36).slice(2, 8);
}
