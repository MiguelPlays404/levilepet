
CREATE OR REPLACE FUNCTION public.__json_to_textarray(_v text)
RETURNS text[] LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE WHEN _v IS NULL OR _v = '' THEN NULL
              ELSE ARRAY(SELECT jsonb_array_elements_text(_v::jsonb)) END
$$;

ALTER TABLE public.album_items ALTER COLUMN album_id TYPE uuid USING NULLIF(album_id,'')::uuid;
ALTER TABLE public.album_items ALTER COLUMN created_at DROP DEFAULT, ALTER COLUMN created_at TYPE timestamptz USING NULLIF(created_at,'')::timestamptz;
ALTER TABLE public.album_items ALTER COLUMN id TYPE uuid USING NULLIF(id,'')::uuid;
ALTER TABLE public.album_items ALTER COLUMN position DROP DEFAULT, ALTER COLUMN position TYPE integer USING NULLIF(position,'')::numeric::integer;
ALTER TABLE public.album_items ALTER COLUMN updated_at DROP DEFAULT, ALTER COLUMN updated_at TYPE timestamptz USING NULLIF(updated_at,'')::timestamptz;
ALTER TABLE public.albums ALTER COLUMN created_at DROP DEFAULT, ALTER COLUMN created_at TYPE timestamptz USING NULLIF(created_at,'')::timestamptz;
ALTER TABLE public.albums ALTER COLUMN expire_at DROP DEFAULT, ALTER COLUMN expire_at TYPE timestamptz USING NULLIF(expire_at,'')::timestamptz;
ALTER TABLE public.albums ALTER COLUMN id TYPE uuid USING NULLIF(id,'')::uuid;
ALTER TABLE public.albums ALTER COLUMN is_active DROP DEFAULT, ALTER COLUMN is_active TYPE boolean USING NULLIF(is_active,'')::boolean;
ALTER TABLE public.albums ALTER COLUMN locations DROP DEFAULT, ALTER COLUMN locations TYPE text[] USING public.__json_to_textarray(locations);
ALTER TABLE public.albums ALTER COLUMN position DROP DEFAULT, ALTER COLUMN position TYPE integer USING NULLIF(position,'')::numeric::integer;
ALTER TABLE public.albums ALTER COLUMN publish_at DROP DEFAULT, ALTER COLUMN publish_at TYPE timestamptz USING NULLIF(publish_at,'')::timestamptz;
ALTER TABLE public.albums ALTER COLUMN show_in_hoje DROP DEFAULT, ALTER COLUMN show_in_hoje TYPE boolean USING NULLIF(show_in_hoje,'')::boolean;
ALTER TABLE public.albums ALTER COLUMN updated_at DROP DEFAULT, ALTER COLUMN updated_at TYPE timestamptz USING NULLIF(updated_at,'')::timestamptz;
ALTER TABLE public.audit_log ALTER COLUMN actor_id TYPE uuid USING NULLIF(actor_id,'')::uuid;
ALTER TABLE public.audit_log ALTER COLUMN created_at DROP DEFAULT, ALTER COLUMN created_at TYPE timestamptz USING NULLIF(created_at,'')::timestamptz;
ALTER TABLE public.audit_log ALTER COLUMN details DROP DEFAULT, ALTER COLUMN details TYPE jsonb USING NULLIF(details,'')::jsonb;
ALTER TABLE public.audit_log ALTER COLUMN id TYPE uuid USING NULLIF(id,'')::uuid;
ALTER TABLE public.auth_attempts ALTER COLUMN created_at DROP DEFAULT, ALTER COLUMN created_at TYPE timestamptz USING NULLIF(created_at,'')::timestamptz;
ALTER TABLE public.auth_attempts ALTER COLUMN id TYPE uuid USING NULLIF(id,'')::uuid;
ALTER TABLE public.auth_attempts ALTER COLUMN success DROP DEFAULT, ALTER COLUMN success TYPE boolean USING NULLIF(success,'')::boolean;
ALTER TABLE public.auth_lockouts ALTER COLUMN fail_count DROP DEFAULT, ALTER COLUMN fail_count TYPE integer USING NULLIF(fail_count,'')::numeric::integer;
ALTER TABLE public.auth_lockouts ALTER COLUMN locked_until DROP DEFAULT, ALTER COLUMN locked_until TYPE timestamptz USING NULLIF(locked_until,'')::timestamptz;
ALTER TABLE public.auth_lockouts ALTER COLUMN stage DROP DEFAULT, ALTER COLUMN stage TYPE integer USING NULLIF(stage,'')::numeric::integer;
ALTER TABLE public.auth_lockouts ALTER COLUMN updated_at DROP DEFAULT, ALTER COLUMN updated_at TYPE timestamptz USING NULLIF(updated_at,'')::timestamptz;
ALTER TABLE public.conhecer_content ALTER COLUMN id TYPE uuid USING NULLIF(id,'')::uuid;
ALTER TABLE public.conhecer_content ALTER COLUMN updated_at DROP DEFAULT, ALTER COLUMN updated_at TYPE timestamptz USING NULLIF(updated_at,'')::timestamptz;
ALTER TABLE public.guia_articles ALTER COLUMN created_at DROP DEFAULT, ALTER COLUMN created_at TYPE timestamptz USING NULLIF(created_at,'')::timestamptz;
ALTER TABLE public.guia_articles ALTER COLUMN display_order DROP DEFAULT, ALTER COLUMN display_order TYPE integer USING NULLIF(display_order,'')::numeric::integer;
ALTER TABLE public.guia_articles ALTER COLUMN id TYPE uuid USING NULLIF(id,'')::uuid;
ALTER TABLE public.guia_articles ALTER COLUMN is_pinned DROP DEFAULT, ALTER COLUMN is_pinned TYPE boolean USING NULLIF(is_pinned,'')::boolean;
ALTER TABLE public.guia_articles ALTER COLUMN updated_at DROP DEFAULT, ALTER COLUMN updated_at TYPE timestamptz USING NULLIF(updated_at,'')::timestamptz;
ALTER TABLE public.hoje_no_le_ville ALTER COLUMN created_at DROP DEFAULT, ALTER COLUMN created_at TYPE timestamptz USING NULLIF(created_at,'')::timestamptz;
ALTER TABLE public.hoje_no_le_ville ALTER COLUMN display_order DROP DEFAULT, ALTER COLUMN display_order TYPE integer USING NULLIF(display_order,'')::numeric::integer;
ALTER TABLE public.hoje_no_le_ville ALTER COLUMN expires_at DROP DEFAULT, ALTER COLUMN expires_at TYPE timestamptz USING NULLIF(expires_at,'')::timestamptz;
ALTER TABLE public.hoje_no_le_ville ALTER COLUMN id TYPE uuid USING NULLIF(id,'')::uuid;
ALTER TABLE public.hoje_no_le_ville ALTER COLUMN is_active DROP DEFAULT, ALTER COLUMN is_active TYPE boolean USING NULLIF(is_active,'')::boolean;
ALTER TABLE public.hoje_no_le_ville ALTER COLUMN published_at DROP DEFAULT, ALTER COLUMN published_at TYPE timestamptz USING NULLIF(published_at,'')::timestamptz;
ALTER TABLE public.hoje_no_le_ville ALTER COLUMN updated_at DROP DEFAULT, ALTER COLUMN updated_at TYPE timestamptz USING NULLIF(updated_at,'')::timestamptz;
ALTER TABLE public.home_sections ALTER COLUMN display_order DROP DEFAULT, ALTER COLUMN display_order TYPE integer USING NULLIF(display_order,'')::numeric::integer;
ALTER TABLE public.home_sections ALTER COLUMN id TYPE uuid USING NULLIF(id,'')::uuid;
ALTER TABLE public.home_sections ALTER COLUMN is_active DROP DEFAULT, ALTER COLUMN is_active TYPE boolean USING NULLIF(is_active,'')::boolean;
ALTER TABLE public.hotelzinho_content ALTER COLUMN id TYPE uuid USING NULLIF(id,'')::uuid;
ALTER TABLE public.hotelzinho_content ALTER COLUMN updated_at DROP DEFAULT, ALTER COLUMN updated_at TYPE timestamptz USING NULLIF(updated_at,'')::timestamptz;
ALTER TABLE public.nav_items ALTER COLUMN created_at DROP DEFAULT, ALTER COLUMN created_at TYPE timestamptz USING NULLIF(created_at,'')::timestamptz;
ALTER TABLE public.nav_items ALTER COLUMN display_order DROP DEFAULT, ALTER COLUMN display_order TYPE integer USING NULLIF(display_order,'')::numeric::integer;
ALTER TABLE public.nav_items ALTER COLUMN id TYPE uuid USING NULLIF(id,'')::uuid;
ALTER TABLE public.nav_items ALTER COLUMN is_active DROP DEFAULT, ALTER COLUMN is_active TYPE boolean USING NULLIF(is_active,'')::boolean;
ALTER TABLE public.nav_items ALTER COLUMN show_in_footer DROP DEFAULT, ALTER COLUMN show_in_footer TYPE boolean USING NULLIF(show_in_footer,'')::boolean;
ALTER TABLE public.nav_items ALTER COLUMN show_in_navbar DROP DEFAULT, ALTER COLUMN show_in_navbar TYPE boolean USING NULLIF(show_in_navbar,'')::boolean;
ALTER TABLE public.nav_items ALTER COLUMN updated_at DROP DEFAULT, ALTER COLUMN updated_at TYPE timestamptz USING NULLIF(updated_at,'')::timestamptz;
ALTER TABLE public.photos ALTER COLUMN created_at DROP DEFAULT, ALTER COLUMN created_at TYPE timestamptz USING NULLIF(created_at,'')::timestamptz;
ALTER TABLE public.photos ALTER COLUMN display_order DROP DEFAULT, ALTER COLUMN display_order TYPE integer USING NULLIF(display_order,'')::numeric::integer;
ALTER TABLE public.photos ALTER COLUMN id TYPE uuid USING NULLIF(id,'')::uuid;
ALTER TABLE public.photos ALTER COLUMN is_active DROP DEFAULT, ALTER COLUMN is_active TYPE boolean USING NULLIF(is_active,'')::boolean;
ALTER TABLE public.photos ALTER COLUMN is_featured DROP DEFAULT, ALTER COLUMN is_featured TYPE boolean USING NULLIF(is_featured,'')::boolean;
ALTER TABLE public.photos ALTER COLUMN locations DROP DEFAULT, ALTER COLUMN locations TYPE text[] USING public.__json_to_textarray(locations);
ALTER TABLE public.photos ALTER COLUMN publish_at DROP DEFAULT, ALTER COLUMN publish_at TYPE timestamptz USING NULLIF(publish_at,'')::timestamptz;
ALTER TABLE public.photos ALTER COLUMN updated_at DROP DEFAULT, ALTER COLUMN updated_at TYPE timestamptz USING NULLIF(updated_at,'')::timestamptz;
ALTER TABLE public.site_config ALTER COLUMN created_at DROP DEFAULT, ALTER COLUMN created_at TYPE timestamptz USING NULLIF(created_at,'')::timestamptz;
ALTER TABLE public.site_config ALTER COLUMN facebook_active DROP DEFAULT, ALTER COLUMN facebook_active TYPE boolean USING NULLIF(facebook_active,'')::boolean;
ALTER TABLE public.site_config ALTER COLUMN footer_show_instagram DROP DEFAULT, ALTER COLUMN footer_show_instagram TYPE boolean USING NULLIF(footer_show_instagram,'')::boolean;
ALTER TABLE public.site_config ALTER COLUMN footer_show_whatsapp DROP DEFAULT, ALTER COLUMN footer_show_whatsapp TYPE boolean USING NULLIF(footer_show_whatsapp,'')::boolean;
ALTER TABLE public.site_config ALTER COLUMN home_section_order DROP DEFAULT, ALTER COLUMN home_section_order TYPE jsonb USING NULLIF(home_section_order,'')::jsonb;
ALTER TABLE public.site_config ALTER COLUMN id TYPE uuid USING NULLIF(id,'')::uuid;
ALTER TABLE public.site_config ALTER COLUMN instagram_active DROP DEFAULT, ALTER COLUMN instagram_active TYPE boolean USING NULLIF(instagram_active,'')::boolean;
ALTER TABLE public.site_config ALTER COLUMN maintenance_mode DROP DEFAULT, ALTER COLUMN maintenance_mode TYPE boolean USING NULLIF(maintenance_mode,'')::boolean;
ALTER TABLE public.site_config ALTER COLUMN tiktok_active DROP DEFAULT, ALTER COLUMN tiktok_active TYPE boolean USING NULLIF(tiktok_active,'')::boolean;
ALTER TABLE public.site_config ALTER COLUMN updated_at DROP DEFAULT, ALTER COLUMN updated_at TYPE timestamptz USING NULLIF(updated_at,'')::timestamptz;
ALTER TABLE public.site_config ALTER COLUMN vagas_section_active DROP DEFAULT, ALTER COLUMN vagas_section_active TYPE boolean USING NULLIF(vagas_section_active,'')::boolean;
ALTER TABLE public.site_config ALTER COLUMN whatsapp_active DROP DEFAULT, ALTER COLUMN whatsapp_active TYPE boolean USING NULLIF(whatsapp_active,'')::boolean;
ALTER TABLE public.site_config ALTER COLUMN youtube_active DROP DEFAULT, ALTER COLUMN youtube_active TYPE boolean USING NULLIF(youtube_active,'')::boolean;
ALTER TABLE public.transporte_content ALTER COLUMN id TYPE uuid USING NULLIF(id,'')::uuid;
ALTER TABLE public.transporte_content ALTER COLUMN updated_at DROP DEFAULT, ALTER COLUMN updated_at TYPE timestamptz USING NULLIF(updated_at,'')::timestamptz;
DROP POLICY IF EXISTS "read_own_roles" ON public.user_roles;
ALTER TABLE public.user_roles ALTER COLUMN created_at DROP DEFAULT, ALTER COLUMN created_at TYPE timestamptz USING NULLIF(created_at,'')::timestamptz;
ALTER TABLE public.user_roles ALTER COLUMN id TYPE uuid USING NULLIF(id,'')::uuid;
ALTER TABLE public.user_roles ALTER COLUMN user_id TYPE uuid USING NULLIF(user_id,'')::uuid;
CREATE POLICY "read_own_roles" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
ALTER TABLE public.vagas ALTER COLUMN created_at DROP DEFAULT, ALTER COLUMN created_at TYPE timestamptz USING NULLIF(created_at,'')::timestamptz;
ALTER TABLE public.vagas ALTER COLUMN display_order DROP DEFAULT, ALTER COLUMN display_order TYPE integer USING NULLIF(display_order,'')::numeric::integer;
ALTER TABLE public.vagas ALTER COLUMN id TYPE uuid USING NULLIF(id,'')::uuid;
ALTER TABLE public.vagas ALTER COLUMN is_active DROP DEFAULT, ALTER COLUMN is_active TYPE boolean USING NULLIF(is_active,'')::boolean;
ALTER TABLE public.vagas ALTER COLUMN updated_at DROP DEFAULT, ALTER COLUMN updated_at TYPE timestamptz USING NULLIF(updated_at,'')::timestamptz;
ALTER TABLE public.video_likes ALTER COLUMN created_at DROP DEFAULT, ALTER COLUMN created_at TYPE timestamptz USING NULLIF(created_at,'')::timestamptz;
ALTER TABLE public.video_likes ALTER COLUMN id TYPE uuid USING NULLIF(id,'')::uuid;
ALTER TABLE public.video_likes ALTER COLUMN video_id TYPE uuid USING NULLIF(video_id,'')::uuid;
ALTER TABLE public.videos ALTER COLUMN created_at DROP DEFAULT, ALTER COLUMN created_at TYPE timestamptz USING NULLIF(created_at,'')::timestamptz;
ALTER TABLE public.videos ALTER COLUMN id TYPE uuid USING NULLIF(id,'')::uuid;
ALTER TABLE public.videos ALTER COLUMN is_active DROP DEFAULT, ALTER COLUMN is_active TYPE boolean USING NULLIF(is_active,'')::boolean;
ALTER TABLE public.videos ALTER COLUMN is_featured DROP DEFAULT, ALTER COLUMN is_featured TYPE boolean USING NULLIF(is_featured,'')::boolean;
ALTER TABLE public.videos ALTER COLUMN likes_count DROP DEFAULT, ALTER COLUMN likes_count TYPE integer USING NULLIF(likes_count,'')::numeric::integer;
ALTER TABLE public.videos ALTER COLUMN locations DROP DEFAULT, ALTER COLUMN locations TYPE text[] USING public.__json_to_textarray(locations);
ALTER TABLE public.videos ALTER COLUMN publish_at DROP DEFAULT, ALTER COLUMN publish_at TYPE timestamptz USING NULLIF(publish_at,'')::timestamptz;
ALTER TABLE public.videos ALTER COLUMN published_at DROP DEFAULT, ALTER COLUMN published_at TYPE timestamptz USING NULLIF(published_at,'')::timestamptz;
ALTER TABLE public.videos ALTER COLUMN updated_at DROP DEFAULT, ALTER COLUMN updated_at TYPE timestamptz USING NULLIF(updated_at,'')::timestamptz;

DO $do$
DECLARE r record;
BEGIN
  FOR r IN SELECT c.relname tbl, a.attname col, format_type(a.atttypid,a.atttypmod) ty
           FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
           JOIN pg_attribute a ON a.attrelid=c.oid AND a.attnum>0 AND NOT a.attisdropped
           WHERE n.nspname='public' AND c.relkind='r'
  LOOP
    IF r.col='id' AND r.ty='uuid' THEN
      EXECUTE format('ALTER TABLE public.%I ALTER COLUMN id SET DEFAULT gen_random_uuid()', r.tbl);
      EXECUTE format('UPDATE public.%I SET id = gen_random_uuid() WHERE id IS NULL', r.tbl);
      EXECUTE format('ALTER TABLE public.%I ALTER COLUMN id SET NOT NULL', r.tbl);
      EXECUTE format('ALTER TABLE public.%I ADD PRIMARY KEY (id)', r.tbl);
    ELSIF r.col IN ('created_at','updated_at') AND r.ty LIKE 'timestamp%' THEN
      EXECUTE format('ALTER TABLE public.%I ALTER COLUMN %I SET DEFAULT now()', r.tbl, r.col);
    ELSIF r.ty='integer' THEN
      EXECUTE format('ALTER TABLE public.%I ALTER COLUMN %I SET DEFAULT 0', r.tbl, r.col);
    ELSIF r.ty='boolean' THEN
      IF r.col IN ('is_featured','is_pinned','show_in_hoje','maintenance_mode','success') THEN
        EXECUTE format('ALTER TABLE public.%I ALTER COLUMN %I SET DEFAULT false', r.tbl, r.col);
      ELSE
        EXECUTE format('ALTER TABLE public.%I ALTER COLUMN %I SET DEFAULT true', r.tbl, r.col);
      END IF;
    END IF;
  END LOOP;
END $do$;

ALTER TABLE public.auth_lockouts ADD PRIMARY KEY (ident);

DROP FUNCTION public.__json_to_textarray(text);
