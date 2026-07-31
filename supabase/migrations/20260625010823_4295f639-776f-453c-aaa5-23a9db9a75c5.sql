
DROP POLICY IF EXISTS "Authenticated can insert vagas" ON public.vagas;
DROP POLICY IF EXISTS "Authenticated can update vagas" ON public.vagas;
DROP POLICY IF EXISTS "Authenticated can delete vagas" ON public.vagas;

CREATE POLICY "Admins insert vagas" ON public.vagas FOR INSERT TO authenticated
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins update vagas" ON public.vagas FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins delete vagas" ON public.vagas FOR DELETE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role));
