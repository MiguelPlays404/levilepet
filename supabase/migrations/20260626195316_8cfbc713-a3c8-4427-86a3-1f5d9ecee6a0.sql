-- Albums table
CREATE TABLE public.albums (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  description text DEFAULT '',
  cover_url text,
  cover_type text DEFAULT 'image',
  aspect_ratio text DEFAULT '4:3',
  locations text[] NOT NULL DEFAULT ARRAY[]::text[],
  is_active boolean NOT NULL DEFAULT true,
  show_in_hoje boolean NOT NULL DEFAULT false,
  publish_at timestamptz,
  expire_at timestamptz,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.albums TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.albums TO authenticated;
GRANT ALL ON public.albums TO service_role;

ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active albums" ON public.albums
  FOR SELECT USING (is_active = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert albums" ON public.albums
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update albums" ON public.albums
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete albums" ON public.albums
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER albums_updated_at BEFORE UPDATE ON public.albums
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Album items table
CREATE TABLE public.album_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id uuid NOT NULL REFERENCES public.albums(id) ON DELETE CASCADE,
  media_type text NOT NULL DEFAULT 'photo', -- 'photo' | 'video'
  source_type text NOT NULL DEFAULT 'upload', -- 'upload' | 'youtube' | 'instagram' | 'tiktok' | 'url'
  media_url text NOT NULL,
  thumb_url text,
  aspect_ratio text DEFAULT '4:3',
  caption text DEFAULT '',
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.album_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.album_items TO authenticated;
GRANT ALL ON public.album_items TO service_role;

ALTER TABLE public.album_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view album items" ON public.album_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.albums a WHERE a.id = album_id AND (a.is_active = true OR public.has_role(auth.uid(), 'admin')))
  );
CREATE POLICY "Admins can insert album items" ON public.album_items
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update album items" ON public.album_items
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete album items" ON public.album_items
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER album_items_updated_at BEFORE UPDATE ON public.album_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_albums_active ON public.albums(is_active, position) WHERE is_active = true;
CREATE INDEX idx_album_items_album ON public.album_items(album_id, position);

-- Extend auto-publish to handle albums
CREATE OR REPLACE FUNCTION public.auto_publish_scheduled_media()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;