import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { MediaUploader } from "@/components/MediaUploader";
import { BulkActionsBar } from "@/components/BulkActionsBar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Eye, EyeOff, ArrowUp, ArrowDown, Star, AlertCircle, Check } from "lucide-react";

const TABS = [
  { key: "destaques_home", label: "Home", titleField: "destaques_home_title", subField: "destaques_home_subtitle" },
  { key: "destaques_hotel", label: "Hotelzinho", titleField: "destaques_hotel_title", subField: "destaques_hotel_subtitle" },
] as const;

const normalizeLocations = (p: any) =>
  Array.from(new Set([...(Array.isArray(p.locations) ? p.locations : []), p.category, p.is_featured ? "home" : null].filter(Boolean)));

export default function AdminDestaques() {
  const [tab, setTab] = useState<typeof TABS[number]>(TABS[0]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [confirmBulk, setConfirmBulk] = useState(false);
  const { toast } = useToast();

  const toggleSelect = (id: string) => setSelected(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const bulkDelete = async () => {
    setBulkDeleting(true);
    const ids = Array.from(selected);
    const toRemove = photos.filter(p => ids.includes(p.id));
    try {
      const paths = toRemove
        .map(p => p.image_url?.includes("/levillepet-media/") ? p.image_url.split("/levillepet-media/")[1] : null)
        .filter(Boolean) as string[];
      if (paths.length) await supabase.storage.from("levillepet-media").remove(paths);
      const { error } = await supabase.from("photos").delete().in("id", ids);
      if (error) throw error;
      toast({ title: `✅ ${ids.length} item(s) removido(s)` });
      setSelected(new Set());
      load();
    } catch (e: any) {
      toast({ title: "Erro ao excluir", description: e.message, variant: "destructive" });
    }
    setBulkDeleting(false);
    setConfirmBulk(false);
  };

  const load = async () => {
    setLoading(true);
    const [{ data: photosData }, { data: cfg }] = await Promise.all([
      supabase.from("photos").select("*").order("display_order"),
      supabase.from("site_config").select("*").limit(1).maybeSingle(),
    ]);
    setPhotos(photosData || []);
    setConfig(cfg);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = photos.filter(p => normalizeLocations(p).includes(tab.key));
  const visibleCount = filtered.filter(p => p.is_active).length;

  const handleUploaded = async (url: string) => {
    if (!url) return;
    const { error } = await supabase.from("photos").insert({
      title: "",
      image_url: url,
      category: "galeria",
      locations: [tab.key],
      is_featured: false,
    } as any);
    if (error) throw error;
    load();
  };

  const toggleActive = async (p: any) => {
    await supabase.from("photos").update({ is_active: !p.is_active }).eq("id", p.id);
    load();
  };

  const remove = async (p: any) => {
    if (!confirm(`Excluir "${p.title}"?`)) return;
    if (p.image_url?.includes("/levillepet-media/")) {
      const path = p.image_url.split("/levillepet-media/")[1];
      if (path) await supabase.storage.from("levillepet-media").remove([path]);
    }
    await supabase.from("photos").delete().eq("id", p.id);
    toast({ title: "✅ Removida" });
    load();
  };

  const removeFromDestaque = async (p: any) => {
    const next = normalizeLocations(p).filter(l => l !== tab.key);
    await supabase.from("photos").update({ locations: next.length ? next : ["galeria"] } as any).eq("id", p.id);
    toast({ title: "Removida desta seção (continua nas outras)" });
    load();
  };

  const reorder = async (p: any, dir: -1 | 1) => {
    const newOrder = (p.display_order || 0) + dir;
    await supabase.from("photos").update({ display_order: newOrder }).eq("id", p.id);
    load();
  };

  const saveConfig = async (field: string, value: string) => {
    if (!config) return;
    setConfig({ ...config, [field]: value });
    await supabase.from("site_config").update({ [field]: value } as any).eq("id", config.id);
  };

  return (
    <AdminLayout title="Destaques da Semana">
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t)}
            className={`px-5 py-2.5 rounded-lg text-sm font-heading transition-colors ${tab.key === t.key ? "bg-primary text-black font-semibold" : "bg-[#18181B] text-[#A1A1AA] hover:text-white"}`}>
            ⭐ {t.label}
          </button>
        ))}
      </div>

      {/* Title/Subtitle */}
      <div className="bg-[#18181B] rounded-2xl p-6 mb-6 border border-white/[0.07] space-y-4">
        <h3 className="font-heading font-semibold text-sm">Textos da seção · {tab.label}</h3>
        <div>
          <label className="text-xs text-[#A1A1AA] mb-1 block">Título</label>
          <input
            value={config?.[tab.titleField] ?? ""}
            onChange={e => saveConfig(tab.titleField, e.target.value)}
            placeholder="Destaques da Semana"
            className="w-full bg-[#27272A] border border-[#3F3F46] rounded-lg px-3 py-2 text-sm text-white"
          />
        </div>
        <div>
          <label className="text-xs text-[#A1A1AA] mb-1 block">Subtítulo</label>
          <input
            value={config?.[tab.subField] ?? ""}
            onChange={e => saveConfig(tab.subField, e.target.value)}
            placeholder="Os momentos mais especiais"
            className="w-full bg-[#27272A] border border-[#3F3F46] rounded-lg px-3 py-2 text-sm text-white"
          />
        </div>
        <p className="text-[11px] text-[#71717A]">As alterações são salvas automaticamente ao digitar.</p>
      </div>

      {/* Upload */}
      <div className="bg-[#18181B] rounded-2xl p-6 mb-6 border border-white/[0.07]">
        <h3 className="font-heading font-semibold text-sm mb-3">Adicionar fotos ao destaque · {tab.label}</h3>
        <MediaUploader accept="image" multiple pathPrefix={`destaques/${tab.key}`} onUploaded={handleUploaded} label="" />
        <p className="text-[11px] text-[#71717A] mt-2">💡 Arraste várias fotos. Cada uma entra sem título.</p>
      </div>

      {/* Limit warning */}
      {visibleCount > 8 && (
        <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-4 py-3 mb-6 text-yellow-300 text-sm">
          <AlertCircle className="w-4 h-4" />
          Há {visibleCount} fotos ativas mas só as 8 primeiras (por ordem) aparecem no site.
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="aspect-[4/5] skeleton rounded-xl" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-[#18181B] rounded-2xl border border-white/[0.07]">
          <Star className="w-10 h-10 text-primary/40 mx-auto mb-3" />
          <p className="text-[#A1A1AA] text-sm">Nenhuma foto nos destaques de <strong>{tab.label}</strong> ainda.</p>
          <p className="text-[#71717A] text-xs mt-1">Use o upload acima para adicionar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map((p, idx) => {
            const isSel = selected.has(p.id);
            return (
            <div key={p.id} className={`bg-[#18181B] rounded-xl overflow-hidden border transition-all ${isSel ? "border-primary ring-2 ring-primary/40" : p.is_active ? "border-[#27272A]" : "border-red-500/40 opacity-60"}`}>
              <div className="relative aspect-[4/5] bg-black cursor-pointer" onClick={() => toggleSelect(p.id)}>
                <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }} />
                <span className="absolute top-2 left-2 bg-primary text-black text-[10px] font-bold px-2 py-0.5 rounded">#{idx + 1}</span>
                <div className={`absolute top-2 right-2 w-6 h-6 rounded-md border-2 flex items-center justify-center ${isSel ? "bg-primary border-primary" : "bg-black/60 border-white/60"}`}>
                  {isSel && <Check className="w-4 h-4 text-black" strokeWidth={3} />}
                </div>
                {!p.is_active && <span className="absolute bottom-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">OCULTA</span>}
                {idx >= 8 && p.is_active && <span className="absolute bottom-2 left-2 bg-yellow-500/90 text-black text-[10px] font-bold px-2 py-0.5 rounded">FORA DO LIMITE</span>}
              </div>
              <div className="p-3 space-y-2">
                <input
                  value={p.title}
                  onChange={(e) => {
                    const v = e.target.value;
                    setPhotos(prev => prev.map(x => x.id === p.id ? { ...x, title: v } : x));
                  }}
                  onBlur={async (e) => { await supabase.from("photos").update({ title: e.target.value }).eq("id", p.id); }}
                  className="w-full bg-[#27272A] border border-[#3F3F46] rounded px-2 py-1.5 text-xs text-white"
                />
                <div className="flex items-center gap-1">
                  <button onClick={() => reorder(p, -1)} title="Subir" className="flex-1 py-1.5 rounded bg-[#27272A] hover:bg-primary/30 text-white"><ArrowUp className="w-3 h-3 mx-auto" /></button>
                  <button onClick={() => reorder(p, 1)} title="Descer" className="flex-1 py-1.5 rounded bg-[#27272A] hover:bg-primary/30 text-white"><ArrowDown className="w-3 h-3 mx-auto" /></button>
                  <button onClick={() => toggleActive(p)} title={p.is_active ? "Ocultar" : "Mostrar"} className="flex-1 py-1.5 rounded bg-[#27272A] hover:bg-white/10 text-white">{p.is_active ? <Eye className="w-3 h-3 mx-auto text-green-400" /> : <EyeOff className="w-3 h-3 mx-auto text-red-400" />}</button>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => removeFromDestaque(p)} title="Tirar daqui" className="flex-1 py-1.5 rounded text-[10px] bg-[#27272A] hover:bg-yellow-500/20 text-[#A1A1AA] hover:text-yellow-300">Tirar do destaque</button>
                  <button onClick={() => remove(p)} title="Excluir" className="px-3 py-1.5 rounded bg-red-500 hover:bg-red-600 text-white font-semibold text-xs flex items-center gap-1"><Trash2 className="w-3 h-3" /> Excluir</button>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      )}

      <BulkActionsBar
        count={selected.size}
        totalVisible={filtered.length}
        onClear={() => setSelected(new Set())}
        onSelectAll={() => setSelected(new Set(filtered.map(p => p.id)))}
        onDelete={() => setConfirmBulk(true)}
        deleting={bulkDeleting}
      />

      {confirmBulk && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={() => setConfirmBulk(false)}>
          <div className="bg-[#18181B] rounded-2xl p-6 max-w-sm w-full mx-4 border border-red-500/40 text-center" onClick={e => e.stopPropagation()}>
            <Trash2 className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <p className="text-white mb-2 font-heading font-semibold">Excluir {selected.size} item(s)?</p>
            <p className="text-[#A1A1AA] text-xs mb-4">Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setConfirmBulk(false)} className="px-4 py-2 text-sm text-[#A1A1AA] hover:text-white">Cancelar</button>
              <button onClick={bulkDelete} disabled={bulkDeleting} className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50">{bulkDeleting ? "Excluindo..." : `Excluir ${selected.size}`}</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
