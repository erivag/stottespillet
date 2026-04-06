-- One-time rename: gamle tabellnavn → spleises / spleis_slots
-- Kjør i Supabase SQL Editor hvis databasen fortsatt har sauna_*-tabeller.
-- Deretter: npm run db:push (i vanlig terminal med TTY) for å synk indekser, eller la Drizzle opprette nye tabeller på tomt skjema.

BEGIN;

ALTER TABLE IF EXISTS public.sauna_spleises RENAME TO spleises;
ALTER TABLE IF EXISTS public.sauna_slots RENAME TO spleis_slots;

COMMIT;
