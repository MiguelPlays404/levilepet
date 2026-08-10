
ALTER TABLE public.site_config
  ADD COLUMN IF NOT EXISTS conhecer_produtos_badge text DEFAULT '🛍️ Qualidade',
  ADD COLUMN IF NOT EXISTS conhecer_produtos_title text DEFAULT 'Produtos que utilizamos no seu pet',
  ADD COLUMN IF NOT EXISTS conhecer_produtos_text text DEFAULT 'Trabalhamos apenas com marcas premium e produtos cuidadosamente selecionados para garantir o bem-estar, a higiene e o conforto do seu companheiro. De shampoos hipoalergênicos a brinquedos seguros, cada item passa pela nossa curadoria.',
  ADD COLUMN IF NOT EXISTS conhecer_produtos_image_url text DEFAULT '/images/seed-dogs/produtos-pet-01.jpg';
