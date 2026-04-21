-- Tillat utkast til sponsorsøknad mot bedrifter som ikke er registrert som sponsor ennå.
ALTER TABLE public.outreach_emails
  ALTER COLUMN sponsor_id DROP NOT NULL;

ALTER TABLE public.outreach_emails
  ADD COLUMN IF NOT EXISTS prospect_org_nr text,
  ADD COLUMN IF NOT EXISTS prospect_company_name text;
