
ALTER TABLE public.site_config
  ADD COLUMN IF NOT EXISTS fixed_phone TEXT DEFAULT '(14) 3204-7040',
  ADD COLUMN IF NOT EXISTS hero_badge_text TEXT DEFAULT '🐾 Petshop em Bauru-SP',
  ADD COLUMN IF NOT EXISTS contact_section_title TEXT DEFAULT 'Entre em Contato',
  ADD COLUMN IF NOT EXISTS faleconosco_visit_text TEXT DEFAULT 'Venha nos visitar! Estamos te esperando 🐾',
  ADD COLUMN IF NOT EXISTS faleconosco_info_title TEXT DEFAULT 'Informações de Contato',
  ADD COLUMN IF NOT EXISTS faleconosco_image_url TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS conhecer_about_title TEXT DEFAULT 'Sobre o Le Ville Pet',
  ADD COLUMN IF NOT EXISTS conhecer_cta_title TEXT DEFAULT 'Venha nos visitar!',
  ADD COLUMN IF NOT EXISTS conhecer_cta_btn_text TEXT DEFAULT 'Fale Conosco',
  ADD COLUMN IF NOT EXISTS hotel_cta_title TEXT DEFAULT 'Quer agendar uma estadia para o seu pet?',
  ADD COLUMN IF NOT EXISTS hotel_gallery_section_title TEXT DEFAULT 'Nosso Espaço',
  ADD COLUMN IF NOT EXISTS localizacao_howto_title TEXT DEFAULT 'Como Chegar',
  ADD COLUMN IF NOT EXISTS fotos_filter_all TEXT DEFAULT 'Todas',
  ADD COLUMN IF NOT EXISTS fotos_filter_galeria TEXT DEFAULT 'Galeria',
  ADD COLUMN IF NOT EXISTS fotos_filter_hotel TEXT DEFAULT 'Hotelzinho',
  ADD COLUMN IF NOT EXISTS fotos_filter_conhecer TEXT DEFAULT 'Nosso Espaço',
  ADD COLUMN IF NOT EXISTS siganos_footer_text TEXT DEFAULT '🐾 Feito com amor para você e seu pet';

UPDATE public.site_config SET fixed_phone = '(14) 3204-7040' WHERE fixed_phone IS NULL OR fixed_phone = '';

ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'geral';

UPDATE storage.buckets SET file_size_limit = NULL WHERE id = 'levillepet-media';
