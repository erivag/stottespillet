-- Allow direct business orders without a club/organization user.
-- This is used by /bestill (manual invoice, no Stripe).

ALTER TABLE orders
  ALTER COLUMN organization_id DROP NOT NULL;

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS direct_company_name text,
  ADD COLUMN IF NOT EXISTS direct_contact_name text,
  ADD COLUMN IF NOT EXISTS direct_email text,
  ADD COLUMN IF NOT EXISTS direct_phone text,
  ADD COLUMN IF NOT EXISTS direct_ball_name text,
  ADD COLUMN IF NOT EXISTS direct_dozens integer,
  ADD COLUMN IF NOT EXISTS direct_imprint_text text,
  ADD COLUMN IF NOT EXISTS direct_comment text;

