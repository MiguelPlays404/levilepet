CREATE SCHEMA IF NOT EXISTS private;

REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated;
GRANT USAGE ON SCHEMA private TO service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;

GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO service_role;

DROP POLICY IF EXISTS "levillepet admin insert" ON storage.objects;
DROP POLICY IF EXISTS "levillepet admin update" ON storage.objects;
DROP POLICY IF EXISTS "levillepet admin delete" ON storage.objects;
DROP POLICY IF EXISTS "levillepet admin read metadata" ON storage.objects;

CREATE POLICY "levillepet admin read metadata"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'levillepet-media'
  AND private.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "levillepet admin insert"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'levillepet-media'
  AND private.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "levillepet admin update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'levillepet-media'
  AND private.has_role(auth.uid(), 'admin'::public.app_role)
)
WITH CHECK (
  bucket_id = 'levillepet-media'
  AND private.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "levillepet admin delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'levillepet-media'
  AND private.has_role(auth.uid(), 'admin'::public.app_role)
);

DO $$
DECLARE
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'conhecer_content','guia_articles','home_sections','hotelzinho_content',
    'nav_items','photos','site_config','transporte_content','videos'
  ]
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Admins insert %1$s" ON public.%I', tbl, tbl);
    EXECUTE format('DROP POLICY IF EXISTS "Admins update %1$s" ON public.%I', tbl, tbl);
    EXECUTE format('DROP POLICY IF EXISTS "Admins delete %1$s" ON public.%I', tbl, tbl);

    EXECUTE format('CREATE POLICY "Admins insert %1$s" ON public.%I FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), ''admin''::public.app_role))', tbl, tbl);
    EXECUTE format('CREATE POLICY "Admins update %1$s" ON public.%I FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), ''admin''::public.app_role)) WITH CHECK (private.has_role(auth.uid(), ''admin''::public.app_role))', tbl, tbl);
    EXECUTE format('CREATE POLICY "Admins delete %1$s" ON public.%I FOR DELETE TO authenticated USING (private.has_role(auth.uid(), ''admin''::public.app_role))', tbl, tbl);
  END LOOP;
END $$;

DROP POLICY IF EXISTS "Admins delete any video_likes" ON public.video_likes;
CREATE POLICY "Admins delete any video_likes"
ON public.video_likes
FOR DELETE
TO authenticated
USING (private.has_role(auth.uid(), 'admin'::public.app_role));