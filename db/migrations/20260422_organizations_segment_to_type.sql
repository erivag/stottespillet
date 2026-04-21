-- Align column name with app (Drizzle maps JS field `type` → column "type").
-- Run only if the table still has `segment` from older schema:

-- ALTER TABLE public.organizations RENAME COLUMN segment TO type;

-- If `type` already exists and `segment` is gone, skip the statement above.
