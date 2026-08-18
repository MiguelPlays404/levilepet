DROP POLICY IF EXISTS "Public can view active albums" ON public.albums;
DROP POLICY IF EXISTS "Public can view album items" ON public.album_items;

CREATE POLICY "Anyone can view active albums"
ON public.albums
FOR SELECT
TO anon
USING (is_active = true);

CREATE POLICY "Authenticated can view albums"
ON public.albums
FOR SELECT
TO authenticated
USING (is_active = true OR public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Anyone can view active album items"
ON public.album_items
FOR SELECT
TO anon
USING (
  EXISTS (
    SELECT 1
    FROM public.albums a
    WHERE a.id = album_items.album_id
      AND a.is_active = true
  )
);

CREATE POLICY "Authenticated can view album items"
ON public.album_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.albums a
    WHERE a.id = album_items.album_id
      AND (a.is_active = true OR public.has_role(auth.uid(), 'admin'::public.app_role))
  )
);