DO $$
DECLARE t text;
  public_tables text[] := ARRAY['site_config','photos','videos','albums','album_items','hoje_no_le_ville','home_sections','nav_items','guia_articles','vagas','conhecer_content','hotelzinho_content','transporte_content'];
  private_tables text[] := ARRAY['audit_log','auth_attempts','auth_lockouts'];
BEGIN
  FOREACH t IN ARRAY public_tables LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('REVOKE ALL ON public.%I FROM anon', t);
    EXECUTE format('GRANT SELECT ON public.%I TO anon', t);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_public_read', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT USING (true)', t || '_public_read', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_admin_write', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (public.has_role(auth.uid(), ''admin'')) WITH CHECK (public.has_role(auth.uid(), ''admin''))', t || '_admin_write', t);
  END LOOP;

  FOREACH t IN ARRAY private_tables LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('REVOKE ALL ON public.%I FROM anon, authenticated', t);
    EXECUTE format('GRANT SELECT ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_admin_read', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (public.has_role(auth.uid(), ''admin''))', t || '_admin_read', t);
  END LOOP;
END $$;

-- user_roles: no client writes
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.user_roles FROM anon, authenticated;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
DROP POLICY IF EXISTS "read_own_roles" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_self_read" ON public.user_roles;
CREATE POLICY "user_roles_self_read" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- video_likes: public can like/unlike, admin manages
ALTER TABLE public.video_likes ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.video_likes FROM anon, authenticated;
GRANT SELECT, INSERT, DELETE ON public.video_likes TO anon;
GRANT SELECT, INSERT, DELETE ON public.video_likes TO authenticated;
GRANT ALL ON public.video_likes TO service_role;
DROP POLICY IF EXISTS "video_likes_public_read" ON public.video_likes;
CREATE POLICY "video_likes_public_read" ON public.video_likes FOR SELECT USING (true);
DROP POLICY IF EXISTS "video_likes_anon_insert" ON public.video_likes;
CREATE POLICY "video_likes_anon_insert" ON public.video_likes FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "video_likes_anon_delete" ON public.video_likes;
CREATE POLICY "video_likes_anon_delete" ON public.video_likes FOR DELETE USING (true);