import { NextResponse } from "next/server";

import { seedGolfProductsIfEmpty } from "@/lib/shop/seed-golf-products";

export const runtime = "nodejs";

function authorized(req: Request): boolean {
  const expected = process.env.ADMIN_SECRET_KEY?.trim();
  if (!expected) return false;
  const header =
    req.headers.get("x-admin-secret")?.trim() ??
    req.headers
      .get("authorization")
      ?.replace(/^Bearer\s+/i, "")
      .trim();
  return header === expected;
}

/**
 * One-shot seed for `products` (golf catalog). Protected by ADMIN_SECRET_KEY.
 * Send header: `x-admin-secret: <ADMIN_SECRET_KEY>` or `Authorization: Bearer <ADMIN_SECRET_KEY>`.
 */
export async function POST(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await seedGolfProductsIfEmpty();
  return NextResponse.json(result);
}
