ALTER TABLE public.site_config
  ADD COLUMN IF NOT EXISTS sobre_badge_text text DEFAULT 'Quem Somos',
  ADD COLUMN IF NOT EXISTS home_explore_title text DEFAULT 'Explore o Le Ville Pet',
  ADD COLUMN IF NOT EXISTS home_explore_subtitle text DEFAULT 'Descubra tudo que preparamos para você e seu pet',
  ADD COLUMN IF NOT EXISTS home_card_cta_text text DEFAULT 'Saiba mais →',
  ADD COLUMN IF NOT EXISTS cta_hotel_badge_text text DEFAULT 'Nosso Hotelzinho',
  ADD COLUMN IF NOT EXISTS contact_fixed_phone_title text DEFAULT 'Telefone Fixo',
  ADD COLUMN IF NOT EXISTS contact_fixed_phone_btn_text text DEFAULT 'Ligar agora';