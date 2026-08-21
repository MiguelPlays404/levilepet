DROP POLICY IF EXISTS "video_likes_anon_delete" ON public.video_likes;

CREATE OR REPLACE FUNCTION public.unlike_video(_video_id uuid, _device_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF _video_id IS NULL OR _device_id IS NULL OR length(_device_id) < 8 OR length(_device_id) > 100 THEN
    RAISE EXCEPTION 'invalid input';
  END IF;
  DELETE FROM public.video_likes
   WHERE video_id = _video_id
     AND (device_id = _device_id OR user_identifier = _device_id);
END;
$$;

REVOKE ALL ON FUNCTION public.unlike_video(uuid, text) FROM public;
GRANT EXECUTE ON FUNCTION public.unlike_video(uuid, text) TO anon, authenticated;