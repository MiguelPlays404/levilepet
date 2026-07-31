
-- Function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- site_config
CREATE TABLE IF NOT EXISTS public.site_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  whatsapp_number TEXT NOT NULL DEFAULT '5514997145610',
  whatsapp_message TEXT DEFAULT 'Olá! Vim pelo site Le Ville Pet e gostaria de mais informações. 🐾',
  instagram_url TEXT DEFAULT 'https://www.instagram.com/levillepetbauru/',
  facebook_url TEXT DEFAULT '',
  tiktok_url TEXT DEFAULT '',
  youtube_url TEXT DEFAULT '',
  google_maps_url TEXT DEFAULT 'https://maps.app.goo.gl/nkuDnVyBe6ZHYNbS8',
  google_maps_embed TEXT DEFAULT '',
  address_full TEXT DEFAULT 'Villaggio Mall Center — Av. Affonso José Aiello, 14-45, Loja 19, Vila Aviação, Bauru-SP, 17018-520',
  site_name TEXT DEFAULT 'Le Ville Pet',
  site_slogan TEXT DEFAULT 'a gente se entende',
  logo_url TEXT DEFAULT '',
  hero_title TEXT DEFAULT 'Porque seu pet merece o melhor.',
  hero_subtitle TEXT DEFAULT 'No Le Ville Pet, cuidamos do seu companheiro com todo o amor e profissionalismo que ele merece.',
  hero_bg_image_url TEXT DEFAULT '',
  sobre_title TEXT DEFAULT 'O Le Ville Pet — onde seu pet se sente em casa',
  sobre_text TEXT DEFAULT 'Somos um petshop em Bauru-SP dedicado a oferecer os melhores cuidados para o seu companheiro de quatro patas.',
  admin_code TEXT NOT NULL DEFAULT '190103',
  instagram_active BOOLEAN DEFAULT TRUE,
  facebook_active BOOLEAN DEFAULT FALSE,
  tiktok_active BOOLEAN DEFAULT FALSE,
  youtube_active BOOLEAN DEFAULT FALSE,
  whatsapp_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER update_site_config_updated_at BEFORE UPDATE ON public.site_config FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- photos
CREATE TABLE IF NOT EXISTS public.photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'galeria',
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER update_photos_updated_at BEFORE UPDATE ON public.photos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- videos
CREATE TABLE IF NOT EXISTS public.videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  video_url TEXT NOT NULL,
  video_type TEXT DEFAULT 'youtube',
  thumbnail_url TEXT DEFAULT '',
  likes_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON public.videos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- video_likes
CREATE TABLE IF NOT EXISTS public.video_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(video_id, device_id)
);

-- hotelzinho_content
CREATE TABLE IF NOT EXISTS public.hotelzinho_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_title TEXT DEFAULT 'Nosso Hotelzinho',
  intro_text TEXT DEFAULT '',
  description_block_1 TEXT DEFAULT '',
  description_block_2 TEXT DEFAULT '',
  description_block_3 TEXT DEFAULT '',
  highlight_1_title TEXT DEFAULT '',
  highlight_1_text TEXT DEFAULT '',
  highlight_2_title TEXT DEFAULT '',
  highlight_2_text TEXT DEFAULT '',
  highlight_3_title TEXT DEFAULT '',
  highlight_3_text TEXT DEFAULT '',
  cta_text TEXT DEFAULT 'Agendar pelo WhatsApp 🐾',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER update_hotelzinho_updated_at BEFORE UPDATE ON public.hotelzinho_content FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- conhecer_content
CREATE TABLE IF NOT EXISTS public.conhecer_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_title TEXT DEFAULT 'Conheça o Nosso Espaço',
  intro_text TEXT DEFAULT '',
  about_text TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER update_conhecer_updated_at BEFORE UPDATE ON public.conhecer_content FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- home_sections
CREATE TABLE IF NOT EXISTS public.home_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  icon TEXT DEFAULT 'Star',
  link_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0
);

-- RLS
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotelzinho_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conhecer_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.home_sections ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Public read site_config" ON public.site_config FOR SELECT TO anon USING (true);
CREATE POLICY "Public read photos" ON public.photos FOR SELECT TO anon USING (true);
CREATE POLICY "Public read videos" ON public.videos FOR SELECT TO anon USING (true);
CREATE POLICY "Public read video_likes" ON public.video_likes FOR SELECT TO anon USING (true);
CREATE POLICY "Public read hotelzinho" ON public.hotelzinho_content FOR SELECT TO anon USING (true);
CREATE POLICY "Public read conhecer" ON public.conhecer_content FOR SELECT TO anon USING (true);
CREATE POLICY "Public read home_sections" ON public.home_sections FOR SELECT TO anon USING (true);

-- Write policies
CREATE POLICY "Anon insert video_likes" ON public.video_likes FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon delete video_likes" ON public.video_likes FOR DELETE TO anon USING (true);
CREATE POLICY "Anon manage photos" ON public.photos FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon manage videos" ON public.videos FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon manage site_config" ON public.site_config FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon manage hotelzinho" ON public.hotelzinho_content FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon manage conhecer" ON public.conhecer_content FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon manage home_sections" ON public.home_sections FOR ALL TO anon USING (true) WITH CHECK (true);

-- Storage
INSERT INTO storage.buckets (id, name, public) VALUES ('levillepet-media', 'levillepet-media', true);
CREATE POLICY "Public read levillepet-media" ON storage.objects FOR SELECT TO anon USING (bucket_id = 'levillepet-media');
CREATE POLICY "Anon upload levillepet-media" ON storage.objects FOR INSERT TO anon WITH CHECK (bucket_id = 'levillepet-media');
CREATE POLICY "Anon update levillepet-media" ON storage.objects FOR UPDATE TO anon USING (bucket_id = 'levillepet-media');
CREATE POLICY "Anon delete levillepet-media" ON storage.objects FOR DELETE TO anon USING (bucket_id = 'levillepet-media');

-- Seed data
INSERT INTO public.site_config (whatsapp_number, whatsapp_message, instagram_url, facebook_url, google_maps_url, address_full, site_name, site_slogan, hero_title, hero_subtitle, admin_code) VALUES ('5514997145610', 'Olá! Vim pelo site Le Ville Pet e gostaria de mais informações. 🐾', 'https://www.instagram.com/levillepetbauru/', 'https://www.facebook.com/levillepetbauru', 'https://maps.app.goo.gl/nkuDnVyBe6ZHYNbS8', 'Villaggio Mall Center — Av. Affonso José Aiello, 14-45, Loja 19, Vila Aviação, Bauru-SP, 17018-520', 'Le Ville Pet', 'a gente se entende', 'Porque seu pet merece o melhor.', 'No Le Ville Pet, cuidamos do seu companheiro com todo o amor e profissionalismo que ele merece.', '190103');

INSERT INTO public.photos (title, image_url, category, is_featured, display_order) VALUES
('Theo, o golden retriever', 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800', 'galeria', true, 1),
('Luna tomando banho', 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800', 'galeria', true, 2),
('Bella e Mel brincando', 'https://images.unsplash.com/photo-1568572933382-74d440642117?w=800', 'galeria', true, 3),
('Rex esperando o dono', 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=800', 'galeria', false, 4),
('Nala, a gata princesa', 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800', 'galeria', false, 5),
('Pitoco pós-banho', 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800', 'galeria', false, 6),
('Thor descansando', 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800', 'galeria', false, 7),
('Amendoim, o beagle', 'https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=800', 'galeria', true, 8),
('Quarto do hotelzinho', 'https://images.unsplash.com/photo-1601758003122-53c40e686a19?w=800', 'hotelzinho', true, 1),
('Área de passeio', 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800', 'hotelzinho', true, 2),
('Caminha confortável', 'https://images.unsplash.com/photo-1560807707-8cc77767d783?w=800', 'hotelzinho', false, 3),
('Hora do lanche', 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=800', 'hotelzinho', true, 4),
('Pet feliz no hotelzinho', 'https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?w=800', 'hotelzinho', false, 5),
('Brincadeiras coletivas', 'https://images.unsplash.com/photo-1560743641-3914f2c45636?w=800', 'hotelzinho', false, 6),
('Fachada do Le Ville Pet', 'https://images.unsplash.com/photo-1601758003122-53c40e686a19?w=800', 'conhecer', true, 1),
('Recepção do petshop', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800', 'conhecer', true, 2),
('Área de banho', 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800', 'conhecer', false, 3),
('Nossa equipe', 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800', 'conhecer', true, 4),
('Produtos disponíveis', 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800', 'conhecer', false, 5),
('Le Ville Pet — ambiente', 'https://images.unsplash.com/photo-1601758003122-53c40e686a19?w=800', 'home', true, 1);

INSERT INTO public.videos (title, description, video_url, video_type, likes_count, is_featured, published_at) VALUES
('Theo tomando banho pela primeira vez! 🛁', 'O golden mais fofo de Bauru no banho!', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'youtube', 47, true, NOW()),
('Luna e Mel — melhores amigas do hotelzinho ❤️', 'Dois dias de pura amizade!', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'youtube', 83, false, NOW() - INTERVAL '2 days'),
('Pitoco tem medo de secador 😂', 'A reação mais engraçada do ano!', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'youtube', 129, false, NOW() - INTERVAL '5 days'),
('Rex chegou tímido, foi embora feliz 🐶', 'Primeira estadia no hotelzinho!', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'youtube', 34, false, NOW() - INTERVAL '7 days'),
('Transformação: antes e depois da tosa da Bella ✂️', 'Que diferença incrível!', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'youtube', 201, false, NOW() - INTERVAL '10 days'),
('Tour pelo nosso hotelzinho 🏨', 'Veja como seu pet vai ficar!', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'youtube', 156, false, NOW() - INTERVAL '14 days');

INSERT INTO public.hotelzinho_content (page_title, intro_text, description_block_1, description_block_2, description_block_3, highlight_1_title, highlight_1_text, highlight_2_title, highlight_2_text, highlight_3_title, highlight_3_text, cta_text) VALUES ('Nosso Hotelzinho', 'Sabemos que deixar seu pet pode ser uma decisão difícil. É por isso que criamos um espaço especialmente pensado para que ele se sinta em casa — seguro, confortável e amado.', 'O nosso hotelzinho foi projetado para ser um lar temporário de verdade. Cada cantinho foi pensado para o conforto e a segurança dos nossos hóspedes peludos.', 'Oferecemos acomodações individuais ou compartilhadas, de acordo com o perfil e as necessidades do seu pet.', 'Durante a estadia, o seu pet recebe atenção individualizada, passeios regulares e toda a medicação prescrita.', '🛡️ Ambiente Seguro', 'Espaço totalmente vedado, sem riscos de fuga. Câmeras de monitoramento e supervisão constante.', '❤️ Carinho Individual', 'Cada pet recebe atenção personalizada. Nossa equipe é apaixonada por animais.', '🍽️ Alimentação Certa', 'Seguimos rigorosamente a dieta do seu pet.', 'Agendar pelo WhatsApp 🐾');

INSERT INTO public.conhecer_content (page_title, intro_text, about_text) VALUES ('Conheça o Nosso Espaço', 'Um ambiente preparado com amor para você e seu pet.', 'O Le Ville Pet nasceu da paixão pelos animais. Localizado no coração do Villaggio Mall Center, em Bauru-SP, somos um petshop completo dedicado a oferecer os melhores cuidados para o seu companheiro de quatro patas.');

INSERT INTO public.home_sections (section_key, title, description, icon, link_url, display_order) VALUES
('hotelzinho', 'Nosso Hotelzinho', 'Seu pet em boas mãos enquanto você viaja com tranquilidade.', 'Home', '/hotelzinho', 1),
('galeria', 'Galeria de Fotos', 'Confira nosso espaço e os pets lindos que já atendemos.', 'Camera', '/fotos', 2),
('videos', 'Vídeos', 'Momentos especiais dos nossos pets peludos. Curta sem culpa!', 'Video', '/videos', 3),
('localizacao', 'Nossa Localização', 'No coração do Villaggio Mall Center, fácil de chegar.', 'MapPin', '/localizacao', 4),
('contato', 'Fale Conosco', 'Tire dúvidas, agende serviços — estamos sempre prontos!', 'MessageCircle', '/fale-conosco', 5),
('siga-nos', 'Redes Sociais', 'Siga a gente e fique por dentro das novidades peludas!', 'Heart', '/siga-nos', 6);
