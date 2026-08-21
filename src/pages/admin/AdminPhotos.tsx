import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { MediaUploader } from "@/components/MediaUploader";
import { BulkActionsBar } from "@/components/BulkActionsBar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { fetchAllRows } from "@/lib/fetchAll";
import { invalidateCache } from "@/lib/dataCache";
import { Trash2, Star, Eye, EyeOff, Pencil, X, Search, Check, ArrowUpDown } from "lucide-react";

const categories = [
  { value: "galeria", label: "Galeria Geral" },
  { value: "hotelzinho", label: "Hotelzinho" },
  { value: "conhecer", label: "Venha Nos Conhecer" },
  { value: "home", label: "Home" },
];

const categoryTabs = [
  { value: "all", label: "Todas" },
  ...categories,
];

const LOCATIONS = [
  { key: "galeria", label: "Galeria Geral" },
  { key: "home", label: "Momentos da Home" },
  { key: "hotelzinho", label: "Hotelzinho" },
  { key: "conhecer", label: "Venha Nos Conhecer" },
  { key: "transporte", label: "🚐 Transporte" },
  { key: "destaques_home", label: "⭐ Destaques Home" },
  { key: "destaques_hotel", label: "⭐ Destaques Hotelzinho" },
];

const normalizeLocations = (photo: any) => {
  const list = Array.isArray(photo.locations) ? photo.locations : [];
  const legacy = [photo.category || "galeria", photo.is_featured ? "home" : null].filter(Boolean);
  return Array.from(new Set([...list, ...legacy]));
};

const primaryCategory = (locations: string[]) => locations.find(l => l !== "home") || "galeria";

export default function AdminPhotos() {
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("galeria");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "alphabetical">("newest");
  const [uploadLocations, setUploadLocations] = useState<string[]>(["galeria"]);
  const [editPhoto, setEditPhoto] = useState<any>(null);
  const [deletePhoto, setDeletePhoto] = useState<any>(null);
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
      invalidateCache("photos_active");
      toast({ title: `✅ ${ids.length} foto(s) removida(s)` });
      setPhotos(prev => prev.filter(p => !ids.includes(p.id)));
      setSelected(new Set());
    } catch (e: any) {
      toast({ title: "Erro ao excluir em lote", description: e.message, variant: "destructive" });
    }
    setBulkDeleting(false);
    setConfirmBulk(false);
  };

  useEffect(() => { fetchPhotos(); }, []);

  const fetchPhotos = async () => {
    // Paginação completa: o Supabase devolve no máximo 1000 linhas por requisição
    const data = await fetchAllRows("photos", "created_at", false);
    setPhotos(data);
    setLoading(false);
  };


  // Refetch automático quando algo termina o upload (usando polling simples ou poderia ser real-time)
  useEffect(() => {
    const interval = setInterval(() => {
      // Se houver fotos sendo enviadas, fetch mais frequente
      fetchPhotos();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleUploaded = async (url: string) => {
    if (!url) return;
    const locations = uploadLocations.length ? uploadLocations : [activeTab === "all" ? "galeria" : activeTab];
    const { error } = await supabase.from("photos").insert({ title: "", image_url: url, category: primaryCategory(locations), locations, is_featured: locations.includes("home") } as any);
    if (error) throw error;
    invalidateCache("photos_active");
    fetchPhotos();
  };

  const handleDelete = async () => {
    if (!deletePhoto) return;
    try {
      if (deletePhoto.image_url?.includes("/levillepet-media/")) {
        const path = deletePhoto.image_url.split("/levillepet-media/")[1];
        if (path) await supabase.storage.from("levillepet-media").remove([path]);
      }
      const { error } = await supabase.from("photos").delete().eq("id", deletePhoto.id);
      if (error) throw error;
      invalidateCache("photos_active");
      toast({ title: "✅ Foto removida" });
      setPhotos(prev => prev.filter(p => p.id !== deletePhoto.id));
    } catch (e: any) {
      toast({ title: "Erro ao excluir", description: e.message, variant: "destructive" });
    }
    setDeletePhoto(null);
  };

  const handleToggleFeatured = async (id: string, current: boolean) => {
    const photo = photos.find(p => p.id === id);
    const currentLocations = normalizeLocations(photo);
    const nextFeatured = !current;
    const locations = nextFeatured ? Array.from(new Set([...currentLocations, "home"])) : currentLocations.filter(l => l !== "home");
    await supabase.from("photos").update({ is_featured: nextFeatured, locations } as any).eq("id", id);
    invalidateCache("photos_active");
    fetchPhotos();
  };

  const toggleUploadLocation = (loc: string) => setUploadLocations(prev => prev.includes(loc) ? prev.filter(x => x !== loc) : [...prev, loc]);

  const handleToggleLocation = async (photo: any, loc: string) => {
    const current = normalizeLocations(photo);
    const next = current.includes(loc) ? current.filter(l => l !== loc) : [...current, loc];
    const safeNext = next.length ? next : ["galeria"];
    await supabase.from("photos").update({ locations: safeNext, category: primaryCategory(safeNext), is_featured: safeNext.includes("home") } as any).eq("id", photo.id);
    invalidateCache("photos_active");
    fetchPhotos();
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    await supabase.from("photos").update({ is_active: !current }).eq("id", id);
    invalidateCache("photos_active");
    fetchPhotos();
  };

  const handleSaveEdit = async () => {
    if (!editPhoto) return;
    const locations = normalizeLocations(editPhoto);
    await supabase.from("photos").update({ title: editPhoto.title, category: primaryCategory(locations), locations, is_featured: locations.includes("home"), display_order: editPhoto.display_order } as any).eq("id", editPhoto.id);
    invalidateCache("photos_active");
    toast({ title: "✅ Foto atualizada!" });
    setEditPhoto(null);
    fetchPhotos();
  };

  const sorted = [...photos].sort((a, b) => {
    if (sortBy === "alphabetical") return (a.title || "").localeCompare(b.title || "");
    if (sortBy === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime(); // newest
  });

  const filtered = sorted.filter(p => {
    if (activeTab !== "all" && !normalizeLocations(p).includes(activeTab)) return false;
    if (searchTerm && !p.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const uploadCategory = activeTab === "all" ? "galeria" : activeTab;
  const currentLabel = categories.find(c => c.value === uploadCategory)?.label || "Galeria Geral";

  return (
    <AdminLayout title="Gerenciar Fotos">
      <div className="flex gap-2 mb-6 flex-wrap">
        {categoryTabs.map(t => (
          <button key={t.value} onClick={() => setActiveTab(t.value)}
            className={`px-4 py-2 rounded-lg text-sm font-body transition-colors ${activeTab === t.value ? "bg-primary text-black font-semibold" : "bg-[#18181B] text-[#A1A1AA] hover:text-white"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Upload com barra de progresso */}
      <div className="bg-[#18181B] rounded-2xl p-6 mb-8 border border-white/[0.07]">
        <div className="flex items-center gap-3 mb-3">
          <h3 className="font-heading font-semibold text-sm">Adicionar foto</h3>
          <span className="text-xs text-[#71717A] ml-auto">Marque todos os locais onde essa foto deve aparecer</span>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {LOCATIONS.map(loc => (
            <button key={loc.key} onClick={() => toggleUploadLocation(loc.key)} className={`px-3 py-2 rounded-lg text-xs font-heading transition-colors ${uploadLocations.includes(loc.key) ? "bg-primary text-black" : "bg-[#27272A] text-[#A1A1AA] hover:text-white"}`}>
              {uploadLocations.includes(loc.key) ? "✓ " : "+ "}{loc.label}
            </button>
          ))}
        </div>
        <MediaUploader accept="image" multiple pathPrefix={`fotos/${uploadCategory}`} onUploaded={handleUploaded} label="" />
        <p className="text-[11px] text-[#71717A] mt-2">💡 Arraste várias fotos de uma vez. Cada uma é enviada sem título — você pode editar depois se quiser.</p>
      </div>

      {/* Filters & Sorting */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-2 bg-[#27272A] border border-[#3F3F46] rounded-lg px-3">
          <Search className="w-4 h-4 text-[#71717A]" />
          <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Buscar..." className="bg-transparent text-sm text-white py-2 outline-none w-40" />
        </div>

        <div className="flex items-center gap-2 bg-[#27272A] border border-[#3F3F46] rounded-lg px-3">
          <ArrowUpDown className="w-4 h-4 text-[#71717A]" />
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-transparent text-sm text-white py-2 outline-none cursor-pointer"
          >
            <option value="newest" className="bg-[#18181B]">Mais Novos</option>
            <option value="oldest" className="bg-[#18181B]">Mais Antigos</option>
            <option value="alphabetical" className="bg-[#18181B]">Ordem Alfabética</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{Array.from({length:8}).map((_,i) => <div key={i} className="aspect-square skeleton rounded-xl" />)}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.length === 0 && <p className="text-[#71717A] col-span-full text-center py-10">Nenhuma foto nesta categoria.</p>}
          {filtered.map(photo => {
            const isSelected = selected.has(photo.id);
            return (
            <div key={photo.id} className={`bg-[#18181B] rounded-xl overflow-hidden border transition-all ${isSelected ? "border-primary ring-2 ring-primary/40" : photo.is_active ? "border-[#27272A]" : "border-red-500/40 opacity-60"}`}>
              <div className="relative cursor-pointer group" onClick={() => toggleSelect(photo.id)}>
                <img 
                  src={photo.image_url} 
                  alt={photo.title} 
                  className="w-full h-auto object-contain max-h-[500px] bg-black/20" 
                  loading="lazy"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }} 
                />
                <div className={`absolute top-2 right-2 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${isSelected ? "bg-primary border-primary" : "bg-black/60 border-white/60"}`}>
                  {isSelected && <Check className="w-4 h-4 text-black" strokeWidth={3} />}
                </div>
                {photo.is_featured && <span className="absolute top-2 left-2 bg-primary text-black text-[10px] font-bold px-2 py-0.5 rounded shadow-lg">⭐ DESTAQUE</span>}
                {!photo.is_active && <span className="absolute bottom-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg">OCULTA</span>}
              </div>
              <div className="p-3 space-y-2">
                <p className="text-sm text-white font-medium truncate">{photo.title || <span className="text-[#71717A] italic">(sem título)</span>}</p>
                <div className="flex flex-wrap gap-1">
                  {LOCATIONS.map(loc => {
                    const active = normalizeLocations(photo).includes(loc.key);
                    return <button key={loc.key} onClick={() => handleToggleLocation(photo, loc.key)} className={`text-[10px] px-2 py-0.5 rounded font-heading ${active ? "bg-primary text-black" : "bg-[#27272A] text-[#A1A1AA] hover:text-white"}`}>{active ? "✓ " : "+ "}{loc.label}</button>;
                  })}
                </div>
                <div className="flex gap-1 pt-1 border-t border-[#27272A]">
                  <button onClick={() => setEditPhoto({...photo})} title="Editar" className="flex-1 py-2 rounded bg-[#27272A] hover:bg-primary hover:text-black text-white text-xs flex items-center justify-center gap-1"><Pencil className="w-3 h-3" /> Editar</button>
                  <button onClick={() => handleToggleFeatured(photo.id, photo.is_featured)} title="Destaque Home" className={`px-3 py-2 rounded ${photo.is_featured ? "bg-primary text-black" : "bg-[#27272A] text-white hover:bg-primary/30"}`}><Star className="w-3 h-3" /></button>
                  <button onClick={() => handleToggleActive(photo.id, photo.is_active)} title={photo.is_active ? "Ocultar" : "Mostrar"} className="px-3 py-2 rounded bg-[#27272A] hover:bg-white/10 text-white">{photo.is_active ? <Eye className="w-3 h-3 text-green-400" /> : <EyeOff className="w-3 h-3 text-red-400" />}</button>
                  <button onClick={() => setDeletePhoto(photo)} title="Excluir" className="px-3 py-2 rounded bg-red-500 hover:bg-red-600 text-white font-semibold text-xs flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" /> Excluir</button>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      {editPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={() => setEditPhoto(null)}>
          <div className="bg-[#18181B] rounded-2xl p-6 max-w-md w-full mx-4 border border-[#3F3F46]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between mb-4"><h3 className="font-heading font-bold">Editar Foto</h3><button onClick={() => setEditPhoto(null)}><X className="w-5 h-5 text-[#71717A]" /></button></div>
            <div className="space-y-4">
              <div><label className="text-xs text-[#A1A1AA] mb-1 block">Título</label><input value={editPhoto.title} onChange={e => setEditPhoto({...editPhoto, title: e.target.value})} className="w-full bg-[#27272A] border border-[#3F3F46] rounded-lg px-3 py-2 text-sm text-white" /></div>
              <div><label className="text-xs text-[#A1A1AA] mb-1 block">Locais onde aparece</label><div className="grid grid-cols-2 gap-2">{LOCATIONS.map(loc => { const active = normalizeLocations(editPhoto).includes(loc.key); return <button key={loc.key} onClick={() => { const current = normalizeLocations(editPhoto); const next = active ? current.filter(l => l !== loc.key) : [...current, loc.key]; setEditPhoto({...editPhoto, locations: next.length ? next : ["galeria"], is_featured: next.includes("home")}); }} className={`px-3 py-2 rounded-lg text-xs ${active ? "bg-primary text-black" : "bg-[#27272A] text-[#A1A1AA]"}`}>{active ? "✓ " : "+ "}{loc.label}</button>; })}</div></div>
              <div><label className="text-xs text-[#A1A1AA] mb-1 block">Ordem</label><input type="number" value={editPhoto.display_order} onChange={e => setEditPhoto({...editPhoto, display_order: parseInt(e.target.value) || 0})} className="w-full bg-[#27272A] border border-[#3F3F46] rounded-lg px-3 py-2 text-sm text-white" /></div>
              <button onClick={handleSaveEdit} className="btn-primary w-full text-sm">Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deletePhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={() => setDeletePhoto(null)}>
          <div className="bg-[#18181B] rounded-2xl p-6 max-w-sm w-full mx-4 border border-[#3F3F46] text-center" onClick={e => e.stopPropagation()}>
            <p className="text-white mb-4">Excluir "{deletePhoto.title}"?</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setDeletePhoto(null)} className="px-4 py-2 text-sm text-[#A1A1AA] hover:text-white">Cancelar</button>
              <button onClick={handleDelete} className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600">Excluir</button>
            </div>
          </div>
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
            <p className="text-white mb-2 font-heading font-semibold">Excluir {selected.size} foto(s)?</p>
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
