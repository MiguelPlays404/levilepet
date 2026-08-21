export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      album_items: {
        Row: {
          album_id: string | null
          aspect_ratio: string | null
          caption: string | null
          created_at: string | null
          id: string
          media_type: string | null
          media_url: string | null
          position: number | null
          source_type: string | null
          thumb_url: string | null
          updated_at: string | null
        }
        Insert: {
          album_id?: string | null
          aspect_ratio?: string | null
          caption?: string | null
          created_at?: string | null
          id?: string
          media_type?: string | null
          media_url?: string | null
          position?: number | null
          source_type?: string | null
          thumb_url?: string | null
          updated_at?: string | null
        }
        Update: {
          album_id?: string | null
          aspect_ratio?: string | null
          caption?: string | null
          created_at?: string | null
          id?: string
          media_type?: string | null
          media_url?: string | null
          position?: number | null
          source_type?: string | null
          thumb_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      albums: {
        Row: {
          aspect_ratio: string | null
          cover_type: string | null
          cover_url: string | null
          created_at: string | null
          description: string | null
          expire_at: string | null
          id: string
          is_active: boolean | null
          locations: string[] | null
          position: number | null
          publish_at: string | null
          show_in_hoje: boolean | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          aspect_ratio?: string | null
          cover_type?: string | null
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          expire_at?: string | null
          id?: string
          is_active?: boolean | null
          locations?: string[] | null
          position?: number | null
          publish_at?: string | null
          show_in_hoje?: boolean | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          aspect_ratio?: string | null
          cover_type?: string | null
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          expire_at?: string | null
          id?: string
          is_active?: boolean | null
          locations?: string[] | null
          position?: number | null
          publish_at?: string | null
          show_in_hoje?: boolean | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string | null
          actor_email: string | null
          actor_id: string | null
          created_at: string | null
          details: Json | null
          entity: string | null
          entity_id: string | null
          id: string
          ip: string | null
          user_agent: string | null
        }
        Insert: {
          action?: string | null
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string | null
          details?: Json | null
          entity?: string | null
          entity_id?: string | null
          id?: string
          ip?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string | null
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string | null
          details?: Json | null
          entity?: string | null
          entity_id?: string | null
          id?: string
          ip?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      auth_attempts: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          ident: string | null
          ip: string | null
          kind: string | null
          success: boolean | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          ident?: string | null
          ip?: string | null
          kind?: string | null
          success?: boolean | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          ident?: string | null
          ip?: string | null
          kind?: string | null
          success?: boolean | null
        }
        Relationships: []
      }
      auth_lockouts: {
        Row: {
          fail_count: number | null
          ident: string
          locked_until: string | null
          stage: number | null
          updated_at: string | null
        }
        Insert: {
          fail_count?: number | null
          ident: string
          locked_until?: string | null
          stage?: number | null
          updated_at?: string | null
        }
        Update: {
          fail_count?: number | null
          ident?: string
          locked_until?: string | null
          stage?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      conhecer_content: {
        Row: {
          about_text: string | null
          id: string
          intro_text: string | null
          page_subtitle: string | null
          page_title: string | null
          updated_at: string | null
        }
        Insert: {
          about_text?: string | null
          id?: string
          intro_text?: string | null
          page_subtitle?: string | null
          page_title?: string | null
          updated_at?: string | null
        }
        Update: {
          about_text?: string | null
          id?: string
          intro_text?: string | null
          page_subtitle?: string | null
          page_title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      guia_articles: {
        Row: {
          category: string | null
          content: string | null
          created_at: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_pinned: boolean | null
          keywords: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          content?: string | null
          created_at?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_pinned?: boolean | null
          keywords?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          content?: string | null
          created_at?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_pinned?: boolean | null
          keywords?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      hoje_no_le_ville: {
        Row: {
          aspect_ratio: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          media_type: string | null
          media_url: string | null
          orientation: string | null
          published_at: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          aspect_ratio?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          media_type?: string | null
          media_url?: string | null
          orientation?: string | null
          published_at?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          aspect_ratio?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          media_type?: string | null
          media_url?: string | null
          orientation?: string | null
          published_at?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      home_sections: {
        Row: {
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          link_url: string | null
          section_key: string | null
          title: string | null
        }
        Insert: {
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          link_url?: string | null
          section_key?: string | null
          title?: string | null
        }
        Update: {
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          link_url?: string | null
          section_key?: string | null
          title?: string | null
        }
        Relationships: []
      }
      hotelzinho_content: {
        Row: {
          cta_text: string | null
          description_block_1: string | null
          description_block_2: string | null
          description_block_3: string | null
          highlight_1_icon: string | null
          highlight_1_text: string | null
          highlight_1_title: string | null
          highlight_2_icon: string | null
          highlight_2_text: string | null
          highlight_2_title: string | null
          highlight_3_icon: string | null
          highlight_3_text: string | null
          highlight_3_title: string | null
          id: string
          intro_text: string | null
          page_subtitle: string | null
          page_title: string | null
          updated_at: string | null
          whatsapp_message: string | null
        }
        Insert: {
          cta_text?: string | null
          description_block_1?: string | null
          description_block_2?: string | null
          description_block_3?: string | null
          highlight_1_icon?: string | null
          highlight_1_text?: string | null
          highlight_1_title?: string | null
          highlight_2_icon?: string | null
          highlight_2_text?: string | null
          highlight_2_title?: string | null
          highlight_3_icon?: string | null
          highlight_3_text?: string | null
          highlight_3_title?: string | null
          id?: string
          intro_text?: string | null
          page_subtitle?: string | null
          page_title?: string | null
          updated_at?: string | null
          whatsapp_message?: string | null
        }
        Update: {
          cta_text?: string | null
          description_block_1?: string | null
          description_block_2?: string | null
          description_block_3?: string | null
          highlight_1_icon?: string | null
          highlight_1_text?: string | null
          highlight_1_title?: string | null
          highlight_2_icon?: string | null
          highlight_2_text?: string | null
          highlight_2_title?: string | null
          highlight_3_icon?: string | null
          highlight_3_text?: string | null
          highlight_3_title?: string | null
          id?: string
          intro_text?: string | null
          page_subtitle?: string | null
          page_title?: string | null
          updated_at?: string | null
          whatsapp_message?: string | null
        }
        Relationships: []
      }
      nav_items: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          label: string | null
          path: string | null
          show_in_footer: boolean | null
          show_in_navbar: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          label?: string | null
          path?: string | null
          show_in_footer?: boolean | null
          show_in_navbar?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          label?: string | null
          path?: string | null
          show_in_footer?: boolean | null
          show_in_navbar?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      photos: {
        Row: {
          aspect_ratio: string | null
          category: string | null
          created_at: string | null
          display_order: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_featured: boolean | null
          locations: string[] | null
          publish_at: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          aspect_ratio?: string | null
          category?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          locations?: string[] | null
          publish_at?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          aspect_ratio?: string | null
          category?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          locations?: string[] | null
          publish_at?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      site_config: {
        Row: {
          address_full: string | null
          address_line1: string | null
          address_line2: string | null
          address_line3: string | null
          conhecer_about_title: string | null
          conhecer_cta_btn_text: string | null
          conhecer_cta_title: string | null
          conhecer_gallery_title: string | null
          conhecer_hero_image_url: string | null
          conhecer_produtos_badge: string | null
          conhecer_produtos_image_url: string | null
          conhecer_produtos_text: string | null
          conhecer_produtos_title: string | null
          contact_fixed_phone_btn_text: string | null
          contact_fixed_phone_title: string | null
          contact_instagram_btn_text: string | null
          contact_maps_btn_text: string | null
          contact_section_title: string | null
          contact_whatsapp_btn_text: string | null
          copyright_text: string | null
          created_at: string | null
          cta_hotel_badge_text: string | null
          cta_hotel_btn1_text: string | null
          cta_hotel_btn2_text: string | null
          cta_hotel_image_url: string | null
          cta_hotel_text: string | null
          cta_hotel_title: string | null
          destaques_home_subtitle: string | null
          destaques_home_title: string | null
          destaques_hotel_subtitle: string | null
          destaques_hotel_title: string | null
          facebook_active: boolean | null
          facebook_btn_text: string | null
          facebook_handle: string | null
          facebook_url: string | null
          faleconosco_btn_text: string | null
          faleconosco_card_text: string | null
          faleconosco_card_title: string | null
          faleconosco_hero_image_url: string | null
          faleconosco_image_url: string | null
          faleconosco_info_title: string | null
          faleconosco_subtitle: string | null
          faleconosco_title: string | null
          faleconosco_visit_text: string | null
          favicon_url: string | null
          featured_photos_btn_text: string | null
          featured_videos_btn_text: string | null
          fixed_phone: string | null
          font_body: string | null
          font_heading: string | null
          footer_contact_title: string | null
          footer_description: string | null
          footer_nav_title: string | null
          footer_show_instagram: boolean | null
          footer_show_whatsapp: boolean | null
          fotos_empty_text: string | null
          fotos_filter_all: string | null
          fotos_filter_conhecer: string | null
          fotos_filter_galeria: string | null
          fotos_filter_hotel: string | null
          fotos_hero_image_url: string | null
          fotos_page_subtitle: string | null
          fotos_page_title: string | null
          gallery_section_subtitle: string | null
          gallery_section_title: string | null
          google_maps_embed: string | null
          google_maps_url: string | null
          hero_badge_text: string | null
          hero_bg_image_url: string | null
          hero_btn_primary_text: string | null
          hero_btn_secondary_text: string | null
          hero_highlight_word: string | null
          hero_stat_1_label: string | null
          hero_stat_1_num: string | null
          hero_stat_2_label: string | null
          hero_stat_2_num: string | null
          hero_stat_3_label: string | null
          hero_stat_3_num: string | null
          hero_subtitle: string | null
          hero_title: string | null
          home_card_cta_text: string | null
          home_explore_subtitle: string | null
          home_explore_title: string | null
          home_section_order: Json | null
          hotel_cta_title: string | null
          hotel_gallery_section_title: string | null
          hotel_gallery_title: string | null
          hotel_hero_image_url: string | null
          hotel_videos_title: string | null
          id: string
          instagram_active: boolean | null
          instagram_btn_text: string | null
          instagram_handle: string | null
          instagram_url: string | null
          localizacao_hero_image_url: string | null
          localizacao_howto_text: string | null
          localizacao_howto_title: string | null
          localizacao_maps_btn_text: string | null
          localizacao_route_btn_text: string | null
          localizacao_subtitle: string | null
          localizacao_title: string | null
          logo_url: string | null
          maintenance_mode: boolean | null
          nav_label_conhecer: string | null
          nav_label_fotos: string | null
          nav_label_hotelzinho: string | null
          nav_label_inicio: string | null
          nav_label_localizacao: string | null
          nav_label_siganos: string | null
          nav_label_videos: string | null
          nav_whatsapp_btn_text: string | null
          primary_color: string | null
          secondary_color: string | null
          siganos_footer_text: string | null
          siganos_hero_image_url: string | null
          siganos_subtitle: string | null
          siganos_title: string | null
          site_name: string | null
          site_slogan: string | null
          sobre_badge_text: string | null
          sobre_cta_text: string | null
          sobre_image_url: string | null
          sobre_text: string | null
          sobre_title: string | null
          tiktok_active: boolean | null
          tiktok_btn_text: string | null
          tiktok_handle: string | null
          tiktok_url: string | null
          updated_at: string | null
          vagas_section_active: boolean | null
          vagas_section_badge: string | null
          vagas_section_image_url: string | null
          vagas_section_subtitle: string | null
          vagas_section_title: string | null
          video_section_subtitle: string | null
          video_section_title: string | null
          videos_empty_text: string | null
          videos_hero_image_url: string | null
          videos_likes_label: string | null
          videos_page_subtitle: string | null
          videos_page_title: string | null
          whatsapp_active: boolean | null
          whatsapp_btn_text: string | null
          whatsapp_message: string | null
          whatsapp_number: string | null
          youtube_active: boolean | null
          youtube_btn_text: string | null
          youtube_handle: string | null
          youtube_url: string | null
        }
        Insert: {
          address_full?: string | null
          address_line1?: string | null
          address_line2?: string | null
          address_line3?: string | null
          conhecer_about_title?: string | null
          conhecer_cta_btn_text?: string | null
          conhecer_cta_title?: string | null
          conhecer_gallery_title?: string | null
          conhecer_hero_image_url?: string | null
          conhecer_produtos_badge?: string | null
          conhecer_produtos_image_url?: string | null
          conhecer_produtos_text?: string | null
          conhecer_produtos_title?: string | null
          contact_fixed_phone_btn_text?: string | null
          contact_fixed_phone_title?: string | null
          contact_instagram_btn_text?: string | null
          contact_maps_btn_text?: string | null
          contact_section_title?: string | null
          contact_whatsapp_btn_text?: string | null
          copyright_text?: string | null
          created_at?: string | null
          cta_hotel_badge_text?: string | null
          cta_hotel_btn1_text?: string | null
          cta_hotel_btn2_text?: string | null
          cta_hotel_image_url?: string | null
          cta_hotel_text?: string | null
          cta_hotel_title?: string | null
          destaques_home_subtitle?: string | null
          destaques_home_title?: string | null
          destaques_hotel_subtitle?: string | null
          destaques_hotel_title?: string | null
          facebook_active?: boolean | null
          facebook_btn_text?: string | null
          facebook_handle?: string | null
          facebook_url?: string | null
          faleconosco_btn_text?: string | null
          faleconosco_card_text?: string | null
          faleconosco_card_title?: string | null
          faleconosco_hero_image_url?: string | null
          faleconosco_image_url?: string | null
          faleconosco_info_title?: string | null
          faleconosco_subtitle?: string | null
          faleconosco_title?: string | null
          faleconosco_visit_text?: string | null
          favicon_url?: string | null
          featured_photos_btn_text?: string | null
          featured_videos_btn_text?: string | null
          fixed_phone?: string | null
          font_body?: string | null
          font_heading?: string | null
          footer_contact_title?: string | null
          footer_description?: string | null
          footer_nav_title?: string | null
          footer_show_instagram?: boolean | null
          footer_show_whatsapp?: boolean | null
          fotos_empty_text?: string | null
          fotos_filter_all?: string | null
          fotos_filter_conhecer?: string | null
          fotos_filter_galeria?: string | null
          fotos_filter_hotel?: string | null
          fotos_hero_image_url?: string | null
          fotos_page_subtitle?: string | null
          fotos_page_title?: string | null
          gallery_section_subtitle?: string | null
          gallery_section_title?: string | null
          google_maps_embed?: string | null
          google_maps_url?: string | null
          hero_badge_text?: string | null
          hero_bg_image_url?: string | null
          hero_btn_primary_text?: string | null
          hero_btn_secondary_text?: string | null
          hero_highlight_word?: string | null
          hero_stat_1_label?: string | null
          hero_stat_1_num?: string | null
          hero_stat_2_label?: string | null
          hero_stat_2_num?: string | null
          hero_stat_3_label?: string | null
          hero_stat_3_num?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          home_card_cta_text?: string | null
          home_explore_subtitle?: string | null
          home_explore_title?: string | null
          home_section_order?: Json | null
          hotel_cta_title?: string | null
          hotel_gallery_section_title?: string | null
          hotel_gallery_title?: string | null
          hotel_hero_image_url?: string | null
          hotel_videos_title?: string | null
          id?: string
          instagram_active?: boolean | null
          instagram_btn_text?: string | null
          instagram_handle?: string | null
          instagram_url?: string | null
          localizacao_hero_image_url?: string | null
          localizacao_howto_text?: string | null
          localizacao_howto_title?: string | null
          localizacao_maps_btn_text?: string | null
          localizacao_route_btn_text?: string | null
          localizacao_subtitle?: string | null
          localizacao_title?: string | null
          logo_url?: string | null
          maintenance_mode?: boolean | null
          nav_label_conhecer?: string | null
          nav_label_fotos?: string | null
          nav_label_hotelzinho?: string | null
          nav_label_inicio?: string | null
          nav_label_localizacao?: string | null
          nav_label_siganos?: string | null
          nav_label_videos?: string | null
          nav_whatsapp_btn_text?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          siganos_footer_text?: string | null
          siganos_hero_image_url?: string | null
          siganos_subtitle?: string | null
          siganos_title?: string | null
          site_name?: string | null
          site_slogan?: string | null
          sobre_badge_text?: string | null
          sobre_cta_text?: string | null
          sobre_image_url?: string | null
          sobre_text?: string | null
          sobre_title?: string | null
          tiktok_active?: boolean | null
          tiktok_btn_text?: string | null
          tiktok_handle?: string | null
          tiktok_url?: string | null
          updated_at?: string | null
          vagas_section_active?: boolean | null
          vagas_section_badge?: string | null
          vagas_section_image_url?: string | null
          vagas_section_subtitle?: string | null
          vagas_section_title?: string | null
          video_section_subtitle?: string | null
          video_section_title?: string | null
          videos_empty_text?: string | null
          videos_hero_image_url?: string | null
          videos_likes_label?: string | null
          videos_page_subtitle?: string | null
          videos_page_title?: string | null
          whatsapp_active?: boolean | null
          whatsapp_btn_text?: string | null
          whatsapp_message?: string | null
          whatsapp_number?: string | null
          youtube_active?: boolean | null
          youtube_btn_text?: string | null
          youtube_handle?: string | null
          youtube_url?: string | null
        }
        Update: {
          address_full?: string | null
          address_line1?: string | null
          address_line2?: string | null
          address_line3?: string | null
          conhecer_about_title?: string | null
          conhecer_cta_btn_text?: string | null
          conhecer_cta_title?: string | null
          conhecer_gallery_title?: string | null
          conhecer_hero_image_url?: string | null
          conhecer_produtos_badge?: string | null
          conhecer_produtos_image_url?: string | null
          conhecer_produtos_text?: string | null
          conhecer_produtos_title?: string | null
          contact_fixed_phone_btn_text?: string | null
          contact_fixed_phone_title?: string | null
          contact_instagram_btn_text?: string | null
          contact_maps_btn_text?: string | null
          contact_section_title?: string | null
          contact_whatsapp_btn_text?: string | null
          copyright_text?: string | null
          created_at?: string | null
          cta_hotel_badge_text?: string | null
          cta_hotel_btn1_text?: string | null
          cta_hotel_btn2_text?: string | null
          cta_hotel_image_url?: string | null
          cta_hotel_text?: string | null
          cta_hotel_title?: string | null
          destaques_home_subtitle?: string | null
          destaques_home_title?: string | null
          destaques_hotel_subtitle?: string | null
          destaques_hotel_title?: string | null
          facebook_active?: boolean | null
          facebook_btn_text?: string | null
          facebook_handle?: string | null
          facebook_url?: string | null
          faleconosco_btn_text?: string | null
          faleconosco_card_text?: string | null
          faleconosco_card_title?: string | null
          faleconosco_hero_image_url?: string | null
          faleconosco_image_url?: string | null
          faleconosco_info_title?: string | null
          faleconosco_subtitle?: string | null
          faleconosco_title?: string | null
          faleconosco_visit_text?: string | null
          favicon_url?: string | null
          featured_photos_btn_text?: string | null
          featured_videos_btn_text?: string | null
          fixed_phone?: string | null
          font_body?: string | null
          font_heading?: string | null
          footer_contact_title?: string | null
          footer_description?: string | null
          footer_nav_title?: string | null
          footer_show_instagram?: boolean | null
          footer_show_whatsapp?: boolean | null
          fotos_empty_text?: string | null
          fotos_filter_all?: string | null
          fotos_filter_conhecer?: string | null
          fotos_filter_galeria?: string | null
          fotos_filter_hotel?: string | null
          fotos_hero_image_url?: string | null
          fotos_page_subtitle?: string | null
          fotos_page_title?: string | null
          gallery_section_subtitle?: string | null
          gallery_section_title?: string | null
          google_maps_embed?: string | null
          google_maps_url?: string | null
          hero_badge_text?: string | null
          hero_bg_image_url?: string | null
          hero_btn_primary_text?: string | null
          hero_btn_secondary_text?: string | null
          hero_highlight_word?: string | null
          hero_stat_1_label?: string | null
          hero_stat_1_num?: string | null
          hero_stat_2_label?: string | null
          hero_stat_2_num?: string | null
          hero_stat_3_label?: string | null
          hero_stat_3_num?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          home_card_cta_text?: string | null
          home_explore_subtitle?: string | null
          home_explore_title?: string | null
          home_section_order?: Json | null
          hotel_cta_title?: string | null
          hotel_gallery_section_title?: string | null
          hotel_gallery_title?: string | null
          hotel_hero_image_url?: string | null
          hotel_videos_title?: string | null
          id?: string
          instagram_active?: boolean | null
          instagram_btn_text?: string | null
          instagram_handle?: string | null
          instagram_url?: string | null
          localizacao_hero_image_url?: string | null
          localizacao_howto_text?: string | null
          localizacao_howto_title?: string | null
          localizacao_maps_btn_text?: string | null
          localizacao_route_btn_text?: string | null
          localizacao_subtitle?: string | null
          localizacao_title?: string | null
          logo_url?: string | null
          maintenance_mode?: boolean | null
          nav_label_conhecer?: string | null
          nav_label_fotos?: string | null
          nav_label_hotelzinho?: string | null
          nav_label_inicio?: string | null
          nav_label_localizacao?: string | null
          nav_label_siganos?: string | null
          nav_label_videos?: string | null
          nav_whatsapp_btn_text?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          siganos_footer_text?: string | null
          siganos_hero_image_url?: string | null
          siganos_subtitle?: string | null
          siganos_title?: string | null
          site_name?: string | null
          site_slogan?: string | null
          sobre_badge_text?: string | null
          sobre_cta_text?: string | null
          sobre_image_url?: string | null
          sobre_text?: string | null
          sobre_title?: string | null
          tiktok_active?: boolean | null
          tiktok_btn_text?: string | null
          tiktok_handle?: string | null
          tiktok_url?: string | null
          updated_at?: string | null
          vagas_section_active?: boolean | null
          vagas_section_badge?: string | null
          vagas_section_image_url?: string | null
          vagas_section_subtitle?: string | null
          vagas_section_title?: string | null
          video_section_subtitle?: string | null
          video_section_title?: string | null
          videos_empty_text?: string | null
          videos_hero_image_url?: string | null
          videos_likes_label?: string | null
          videos_page_subtitle?: string | null
          videos_page_title?: string | null
          whatsapp_active?: boolean | null
          whatsapp_btn_text?: string | null
          whatsapp_message?: string | null
          whatsapp_number?: string | null
          youtube_active?: boolean | null
          youtube_btn_text?: string | null
          youtube_handle?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      transporte_content: {
        Row: {
          coverage_neighborhoods: string | null
          coverage_text: string | null
          coverage_title: string | null
          cta_btn_text: string | null
          cta_title: string | null
          description_text: string | null
          driver_name: string | null
          driver_section_title: string | null
          driver_text: string | null
          faq_a1: string | null
          faq_a2: string | null
          faq_a3: string | null
          faq_a4: string | null
          faq_q1: string | null
          faq_q2: string | null
          faq_q3: string | null
          faq_q4: string | null
          faq_title: string | null
          gallery_section_title: string | null
          hero_image_url: string | null
          highlight_1_icon: string | null
          highlight_1_text: string | null
          highlight_1_title: string | null
          highlight_2_icon: string | null
          highlight_2_text: string | null
          highlight_2_title: string | null
          highlight_3_icon: string | null
          highlight_3_text: string | null
          highlight_3_title: string | null
          highlight_4_icon: string | null
          highlight_4_text: string | null
          highlight_4_title: string | null
          highlight_5_icon: string | null
          highlight_5_text: string | null
          highlight_5_title: string | null
          highlight_6_icon: string | null
          highlight_6_text: string | null
          highlight_6_title: string | null
          how_it_works_subtitle: string | null
          how_it_works_title: string | null
          id: string
          intro_text: string | null
          page_subtitle: string | null
          page_title: string | null
          photo_2_url: string | null
          photo_3_url: string | null
          photo_4_url: string | null
          photo_main_url: string | null
          pricing_text: string | null
          pricing_title: string | null
          safety_text: string | null
          safety_title: string | null
          step_1_text: string | null
          step_1_title: string | null
          step_2_text: string | null
          step_2_title: string | null
          step_3_text: string | null
          step_3_title: string | null
          step_4_text: string | null
          step_4_title: string | null
          testimonial_author: string | null
          testimonial_text: string | null
          testimonial_title: string | null
          updated_at: string | null
          whatsapp_message: string | null
        }
        Insert: {
          coverage_neighborhoods?: string | null
          coverage_text?: string | null
          coverage_title?: string | null
          cta_btn_text?: string | null
          cta_title?: string | null
          description_text?: string | null
          driver_name?: string | null
          driver_section_title?: string | null
          driver_text?: string | null
          faq_a1?: string | null
          faq_a2?: string | null
          faq_a3?: string | null
          faq_a4?: string | null
          faq_q1?: string | null
          faq_q2?: string | null
          faq_q3?: string | null
          faq_q4?: string | null
          faq_title?: string | null
          gallery_section_title?: string | null
          hero_image_url?: string | null
          highlight_1_icon?: string | null
          highlight_1_text?: string | null
          highlight_1_title?: string | null
          highlight_2_icon?: string | null
          highlight_2_text?: string | null
          highlight_2_title?: string | null
          highlight_3_icon?: string | null
          highlight_3_text?: string | null
          highlight_3_title?: string | null
          highlight_4_icon?: string | null
          highlight_4_text?: string | null
          highlight_4_title?: string | null
          highlight_5_icon?: string | null
          highlight_5_text?: string | null
          highlight_5_title?: string | null
          highlight_6_icon?: string | null
          highlight_6_text?: string | null
          highlight_6_title?: string | null
          how_it_works_subtitle?: string | null
          how_it_works_title?: string | null
          id?: string
          intro_text?: string | null
          page_subtitle?: string | null
          page_title?: string | null
          photo_2_url?: string | null
          photo_3_url?: string | null
          photo_4_url?: string | null
          photo_main_url?: string | null
          pricing_text?: string | null
          pricing_title?: string | null
          safety_text?: string | null
          safety_title?: string | null
          step_1_text?: string | null
          step_1_title?: string | null
          step_2_text?: string | null
          step_2_title?: string | null
          step_3_text?: string | null
          step_3_title?: string | null
          step_4_text?: string | null
          step_4_title?: string | null
          testimonial_author?: string | null
          testimonial_text?: string | null
          testimonial_title?: string | null
          updated_at?: string | null
          whatsapp_message?: string | null
        }
        Update: {
          coverage_neighborhoods?: string | null
          coverage_text?: string | null
          coverage_title?: string | null
          cta_btn_text?: string | null
          cta_title?: string | null
          description_text?: string | null
          driver_name?: string | null
          driver_section_title?: string | null
          driver_text?: string | null
          faq_a1?: string | null
          faq_a2?: string | null
          faq_a3?: string | null
          faq_a4?: string | null
          faq_q1?: string | null
          faq_q2?: string | null
          faq_q3?: string | null
          faq_q4?: string | null
          faq_title?: string | null
          gallery_section_title?: string | null
          hero_image_url?: string | null
          highlight_1_icon?: string | null
          highlight_1_text?: string | null
          highlight_1_title?: string | null
          highlight_2_icon?: string | null
          highlight_2_text?: string | null
          highlight_2_title?: string | null
          highlight_3_icon?: string | null
          highlight_3_text?: string | null
          highlight_3_title?: string | null
          highlight_4_icon?: string | null
          highlight_4_text?: string | null
          highlight_4_title?: string | null
          highlight_5_icon?: string | null
          highlight_5_text?: string | null
          highlight_5_title?: string | null
          highlight_6_icon?: string | null
          highlight_6_text?: string | null
          highlight_6_title?: string | null
          how_it_works_subtitle?: string | null
          how_it_works_title?: string | null
          id?: string
          intro_text?: string | null
          page_subtitle?: string | null
          page_title?: string | null
          photo_2_url?: string | null
          photo_3_url?: string | null
          photo_4_url?: string | null
          photo_main_url?: string | null
          pricing_text?: string | null
          pricing_title?: string | null
          safety_text?: string | null
          safety_title?: string | null
          step_1_text?: string | null
          step_1_title?: string | null
          step_2_text?: string | null
          step_2_title?: string | null
          step_3_text?: string | null
          step_3_title?: string | null
          step_4_text?: string | null
          step_4_title?: string | null
          testimonial_author?: string | null
          testimonial_text?: string | null
          testimonial_title?: string | null
          updated_at?: string | null
          whatsapp_message?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      vagas: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          requirements: string | null
          schedule: string | null
          title: string | null
          updated_at: string | null
          whatsapp_message: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          requirements?: string | null
          schedule?: string | null
          title?: string | null
          updated_at?: string | null
          whatsapp_message?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          requirements?: string | null
          schedule?: string | null
          title?: string | null
          updated_at?: string | null
          whatsapp_message?: string | null
        }
        Relationships: []
      }
      video_likes: {
        Row: {
          created_at: string | null
          device_id: string | null
          id: string
          user_identifier: string | null
          video_id: string | null
        }
        Insert: {
          created_at?: string | null
          device_id?: string | null
          id?: string
          user_identifier?: string | null
          video_id?: string | null
        }
        Update: {
          created_at?: string | null
          device_id?: string | null
          id?: string
          user_identifier?: string | null
          video_id?: string | null
        }
        Relationships: []
      }
      videos: {
        Row: {
          aspect_ratio: string | null
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          likes_count: number | null
          locations: string[] | null
          orientation: string | null
          publish_at: string | null
          published_at: string | null
          thumbnail_url: string | null
          title: string | null
          updated_at: string | null
          video_type: string | null
          video_url: string | null
        }
        Insert: {
          aspect_ratio?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          likes_count?: number | null
          locations?: string[] | null
          orientation?: string | null
          publish_at?: string | null
          published_at?: string | null
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string | null
          video_type?: string | null
          video_url?: string | null
        }
        Update: {
          aspect_ratio?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          likes_count?: number | null
          locations?: string[] | null
          orientation?: string | null
          publish_at?: string | null
          published_at?: string | null
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string | null
          video_type?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_list_tables: {
        Args: never
        Returns: {
          table_name: string
        }[]
      }
      auto_publish_scheduled_media: { Args: never; Returns: undefined }
      has_role: { Args: { _role: string; _user_id: string }; Returns: boolean }
      unlike_video: {
        Args: { _device_id: string; _video_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
