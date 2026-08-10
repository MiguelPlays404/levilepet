import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { MediaUploader } from "@/components/MediaUploader";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function AdminConhecer() {
  const [content, setContent] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    supabase.from("conhecer_content").select("*").limit(1).single().then(({ data }) => { if (data) setContent(data); });
    supabase.from("site_config").select("*").limit(1).maybeSingle().then(({ data }) => { if (data) setConfig(data); });
  }, []);

  const handleSave = async () => {
    if (!content) return;
    setSaving(true);
    const { error } = await supabase.from("conhecer_content").update(content).eq("id", content.id);
    if (config?.id) await supabase.from("site_config").update({
      conhecer_hero_image_url: config.conhecer_hero_image_url,
      conhecer_about_title: config.conhecer_about_title,
      conhecer_gallery_title: config.conhecer_gallery_title,
      conhecer_cta_title: config.conhecer_cta_title,
      conhecer_cta_btn_text: config.conhecer_cta_btn_text,
      conhecer_produtos_badge: config.conhecer_produtos_badge,
      conhecer_produtos_title: config.conhecer_produtos_title,
      conhecer_produtos_text: config.conhecer_produtos_text,
      conhecer_produtos_image_url: config.conhecer_produtos_image_url,
    } as any).eq("id", config.id);
    toast({ title: error ? "Erro ao salvar" : "✅ Conteúdo salvo!" });
    setSaving(false);
  };

  if (!content) return <AdminLayout title="Venha Nos Conhecer"><div className="text-[#71717A]">Carregando...</div></AdminLayout>;

  return (
    <AdminLayout title="Venha Nos Conhecer">
      <div className="max-w-2xl space-y-6">
        {config && (
          <div>
            <label className="text-xs text-[#A1A1AA] uppercase tracking-wider font-heading mb-2 block">Imagem ou vídeo do topo da página</label>
            <MediaUploader accept="both" pathPrefix="conhecer/hero" currentUrl={config.conhecer_hero_image_url} onUploaded={(url) => setConfig({ ...config, conhecer_hero_image_url: url })} label="" />
          </div>
        )}
        <div>
          <label className="text-xs text-[#A1A1AA] uppercase tracking-wider font-heading mb-1 block">Título da Página</label>
          <input value={content.page_title || ""} onChange={e => setContent({...content, page_title: e.target.value})} className="w-full bg-[#27272A] border border-[#3F3F46] rounded-lg px-3 py-2 text-sm text-white" />
        </div>
        <div>
          <label className="text-xs text-[#A1A1AA] uppercase tracking-wider font-heading mb-1 block">Subtítulo</label>
          <input value={content.page_subtitle || ""} onChange={e => setContent({...content, page_subtitle: e.target.value})} className="w-full bg-[#27272A] border border-[#3F3F46] rounded-lg px-3 py-2 text-sm text-white" />
        </div>
        <div>
          <label className="text-xs text-[#A1A1AA] uppercase tracking-wider font-heading mb-1 block">Texto de Introdução</label>
          <textarea value={content.intro_text || ""} onChange={e => setContent({...content, intro_text: e.target.value})} rows={3} className="w-full bg-[#27272A] border border-[#3F3F46] rounded-lg px-3 py-2 text-sm text-white resize-y" />
        </div>
        <div>
          <label className="text-xs text-[#A1A1AA] uppercase tracking-wider font-heading mb-1 block">Texto Sobre o Petshop</label>
          <textarea value={content.about_text || ""} onChange={e => setContent({...content, about_text: e.target.value})} rows={6} className="w-full bg-[#27272A] border border-[#3F3F46] rounded-lg px-3 py-2 text-sm text-white resize-y" />
        </div>
        {config && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="text-xs text-[#A1A1AA] uppercase tracking-wider font-heading mb-1 block">Título Sobre</label><input value={config.conhecer_about_title || ""} onChange={e => setConfig({...config, conhecer_about_title: e.target.value})} className="w-full bg-[#27272A] border border-[#3F3F46] rounded-lg px-3 py-2 text-sm text-white" /></div>
            <div><label className="text-xs text-[#A1A1AA] uppercase tracking-wider font-heading mb-1 block">Título Galeria</label><input value={config.conhecer_gallery_title || ""} onChange={e => setConfig({...config, conhecer_gallery_title: e.target.value})} className="w-full bg-[#27272A] border border-[#3F3F46] rounded-lg px-3 py-2 text-sm text-white" /></div>
            <div><label className="text-xs text-[#A1A1AA] uppercase tracking-wider font-heading mb-1 block">Título CTA</label><input value={config.conhecer_cta_title || ""} onChange={e => setConfig({...config, conhecer_cta_title: e.target.value})} className="w-full bg-[#27272A] border border-[#3F3F46] rounded-lg px-3 py-2 text-sm text-white" /></div>
            <div><label className="text-xs text-[#A1A1AA] uppercase tracking-wider font-heading mb-1 block">Botão CTA</label><input value={config.conhecer_cta_btn_text || ""} onChange={e => setConfig({...config, conhecer_cta_btn_text: e.target.value})} className="w-full bg-[#27272A] border border-[#3F3F46] rounded-lg px-3 py-2 text-sm text-white" /></div>
          </div>
        )}

        {config && (
          <div className="border-t border-[#27272A] pt-6">
            <h3 className="font-heading font-semibold text-primary text-sm uppercase tracking-wider mb-4">🛍️ Seção "Produtos que utilizamos"</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-[#A1A1AA] uppercase tracking-wider font-heading mb-2 block">Imagem ou vídeo dos produtos</label>
                <MediaUploader accept="both" pathPrefix="conhecer/produtos" currentUrl={config.conhecer_produtos_image_url} onUploaded={(url) => setConfig({ ...config, conhecer_produtos_image_url: url })} label="" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-xs text-[#A1A1AA] uppercase tracking-wider font-heading mb-1 block">Selo (badge)</label><input value={config.conhecer_produtos_badge || ""} onChange={e => setConfig({...config, conhecer_produtos_badge: e.target.value})} className="w-full bg-[#27272A] border border-[#3F3F46] rounded-lg px-3 py-2 text-sm text-white" /></div>
                <div><label className="text-xs text-[#A1A1AA] uppercase tracking-wider font-heading mb-1 block">Título</label><input value={config.conhecer_produtos_title || ""} onChange={e => setConfig({...config, conhecer_produtos_title: e.target.value})} className="w-full bg-[#27272A] border border-[#3F3F46] rounded-lg px-3 py-2 text-sm text-white" /></div>
              </div>
              <div>
                <label className="text-xs text-[#A1A1AA] uppercase tracking-wider font-heading mb-1 block">Texto descritivo</label>
                <textarea value={config.conhecer_produtos_text || ""} onChange={e => setConfig({...config, conhecer_produtos_text: e.target.value})} rows={5} className="w-full bg-[#27272A] border border-[#3F3F46] rounded-lg px-3 py-2 text-sm text-white resize-y" />
              </div>
            </div>
          </div>
        )}
        <div className="flex gap-3 justify-end pt-4">
          <a href="/venha-nos-conhecer" target="_blank" className="px-4 py-2 text-sm text-[#A1A1AA] hover:text-primary">Ver página ↗</a>
          <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">{saving ? "Salvando..." : "💾 Salvar"}</button>
        </div>
      </div>
    </AdminLayout>
  );
}
