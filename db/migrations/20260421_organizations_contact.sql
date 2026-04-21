-- Lagprofil: kontaktperson og telefon på organizations
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS contact_name text,
  ADD COLUMN IF NOT EXISTS phone text;
