
GRANT SELECT ON public.albums TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.albums TO authenticated;
GRANT ALL ON public.albums TO service_role;

GRANT SELECT ON public.album_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.album_items TO authenticated;
GRANT ALL ON public.album_items TO service_role;
