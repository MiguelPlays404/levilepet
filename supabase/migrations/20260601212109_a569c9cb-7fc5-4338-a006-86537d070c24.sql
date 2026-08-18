
-- 1) Create hoje_no_le_ville
CREATE TABLE IF NOT EXISTS public.hoje_no_le_ville (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  description text,
  media_url text NOT NULL,
  media_type text NOT NULL DEFAULT 'image',
  orientation text NOT NULL DEFAULT 'horizontal',
  aspect_ratio text NOT NULL DEFAULT '16:9',
  published_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.hoje_no_le_ville TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hoje_no_le_ville TO authenticated;
GRANT ALL ON public.hoje_no_le_ville TO service_role;

ALTER TABLE public.hoje_no_le_ville ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read hoje_no_le_ville"
  ON public.hoje_no_le_ville FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins insert hoje_no_le_ville"
  ON public.hoje_no_le_ville FOR INSERT
  TO authenticated
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins update hoje_no_le_ville"
  ON public.hoje_no_le_ville FOR UPDATE
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins delete hoje_no_le_ville"
  ON public.hoje_no_le_ville FOR DELETE
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_hoje_no_le_ville_updated_at
  BEFORE UPDATE ON public.hoje_no_le_ville
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2) Add aspect_ratio + orientation to videos and photos
ALTER TABLE public.videos
  ADD COLUMN IF NOT EXISTS orientation text DEFAULT 'horizontal',
  ADD COLUMN IF NOT EXISTS aspect_ratio text DEFAULT '16:9';

ALTER TABLE public.photos
  ADD COLUMN IF NOT EXISTS aspect_ratio text DEFAULT '1:1';
