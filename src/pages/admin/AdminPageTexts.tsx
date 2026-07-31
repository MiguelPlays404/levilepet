import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";

const TABS = [
  { key: "global", label: "🌐 Globais", fields: [
    { k: "hero_badge_text", l: "Badge do Hero (Home)" },
    { k: "sobre_badge_text", l: "Badge da seção Quem Somos" },
    { k: "home_explore_title", l: "Título dos cards da Home" },
    { k: "home_explore_subtitle", l: "Subtítulo dos cards da Home" },
    { k: "home_card_cta_text", l: "Texto do link nos cards" },
    { k: "cta_hotel_badge_text", l: "Badge do CTA Hotelzinho" },
    { k: "contact_section_title", l: "Título da seção de contato (Home)" },
    { k: "contact_fixed_phone_title", l: "Título do telefone fixo (Home)" },
    { k: "contact_fixed_phone_btn_text", l: "Botão do telefone fixo (Home)" },
    { k: "siganos_footer_text", l: "Texto pé da página Siga-nos" },
  ]},
  { key: "fotos", label: "Fotos", fields: [
    { k: "fotos_page_title", l: "Título da página" },
    { k: "fotos_page_subtitle", l: "Subtítulo" },
    { k: "fotos_empty_text", l: "Texto quando não há fotos" },
    { k: "fotos_filter_all", l: "Filtro: Todas" },
    { k: "fotos_filter_galeria", l: "Filtro: Galeria" },
    { k: "fotos_filter_hotel", l: "Filtro: Hotelzinho" },
    { k: "fotos_filter_conhecer", l: "Filtro: Nosso Espaço" },
    { k: "gallery_section_title", l: "Título da galeria na home" },
    { k: "gallery_section_subtitle", l: "Subtítulo da galeria na home" },
    { k: "featured_photos_btn_text", l: "Texto do botão 'Ver todas as fotos'" },
  ]},
  { key: "videos", label: "Vídeos", fields: [
    { k: "videos_page_title", l: "Título da página" },
    { k: "videos_page_subtitle", l: "Subtítulo" },
    { k: "videos_empty_text", l: "Texto quando não há vídeos" },
    { k: "videos_likes_label", l: "Rótulo de curtidas" },
    { k: "video_section_title", l: "Título dos vídeos na home" },
    { k: "video_section_subtitle", l: "Subtítulo dos vídeos na home" },
    { k: "featured_videos_btn_text", l: "Texto do botão 'Ver todos os vídeos'" },
  ]},
  { key: "siganos", label: "Siga-nos", fields: [
    { k: "siganos_title", l: "Título da página" },
    { k: "siganos_subtitle", l: "Subtítulo" },
    { k: "instagram_btn_text", l: "Botão Instagram" },
    { k: "whatsapp_btn_text", l: "Botão WhatsApp" },
    { k: "facebook_btn_text", l: "Botão Facebook" },
    { k: "tiktok_btn_text", l: "Botão TikTok" },
    { k: "youtube_btn_text", l: "Botão YouTube" },
  ]},
  { key: "fale", label: "Fale Conosco", fields: [
    { k: "faleconosco_title", l: "Título" },
    { k: "faleconosco_subtitle", l: "Subtítulo" },
    { k: "faleconosco_card_title", l: "Título do card" },
    { k: "faleconosco_card_text", l: "Texto do card" },
    { k: "faleconosco_btn_text", l: "Texto do botão" },
    { k: "faleconosco_info_title", l: "Título 'Informações de Contato'" },
    { k: "faleconosco_visit_text", l: "Texto rodapé 'Venha nos visitar'" },
    { k: "faleconosco_image_url", l: "URL da imagem lateral" },
  ]},
  { key: "loc", label: "Localização", fields: [
    { k: "localizacao_title", l: "Título" },
    { k: "localizacao_subtitle", l: "Subtítulo" },
    { k: "localizacao_howto_title", l: "Título 'Como Chegar'" },
    { k: "localizacao_howto_text", l: "Instruções (como chegar)" },
    { k: "localizacao_maps_btn_text", l: "Botão Maps" },
    { k: "localizacao_route_btn_text", l: "Botão calcular rota" },
  ]},
  { key: "hotel", label: "Hotelzinho", fields: [
    { k: "hotel_cta_title", l: "Título do CTA amarelo" },
    { k: "hotel_gallery_section_title", l: "Título da galeria 'Nosso Espaço'" },
    { k: "hotel_gallery_title", l: "Título seção (extra)" },
    { k: "hotel_videos_title", l: "Título seção vídeos" },
  ]},
  { key: "conhecer", label: "Venha Nos Conhecer", fields: [
    { k: "conhecer_about_title", l: "Título 'Sobre o Le Ville Pet'" },
    { k: "conhecer_gallery_title", l: "Título 'Galeria do Espaço'" },
    { k: "conhecer_cta_title", l: "Título do CTA amarelo" },
    { k: "conhecer_cta_btn_text", l: "Texto do botão CTA" },
  ]},
];

export default function AdminPageTexts() {
  const [tab, setTab] = useState("global");
  const [c, setC] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    supabase.from("site_config").select("*").limit(1).maybeSingle().then(({ data }) => {
      setC(data || {});
      setLoading(false);
    });
  }, []);

  const save = async () => {
    setSaving(true);
    const fields = TABS.flatMap(t => t.fields.map(f => f.k));
    const payload: any = {};
    fields.forEach(f => { payload[f] = c[f]; });
    await supabase.from("site_config").update(payload).neq("id", "00000000-0000-0000-0000-000000000000");
    setSaving(false);
    toast({ title: "✅ Textos salvos!" });
  };

  if (loading) return <AdminLayout title="Textos das Páginas"><p className="text-[#A1A1AA]">Carregando...</p></AdminLayout>;

  const active = TABS.find(t => t.key === tab)!;

  return (
    <AdminLayout title="Textos das Páginas">
      <div className="max-w-3xl">
        <div className="flex gap-1 mb-4 flex-wrap">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-body transition-colors ${tab === t.key ? "bg-primary text-black font-semibold" : "bg-[#18181B] text-[#A1A1AA] hover:text-white"}`}>
              {t.label}
            </button>
          ))}
        </div>

        <section className="bg-[#18181B] rounded-2xl p-6 border border-white/[0.07] space-y-4">
          <h3 className="font-heading font-semibold mb-3">Textos · {active.label}</h3>
          {active.fields.map(f => (
            <div key={f.k}>
              <label className="text-xs text-[#A1A1AA] block mb-1">{f.l}</label>
              <textarea value={c[f.k] || ""} onChange={e => setC({ ...c, [f.k]: e.target.value })} rows={2} className="w-full bg-[#27272A] border border-[#3F3F46] rounded px-3 py-2 text-sm resize-y" />
            </div>
          ))}
        </section>

        <button onClick={save} disabled={saving} className="btn-primary flex items-center gap-2 mt-4"><Save className="w-4 h-4" /> {saving ? "Salvando..." : "Salvar textos"}</button>
      </div>
    </AdminLayout>
  );
}
