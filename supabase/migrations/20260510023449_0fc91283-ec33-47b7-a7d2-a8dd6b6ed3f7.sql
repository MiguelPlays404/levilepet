
ALTER TABLE public.site_config
  ADD COLUMN IF NOT EXISTS fotos_hero_image_url text DEFAULT '',
  ADD COLUMN IF NOT EXISTS videos_hero_image_url text DEFAULT '',
  ADD COLUMN IF NOT EXISTS localizacao_hero_image_url text DEFAULT '',
  ADD COLUMN IF NOT EXISTS faleconosco_hero_image_url text DEFAULT '',
  ADD COLUMN IF NOT EXISTS siganos_hero_image_url text DEFAULT '';

UPDATE public.site_config SET
  fotos_hero_image_url = COALESCE(NULLIF(fotos_hero_image_url,''), '/images/seed-dogs/dog-conhecer-hero-01.jpg'),
  videos_hero_image_url = COALESCE(NULLIF(videos_hero_image_url,''), '/images/seed-dogs/dog-play-02.jpg'),
  localizacao_hero_image_url = COALESCE(NULLIF(localizacao_hero_image_url,''), '/images/seed-dogs/dog-trio-02.jpg'),
  faleconosco_hero_image_url = COALESCE(NULLIF(faleconosco_hero_image_url,''), '/images/seed-dogs/dog-grooming-02.jpg'),
  siganos_hero_image_url = COALESCE(NULLIF(siganos_hero_image_url,''), '/images/seed-dogs/dog-bath-02.jpg');
