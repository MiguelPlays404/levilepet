DROP POLICY IF EXISTS "Public read video_likes" ON public.video_likes;

CREATE POLICY "Admins read video_likes"
ON public.video_likes
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

REVOKE SELECT ON public.video_likes FROM anon;
GRANT INSERT, DELETE ON public.video_likes TO anon;
GRANT SELECT, INSERT, DELETE ON public.video_likes TO authenticated;
GRANT ALL ON public.video_likes TO service_role;