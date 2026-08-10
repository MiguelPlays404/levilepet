
-- Add missing columns to site_config
ALTER TABLE site_config ADD COLUMN IF NOT EXISTS address_line1 TEXT DEFAULT 'Villaggio Mall Center';
ALTER TABLE site_config ADD COLUMN IF NOT EXISTS address_line2 TEXT DEFAULT 'Av. Affonso José Aiello, 14-45 - Loja 19';
ALTER TABLE site_config ADD COLUMN IF NOT EXISTS address_line3 TEXT DEFAULT 'Vila Aviação, Bauru-SP, 17018-520';

-- Add missing columns to hotelzinho_content
ALTER TABLE hotelzinho_content ADD COLUMN IF NOT EXISTS page_subtitle TEXT DEFAULT 'O lar temporário do seu pet';
ALTER TABLE hotelzinho_content ADD COLUMN IF NOT EXISTS highlight_1_icon TEXT DEFAULT '🛡️';
ALTER TABLE hotelzinho_content ADD COLUMN IF NOT EXISTS highlight_2_icon TEXT DEFAULT '❤️';
ALTER TABLE hotelzinho_content ADD COLUMN IF NOT EXISTS highlight_3_icon TEXT DEFAULT '🍽️';
ALTER TABLE hotelzinho_content ADD COLUMN IF NOT EXISTS whatsapp_message TEXT DEFAULT 'Olá! Gostaria de agendar o hotelzinho para o meu pet. Pode me passar as informações?';

-- Add missing columns to conhecer_content
ALTER TABLE conhecer_content ADD COLUMN IF NOT EXISTS page_subtitle TEXT DEFAULT 'Um ambiente preparado com amor para você e seu pet';

-- Add missing column to video_likes for user_identifier
ALTER TABLE video_likes ADD COLUMN IF NOT EXISTS user_identifier TEXT DEFAULT '';
