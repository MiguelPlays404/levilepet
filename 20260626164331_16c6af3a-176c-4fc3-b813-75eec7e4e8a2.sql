-- ─────────────────────────────────────────────────────────────
-- Schema público do Le Ville Pet para o Supabase self-hosted.
-- Roda automaticamente na primeira inicialização do container do banco.
-- ─────────────────────────────────────────────────────────────

-- Tipos ------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'user');
  END IF;
END
$$;

-- Funções utilitárias ----------------------------------------
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Papéis de usuário ------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

DROP POLICY IF EXISTS "user_roles_self_read" ON public.user_roles;
CREATE POLICY "user_roles_self_read" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Conteúdo -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  whatsapp_number text NOT NULL DEFAULT '',
  maintenance_mode boolean DEFAULT false,
  home_section_order jsonb,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  image_url text NOT NULL,
  category text NOT NULL DEFAULT 'galeria',
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  locations text[] DEFAULT '{}',
  aspect_ratio text,
  publish_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  video_url text NOT NULL,
  video_type text,
  thumbnail_url text,
  likes_count integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  category text,
  locations text[] DEFAULT '{}',
  orientation text,
  aspect_ratio text,
  published_at timestamptz DEFAULT now(),
  publish_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.video_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  device_id text NOT NULL,
  user_identifier text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.albums (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  cover_url text,
  cover_type text,
  aspect_ratio text,
  locations text[] NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  show_in_hoje boolean NOT NULL DEFAULT false,
  publish_at timestamptz,
  expire_at timestamptz,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.album_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id uuid NOT NULL REFERENCES public.albums(id) ON DELETE CASCADE,
  media_type text NOT NULL,
  source_type text NOT NULL,
  media_url text NOT NULL,
  thumb_url text,
  aspect_ratio text,
  caption text,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.hoje_no_le_ville (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  description text,
  media_url text NOT NULL,
  media_type text NOT NULL DEFAULT 'image',
  orientation text NOT NULL DEFAULT 'landscape',
  aspect_ratio text NOT NULL DEFAULT '16:9',
  published_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.home_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key text NOT NULL,
  title text NOT NULL,
  description text,
  icon text,
  link_url text NOT NULL DEFAULT '/',
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.nav_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  path text NOT NULL,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  show_in_navbar boolean DEFAULT true,
  show_in_footer boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.guia_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text,
  title text NOT NULL,
  content text NOT NULL,
  keywords text,
  display_order integer DEFAULT 0,
  icon text,
  is_pinned boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.vagas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  schedule text,
  requirements text,
  whatsapp_message text,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Páginas de conteúdo único (campos textuais em jsonb + colunas legadas)
CREATE TABLE IF NOT EXISTS public.conhecer_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_title text,
  page_subtitle text,
  intro_text text,
  about_text text,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.hotelzinho_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_title text,
  page_subtitle text,
  intro_text text,
  cta_text text,
  whatsapp_message text,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.transporte_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_title text,
  page_subtitle text,
  hero_image_url text,
  intro_text text,
  description_text text,
  cta_title text,
  cta_btn_text text,
  whatsapp_message text,
  updated_at timestamptz DEFAULT now()
);

-- Auditoria e segurança ---------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  actor_email text,
  action text NOT NULL,
  entity text,
  entity_id text,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  ip text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.auth_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ident text NOT NULL,
  ip text,
  email text,
  kind text NOT NULL,
  success boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.auth_lockouts (
  ident text PRIMARY KEY,
  fail_count integer NOT NULL DEFAULT 0,
  stage integer NOT NULL DEFAULT 0,
  locked_until timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Grants + RLS -------------------------------------------------
DO $$
DECLARE
  t text;
  public_tables text[] := ARRAY[
    'site_config','photos','videos','video_likes','albums','album_items',
    'hoje_no_le_ville','home_sections','nav_items','guia_articles','vagas',
    'conhecer_content','hotelzinho_content','transporte_content'
  ];
  private_tables text[] := ARRAY['audit_log','auth_attempts','auth_lockouts'];
BEGIN
  FOREACH t IN ARRAY public_tables LOOP
    EXECUTE format('GRANT SELECT ON public.%I TO anon', t);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR SELECT USING (true)', t || '_public_read', t);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR ALL TO authenticated
         USING (public.has_role(auth.uid(), ''admin''))
         WITH CHECK (public.has_role(auth.uid(), ''admin''))',
      t || '_admin_write', t);
  END LOOP;

  FOREACH t IN ARRAY private_tables LOOP
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR SELECT TO authenticated
         USING (public.has_role(auth.uid(), ''admin''))',
      t || '_admin_read', t);
  END LOOP;
END
$$;

-- Curtidas de vídeo: qualquer visitante pode registrar
GRANT INSERT, DELETE ON public.video_likes TO anon;
CREATE POLICY "video_likes_anon_insert" ON public.video_likes
  FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "video_likes_anon_delete" ON public.video_likes
  FOR DELETE TO anon USING (true);

-- Triggers de updated_at ---------------------------------------
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'site_config','photos','videos','albums','album_items','hoje_no_le_ville',
    'nav_items','guia_articles','vagas','conhecer_content','hotelzinho_content',
    'transporte_content'
  ] LOOP
    EXECUTE format(
      'CREATE TRIGGER %I BEFORE UPDATE ON public.%I
         FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column()',
      t || '_updated_at', t);
  END LOOP;
END
$$;

-- Agendamento automático de publicações ------------------------
CREATE OR REPLACE FUNCTION public.auto_publish_scheduled_media()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.photos SET is_active = true, publish_at = NULL
   WHERE is_active = false AND publish_at IS NOT NULL AND publish_at <= now();

  UPDATE public.videos SET is_active = true, publish_at = NULL,
         published_at = COALESCE(published_at, now())
   WHERE is_active = false AND publish_at IS NOT NULL AND publish_at <= now();

  UPDATE public.albums SET is_active = true, publish_at = NULL
   WHERE is_active = false AND publish_at IS NOT NULL AND publish_at <= now();

  UPDATE public.albums SET is_active = false
   WHERE is_active = true AND expire_at IS NOT NULL AND expire_at <= now();
END;
$$;

SELECT cron.schedule(
  'auto-publish-scheduled-media',
  '* * * * *',
  $$SELECT public.auto_publish_scheduled_media()$$
);

-- Configuração inicial mínima ----------------------------------
INSERT INTO public.site_config (whatsapp_number)
SELECT '' WHERE NOT EXISTS (SELECT 1 FROM public.site_config);
