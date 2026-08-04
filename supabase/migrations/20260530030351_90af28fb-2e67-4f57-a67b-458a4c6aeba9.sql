
-- 1. Roles infrastructure
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 2. Create admin user
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'laura78marinho@gmail.com';
  
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data, is_super_admin, confirmation_token, recovery_token, email_change_token_new, email_change
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', v_user_id, 'authenticated', 'authenticated',
      'laura78marinho@gmail.com', crypt('PLACEHOLDER_ROTATE_VIA_ADMIN_UI', gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, false, '', '', '', ''
    );
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), v_user_id,
      jsonb_build_object('sub', v_user_id::text, 'email', 'laura78marinho@gmail.com', 'email_verified', true),
      'email', v_user_id::text, now(), now(), now());
  END IF;
  
  INSERT INTO public.user_roles (user_id, role) VALUES (v_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
END $$;

-- 3. Remove admin_code column
ALTER TABLE public.site_config DROP COLUMN IF EXISTS admin_code;

-- 4. Replace permissive policies on all content tables
DO $$
DECLARE
  t text;
  tables text[] := ARRAY['site_config','photos','videos','nav_items','home_sections','guia_articles','hotelzinho_content','transporte_content','conhecer_content'];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Anon manage %s" ON public.%I', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "Public read %s" ON public.%I', t, t);
    EXECUTE format('CREATE POLICY "Public can read %s" ON public.%I FOR SELECT TO anon, authenticated USING (true)', t, t);
    EXECUTE format('CREATE POLICY "Admins insert %s" ON public.%I FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),''admin''))', t, t);
    EXECUTE format('CREATE POLICY "Admins update %s" ON public.%I FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),''admin'')) WITH CHECK (public.has_role(auth.uid(),''admin''))', t, t);
    EXECUTE format('CREATE POLICY "Admins delete %s" ON public.%I FOR DELETE TO authenticated USING (public.has_role(auth.uid(),''admin''))', t, t);
    EXECUTE format('REVOKE INSERT, UPDATE, DELETE ON public.%I FROM anon', t);
    EXECUTE format('GRANT INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
  END LOOP;
END $$;

-- 5. video_likes: restrict delete to owner device
DROP POLICY IF EXISTS "Anon delete video_likes" ON public.video_likes;
DROP POLICY IF EXISTS "Anon insert video_likes" ON public.video_likes;
DROP POLICY IF EXISTS "Public read video_likes" ON public.video_likes;

CREATE POLICY "Public read video_likes" ON public.video_likes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone insert video_likes" ON public.video_likes FOR INSERT TO anon, authenticated WITH CHECK (device_id IS NOT NULL AND length(device_id) > 0);
CREATE POLICY "Delete own device like" ON public.video_likes FOR DELETE TO anon, authenticated
  USING (device_id = current_setting('request.headers', true)::json->>'x-device-id');
CREATE POLICY "Admins delete any video_likes" ON public.video_likes FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 6. Storage: restrict writes to admins on levillepet-media; keep public read of objects only (no bucket listing)
DO $$
DECLARE p text;
BEGIN
  FOR p IN SELECT policyname FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname ILIKE '%levillepet%' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', p);
  END LOOP;
END $$;

CREATE POLICY "levillepet public read"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'levillepet-media');

CREATE POLICY "levillepet admin insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'levillepet-media' AND public.has_role(auth.uid(),'admin'));

CREATE POLICY "levillepet admin update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'levillepet-media' AND public.has_role(auth.uid(),'admin'));

CREATE POLICY "levillepet admin delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'levillepet-media' AND public.has_role(auth.uid(),'admin'));
