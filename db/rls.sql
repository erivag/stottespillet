-- =============================================================================
-- Støttespillet — Row Level Security (Supabase / PostgreSQL)
-- Kjør hele filen i Supabase SQL Editor (én gang, eller etter justeringer).
--
-- Admin: Sett for utvalgte brukere i Authentication → Users → bruker
--   → User Metadata / App Metadata: { "role": "admin" }
--   (JWT-claim leses som auth.jwt()->'app_metadata'->>'role' = 'admin')
--
-- Merk: service_role (server) omgår RLS automatisk — webhooks, Drizzle m/service key.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Helpers
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;

COMMENT ON FUNCTION public.is_platform_admin() IS
  'True når JWT app_metadata.role = admin. Sett i Supabase Auth for UTEbygg-admin.';

-- Unngår at RLS på spleises blokkerer anonym lesing av slots under aktive spleiser.
DROP FUNCTION IF EXISTS public.sauna_spleis_is_publicly_visible(uuid);

-- Bruker ikke s.status: noen databaser mangler kolonnen etter rename/migrasjon.
-- Synlighet for anonyme lesere = spleis-rad finnes (eier ser alle egne slots via egen policy).
CREATE OR REPLACE FUNCTION public.spleis_is_market_visible(p_spleis_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.spleises s
    WHERE s.id = p_spleis_id
  );
$$;

COMMENT ON FUNCTION public.spleis_is_market_visible(uuid) IS
  'SECURITY DEFINER: true hvis spleis finnes — uten RLS; brukt for offentlig listing av spleis_slots (uten status-kolonne).';

GRANT EXECUTE ON FUNCTION public.is_platform_admin() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.spleis_is_market_visible(uuid) TO anon, authenticated;

-- -----------------------------------------------------------------------------
-- RLS på
-- -----------------------------------------------------------------------------

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outreach_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spleises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spleis_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brreg_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.toilet_buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.toilet_sessions ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- organizations — bruker ser kun sin egen rad (+ admin)
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "organizations_select" ON public.organizations;
DROP POLICY IF EXISTS "organizations_insert" ON public.organizations;
DROP POLICY IF EXISTS "organizations_update" ON public.organizations;
DROP POLICY IF EXISTS "organizations_delete" ON public.organizations;

CREATE POLICY "organizations_select"
  ON public.organizations FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_platform_admin());

CREATE POLICY "organizations_insert"
  ON public.organizations FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR public.is_platform_admin());

CREATE POLICY "organizations_update"
  ON public.organizations FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.is_platform_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_platform_admin());

CREATE POLICY "organizations_delete"
  ON public.organizations FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR public.is_platform_admin());

-- -----------------------------------------------------------------------------
-- sponsors — bedrift ser kun sin egen rad (+ admin)
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "sponsors_select" ON public.sponsors;
DROP POLICY IF EXISTS "sponsors_insert" ON public.sponsors;
DROP POLICY IF EXISTS "sponsors_update" ON public.sponsors;
DROP POLICY IF EXISTS "sponsors_delete" ON public.sponsors;

CREATE POLICY "sponsors_select"
  ON public.sponsors FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_platform_admin());

CREATE POLICY "sponsors_insert"
  ON public.sponsors FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR public.is_platform_admin());

CREATE POLICY "sponsors_update"
  ON public.sponsors FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.is_platform_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_platform_admin());

CREATE POLICY "sponsors_delete"
  ON public.sponsors FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR public.is_platform_admin());

-- -----------------------------------------------------------------------------
-- campaigns — lag ser kun egne (+ admin)
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "campaigns_select" ON public.campaigns;
DROP POLICY IF EXISTS "campaigns_insert" ON public.campaigns;
DROP POLICY IF EXISTS "campaigns_update" ON public.campaigns;
DROP POLICY IF EXISTS "campaigns_delete" ON public.campaigns;

CREATE POLICY "campaigns_select"
  ON public.campaigns FOR SELECT TO authenticated
  USING (
    organization_id IN (
      SELECT o.id FROM public.organizations o
      WHERE o.user_id = auth.uid()
    )
    OR public.is_platform_admin()
  );

CREATE POLICY "campaigns_insert"
  ON public.campaigns FOR INSERT TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT o.id FROM public.organizations o
      WHERE o.user_id = auth.uid()
    )
    OR public.is_platform_admin()
  );

CREATE POLICY "campaigns_update"
  ON public.campaigns FOR UPDATE TO authenticated
  USING (
    organization_id IN (
      SELECT o.id FROM public.organizations o
      WHERE o.user_id = auth.uid()
    )
    OR public.is_platform_admin()
  )
  WITH CHECK (
    organization_id IN (
      SELECT o.id FROM public.organizations o
      WHERE o.user_id = auth.uid()
    )
    OR public.is_platform_admin()
  );

CREATE POLICY "campaigns_delete"
  ON public.campaigns FOR DELETE TO authenticated
  USING (
    organization_id IN (
      SELECT o.id FROM public.organizations o
      WHERE o.user_id = auth.uid()
    )
    OR public.is_platform_admin()
  );

-- -----------------------------------------------------------------------------
-- outreach_emails — lag: egne via kampanje; bedrift: egne via sponsor (+ admin)
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "outreach_emails_select" ON public.outreach_emails;
DROP POLICY IF EXISTS "outreach_emails_insert" ON public.outreach_emails;
DROP POLICY IF EXISTS "outreach_emails_update" ON public.outreach_emails;
DROP POLICY IF EXISTS "outreach_emails_delete" ON public.outreach_emails;

CREATE POLICY "outreach_emails_select"
  ON public.outreach_emails FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.campaigns c
      JOIN public.organizations o ON o.id = c.organization_id
      WHERE c.id = outreach_emails.campaign_id
        AND o.user_id = auth.uid()
    )
    OR sponsor_id IN (
      SELECT s.id FROM public.sponsors s WHERE s.user_id = auth.uid()
    )
    OR public.is_platform_admin()
  );

CREATE POLICY "outreach_emails_insert"
  ON public.outreach_emails FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.campaigns c
      JOIN public.organizations o ON o.id = c.organization_id
      WHERE c.id = outreach_emails.campaign_id
        AND o.user_id = auth.uid()
    )
    OR public.is_platform_admin()
  );

CREATE POLICY "outreach_emails_update"
  ON public.outreach_emails FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.campaigns c
      JOIN public.organizations o ON o.id = c.organization_id
      WHERE c.id = outreach_emails.campaign_id
        AND o.user_id = auth.uid()
    )
    OR sponsor_id IN (
      SELECT s.id FROM public.sponsors s WHERE s.user_id = auth.uid()
    )
    OR public.is_platform_admin()
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.campaigns c
      JOIN public.organizations o ON o.id = c.organization_id
      WHERE c.id = outreach_emails.campaign_id
        AND o.user_id = auth.uid()
    )
    OR sponsor_id IN (
      SELECT s.id FROM public.sponsors s WHERE s.user_id = auth.uid()
    )
    OR public.is_platform_admin()
  );

CREATE POLICY "outreach_emails_delete"
  ON public.outreach_emails FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.campaigns c
      JOIN public.organizations o ON o.id = c.organization_id
      WHERE c.id = outreach_emails.campaign_id
        AND o.user_id = auth.uid()
    )
    OR public.is_platform_admin()
  );

-- -----------------------------------------------------------------------------
-- matches — lag (via kampanje) og bedrift (via sponsor) ser kun sine (+ admin)
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "matches_select" ON public.matches;
DROP POLICY IF EXISTS "matches_insert" ON public.matches;
DROP POLICY IF EXISTS "matches_update" ON public.matches;
DROP POLICY IF EXISTS "matches_delete" ON public.matches;

CREATE POLICY "matches_select"
  ON public.matches FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.campaigns c
      JOIN public.organizations o ON o.id = c.organization_id
      WHERE c.id = matches.campaign_id
        AND o.user_id = auth.uid()
    )
    OR sponsor_id IN (
      SELECT s.id FROM public.sponsors s WHERE s.user_id = auth.uid()
    )
    OR public.is_platform_admin()
  );

CREATE POLICY "matches_insert"
  ON public.matches FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.campaigns c
      JOIN public.organizations o ON o.id = c.organization_id
      WHERE c.id = matches.campaign_id
        AND o.user_id = auth.uid()
    )
    OR sponsor_id IN (
      SELECT s.id FROM public.sponsors s WHERE s.user_id = auth.uid()
    )
    OR public.is_platform_admin()
  );

CREATE POLICY "matches_update"
  ON public.matches FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.campaigns c
      JOIN public.organizations o ON o.id = c.organization_id
      WHERE c.id = matches.campaign_id
        AND o.user_id = auth.uid()
    )
    OR sponsor_id IN (
      SELECT s.id FROM public.sponsors s WHERE s.user_id = auth.uid()
    )
    OR public.is_platform_admin()
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.campaigns c
      JOIN public.organizations o ON o.id = c.organization_id
      WHERE c.id = matches.campaign_id
        AND o.user_id = auth.uid()
    )
    OR sponsor_id IN (
      SELECT s.id FROM public.sponsors s WHERE s.user_id = auth.uid()
    )
    OR public.is_platform_admin()
  );

CREATE POLICY "matches_delete"
  ON public.matches FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.campaigns c
      JOIN public.organizations o ON o.id = c.organization_id
      WHERE c.id = matches.campaign_id
        AND o.user_id = auth.uid()
    )
    OR sponsor_id IN (
      SELECT s.id FROM public.sponsors s WHERE s.user_id = auth.uid()
    )
    OR public.is_platform_admin()
  );

-- -----------------------------------------------------------------------------
-- orders — lag ser kun egne (+ admin)
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "orders_select" ON public.orders;
DROP POLICY IF EXISTS "orders_insert" ON public.orders;
DROP POLICY IF EXISTS "orders_update" ON public.orders;
DROP POLICY IF EXISTS "orders_delete" ON public.orders;

CREATE POLICY "orders_select"
  ON public.orders FOR SELECT TO authenticated
  USING (
    organization_id IN (
      SELECT o.id FROM public.organizations o WHERE o.user_id = auth.uid()
    )
    OR public.is_platform_admin()
  );

CREATE POLICY "orders_insert"
  ON public.orders FOR INSERT TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT o.id FROM public.organizations o WHERE o.user_id = auth.uid()
    )
    OR public.is_platform_admin()
  );

CREATE POLICY "orders_update"
  ON public.orders FOR UPDATE TO authenticated
  USING (
    organization_id IN (
      SELECT o.id FROM public.organizations o WHERE o.user_id = auth.uid()
    )
    OR public.is_platform_admin()
  )
  WITH CHECK (
    organization_id IN (
      SELECT o.id FROM public.organizations o WHERE o.user_id = auth.uid()
    )
    OR public.is_platform_admin()
  );

CREATE POLICY "orders_delete"
  ON public.orders FOR DELETE TO authenticated
  USING (
    organization_id IN (
      SELECT o.id FROM public.organizations o WHERE o.user_id = auth.uid()
    )
    OR public.is_platform_admin()
  );

-- -----------------------------------------------------------------------------
-- social_posts — lag ser kun egne (+ admin)
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "social_posts_select" ON public.social_posts;
DROP POLICY IF EXISTS "social_posts_insert" ON public.social_posts;
DROP POLICY IF EXISTS "social_posts_update" ON public.social_posts;
DROP POLICY IF EXISTS "social_posts_delete" ON public.social_posts;

CREATE POLICY "social_posts_select"
  ON public.social_posts FOR SELECT TO authenticated
  USING (
    organization_id IN (
      SELECT o.id FROM public.organizations o WHERE o.user_id = auth.uid()
    )
    OR public.is_platform_admin()
  );

CREATE POLICY "social_posts_insert"
  ON public.social_posts FOR INSERT TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT o.id FROM public.organizations o WHERE o.user_id = auth.uid()
    )
    OR public.is_platform_admin()
  );

CREATE POLICY "social_posts_update"
  ON public.social_posts FOR UPDATE TO authenticated
  USING (
    organization_id IN (
      SELECT o.id FROM public.organizations o WHERE o.user_id = auth.uid()
    )
    OR public.is_platform_admin()
  )
  WITH CHECK (
    organization_id IN (
      SELECT o.id FROM public.organizations o WHERE o.user_id = auth.uid()
    )
    OR public.is_platform_admin()
  );

CREATE POLICY "social_posts_delete"
  ON public.social_posts FOR DELETE TO authenticated
  USING (
    organization_id IN (
      SELECT o.id FROM public.organizations o WHERE o.user_id = auth.uid()
    )
    OR public.is_platform_admin()
  );

-- -----------------------------------------------------------------------------
-- spleises — alle kan lese (public); kun eier-lag (+ admin) kan opprette/endre/slette
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "spleises_select_public" ON public.spleises;
DROP POLICY IF EXISTS "spleises_insert_owner" ON public.spleises;
DROP POLICY IF EXISTS "spleises_update_owner" ON public.spleises;
DROP POLICY IF EXISTS "spleises_delete_owner" ON public.spleises;

CREATE POLICY "spleises_select_public"
  ON public.spleises FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "spleises_insert_owner"
  ON public.spleises FOR INSERT TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT o.id FROM public.organizations o WHERE o.user_id = auth.uid()
    )
    OR public.is_platform_admin()
  );

CREATE POLICY "spleises_update_owner"
  ON public.spleises FOR UPDATE TO authenticated
  USING (
    organization_id IN (
      SELECT o.id FROM public.organizations o WHERE o.user_id = auth.uid()
    )
    OR public.is_platform_admin()
  )
  WITH CHECK (
    organization_id IN (
      SELECT o.id FROM public.organizations o WHERE o.user_id = auth.uid()
    )
    OR public.is_platform_admin()
  );

CREATE POLICY "spleises_delete_owner"
  ON public.spleises FOR DELETE TO authenticated
  USING (
    organization_id IN (
      SELECT o.id FROM public.organizations o WHERE o.user_id = auth.uid()
    )
    OR public.is_platform_admin()
  );

-- -----------------------------------------------------------------------------
-- spleis_slots — alle kan se slots under aktiv/funded spleis; eier-lag full CRUD;
--                sponsor ser egne reserverte/betalte rader (+ admin)
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "spleis_slots_select" ON public.spleis_slots;
DROP POLICY IF EXISTS "spleis_slots_insert" ON public.spleis_slots;
DROP POLICY IF EXISTS "spleis_slots_update" ON public.spleis_slots;
DROP POLICY IF EXISTS "spleis_slots_delete" ON public.spleis_slots;

CREATE POLICY "spleis_slots_select"
  ON public.spleis_slots FOR SELECT TO anon, authenticated
  USING (
    public.spleis_is_market_visible(spleis_id)
    OR EXISTS (
      SELECT 1
      FROM public.spleises ss
      JOIN public.organizations o ON o.id = ss.organization_id
      WHERE ss.id = spleis_slots.spleis_id
        AND o.user_id = auth.uid()
    )
    OR (
      sponsor_id IS NOT NULL
      AND sponsor_id IN (
        SELECT s.id FROM public.sponsors s WHERE s.user_id = auth.uid()
      )
    )
    OR public.is_platform_admin()
  );

CREATE POLICY "spleis_slots_insert"
  ON public.spleis_slots FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.spleises ss
      JOIN public.organizations o ON o.id = ss.organization_id
      WHERE ss.id = spleis_slots.spleis_id
        AND o.user_id = auth.uid()
    )
    OR public.is_platform_admin()
  );

CREATE POLICY "spleis_slots_update"
  ON public.spleis_slots FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.spleises ss
      JOIN public.organizations o ON o.id = ss.organization_id
      WHERE ss.id = spleis_slots.spleis_id
        AND o.user_id = auth.uid()
    )
    OR (
      sponsor_id IS NOT NULL
      AND sponsor_id IN (
        SELECT s.id FROM public.sponsors s WHERE s.user_id = auth.uid()
      )
    )
    OR public.is_platform_admin()
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.spleises ss
      JOIN public.organizations o ON o.id = ss.organization_id
      WHERE ss.id = spleis_slots.spleis_id
        AND o.user_id = auth.uid()
    )
    OR (
      sponsor_id IS NOT NULL
      AND sponsor_id IN (
        SELECT s.id FROM public.sponsors s WHERE s.user_id = auth.uid()
      )
    )
    OR public.is_platform_admin()
  );

CREATE POLICY "spleis_slots_delete"
  ON public.spleis_slots FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.spleises ss
      JOIN public.organizations o ON o.id = ss.organization_id
      WHERE ss.id = spleis_slots.spleis_id
        AND o.user_id = auth.uid()
    )
    OR public.is_platform_admin()
  );

-- -----------------------------------------------------------------------------
-- products — alle kan lese; kun admin skriver (for øvrig service_role)
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "products_select_public" ON public.products;
DROP POLICY IF EXISTS "products_write_admin" ON public.products;

CREATE POLICY "products_select_public"
  ON public.products FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "products_write_admin"
  ON public.products FOR ALL TO authenticated
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());

-- -----------------------------------------------------------------------------
-- brreg_cache — alle kan lese; kun admin skriver
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "brreg_cache_select_public" ON public.brreg_cache;
DROP POLICY IF EXISTS "brreg_cache_write_admin" ON public.brreg_cache;

CREATE POLICY "brreg_cache_select_public"
  ON public.brreg_cache FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "brreg_cache_write_admin"
  ON public.brreg_cache FOR ALL TO authenticated
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());

-- -----------------------------------------------------------------------------
-- toilet_buildings — admin full; eier-lag ser og administrerer egen
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "toilet_buildings_select" ON public.toilet_buildings;
DROP POLICY IF EXISTS "toilet_buildings_insert" ON public.toilet_buildings;
DROP POLICY IF EXISTS "toilet_buildings_update" ON public.toilet_buildings;
DROP POLICY IF EXISTS "toilet_buildings_delete" ON public.toilet_buildings;

CREATE POLICY "toilet_buildings_select"
  ON public.toilet_buildings FOR SELECT TO authenticated
  USING (
    organization_id IN (
      SELECT o.id FROM public.organizations o WHERE o.user_id = auth.uid()
    )
    OR public.is_platform_admin()
  );

CREATE POLICY "toilet_buildings_insert"
  ON public.toilet_buildings FOR INSERT TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT o.id FROM public.organizations o WHERE o.user_id = auth.uid()
    )
    OR public.is_platform_admin()
  );

CREATE POLICY "toilet_buildings_update"
  ON public.toilet_buildings FOR UPDATE TO authenticated
  USING (
    organization_id IN (
      SELECT o.id FROM public.organizations o WHERE o.user_id = auth.uid()
    )
    OR public.is_platform_admin()
  )
  WITH CHECK (
    organization_id IN (
      SELECT o.id FROM public.organizations o WHERE o.user_id = auth.uid()
    )
    OR public.is_platform_admin()
  );

CREATE POLICY "toilet_buildings_delete"
  ON public.toilet_buildings FOR DELETE TO authenticated
  USING (
    organization_id IN (
      SELECT o.id FROM public.organizations o WHERE o.user_id = auth.uid()
    )
    OR public.is_platform_admin()
  );

-- -----------------------------------------------------------------------------
-- toilet_sessions — admin og eier-lag (via bygg) ser; skriv helst service_role
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "toilet_sessions_select" ON public.toilet_sessions;
DROP POLICY IF EXISTS "toilet_sessions_write_admin" ON public.toilet_sessions;

CREATE POLICY "toilet_sessions_select"
  ON public.toilet_sessions FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.toilet_buildings tb
      JOIN public.organizations o ON o.id = tb.organization_id
      WHERE tb.id = toilet_sessions.toilet_building_id
        AND o.user_id = auth.uid()
    )
    OR public.is_platform_admin()
  );

CREATE POLICY "toilet_sessions_write_admin"
  ON public.toilet_sessions FOR ALL TO authenticated
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());

-- -----------------------------------------------------------------------------
-- Grants (RLS avgjør rader; rollen trenger tabellrettigheter)
-- -----------------------------------------------------------------------------

GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT ON TABLE public.products TO anon, authenticated;
GRANT SELECT ON TABLE public.brreg_cache TO anon, authenticated;
GRANT SELECT ON TABLE public.spleises TO anon, authenticated;
GRANT SELECT ON TABLE public.spleis_slots TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.organizations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.sponsors TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.campaigns TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.outreach_emails TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.matches TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.orders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.products TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.spleises TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.spleis_slots TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.social_posts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.brreg_cache TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.toilet_buildings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.toilet_sessions TO authenticated;
