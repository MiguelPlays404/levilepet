-- Enable pg_cron for server-side scheduled publishing
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Auto-publisher function: flips is_active=true on any photo/video whose publish_at has arrived
CREATE OR REPLACE FUNCTION public.auto_publish_scheduled_media()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.photos
     SET is_active = true,
         publish_at = NULL
   WHERE is_active = false
     AND publish_at IS NOT NULL
     AND publish_at <= now();

  UPDATE public.videos
     SET is_active = true,
         publish_at = NULL,
         published_at = COALESCE(published_at, now())
   WHERE is_active = false
     AND publish_at IS NOT NULL
     AND publish_at <= now();
END;
$$;

-- Schedule the job to run every minute (idempotent)
DO $$
BEGIN
  PERFORM cron.unschedule('auto-publish-scheduled-media');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

SELECT cron.schedule(
  'auto-publish-scheduled-media',
  '* * * * *',
  $$ SELECT public.auto_publish_scheduled_media(); $$
);