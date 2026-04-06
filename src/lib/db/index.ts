import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "@db/schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Add the Supabase Postgres connection string to .env.local (Settings → Database → URI, use Transaction pooler for serverless)."
  );
}

const client = postgres(connectionString, {
  prepare: false,
  max: 1,
});

export const db = drizzle(client, { schema });
