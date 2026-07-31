
DO $$
DECLARE
  t text;
  tables text[] := ARRAY['hotelzinho_content','conhecer_content','guia_articles','transporte_content'];
  shortname text;
BEGIN
  FOREACH t IN ARRAY tables LOOP
    shortname := replace(replace(t, '_content',''), '_articles','');
    EXECUTE format('DROP POLICY IF EXISTS "Anon manage %s" ON public.%I', shortname, t);
    EXECUTE format('DROP POLICY IF EXISTS "Public read %s" ON public.%I', shortname, t);
    EXECUTE format('DROP POLICY IF EXISTS "Public can read %s" ON public.%I', t, t);
    EXECUTE format('CREATE POLICY "Public can read %s" ON public.%I FOR SELECT TO anon, authenticated USING (true)', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "Admins insert %s" ON public.%I', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "Admins update %s" ON public.%I', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "Admins delete %s" ON public.%I', t, t);
    EXECUTE format('CREATE POLICY "Admins insert %s" ON public.%I FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),''admin''))', t, t);
    EXECUTE format('CREATE POLICY "Admins update %s" ON public.%I FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),''admin'')) WITH CHECK (public.has_role(auth.uid(),''admin''))', t, t);
    EXECUTE format('CREATE POLICY "Admins delete %s" ON public.%I FOR DELETE TO authenticated USING (public.has_role(auth.uid(),''admin''))', t, t);
    EXECUTE format('REVOKE INSERT, UPDATE, DELETE ON public.%I FROM anon', t);
    EXECUTE format('GRANT INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
  END LOOP;
END $$;

-- Restrict has_role execution
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
