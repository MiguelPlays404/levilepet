ALTER TABLE public.photos
  ADD COLUMN IF NOT EXISTS publish_at TIMESTAMPTZ DEFAULT NULL;

ALTER TABLE public.videos
  ADD COLUMN IF NOT EXISTS publish_at TIMESTAMPTZ DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_photos_publish_at
  ON public.photos (publish_at)
  WHERE is_active = false AND publish_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_videos_publish_at
  ON public.videos (publish_at)
  WHERE is_active = false AND publish_at IS NOT NULL;