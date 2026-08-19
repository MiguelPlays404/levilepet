import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { MediaUploader } from "@/components/MediaUploader";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Trash2, ArrowUp, ArrowDown, Eye, EyeOff } from "lucide-react";
import { useAutoSave, AutoSaveIndicator } from "@/hooks/useAutoSave";
import { invalidateCache } from "@/lib/dataCache";

const ICON_OPTIONS = ["Truck", "Shield", "Heart", "Clock", "MapPin", "PawPrint", "Snowflake", "Star", "CheckCircle", "Phone", "Calendar", "Home"];

const normalizeLocations = (p: any) =>
  Array.from(new Set([...(Array.isArray(p.locations) ? p.locations : []), p.category].filter(Boolean)));

export default function AdminTransporte() {
  const [content, setContent] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const loadPhotos = async () => {
    const { data } = await supabase.from("photos").select("*").order("display_order").order("created_at", { ascending: false });
    setPhotos((data || []).filter((p: any) => normalizeLocations(p).includes("transporte")));
  };

  useEffect(() => {
    supabase.from("transporte_content").select("*").limit(1).maybeSingle().then(({ data }) => setContent(data));
    loadPhotos();
  }, []);

  const handleSave = async () => {
    if (!content) return;
    setSaving(true);
    const { id, updated_at, ...rest } = content;
    const { error } = await supabase.from("transporte_content").update(rest).eq("id", id);
    invalidateCache("transporte_content");
    toast({ title: error ? "Erro ao salvar" : "✅ Salvo!" });
    setSaving(false);
  };

  const { status, hasDraft, restoreDraft, clearDraft } = useAutoSave(
    content,
    async (data) => {
      const { id, updated_at, ...rest } = data;
      const { error } = await supabase.from("transporte_content").update(rest).eq("id", id);
      if (error) throw error;
      invalidateCache("transporte_content");
    },
    {
      storageKey: "draft_admin_transporte",
      enabled: !!content,
      onRestore: (draft) => setContent(draft)
    }
  );

  if (!content) return <AdminLayout title="Transporte"><div className="text-[#71717A]">Carregando...</div></AdminLayout>;

  const set = (k: string, v: any) => setContent({ ...content, [k]: v });

  // ---- Extra photos handlers (uses photos table, location = 'transporte') ----
  const handlePhotoUpload = async (url: string) => {
    if (!url) return;
    const fileName = url.split("/").pop()?.split(".")[0] || "Transporte";
    await supabase.from("photos").insert({
      title: fileName,
      image_url: url,
      category: "transporte",
      locations: ["transporte"],
    } as any);
    invalidateCache("photos_active");
    toast({ title: "✅ Foto adicionada" });
    loadPhotos();
  };

  const updatePhotoTitle = async (id: string, title: string) => {
    setPhotos(prev => prev.map(p => p.id === id ? { ...p, title } : p));
  };

  const savePhotoTitle = async (p: any) => {
    await supabase.from("photos").update({ title: p.title }).eq("id", p.id);
    invalidateCache("photos_active");
  };

  const togglePhoto = async (p: any) => {
    await supabase.from("photos").update({ is_active: !p.is_active }).eq("id", p.id);
    invalidateCache("photos_active");
    loadPhotos();
  };

  const reorderPhoto = async (p: any, dir: -1 | 1) => {
    await supabase.from("photos").update({ display_order: (p.display_order || 0) + dir }).eq("id", p.id);
    invalidateCache("photos_active");
    loadPhotos();
  };

  const deletePhoto = async (p: any) => {
    if (!confirm(`Excluir "${p.title}"?`)) return;
    if (p.image_url?.includes("/levillepet-media/")) {
      const path = p.image_url.split("/levillepet-media/")[1];
      if (path) await supabase.storage.from("levillepet-media").remove([path]);
    }
    await supabase.from("photos").delete().eq("id", p.id);
    invalidateCache("photos_active");
    toast({ title: "✅ Removida" });
    loadPhotos();
  };

  // ---- Field groups ----
  type F = { key: string; label: string; type?: "input" | "textarea" | "select"; options?: string[] };
  const groups: { title: string; fields: F[] }[] = [
    {
      title: "Topo da página",
      fields: [
        { key: "page_title", label: "Título" },
        { key: "page_subtitle", label: "Subtítulo" },
        { key: "intro_text", label: "Texto de introdução", type: "textarea" },
      ],
    },
    {
      title: "Selos / Diferenciais (6)",
      fields: ([1, 2, 3, 4, 5, 6] as const).flatMap(n => [
        { key: `highlight_${n}_icon`, label: `Selo ${n} - Ícone`, type: "select" as const, options: ICON_OPTIONS },
        { key: `highlight_${n}_title`, label: `Selo ${n} - Título` },
        { key: `highlight_${n}_text`, label: `Selo ${n} - Texto`, type: "textarea" as const },
      ]),
    },
    {
      title: "Descrição do serviço",
      fields: [{ key: "description_text", label: "Texto", type: "textarea" }],
    },
    {
      title: "Como funciona (4 passos)",
      fields: [
        { key: "how_it_works_title", label: "Título da seção" },
        { key: "how_it_works_subtitle", label: "Subtítulo" },
        ...([1, 2, 3, 4] as const).flatMap(n => [
          { key: `step_${n}_title`, label: `Passo ${n} - Título` },
          { key: `step_${n}_text`, label: `Passo ${n} - Texto`, type: "textarea" as const },
        ]),
      ],
    },
    {
      title: "Tio João (motorista)",
      fields: [
        { key: "driver_section_title", label: "Título da seção" },
        { key: "driver_name", label: "Nome do motorista" },
        { key: "driver_text", label: "Texto sobre o motorista", type: "textarea" },
      ],
    },
    {
      title: "Segurança",
      fields: [
        { key: "safety_title", label: "Título" },
        { key: "safety_text", label: "Texto", type: "textarea" },
      ],
    },
    {
      title: "Cobertura / Onde atendemos",
      fields: [
        { key: "coverage_title", label: "Título" },
        { key: "coverage_text", label: "Texto", type: "textarea" },
        { key: "coverage_neighborhoods", label: "Bairros (separe com · ponto-mediano)", type: "textarea" },
      ],
    },
    {
      title: "Galeria",
      fields: [{ key: "gallery_section_title", label: "Título da galeria" }],
    },
    {
      title: "Preços",
      fields: [
        { key: "pricing_title", label: "Título" },
        { key: "pricing_text", label: "Texto", type: "textarea" },
      ],
    },
    {
      title: "Depoimento",
      fields: [
        { key: "testimonial_title", label: "Título da seção" },
        { key: "testimonial_text", label: "Depoimento", type: "textarea" },
        { key: "testimonial_author", label: "Autor do depoimento" },
      ],
    },
    {
      title: "FAQ (4 perguntas)",
      fields: [
        { key: "faq_title", label: "Título da seção" },
        ...([1, 2, 3, 4] as const).flatMap(n => [
          { key: `faq_q${n}`, label: `Pergunta ${n}` },
          { key: `faq_a${n}`, label: `Resposta ${n}`, type: "textarea" as const },
        ]),
      ],
    },
    {
      title: "Chamada final (CTA)",
      fields: [
        { key: "cta_title", label: "Título" },
        { key: "cta_btn_text", label: "Texto do botão" },
        { key: "whatsapp_message", label: "Mensagem do WhatsApp", type: "textarea" },
      ],
    },
  ];

  const renderField = (f: F) => (
    <div key={f.key}>
      <label className="text-xs text-[#A1A1AA] uppercase tracking-wider font-heading mb-1 block">{f.label}</label>
      {f.type === "textarea" ? (
        <textarea value={content[f.key] || ""} onChange={e => set(f.key, e.target.value)} rows={3} className="w-full bg-[#27272A] border border-[#3F3F46] rounded-lg px-3 py-2 text-sm text-white resize-y" />
      ) : f.type === "select" ? (
        <select value={content[f.key] || ""} onChange={e => set(f.key, e.target.value)} className="w-full bg-[#27272A] border border-[#3F3F46] rounded-lg px-3 py-2 text-sm text-white">
          {(f.options || []).map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input value={content[f.key] || ""} onChange={e => set(f.key, e.target.value)} className="w-full bg-[#27272A] border border-[#3F3F46] rounded-lg px-3 py-2 text-sm text-white" />
      )}
    </div>
  );

  return (
    <AdminLayout title="Transporte">
      <div className="max-w-3xl space-y-8 pb-24">
        {/* Hero + main photo */}
        <section className="bg-[#18181B] rounded-2xl p-6 border border-white/[0.07] space-y-5">
          <h2 className="font-heading font-bold text-white">Imagens principais</h2>
          <div>
            <label className="text-xs text-[#A1A1AA] uppercase tracking-wider font-heading mb-2 block">Imagem/Vídeo do topo (Hero)</label>
            <MediaUploader accept="both" pathPrefix="transporte/hero" currentUrl={content.hero_image_url} onUploaded={(url) => set("hero_image_url", url)} label="" />
            {content.hero_image_url && <button onClick={() => set("hero_image_url", "")} className="text-xs text-red-400 hover:text-red-300 mt-1">Remover</button>}
          </div>
          <div>
            <label className="text-xs text-[#A1A1AA] uppercase tracking-wider font-heading mb-2 block">Foto principal (motorista + veículo)</label>
            <MediaUploader accept="image" pathPrefix="transporte/main" currentUrl={content.photo_main_url} onUploaded={(url) => set("photo_main_url", url)} label="" />
            {content.photo_main_url && <button onClick={() => set("photo_main_url", "")} className="text-xs text-red-400 hover:text-red-300 mt-1">Remover</button>}
          </div>
        </section>

        {/* Text groups */}
        {groups.map(g => (
          <section key={g.title} className="bg-[#18181B] rounded-2xl p-6 border border-white/[0.07] space-y-4">
            <h2 className="font-heading font-bold text-white">{g.title}</h2>
            {g.fields.map(renderField)}
          </section>
        ))}

        {/* Extra photos — unlimited */}
        <section className="bg-[#18181B] rounded-2xl p-6 border border-white/[0.07] space-y-4">
          <div className="flex items-baseline justify-between">
            <h2 className="font-heading font-bold text-white">Galeria extra (ilimitada)</h2>
            <span className="text-xs text-[#71717A]">{photos.length} foto{photos.length !== 1 ? "s" : ""}</span>
          </div>
          <p className="text-xs text-[#A1A1AA]">Adicione quantas fotos quiser. Cada uma pode ter um nome personalizado.</p>
          <MediaUploader accept="image" pathPrefix="transporte/extras" onUploaded={handlePhotoUpload} label="" />

          {photos.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              {photos.map((p, idx) => (
                <div key={p.id} className={`bg-[#0F0F11] rounded-xl overflow-hidden border ${p.is_active ? "border-[#27272A]" : "border-red-500/40 opacity-60"}`}>
                  <div className="relative aspect-[4/3] bg-black">
                    <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }} />
                    <span className="absolute top-2 left-2 bg-primary text-black text-[10px] font-bold px-2 py-0.5 rounded">#{idx + 1}</span>
                    {!p.is_active && <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">OCULTA</span>}
                  </div>
                  <div className="p-3 space-y-2">
                    <input
                      value={p.title || ""}
                      onChange={e => updatePhotoTitle(p.id, e.target.value)}
                      onBlur={() => savePhotoTitle(p)}
                      placeholder="Nome da foto"
                      className="w-full bg-[#27272A] border border-[#3F3F46] rounded px-2 py-1.5 text-xs text-white"
                    />
                    <div className="flex items-center gap-1">
                      <button onClick={() => reorderPhoto(p, -1)} title="Subir" className="flex-1 py-1.5 rounded bg-[#27272A] hover:bg-primary/30 text-white"><ArrowUp className="w-3 h-3 mx-auto" /></button>
                      <button onClick={() => reorderPhoto(p, 1)} title="Descer" className="flex-1 py-1.5 rounded bg-[#27272A] hover:bg-primary/30 text-white"><ArrowDown className="w-3 h-3 mx-auto" /></button>
                      <button onClick={() => togglePhoto(p)} title={p.is_active ? "Ocultar" : "Mostrar"} className="flex-1 py-1.5 rounded bg-[#27272A] hover:bg-white/10 text-white">{p.is_active ? <Eye className="w-3 h-3 mx-auto text-green-400" /> : <EyeOff className="w-3 h-3 mx-auto text-red-400" />}</button>
                      <button onClick={() => deletePhoto(p)} title="Excluir" className="px-3 py-1.5 rounded bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Save bar */}
        <div className="flex gap-3 justify-end pt-4 sticky bottom-0 bg-[#09090B] py-3 z-10">
          <a href="/transporte" target="_blank" className="px-4 py-2 text-sm text-[#A1A1AA] hover:text-primary">Ver página ↗</a>
          <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">{saving ? "Salvando..." : "💾 Salvar textos"}</button>
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
