DO $$
DECLARE
  v_user_id uuid;
  v_email text := 'laura78marinho@gmail.com';
  v_password text := '190103';
BEGIN
  -- Buscar o ID do usuário
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;
  
  IF v_user_id IS NOT NULL THEN
    -- Atualizar a senha
    UPDATE auth.users 
    SET encrypted_password = crypt(v_password, gen_salt('bf')),
        updated_at = now()
    WHERE id = v_user_id;
    
    -- Garantir papel admin
    INSERT INTO public.user_roles (user_id, role) 
    VALUES (v_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- Limpar bloqueios de rate limit
    DELETE FROM public.auth_lockouts WHERE ident LIKE '%' || v_email;
  END IF;
END $$;