import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { MediaUploader } from "@/components/MediaUploader";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, GripVertical } from "lucide-react";

export default function AdminVagas() {
  const { toast } = useToast();
  const [config, setConfig] = useState<any>(null);
  const [vagas, setVagas] = useState<any[]>([]);
  const [saving, setSaving] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    const { data: cfg } = await supabase.from("site_config").select("*").limit(1).maybeSingle();
    if (cfg) setConfig(cfg);
    const { data: vs } = await supabase.from("vagas").select("*").order("display_order");
    setVagas(vs || []);
    setLoading(false);
  };

  const saveSectionFields = async () => {
    if (!config?.id) return;
    setSaving("section");
    const { error } = await supabase.from("site_config").update({
      vagas_section_active: config.vagas_section_active,
      vagas_section_title: config.vagas_section_title,
      vagas_section_subtitle: config.vagas_section_subtitle,
      vagas_section_badge: config.vagas_section_badge,
      vagas_section_image_url: config.vagas_section_image_url,
    } as any).eq("id", config.id);
    setSaving("");
    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "✅ Seção salva!" });
    }
  };

  const addVaga = async () => {
    const { error } = await supabase.from("vagas").insert({
      title: "Nova Vaga",
      schedule: "",
      requirements: "",
      whatsapp_message: "Olá! Vim pelo site do Le Ville Pet e tenho interesse na vaga.",
      display_order: vagas.length,
      is_active: true,
    });
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else { toast({ title: "✅ Vaga adicionada!" }); loadData(); }
  };

  const saveVaga = async (vaga: any) => {
    setSaving(vaga.id);
    const { error } = await supabase.from("vagas").update({
      title: vaga.title,
      schedule: vaga.schedule,
      requirements: vaga.requirements,
      whatsapp_message: vaga.whatsapp_message,
      is_active: vaga.is_active,
      display_order: vaga.display_order,
    }).eq("id", vaga.id);
    setSaving("");
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else toast({ title: "✅ Vaga salva!" });
  };

  const deleteVaga = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover essa vaga?")) return;
    await supabase.from("vagas").delete().eq("id", id);
    toast({ title: "Vaga removida" });
    loadData();
  };

  const updateLocal = (id: string, patch: any) => {
    setVagas(vs => vs.map(v => v.id === id ? { ...v, ...patch } : v));
  };

  if (loading || !config) return <AdminLayout title="💼 Vagas / Trabalhe Conosco"><div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full" style={{ animation: 'spinSmooth 1s linear infinite' }} /></div></AdminLayout>;

  return (
    <AdminLayout title="💼 Vagas / Trabalhe Conosco">
      {/* Seção config */}
      <div className="bg-[#18181B] rounded-2xl p-6 border border-white/[0.07] mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-semibold text-white">Configuração da Seção</h2>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={!!config.vagas_section_active}
              onChange={(e) => setConfig({ ...config, vagas_section_active: e.target.checked })}
              className="w-4 h-4 accent-primary"
            />
            <span className="text-sm text-white font-heading">{config.vagas_section_active ? "Seção Ativa" : "Seção Desativada"}</span>
          </label>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-[#A1A1AA] uppercase tracking-wider font-heading mb-1 block">Badge</label>
              <input value={config.vagas_section_badge || ""} onChange={e => setConfig({ ...config, vagas_section_badge: e.target.value })} className="w-full bg-[#27272A] border border-[#3F3F46] rounded-lg px-4 py-3 text-white text-sm focus:border-primary outline-none" />
            </div>
            <div>
              <label className="text-xs text-[#A1A1AA] uppercase tracking-wider font-heading mb-1 block">Título</label>
              <input value={config.vagas_section_title || ""} onChange={e => setConfig({ ...config, vagas_section_title: e.target.value })} className="w-full bg-[#27272A] border border-[#3F3F46] rounded-lg px-4 py-3 text-white text-sm focus:border-primary outline-none" />
            </div>
            <div>
              <label className="text-xs text-[#A1A1AA] uppercase tracking-wider font-heading mb-1 block">Subtítulo</label>
              <input value={config.vagas_section_subtitle || ""} onChange={e => setConfig({ ...config, vagas_section_subtitle: e.target.value })} className="w-full bg-[#27272A] border border-[#3F3F46] rounded-lg px-4 py-3 text-white text-sm focus:border-primary outline-none" />
            </div>
          </div>
          <div>
            <label className="text-xs text-[#A1A1AA] uppercase tracking-wider font-heading mb-2 block">📷 Imagem em destaque (clicável e expansível na home)</label>
            <MediaUploader accept="image" pathPrefix="home/vagas" currentUrl={config.vagas_section_image_url} onUploaded={(url) => setConfig({ ...config, vagas_section_image_url: url })} label="" />
          </div>
          <button onClick={saveSectionFields} disabled={saving === "section"} className="bg-primary text-black font-heading font-bold px-6 py-2.5 rounded-lg hover:bg-primary-vibrant transition-colors disabled:opacity-50">
            {saving === "section" ? "Salvando..." : "💾 Salvar Seção"}
          </button>
        </div>
      </div>

      {/* Lista de vagas */}
      <div className="bg-[#18181B] rounded-2xl p-6 border border-white/[0.07]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-semibold text-white">Vagas ({vagas.length})</h2>
          <button onClick={addVaga} className="inline-flex items-center gap-2 bg-primary text-black font-heading font-bold px-4 py-2 rounded-lg hover:bg-primary-vibrant transition-colors text-sm">
            <Plus className="w-4 h-4" /> Adicionar Vaga
          </button>
        </div>
        <div className="space-y-4">
          {vagas.length === 0 && <p className="text-[#71717A] text-sm">Nenhuma vaga cadastrada.</p>}
          {vagas.map((vaga) => (
            <div key={vaga.id} className="bg-[#27272A] rounded-xl p-5 border border-[#3F3F46] space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <GripVertical className="w-4 h-4 text-[#71717A]" />
                  <input
                    value={vaga.title || ""}
                    onChange={e => updateLocal(vaga.id, { title: e.target.value })}
                    placeholder="Título da vaga (ex: Estamos contratando uma Banhista)"
                    className="flex-1 bg-[#18181B] border border-[#3F3F46] rounded-lg px-3 py-2 text-white text-sm font-heading font-semibold focus:border-primary outline-none"
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!vaga.is_active}
                    onChange={e => updateLocal(vaga.id, { is_active: e.target.checked })}
                    className="w-4 h-4 accent-primary"
                  />
                  <span className="text-xs text-white font-heading">{vaga.is_active ? "Ativa" : "Inativa"}</span>
                </label>
                <button onClick={() => deleteVaga(vaga.id)} className="text-red-400 hover:text-red-300 p-2">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#A1A1AA] mb-1 block font-heading">Disponibilidade</label>
                  <input
                    value={vaga.schedule || ""}
                    onChange={e => updateLocal(vaga.id, { schedule: e.target.value })}
                    placeholder="Segunda a sexta, das 8h às 14h"
                    className="w-full bg-[#18181B] border border-[#3F3F46] rounded-lg px-3 py-2 text-white text-sm focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#A1A1AA] mb-1 block font-heading">Requisitos Mínimos</label>
                  <input
                    value={vaga.requirements || ""}
                    onChange={e => updateLocal(vaga.id, { requirements: e.target.value })}
                    placeholder="Experiência e curso completo"
                    className="w-full bg-[#18181B] border border-[#3F3F46] rounded-lg px-3 py-2 text-white text-sm focus:border-primary outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-[#A1A1AA] mb-1 block font-heading">Mensagem ao clicar no WhatsApp</label>
                <textarea
                  value={vaga.whatsapp_message || ""}
                  onChange={e => updateLocal(vaga.id, { whatsapp_message: e.target.value })}
                  rows={2}
                  placeholder="Vim Pelo site do Le Vile Pet e estou(A) intereçado(A) na vaga para banhista"
                  className="w-full bg-[#18181B] border border-[#3F3F46] rounded-lg px-3 py-2 text-white text-sm focus:border-primary outline-none resize-none"
                />
              </div>
              <div className="flex items-center gap-3">
                <div>
                  <label className="text-xs text-[#A1A1AA] mb-1 block font-heading">Ordem</label>
                  <input
                    type="number"
                    value={vaga.display_order ?? 0}
                    onChange={e => updateLocal(vaga.id, { display_order: parseInt(e.target.value) || 0 })}
                    className="w-24 bg-[#18181B] border border-[#3F3F46] rounded-lg px-3 py-2 text-white text-sm focus:border-primary outline-none"
                  />
                </div>
                <button onClick={() => saveVaga(vaga)} disabled={saving === vaga.id} className="ml-auto bg-primary text-black font-heading font-bold px-5 py-2 rounded-lg hover:bg-primary-vibrant transition-colors disabled:opacity-50 text-sm">
                  {saving === vaga.id ? "Salvando..." : "💾 Salvar Vaga"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
