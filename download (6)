CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
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

GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO service_role;

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
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "levillepet admin insert"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'levillepet-media'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "levillepet admin update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'levillepet-media'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
)
WITH CHECK (
  bucket_id = 'levillepet-media'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "levillepet admin delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'levillepet-media'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);