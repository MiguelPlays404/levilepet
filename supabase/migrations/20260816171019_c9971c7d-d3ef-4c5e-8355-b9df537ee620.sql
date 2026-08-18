
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DO $do$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT c.relname FROM pg_class c
    JOIN pg_namespace n ON n.oid=c.relnamespace
    JOIN pg_attribute a ON a.attrelid=c.oid AND a.attname='updated_at' AND a.attnum>0
    WHERE n.nspname='public' AND c.relkind='r'
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at ON public.%I', r.relname);
    EXECUTE format('CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column()', r.relname);
  END LOOP;
END $do$;

CREATE OR REPLACE FUNCTION public.auto_publish_scheduled_media()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.photos SET is_active = true
    WHERE publish_at IS NOT NULL AND publish_at <= now() AND is_active = false;
  UPDATE public.videos SET is_active = true
    WHERE publish_at IS NOT NULL AND publish_at <= now() AND is_active = false;
  UPDATE public.albums SET is_active = true
    WHERE publish_at IS NOT NULL AND publish_at <= now() AND is_active = false;
  UPDATE public.albums SET is_active = false
    WHERE expire_at IS NOT NULL AND expire_at <= now() AND is_active = true;
  UPDATE public.hoje_no_le_ville SET is_active = false
    WHERE expires_at IS NOT NULL AND expires_at <= now() AND is_active = true;
END $$;

REVOKE EXECUTE ON FUNCTION public.auto_publish_scheduled_media() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.auto_publish_scheduled_media() TO service_role;

CREATE OR REPLACE FUNCTION public.admin_list_tables()
RETURNS TABLE(table_name text) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT c.relname::text
  FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' AND c.relkind = 'r'
    AND public.has_role(auth.uid(), 'admin')
  ORDER BY 1
$$;

REVOKE EXECUTE ON FUNCTION public.admin_list_tables() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_tables() TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, text) FROM anon;
