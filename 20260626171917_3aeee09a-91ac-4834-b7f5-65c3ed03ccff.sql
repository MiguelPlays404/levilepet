import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { MediaUploader } from "@/components/MediaUploader";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAutoSave, AutoSaveIndicator } from "@/hooks/useAutoSave";

export default function AdminHotelzinho() {
  const [content, setContent] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    supabase.from("hotelzinho_content").select("*").limit(1).single().then(({ data }) => { if (data) setContent(data); });
    supabase.from("site_config").select("*").limit(1).maybeSingle().then(({ data }) => { if (data) setConfig(data); });
  }, []);

  const handleSave = async () => {
    if (!content) return;
    setSaving(true);
    const { error } = await supabase.from("hotelzinho_content").update(content).eq("id", content.id);
    if (config?.id) await supabase.from("site_config").update({ 
      hotel_hero_image_url: config.hotel_hero_image_url, 
      hotel_gallery_section_title: config.hotel_gallery_section_title, 
      hotel_cta_title: config.hotel_cta_title 
    } as any).eq("id", config.id);
    toast({ title: error ? "Erro ao salvar" : "✅ Conteúdo salvo!" });
    setSaving(false);
  };

  const { status, hasDraft, restoreDraft, clearDraft } = useAutoSave(
    content,
    async (data) => {
      const { error } = await supabase.from("hotelzinho_content").update(data).eq("id", content.id);
      if (error) throw error;
    },
    {
      storageKey: "draft_admin_hotelzinho",
      enabled: !!content,
      onRestore: (draft) => setContent(draft)
    }
  );

  if (!content) return <AdminLayout title="Hotelzinho"><div className="text-[#71717A]">Carregando...</div></AdminLayout>;

  const fields = [
    { key: "page_title", label: "Título da Página", type: "input" },
    { key: "page_subtitle", label: "Subtítulo da Página", type: "input" },
    { key: "intro_text", label: "Texto de Introdução", type: "textarea" },
    { key: "highlight_1_icon", label: "Destaque 1 - Emoji/Ícone", type: "input" },
    { key: "highlight_1_title", label: "Destaque 1 - Título", type: "input" },
    { key: "highlight_1_text", label: "Destaque 1 - Texto", type: "textarea" },
    { key: "highlight_2_icon", label: "Destaque 2 - Emoji/Ícone", type: "input" },
    { key: "highlight_2_title", label: "Destaque 2 - Título", type: "input" },
    { key: "highlight_2_text", label: "Destaque 2 - Texto", type: "textarea" },
    { key: "highlight_3_icon", label: "Destaque 3 - Emoji/Ícone", type: "input" },
    { key: "highlight_3_title", label: "Destaque 3 - Título", type: "input" },
    { key: "highlight_3_text", label: "Destaque 3 - Texto", type: "textarea" },
    { key: "description_block_1", label: "Bloco de Texto 1", type: "textarea" },
    { key: "description_block_2", label: "Bloco de Texto 2 (opcional)", type: "textarea" },
    { key: "description_block_3", label: "Bloco de Texto 3 (opcional)", type: "textarea" },
    { key: "cta_text", label: "Texto do Botão CTA", type: "input" },
    { key: "whatsapp_message", label: "Mensagem WhatsApp (hotelzinho)", type: "textarea" },
  ];

  return (
    <AdminLayout title="Hotelzinho">
      <div className="max-w-2xl space-y-6">
        {config && (
          <div>
            <label className="text-xs text-[#A1A1AA] uppercase tracking-wider font-heading mb-2 block">Imagem ou vídeo do topo da página</label>
            <MediaUploader accept="both" pathPrefix="hotelzinho/hero" currentUrl={config.hotel_hero_image_url} onUploaded={(url) => setConfig({ ...config, hotel_hero_image_url: url })} label="" />
          </div>
        )}
        {fields.map(f => (
          <div key={f.key}>
            <label className="text-xs text-[#A1A1AA] uppercase tracking-wider font-heading mb-1 block">{f.label}</label>
            {f.type === "input" ? (
              <input value={content[f.key] || ""} onChange={e => setContent({ ...content, [f.key]: e.target.value })} className="w-full bg-[#27272A] border border-[#3F3F46] rounded-lg px-3 py-2 text-sm text-white" />
            ) : (
              <textarea value={content[f.key] || ""} onChange={e => setContent({ ...content, [f.key]: e.target.value })} rows={3} className="w-full bg-[#27272A] border border-[#3F3F46] rounded-lg px-3 py-2 text-sm text-white resize-y" />
            )}
          </div>
        ))}
        <div className="flex gap-3 justify-end pt-4">
          <a href="/hotelzinho" target="_blank" className="px-4 py-2 text-sm text-[#A1A1AA] hover:text-primary">Ver página ↗</a>
          <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">{saving ? "Salvando..." : "💾 Salvar"}</button>
        </div>
      </div>
      <AutoSaveIndicator 
        status={status} 
        hasDraft={hasDraft} 
        onRestore={restoreDraft} 
        onClear={clearDraft} 
      />
    </AdminLayout>
  );
}
