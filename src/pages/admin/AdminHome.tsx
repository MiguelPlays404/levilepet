import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { MediaUploader } from "@/components/MediaUploader";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAutoSave, AutoSaveIndicator } from "@/hooks/useAutoSave";
import { invalidateCache } from "@/lib/dataCache";

const HOME_TABS = [
  { key: "hero", label: "Hero" },
  { key: "sobre", label: "Quem Somos" },
  { key: "midia", label: "Galeria & Vídeo" },
  { key: "cards", label: "Cards" },
  { key: "cta", label: "CTA Hotelzinho" },
  { key: "contato", label: "Contato" },
];

type FieldProps = { label: string; field: string; max?: number; textarea?: boolean; config: any; setConfig: (v: any) => void };
const Field = ({ label, field, max, textarea, config, setConfig }: FieldProps) => (
  <div>
    <label className="text-xs text-[#A1A1AA] uppercase tracking-wider font-heading mb-1 block">{label} {max && `(${(config[field] || '').length}/${max})`}</label>
    {textarea ? (
      <textarea value={config[field] || ""} onChange={e => setConfig({ ...config, [field]: e.target.value })} maxLength={max} rows={3} className="w-full bg-[#27272A] border border-[#3F3F46] rounded-lg px-4 py-3 text-white text-sm focus:border-primary outline-none transition-colors resize-none" />
    ) : (
      <input value={config[field] || ""} onChange={e => setConfig({ ...config, [field]: e.target.value })} maxLength={max} className="w-full bg-[#27272A] border border-[#3F3F46] rounded-lg px-4 py-3 text-white text-sm focus:border-primary outline-none transition-colors" />
    )}
  </div>
);

export default function AdminHome() {
  const { toast } = useToast();
  const [config, setConfig] = useState<any>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [saving, setSaving] = useState("");
  const [editSection, setEditSection] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("hero");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const { data: cfg } = await supabase.from("site_config").select("*").limit(1).single();
    if (cfg) setConfig(cfg);
    const { data: secs } = await supabase.from("home_sections").select("*").order("display_order");
    setSections(secs || []);
  };

  const saveFields = async (fields: Record<string, any>, label: string) => {
    if (!config?.id) return;
    setSaving(label);
    const { error } = await supabase.from("site_config").update(fields as any).eq("id", config.id);
    setSaving("");
    if (!error) {
      invalidateCache("site_config");
      toast({ title: `✅ ${label} salvo!` });
      setConfig((prev: any) => ({ ...prev, ...fields }));
      return true;
    } else {
      toast({ title: "Erro ao salvar", variant: "destructive" });
      return false;
    }
  };

  const { status, hasDraft, restoreDraft, clearDraft } = useAutoSave(
    config,
    async (data) => {
      const { error } = await supabase.from("site_config").update(data).eq("id", config.id);
      if (error) throw error;
      invalidateCache("site_config");
    },
    {
      storageKey: "draft_admin_home",
      enabled: !!config,
      onRestore: (draft) => setConfig(draft)
    }
  );

  const toggleSection = async (id: string, active: boolean) => {
    await supabase.from("home_sections").update({ is_active: !active }).eq("id", id);
    invalidateCache("home_sections");
    loadData();
    toast({ title: `Seção ${!active ? "ativada" : "desativada"}` });
  };

  const saveSection = async () => {
    if (!editSection) return;
    await supabase.from("home_sections").update({ title: editSection.title, description: editSection.description }).eq("id", editSection.id);
    invalidateCache("home_sections");
    toast({ title: "✅ Card atualizado!" });
    setEditSection(null);
    loadData();
  };

  if (!config) return <AdminLayout title="🏠 Gerenciar Home"><div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full" style={{ animation: 'spinSmooth 1s linear infinite' }} /></div></AdminLayout>;

  const SaveBtn = ({ label, fields }: { label: string; fields: string[] }) => (
    <button onClick={() => saveFields(Object.fromEntries(fields.map(f => [f, config[f]])), label)} disabled={saving === label} className="bg-primary text-black font-heading font-bold px-6 py-2.5 rounded-lg hover:bg-primary-vibrant transition-colors disabled:opacity-50">
      {saving === label ? "Salvando..." : `💾 Salvar ${label}`}
    </button>
  );
  const cfgProps = { config, setConfig };

  return (
    <AdminLayout title="🏠 Gerenciar Home">
      <div className="sticky top-0 z-20 bg-[#09090B]/95 backdrop-blur border-b border-white/[0.07] -mx-8 px-8 py-4 mb-6 flex gap-2 overflow-x-auto">
        {HOME_TABS.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} className={`px-4 py-2 rounded-lg text-sm font-heading whitespace-nowrap transition-colors ${activeTab === t.key ? "bg-primary text-black" : "bg-[#18181B] text-[#A1A1AA] hover:text-white"}`}>{t.label}</button>
        ))}
      </div>

      {/* Hero Editor */}
      <div className={`${activeTab === "hero" ? "block" : "hidden"} bg-[#18181B] rounded-2xl p-6 border border-white/[0.07] mb-6`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-semibold text-white">Editor do Hero</h2>
          <a href="/" target="_blank" className="text-xs text-primary hover:underline">Ver página →</a>
        </div>
        <div className="space-y-4">
          <Field {...cfgProps} label="Título Principal" field="hero_title" max={80} />
            <Field {...cfgProps} label="Badge do Hero" field="hero_badge_text" />
          <Field {...cfgProps} label="Palavra em Destaque (amarela)" field="hero_highlight_word" />
          <Field {...cfgProps} label="Subtítulo" field="hero_subtitle" max={200} textarea />
            <div>
              <label className="text-xs text-[#A1A1AA] uppercase tracking-wider font-heading mb-2 block">Imagem ou vídeo de fundo do Hero</label>
              <MediaUploader accept="both" pathPrefix="home/hero" currentUrl={config.hero_bg_image_url} onUploaded={(url) => setConfig({...config, hero_bg_image_url: url})} label="" />
            </div>
          <div className="grid grid-cols-2 gap-4">
            <Field {...cfgProps} label="Texto Botão Primário" field="hero_btn_primary_text" />
            <Field {...cfgProps} label="Texto Botão Secundário" field="hero_btn_secondary_text" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Field {...cfgProps} label="Stat 1 Número" field="hero_stat_1_num" />
            <Field {...cfgProps} label="Stat 1 Label" field="hero_stat_1_label" />
            <div />
            <Field {...cfgProps} label="Stat 2 Número" field="hero_stat_2_num" />
            <Field {...cfgProps} label="Stat 2 Label" field="hero_stat_2_label" />
            <div />
            <Field {...cfgProps} label="Stat 3 Número" field="hero_stat_3_num" />
            <Field {...cfgProps} label="Stat 3 Label" field="hero_stat_3_label" />
          </div>
          <SaveBtn label="Hero" fields={["hero_title","hero_badge_text","hero_highlight_word","hero_subtitle","hero_bg_image_url","hero_btn_primary_text","hero_btn_secondary_text","hero_stat_1_num","hero_stat_1_label","hero_stat_2_num","hero_stat_2_label","hero_stat_3_num","hero_stat_3_label"]} />
        </div>
      </div>

      {/* Sobre Editor */}
      <div className={`${activeTab === "sobre" ? "block" : "hidden"} bg-[#18181B] rounded-2xl p-6 border border-white/[0.07] mb-6`}>
        <h2 className="font-heading font-semibold text-white mb-4">Sobre o Petshop (Quem Somos)</h2>
        <div className="space-y-4">
          <Field {...cfgProps} label="Título da Seção" field="sobre_title" />
          <Field {...cfgProps} label="Badge da Seção" field="sobre_badge_text" />
          <Field {...cfgProps} label="Texto de Apresentação" field="sobre_text" textarea />
          <Field {...cfgProps} label="Texto do CTA" field="sobre_cta_text" />
          <div>
            <label className="text-xs text-[#A1A1AA] uppercase tracking-wider font-heading mb-2 block">📷 Imagem ou vídeo da Seção (Quem Somos)</label>
            <MediaUploader accept="both" pathPrefix="home/sobre" currentUrl={config.sobre_image_url} onUploaded={(url) => setConfig({...config, sobre_image_url: url})} label="" />
          </div>
          <SaveBtn label="Sobre" fields={["sobre_title","sobre_badge_text","sobre_text","sobre_cta_text","sobre_image_url"]} />
        </div>
      </div>

      {/* Gallery/Video Section Titles */}
      <div className={`${activeTab === "midia" ? "grid" : "hidden"} grid-cols-1 lg:grid-cols-2 gap-6 mb-6`}>
        <div className="bg-[#18181B] rounded-2xl p-6 border border-white/[0.07]">
          <h2 className="font-heading font-semibold text-white mb-4">Seção Galeria</h2>
          <div className="space-y-4">
            <Field {...cfgProps} label="Título" field="gallery_section_title" />
            <Field {...cfgProps} label="Subtítulo" field="gallery_section_subtitle" />
            <Field {...cfgProps} label="Texto do Botão" field="featured_photos_btn_text" />
            <SaveBtn label="Galeria" fields={["gallery_section_title","gallery_section_subtitle","featured_photos_btn_text"]} />
          </div>
        </div>
        <div className="bg-[#18181B] rounded-2xl p-6 border border-white/[0.07]">
          <h2 className="font-heading font-semibold text-white mb-4">Seção Vídeo</h2>
          <div className="space-y-4">
            <Field {...cfgProps} label="Título" field="video_section_title" />
            <Field {...cfgProps} label="Subtítulo" field="video_section_subtitle" />
            <Field {...cfgProps} label="Texto do Botão" field="featured_videos_btn_text" />
            <SaveBtn label="Vídeo" fields={["video_section_title","video_section_subtitle","featured_videos_btn_text"]} />
          </div>
        </div>
      </div>

      <div className={`${activeTab === "cards" ? "block" : "hidden"} bg-[#18181B] rounded-2xl p-6 border border-white/[0.07] mb-6`}>
        <h2 className="font-heading font-semibold text-white mb-4">Seção de Cards da Home</h2>
        <div className="space-y-4">
          <Field {...cfgProps} label="Título" field="home_explore_title" />
          <Field {...cfgProps} label="Subtítulo" field="home_explore_subtitle" />
          <Field {...cfgProps} label="Texto do Link" field="home_card_cta_text" />
          <SaveBtn label="Cards" fields={["home_explore_title","home_explore_subtitle","home_card_cta_text"]} />
        </div>
      </div>

      {/* CTA Hotel */}
      <div className={`${activeTab === "cta" ? "block" : "hidden"} bg-[#18181B] rounded-2xl p-6 border border-white/[0.07] mb-6`}>
        <h2 className="font-heading font-semibold text-white mb-4">CTA Hotelzinho (faixa amarela)</h2>
        <div className="space-y-4">
          <Field {...cfgProps} label="Título" field="cta_hotel_title" />
          <Field {...cfgProps} label="Badge" field="cta_hotel_badge_text" />
          <Field {...cfgProps} label="Texto Descritivo" field="cta_hotel_text" textarea />
          <div className="grid grid-cols-2 gap-4">
            <Field {...cfgProps} label="Botão 1" field="cta_hotel_btn1_text" />
            <Field {...cfgProps} label="Botão 2" field="cta_hotel_btn2_text" />
          </div>
          <div>
            <label className="text-xs text-[#A1A1AA] uppercase tracking-wider font-heading mb-2 block">📷 Imagem ou vídeo da Faixa CTA</label>
            <MediaUploader accept="both" pathPrefix="home/cta-hotel" currentUrl={config.cta_hotel_image_url} onUploaded={(url) => setConfig({...config, cta_hotel_image_url: url})} label="" />
          </div>
          <SaveBtn label="CTA Hotel" fields={["cta_hotel_title","cta_hotel_badge_text","cta_hotel_text","cta_hotel_btn1_text","cta_hotel_btn2_text","cta_hotel_image_url"]} />
        </div>
      </div>

      {/* Contact Buttons */}
      <div className={`${activeTab === "contato" ? "block" : "hidden"} bg-[#18181B] rounded-2xl p-6 border border-white/[0.07] mb-6`}>
        <h2 className="font-heading font-semibold text-white mb-4">Textos dos Botões de Contato</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field {...cfgProps} label="Título da Seção" field="contact_section_title" />
          <Field {...cfgProps} label="Botão WhatsApp" field="contact_whatsapp_btn_text" />
          <Field {...cfgProps} label="Título Telefone Fixo" field="contact_fixed_phone_title" />
          <Field {...cfgProps} label="Botão Telefone Fixo" field="contact_fixed_phone_btn_text" />
          <Field {...cfgProps} label="Botão Mapa" field="contact_maps_btn_text" />
          <Field {...cfgProps} label="Botão Instagram" field="contact_instagram_btn_text" />
        </div>
        <div className="mt-4">
          <SaveBtn label="Contato" fields={["contact_section_title","contact_whatsapp_btn_text","contact_fixed_phone_title","contact_fixed_phone_btn_text","contact_maps_btn_text","contact_instagram_btn_text"]} />
        </div>
      </div>

      {/* Home Sections / Cards */}
      <div className={`${activeTab === "cards" ? "block" : "hidden"} bg-[#18181B] rounded-2xl p-6 border border-white/[0.07]`}>
        <h2 className="font-heading font-semibold text-white mb-4">Cards das Páginas</h2>
        <div className="space-y-3">
          {sections.map((s) => (
            <div key={s.id} className="flex items-center justify-between bg-[#27272A] rounded-xl px-4 py-3 border border-[#3F3F46]">
              <div className="flex-1 cursor-pointer" onClick={() => setEditSection({ ...s })}>
                <p className="text-white text-sm font-heading font-semibold">{s.title}</p>
                <p className="text-[#71717A] text-xs">{s.description}</p>
              </div>
              <button onClick={() => toggleSection(s.id, s.is_active)} className={`px-3 py-1.5 rounded-lg text-xs font-heading font-semibold transition-colors ${s.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {s.is_active ? "Ativo" : "Inativo"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Section Modal */}
      {editSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={() => setEditSection(null)}>
          <div className="bg-[#18181B] rounded-2xl p-6 max-w-md w-full mx-4 border border-[#3F3F46]" onClick={e => e.stopPropagation()}>
            <h3 className="font-heading font-bold text-white mb-4">Editar Card</h3>
            <div className="space-y-4">
              <div><label className="text-xs text-[#A1A1AA] mb-1 block">Título</label><input value={editSection.title} onChange={e => setEditSection({...editSection, title: e.target.value})} className="w-full bg-[#27272A] border border-[#3F3F46] rounded-lg px-3 py-2 text-sm text-white" /></div>
              <div><label className="text-xs text-[#A1A1AA] mb-1 block">Descrição</label><textarea value={editSection.description} onChange={e => setEditSection({...editSection, description: e.target.value})} rows={3} className="w-full bg-[#27272A] border border-[#3F3F46] rounded-lg px-3 py-2 text-sm text-white resize-none" /></div>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setEditSection(null)} className="px-4 py-2 text-sm text-[#A1A1AA]">Cancelar</button>
                <button onClick={saveSection} className="btn-primary text-sm">Salvar</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <AutoSaveIndicator 
        status={status} 
        hasDraft={hasDraft} 
        onRestore={restoreDraft} 
        onClear={clearDraft} 
      />
    </AdminLayout>
  );
}
