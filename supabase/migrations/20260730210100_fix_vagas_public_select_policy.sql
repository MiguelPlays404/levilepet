-- SEGURANÇA (baixo risco, mas inconsistente): a policy "Public can view active vagas"
-- tinha nome de "active" mas usava USING (true), ou seja, expunha também vagas
-- desativadas/encerradas via API pública, ainda que o front-end só mostre as ativas.
-- Alinha o comportamento real da tabela com o nome da policy e com o mesmo padrão
-- já usado em outras tabelas (ex.: albums).
DROP POLICY IF EXISTS "Public can view active vagas" ON public.vagas;

CREATE POLICY "Public can view active vagas"
  ON public.vagas FOR SELECT
  USING (is_active = true OR private.has_role(auth.uid(), 'admin'::public.app_role));
