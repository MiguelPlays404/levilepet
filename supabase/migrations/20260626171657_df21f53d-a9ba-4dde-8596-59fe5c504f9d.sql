
-- 1) Restringir leitura de guia_articles apenas a admins
DROP POLICY IF EXISTS "Public can read guia_articles" ON public.guia_articles;
REVOKE SELECT ON public.guia_articles FROM anon;

CREATE POLICY "Admins read guia_articles"
  ON public.guia_articles FOR SELECT
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role));

-- 2) Remover EXECUTE de SECURITY DEFINER funções que não devem ser chamadas por usuários
REVOKE ALL ON FUNCTION public.auto_publish_scheduled_media() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.auto_publish_scheduled_media() TO service_role;
