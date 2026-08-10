ALTER TABLE public.site_config
  ADD COLUMN IF NOT EXISTS destaques_home_title TEXT DEFAULT 'Destaques da Semana',
  ADD COLUMN IF NOT EXISTS destaques_home_subtitle TEXT DEFAULT 'Os momentos mais especiais',
  ADD COLUMN IF NOT EXISTS destaques_hotel_title TEXT DEFAULT 'Destaques da Semana',
  ADD COLUMN IF NOT EXISTS destaques_hotel_subtitle TEXT DEFAULT 'Pets que passaram por aqui';