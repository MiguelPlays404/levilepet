-- SEGURANÇA: invalida a senha placeholder gravada em texto puro na migração
-- 20260530030351_90af28fb-2e67-4f57-a67b-458a4c6aeba9.sql
-- ('PLACEHOLDER_ROTATE_VIA_ADMIN_UI'). Como o repositório é público, essa
-- senha nunca pode ser considerada segura, mesmo que já tenha sido trocada
-- manualmente pelo painel — este passo garante que QUALQUER ambiente que
-- rode as migrações do zero (staging, disaster recovery, fork) também
-- nasça protegido, sem depender de alguém lembrar de trocar a senha à mão.
--
-- Efeito: a senha da conta é substituída por um valor aleatório de 32 bytes
-- que ninguém conhece (nem fica salvo em lugar nenhum). Depois de rodar esta
-- migração, a única forma de entrar nessa conta é pelo fluxo "Esqueci minha
-- senha" do Supabase Auth (ou definindo uma nova senha pelo painel
-- Authentication > Users). Isso é intencional.
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'laura78marinho@gmail.com';

  IF v_user_id IS NOT NULL THEN
    UPDATE auth.users
       SET encrypted_password = crypt(encode(gen_random_bytes(32), 'hex'), gen_salt('bf')),
           updated_at = now()
     WHERE id = v_user_id;
  END IF;
END $$;
