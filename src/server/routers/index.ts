import { router } from "../trpc";

import { adminRouter } from "./admin";
import { bedriftRouter } from "./bedrift";
import { lagRouter } from "./lag";

export const appRouter = router({
  lag: lagRouter,
  bedrift: bedriftRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
