
CREATE TABLE public.vagas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  schedule text,
  requirements text,
  whatsapp_message text,
  display_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.vagas TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vagas TO authenticated;
GRANT ALL ON public.vagas TO service_role;

ALTER TABLE public.vagas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active vagas" ON public.vagas FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert vagas" ON public.vagas FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update vagas" ON public.vagas FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete vagas" ON public.vagas FOR DELETE TO authenticated USING (true);

CREATE TRIGGER update_vagas_updated_at BEFORE UPDATE ON public.vagas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.site_config
  ADD COLUMN IF NOT EXISTS vagas_section_active boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS vagas_section_title text DEFAULT 'Vagas Disponíveis',
  ADD COLUMN IF NOT EXISTS vagas_section_subtitle text DEFAULT 'Faça parte da nossa equipe!',
  ADD COLUMN IF NOT EXISTS vagas_section_badge text DEFAULT 'Trabalhe Conosco',
  ADD COLUMN IF NOT EXISTS vagas_section_image_url text DEFAULT '/__l5e/assets-v1/54501d92-7544-4502-8c7b-207bccc137ff/vaga-banhista.jpg';

INSERT INTO public.vagas (title, schedule, requirements, whatsapp_message, display_order)
VALUES (
  'Estamos contratando uma Banhista',
  'Segunda a sexta, das 8h às 14h',
  'Experiência e curso completo',
  'Vim Pelo site do Le Vile Pet e estou(A) intereçado(A) na vaga para banhista',
  0
);
