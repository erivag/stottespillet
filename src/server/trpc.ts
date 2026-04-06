import { initTRPC, TRPCError } from "@trpc/server";
import type { User } from "@supabase/supabase-js";
import { cookies } from "next/headers";

import { createClient } from "@/utils/supabase/server";

export async function createTRPCContext() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return {
    supabase,
    user,
  };
}

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;

type AuthedContext = TRPCContext & { user: User };

const t = initTRPC.context<TRPCContext>().create();

const enforceUser = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Du må være innlogget.",
    });
  }

  return next({
    ctx: { ...ctx, user: ctx.user } satisfies AuthedContext,
  });
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(enforceUser);
