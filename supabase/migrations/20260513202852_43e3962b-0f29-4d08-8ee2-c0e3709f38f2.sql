-- Transporte content table
CREATE TABLE public.transporte_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_title text DEFAULT 'Transporte Pet',
  page_subtitle text DEFAULT 'Buscamos e levamos seu pet com segurança e carinho',
  hero_image_url text DEFAULT '',
  intro_text text DEFAULT 'Levamos e buscamos seu pet com todo cuidado, no entorno e proximidades do Villaggio Mall Center.',
  highlight_1_icon text DEFAULT '🚐',
  highlight_1_title text DEFAULT 'Veículo Climatizado',
  highlight_1_text text DEFAULT 'Ar condicionado para o conforto do seu pet em qualquer clima.',
  highlight_2_icon text DEFAULT '🛡️',
  highlight_2_title text DEFAULT 'Segurança Total',
  highlight_2_text text DEFAULT 'Transporte seguro com cintos e caixas adequadas.',
  highlight_3_icon text DEFAULT '❤️',
  highlight_3_title text DEFAULT 'Carinho de Verdade',
  highlight_3_text text DEFAULT 'Tio João trata cada pet como se fosse da família.',
  highlight_4_icon text DEFAULT '⏰',
  highlight_4_title text DEFAULT 'Pontualidade',
  highlight_4_text text DEFAULT 'Horários combinados respeitados para sua tranquilidade.',
  highlight_5_icon text DEFAULT '📍',
  highlight_5_title text DEFAULT 'Atendimento Local',
  highlight_5_text text DEFAULT 'Atendemos toda a região do Villaggio Mall Center.',
  highlight_6_icon text DEFAULT '🐾',
  highlight_6_title text DEFAULT '9 Anos de Experiência',
  highlight_6_text text DEFAULT 'Quase uma década cuidando de pets com amor.',
  description_text text DEFAULT 'Temos o serviço de transporte no entorno e proximidades do Villaggio Mall, feito pelo tio João há 9 anos com muito amor e carinho — porque seu pet merece. O veículo conta com segurança e ar condicionado.',
  driver_name text DEFAULT 'Tio João',
  driver_section_title text DEFAULT 'Conheça o Tio João',
  driver_text text DEFAULT 'Há 9 anos cuidando do transporte dos nossos pets com dedicação, carinho e responsabilidade.',
  photo_main_url text DEFAULT '',
  photo_2_url text DEFAULT '',
  photo_3_url text DEFAULT '',
  photo_4_url text DEFAULT '',
  gallery_section_title text DEFAULT 'Nosso Transporte',
  cta_title text DEFAULT 'Quer agendar o transporte do seu pet?',
  cta_btn_text text DEFAULT '🚐 Agendar pelo WhatsApp',
  whatsapp_message text DEFAULT 'Olá! Gostaria de agendar o serviço de transporte para o meu pet.',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.transporte_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read transporte" ON public.transporte_content FOR SELECT TO anon USING (true);
CREATE POLICY "Anon manage transporte" ON public.transporte_content FOR ALL TO anon USING (true) WITH CHECK (true);

INSERT INTO public.transporte_content DEFAULT VALUES;

-- Add nav item for Transporte (between Hotelzinho and Venha Nos Conhecer)
-- Bump display_order of items at/after the conhecer slot so Transporte fits in between.
DO $$
DECLARE
  hotel_order int;
BEGIN
  SELECT display_order INTO hotel_order FROM public.nav_items WHERE path = '/hotelzinho' LIMIT 1;
  IF hotel_order IS NOT NULL THEN
    UPDATE public.nav_items SET display_order = display_order + 1 WHERE display_order > hotel_order;
    INSERT INTO public.nav_items (label, path, display_order, is_active, show_in_navbar, show_in_footer)
    VALUES ('Transporte', '/transporte', hotel_order + 1, true, true, true);
  ELSE
    INSERT INTO public.nav_items (label, path, display_order, is_active, show_in_navbar, show_in_footer)
    VALUES ('Transporte', '/transporte', 999, true, true, true);
  END IF;
END $$;