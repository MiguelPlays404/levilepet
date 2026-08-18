-- 1. Expandir site_config com novos textos
ALTER TABLE public.site_config
  ADD COLUMN IF NOT EXISTS nav_label_inicio text DEFAULT 'Início',
  ADD COLUMN IF NOT EXISTS nav_label_hotelzinho text DEFAULT 'Hotelzinho',
  ADD COLUMN IF NOT EXISTS nav_label_conhecer text DEFAULT 'Venha Nos Conhecer',
  ADD COLUMN IF NOT EXISTS nav_label_fotos text DEFAULT 'Fotos',
  ADD COLUMN IF NOT EXISTS nav_label_videos text DEFAULT 'Vídeos',
  ADD COLUMN IF NOT EXISTS nav_label_localizacao text DEFAULT 'Localização',
  ADD COLUMN IF NOT EXISTS nav_label_siganos text DEFAULT 'Siga-nos',
  ADD COLUMN IF NOT EXISTS nav_whatsapp_btn_text text DEFAULT '💬 WhatsApp',
  ADD COLUMN IF NOT EXISTS footer_nav_title text DEFAULT 'Navegação',
  ADD COLUMN IF NOT EXISTS footer_contact_title text DEFAULT 'Contato',
  ADD COLUMN IF NOT EXISTS footer_show_instagram boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS footer_show_whatsapp boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS fotos_page_title text DEFAULT 'Galeria de Fotos',
  ADD COLUMN IF NOT EXISTS fotos_page_subtitle text DEFAULT 'Momentos especiais dos nossos pets',
  ADD COLUMN IF NOT EXISTS fotos_empty_text text DEFAULT 'Nenhuma foto disponível ainda.',
  ADD COLUMN IF NOT EXISTS videos_page_title text DEFAULT 'Vídeos',
  ADD COLUMN IF NOT EXISTS videos_page_subtitle text DEFAULT 'Assista aos nossos melhores momentos',
  ADD COLUMN IF NOT EXISTS videos_likes_label text DEFAULT 'curtidas',
  ADD COLUMN IF NOT EXISTS videos_empty_text text DEFAULT 'Nenhum vídeo disponível ainda.',
  ADD COLUMN IF NOT EXISTS siganos_title text DEFAULT 'Siga o Le Ville Pet',
  ADD COLUMN IF NOT EXISTS siganos_subtitle text DEFAULT 'Acompanhe nossas redes e fique por dentro de tudo',
  ADD COLUMN IF NOT EXISTS hotel_gallery_title text DEFAULT 'Conheça nosso hotelzinho',
  ADD COLUMN IF NOT EXISTS hotel_videos_title text DEFAULT 'Vídeos do hotelzinho',
  ADD COLUMN IF NOT EXISTS hotel_hero_image_url text DEFAULT '',
  ADD COLUMN IF NOT EXISTS conhecer_gallery_title text DEFAULT 'Nosso espaço',
  ADD COLUMN IF NOT EXISTS conhecer_hero_image_url text DEFAULT '',
  ADD COLUMN IF NOT EXISTS featured_videos_btn_text text DEFAULT 'Ver todos os vídeos',
  ADD COLUMN IF NOT EXISTS featured_photos_btn_text text DEFAULT 'Ver todas as fotos',
  ADD COLUMN IF NOT EXISTS home_section_order jsonb DEFAULT '["hero","sobre","gallery","video","cta_hotel","contact"]'::jsonb,
  ADD COLUMN IF NOT EXISTS favicon_url text DEFAULT '',
  ADD COLUMN IF NOT EXISTS font_heading text DEFAULT 'Poppins',
  ADD COLUMN IF NOT EXISTS font_body text DEFAULT 'Inter',
  ADD COLUMN IF NOT EXISTS primary_color text DEFAULT '#F5C000',
  ADD COLUMN IF NOT EXISTS secondary_color text DEFAULT '#09090B';

-- 2. Tabela nav_items
CREATE TABLE IF NOT EXISTS public.nav_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  path text NOT NULL,
  display_order int DEFAULT 0,
  is_active boolean DEFAULT true,
  show_in_navbar boolean DEFAULT true,
  show_in_footer boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.nav_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read nav_items" ON public.nav_items FOR SELECT TO anon USING (true);
CREATE POLICY "Anon manage nav_items" ON public.nav_items FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE TRIGGER trg_nav_items_updated BEFORE UPDATE ON public.nav_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.nav_items (label, path, display_order) VALUES
  ('Início', '/', 1),
  ('Hotelzinho', '/hotelzinho', 2),
  ('Venha Nos Conhecer', '/venha-nos-conhecer', 3),
  ('Fotos', '/fotos', 4),
  ('Vídeos', '/videos', 5),
  ('Localização', '/localizacao', 6),
  ('Siga-nos', '/siga-nos', 7);

-- 3. Tabela guia_articles
CREATE TABLE IF NOT EXISTS public.guia_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text DEFAULT 'Geral',
  title text NOT NULL,
  content text NOT NULL,
  keywords text DEFAULT '',
  display_order int DEFAULT 0,
  icon text DEFAULT '📖',
  is_pinned boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.guia_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read guia" ON public.guia_articles FOR SELECT TO anon USING (true);
CREATE POLICY "Anon manage guia" ON public.guia_articles FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE TRIGGER trg_guia_updated BEFORE UPDATE ON public.guia_articles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.guia_articles (category, title, content, keywords, icon, is_pinned, display_order) VALUES
('Primeiros Passos', 'Bem-vindo ao painel Le Ville Pet', E'## Visão geral\n\nEste painel permite editar **100% do site** sem mexer em código.\n\n### Categorias da barra lateral\n- **CONTEÚDO**: Home, Fotos, Vídeos, Hotelzinho, Conhecer, Textos das Páginas\n- **APARÊNCIA**: Branding, Navbar & Rodapé, Configurações\n- **CONTATO**: Redes Sociais\n- **SISTEMA**: Segurança, Guia\n\n### Como salvar\nQuase todas as páginas têm o botão **Salvar** no fim. Sempre clique para confirmar.', 'comecar inicio bem vindo painel', '🚀', true, 1),
('Primeiros Passos', 'Como buscar funções no Guia', E'Use a **barra de pesquisa** no topo da página Guia. Ela busca em título, conteúdo, categoria e palavras-chave.\n\n**Exemplos de busca:**\n- "logo" → mostra como trocar a logo\n- "curtidas" → mostra como zerar curtidas de vídeos\n- "whatsapp" → todos os artigos sobre WhatsApp', 'pesquisa busca ajuda', '🔎', true, 2),
('Home', 'Como editar a seção Hero (banner principal)', E'Vá em **Gerenciar Home** na barra lateral.\n\n1. Edite **Título**, **Subtítulo** e **Palavra em destaque** (que fica amarela)\n2. Faça upload da imagem de fundo na área **Imagem do Hero**\n3. Altere os textos dos botões e os 3 indicadores de estatísticas\n4. Clique em **Salvar**', 'hero banner principal home capa', '🏠', false, 10),
('Home', 'Como editar a seção "Sobre"', E'Em **Gerenciar Home**, role até **Sobre o Le Ville Pet**.\n\nVocê pode mudar título, texto, botão e a imagem (com upload + barra de progresso).', 'sobre home apresentacao', '📝', false, 11),
('Home', 'Como editar o CTA do Hotelzinho na home', E'Em **Gerenciar Home**, vá até **Chamada do Hotelzinho**. Edite título, texto, dois botões e a imagem.', 'cta hotel chamada home', '🏨', false, 12),
('Fotos', 'Como adicionar uma foto', E'1. Acesse **Fotos** na barra lateral\n2. Use o **uploader** no topo (arraste o arquivo ou clique)\n3. A barra de progresso mostra o envio em tempo real\n4. Sem limite de tamanho ou resolução\n5. A foto aparece automaticamente na lista\n\n**Marque como destaque** para que apareça na home.', 'foto upload imagem adicionar enviar', '📸', false, 20),
('Fotos', 'Como reordenar / desativar / excluir fotos', E'Na lista de fotos:\n- **Olho** → ativa/desativa (some do site mas continua salva)\n- **Estrela** → marca como destaque (aparece na home)\n- **Lixeira** → exclui permanentemente', 'ordem destaque excluir foto', '🎛️', false, 21),
('Vídeos', 'Como adicionar um vídeo (YouTube ou link)', E'Em **Vídeos**:\n- Cole a URL do YouTube → a thumbnail é gerada automaticamente\n- Ou cole qualquer outro link de vídeo\n- Defina o título e clique em **Adicionar**', 'video youtube link adicionar', '🎬', false, 30),
('Vídeos', 'Como zerar as curtidas de um vídeo', E'Na lista de vídeos, clique no ícone de **coração** ao lado do vídeo. Confirme e as curtidas voltam a 0.', 'curtidas zerar likes coracao', '❤️', false, 31),
('Vídeos', 'Como destacar um vídeo na home', E'Marque o vídeo como **destaque** (estrela) na lista. Apenas vídeos em destaque aparecem na seção "Em Destaque" da home.', 'destaque featured home', '⭐', false, 32),
('Hotelzinho', 'Como editar a página Hotelzinho', E'Acesse **Hotelzinho** na barra lateral. Você pode editar título, subtítulo, 3 blocos de descrição, 3 destaques (com ícone), texto do CTA e mensagem do WhatsApp.\n\nPara a imagem hero do hotelzinho, use o uploader em **Branding/Configurações**.', 'hotelzinho hotel pets editar', '🏨', false, 40),
('Conhecer', 'Como editar "Venha nos Conhecer"', E'Acesse **Venha Nos Conhecer** na barra lateral. Edite títulos e textos.\n\nA galeria desta página puxa fotos da categoria **conhecer** (defina ao subir uma foto).', 'conhecer venha espaco', '👁️', false, 50),
('Aparência', 'Como trocar a logo do site', E'Vá em **Branding** na barra lateral.\n\n1. Clique no uploader de **Logo**\n2. Selecione qualquer imagem (PNG ou JPG, qualquer tamanho)\n3. Acompanhe a barra de progresso\n4. A logo aparece imediatamente na navbar', 'logo marca trocar imagem', '🎨', true, 60),
('Aparência', 'Como trocar o favicon', E'Em **Branding**, use o uploader **Favicon**. Recomendado: imagem quadrada PNG.', 'favicon icone aba navegador', '🌐', false, 61),
('Aparência', 'Como mudar as cores do site', E'Em **Branding**:\n- **Cor primária** → cor de destaque (botões, links)\n- **Cor secundária** → cor de fundo escura\n\nUse o seletor de cores ou cole o código HEX (ex: `#F5C000`).', 'cores cor primaria secundaria hex paleta', '🎨', false, 62),
('Aparência', 'Como mudar a fonte do site', E'Em **Branding**, escolha a fonte de **títulos** e a de **corpo** entre as opções disponíveis (Poppins, Inter, Roboto, Montserrat, etc.).', 'fonte tipografia letra', '🔤', false, 63),
('Navegação', 'Como editar os links da navbar e rodapé', E'Acesse **Navbar & Rodapé**.\n\n- Edite o **rótulo** de cada link\n- Reordene arrastando (display order)\n- Marque/desmarque **mostrar na navbar** ou **no rodapé**\n- Adicione novos links custom', 'navbar menu links rodape footer', '🧭', false, 70),
('Navegação', 'Como mudar o texto do botão WhatsApp', E'Em **Navbar & Rodapé**, campo **Texto do botão WhatsApp**. Use emojis se quiser.', 'whatsapp botao texto navbar', '💬', false, 71),
('Textos', 'Onde edito os títulos das páginas Fotos/Vídeos/Siga-nos', E'Acesse **Textos das Páginas**. Tem uma aba para cada página com todos os títulos, subtítulos e mensagens vazias.', 'textos titulos paginas global', '📝', false, 80),
('Configurações', 'Como atualizar endereço e mapa', E'Em **Configurações** edite os campos de endereço (3 linhas) e a URL do Google Maps. O mapa do site atualiza sozinho.', 'endereco mapa google maps localizacao', '📍', false, 90),
('Configurações', 'Como editar o número/mensagem do WhatsApp', E'Em **Configurações**, campos **Número WhatsApp** (formato: 5514997145610) e **Mensagem padrão**. Aplica em todos os botões do site.', 'whatsapp numero mensagem padrao', '📱', false, 91),
('Redes Sociais', 'Como ativar/desativar uma rede social', E'Em **Redes Sociais**, cada rede (Instagram, Facebook, TikTok, YouTube) tem um **toggle ativo**. Desativadas não aparecem na página Siga-nos nem no rodapé.', 'redes sociais ativar desativar instagram facebook tiktok youtube', '📱', false, 100),
('Redes Sociais', 'Como mudar o @handle ou URL da rede social', E'Em **Redes Sociais**, edite os campos **handle** (ex: @levillepetbauru) e **URL completa** de cada rede.', 'handle url instagram redes', '🔗', false, 101),
('Segurança', 'Como mudar o código de acesso admin', E'Em **Segurança**, campo **Código admin**. Use 6 dígitos. O código atual é necessário para acessar o painel pelo rodapé do site.', 'codigo admin senha acesso seguranca', '🔒', true, 110),
('Uploads', 'Como funciona o uploader de mídia', E'O uploader funciona em **toda página de admin** que pede imagem ou vídeo:\n\n- **Arraste e solte** ou clique para selecionar\n- **Sem limite de tamanho** (até 5GB)\n- **Qualquer resolução / duração**\n- **Barra de progresso real** durante o envio\n- **Preview imediato** após upload', 'upload uploader arquivo barra progresso', '⬆️', true, 120),
('Uploads', 'Posso enviar vídeos longos?', E'Sim! Sem limite de duração ou resolução. Para arquivos grandes (>500MB) o upload pode demorar alguns minutos — acompanhe pela barra de progresso.', 'video grande longo duracao tamanho', '🎥', false, 121);

-- 4. Storage policies para o bucket levillepet-media (idempotente)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='LeVillePet public read') THEN
    CREATE POLICY "LeVillePet public read" ON storage.objects
      FOR SELECT TO anon USING (bucket_id = 'levillepet-media');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='LeVillePet anon insert') THEN
    CREATE POLICY "LeVillePet anon insert" ON storage.objects
      FOR INSERT TO anon WITH CHECK (bucket_id = 'levillepet-media');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='LeVillePet anon update') THEN
    CREATE POLICY "LeVillePet anon update" ON storage.objects
      FOR UPDATE TO anon USING (bucket_id = 'levillepet-media') WITH CHECK (bucket_id = 'levillepet-media');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='LeVillePet anon delete') THEN
    CREATE POLICY "LeVillePet anon delete" ON storage.objects
      FOR DELETE TO anon USING (bucket_id = 'levillepet-media');
  END IF;
END $$;