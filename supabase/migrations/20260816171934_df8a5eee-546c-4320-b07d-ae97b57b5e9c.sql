DROP POLICY IF EXISTS "media_public_read" ON storage.objects;
DROP POLICY IF EXISTS "media_admin_insert" ON storage.objects;
DROP POLICY IF EXISTS "media_admin_update" ON storage.objects;
DROP POLICY IF EXISTS "media_admin_delete" ON storage.objects;

CREATE POLICY "media_public_read" ON storage.objects FOR SELECT
  USING (bucket_id = 'levillepet-media');

CREATE POLICY "media_admin_insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'levillepet-media' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "media_admin_update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'levillepet-media' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'levillepet-media' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "media_admin_delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'levillepet-media' AND public.has_role(auth.uid(), 'admin'));