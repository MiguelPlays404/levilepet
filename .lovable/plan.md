## Plano

### 1. Nova seção "Destaques da Semana"

Reaproveitar a tabela `photos` existente usando o sistema `locations` (já suporta múltiplos locais). Adicionar duas novas chaves:

- `destaques_home` — aparece na Home entre "Quem Somos" e "Explore o Le Ville Pet"
- `destaques_hotel` — aparece no Hotelzinho antes de "Nosso Espaço"

Limite de exibição: **8 fotos** por seção (ordenadas por `display_order`). Clique abre o `Lightbox` já existente com swipe/teclado.

### 2. Configuração editável (site_config)

Adicionar colunas opcionais para títulos/subtítulos editáveis:
- `destaques_home_title` (default "Destaques da Semana")
- `destaques_home_subtitle` (default "Os momentos mais especiais")
- `destaques_hotel_title` (default "Destaques da Semana")
- `destaques_hotel_subtitle` (default "Pets que passaram por aqui")

### 3. Frontend público

- `src/pages/Index.tsx`: nova `<section>` carrossel/grid após Sobre
- `src/pages/Hotelzinho.tsx`: nova `<section>` antes de "Nosso Espaço"
- Componente reutilizável `DestaquesSection` que:
  - busca `photos` filtrando por `locations` contendo a chave, limit 8
  - layout: grid responsivo (2 col mobile, 4 col desktop) **OU** carrossel horizontal com snap
  - usa `Lightbox` ao clicar
  - skeleton enquanto carrega; oculta seção se vazia

### 4. Painel admin

Nova página `src/pages/admin/AdminDestaques.tsx` com 2 abas (Home / Hotelzinho):
- Editar título e subtítulo da seção
- Upload de fotos (`MediaUploader`) que insere em `photos` já marcando o `location` correto
- Listar as fotos atuais do destaque com: reordenar (setas/up-down em `display_order`), ocultar/mostrar, excluir, alternar entre as duas seções
- Aviso visual quando >8 fotos ativas (só as 8 primeiras aparecem)
- Adicionar entrada no `AdminLayout` sidebar e rota em `App.tsx`

### 5. Atualizar `AdminPhotos`

Incluir as duas novas chaves (`destaques_home`, `destaques_hotel`) na constante `LOCATIONS` para que qualquer foto existente possa ser marcada como destaque sem reupload.

### 6. Animação suave entre fotos (todas as galerias)

Aplicar em `Fotos.tsx`, `Hotelzinho.tsx`, `VenhaNosConhecer.tsx`, novas seções de destaques e `Lightbox`:

- **Cards**: fade-up escalonado ao entrar (`stagger 60ms`), `transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]`, hover com `scale-[1.03]` e sombra amarela suave
- **Lightbox**: cross-fade entre imagens (200ms opacity), além do swipe atual; precarregar próxima/anterior
- **Carrossel destaques**: scroll horizontal com `scroll-smooth snap-x snap-mandatory`, setas com fade e arrasto por touch

### Arquivos a criar/alterar

- `supabase/migrations/<novo>.sql` — colunas em `site_config`
- `src/components/DestaquesSection.tsx` (novo)
- `src/pages/Index.tsx`, `src/pages/Hotelzinho.tsx`
- `src/pages/admin/AdminDestaques.tsx` (novo)
- `src/pages/admin/AdminPhotos.tsx` (LOCATIONS)
- `src/components/AdminLayout.tsx` (item de menu)
- `src/App.tsx` (rota)
- `src/components/Lightbox.tsx` (cross-fade)
- `src/pages/Fotos.tsx`, `src/pages/Hotelzinho.tsx`, `src/pages/VenhaNosConhecer.tsx` (animação cards)
- `src/index.css` (keyframes refinados se necessário)

### Detalhes técnicos

- Sem mudanças em RLS — `photos` já permite tudo via `Anon manage photos`
- Sem novas tabelas; reuso de `locations[]`
- Limite de 8 aplicado no frontend (`.slice(0,8)` após ordenar) — admin permite mais cadastrados, mas só 8 visíveis
