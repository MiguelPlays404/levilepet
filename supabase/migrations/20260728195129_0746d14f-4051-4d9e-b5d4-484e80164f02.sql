-- Remove spoofable header-based ownership policy
DROP POLICY IF EXISTS "Delete own device like" ON public.video_likes;

-- Ensure inserts bind the authenticated user (when present) to the like row
DROP POLICY IF EXISTS "Anyone insert video_likes" ON public.video_likes;
CREATE POLICY "Anyone insert video_likes"
ON public.video_likes
FOR INSERT
TO anon, authenticated
WITH CHECK (
  device_id IS NOT NULL
  AND length(device_id) > 0
  AND (
    (auth.uid() IS NULL AND user_identifier IS NULL)
    OR (auth.uid() IS NOT NULL AND user_identifier = auth.uid()::text)
  )
);

-- Only the verified owner (server-side auth.uid()) can delete their like
CREATE POLICY "Users delete own like"
ON public.video_likes
FOR DELETE
TO authenticated
USING (user_identifier = auth.uid()::text);