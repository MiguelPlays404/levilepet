
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id::text = _user_id::text AND role::text = _role
  )
$$;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, text) TO anon, authenticated, service_role;

DO $do$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'albums','album_items','conhecer_content','guia_articles','hoje_no_le_ville',
    'home_sections','hotelzinho_content','nav_items','photos','site_config',
    'transporte_content','vagas','videos'
  ] LOOP
    EXECUTE format('GRANT SELECT ON public.%I TO anon', t);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS "public_read_%1$s" ON public.%1$I', t);
    EXECUTE format('CREATE POLICY "public_read_%1$s" ON public.%1$I FOR SELECT USING (true)', t);
    EXECUTE format('DROP POLICY IF EXISTS "admin_write_%1$s" ON public.%1$I', t);
    EXECUTE format('CREATE POLICY "admin_write_%1$s" ON public.%1$I FOR ALL TO authenticated USING (public.has_role(auth.uid(), ''admin'')) WITH CHECK (public.has_role(auth.uid(), ''admin''))', t);
  END LOOP;
END
$do$;

GRANT SELECT, INSERT ON public.video_likes TO anon;
GRANT SELECT, INSERT, DELETE ON public.video_likes TO authenticated;
GRANT ALL ON public.video_likes TO service_role;
ALTER TABLE public.video_likes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_video_likes" ON public.video_likes;
CREATE POLICY "public_read_video_likes" ON public.video_likes FOR SELECT USING (true);
DROP POLICY IF EXISTS "public_insert_video_likes" ON public.video_likes;
CREATE POLICY "public_insert_video_likes" ON public.video_likes FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "admin_delete_video_likes" ON public.video_likes;
CREATE POLICY "admin_delete_video_likes" ON public.video_likes FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

REVOKE ALL ON public.user_roles FROM anon;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_own_roles" ON public.user_roles;
CREATE POLICY "read_own_roles" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id::text = auth.uid()::text OR public.has_role(auth.uid(), 'admin'));

REVOKE ALL ON public.audit_log FROM anon, authenticated;
REVOKE ALL ON public.auth_attempts FROM anon, authenticated;
REVOKE ALL ON public.auth_lockouts FROM anon, authenticated;
GRANT ALL ON public.audit_log TO service_role;
GRANT ALL ON public.auth_attempts TO service_role;
GRANT ALL ON public.auth_lockouts TO service_role;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_lockouts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_read_audit_log" ON public.audit_log;
CREATE POLICY "admin_read_audit_log" ON public.audit_log FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
