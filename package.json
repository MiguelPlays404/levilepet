
CREATE INDEX IF NOT EXISTS idx_photos_active_order ON public.photos (is_active, display_order) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_videos_active_published ON public.videos (is_active, published_at DESC) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_videos_active_featured ON public.videos (is_active, is_featured) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_home_sections_active_order ON public.home_sections (is_active, display_order) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_nav_items_active_order ON public.nav_items (is_active, display_order) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_vagas_active_order ON public.vagas (is_active, display_order) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_hoje_active_published ON public.hoje_no_le_ville (is_active, published_at, expires_at) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_user_roles_user_role ON public.user_roles (user_id, role);
