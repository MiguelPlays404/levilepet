import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { MediaUploader } from "@/components/MediaUploader";
import { AspectRatioPicker, aspectToOrientation, aspectClass, ASPECT_OPTIONS } from "@/components/AspectRatioPicker";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getYoutubeThumbnail } from "@/lib/youtube";
import { Link2, Trash2, Eye, EyeOff, Star, Upload } from "lucide-react";

const TABS = [
  { key: "all", label: "Todos" },
  { key: "home", label: "⭐ Em Destaque (Home)" },
  { key: "geral", label: "Geral" },
  { key: "hotelzinho", label: "Hotelzinho" },
  { key: "conhecer", label: "Venha Nos Conhecer" },
];

const LOCATIONS = [
  { key: "geral", label: "Geral" },
  { key: "home", label: "Destaque na Home" },
  { key: "hotelzinho", label: "Hotelzinho" },
  { key: "conhecer", label: "Venha Nos Conhecer" },
];

const normalizeLocations = (video: any) => {
  const list = Array.isArray(video.locations) ? video.locations : [];
  const legacy = [video.category || "geral", video.is_featured ? "home" : null].filter(Boolean);
  return Array.from(new Set([...list, ...legacy]));
};

const primaryCategory = (locations: string[]) => locations.find(l => l !== "home") || "geral";


export default function AdminVideos() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadThumb, setUploadThumb] = useState("");
  const [pendingVideoUrl, setPendingVideoUrl] = useState("");
  const [tab, setTab] = useState("all");
  const [addLocations, setAddLocations] = useState<string[]>(["geral"]);
  const [deleteVideo, setDeleteVideo] = useState<any>(null);

  // Proporção — obrigatório para uploads (16:9, 4:3, 1:1, 3:4, 9:16)
  const [uploadAspect, setUploadAspect] = useState<string>("");
  const [multiAspect, setMultiAspect] = useState<string>("");
  const [linkAspect, setLinkAspect] = useState<string>("16:9");

  const { toast } = useToast();

  useEffect(() => { fetchVideos(); }, []);

  const fetchVideos = async () => {
    const { data } = await supabase.from("videos").select("*").order("published_at", { ascending: false });
    setVideos(data || []);
    setLoading(false);
  };

  const handleAddLink = async () => {
    if (!linkUrl.trim()) return;
    // YouTube links: horizontal por padrão mas ainda pode ser alterado
    const thumbnail = getYoutubeThumbnail(linkUrl);
    const isYoutube = linkUrl.includes("youtube") || linkUrl.includes("youtu.be");
    const locations = addLocations.length ? addLocations : ["geral"];
    const { error } = await supabase.from("videos").insert({
      title: linkTitle || "Novo vídeo",
      video_url: linkUrl,
      video_type: isYoutube ? "youtube" : "link",
      thumbnail_url: thumbnail,
      category: primaryCategory(locations),
      locations,
      is_featured: locations.includes("home"),
      orientation: linkAspect || "horizontal",
      likes_count: 0, is_active: true, published_at: new Date().toISOString(),
    } as any);
    if (error) { toast({ title: "Erro ao adicionar vídeo", description: error.message, variant: "destructive" }); return; }
    toast({ title: "✅ Vídeo adicionado!" });
    setLinkUrl(""); setLinkTitle(""); setLinkOrientation("horizontal");
    fetchVideos();
  };

  const handleUploadedVideo = (url: string) => setPendingVideoUrl(url);

  const handleConfirmUpload = async () => {
    if (!pendingVideoUrl) { toast({ title: "Envie o vídeo primeiro" }); return; }
    if (!uploadAspect) { toast({ title: "⚠️ Selecione a orientação do vídeo", variant: "destructive" }); return; }
    const locations = addLocations.length ? addLocations : ["geral"];
    const { error } = await supabase.from("videos").insert({
      title: uploadTitle || "",
      video_url: pendingVideoUrl,
      video_type: "upload",
      thumbnail_url: uploadThumb || "",
      category: primaryCategory(locations),
      locations,
      is_featured: locations.includes("home"),
      orientation: uploadAspect,
      likes_count: 0, is_active: true, published_at: new Date().toISOString(),
    } as any);
    if (error) { toast({ title: "Erro ao salvar vídeo", description: error.message, variant: "destructive" }); return; }
    toast({ title: "✅ Vídeo adicionado!" });
    setUploadTitle(""); setUploadThumb(""); setPendingVideoUrl(""); setUploadOrientation("");
    fetchVideos();
  };

  // Multi-upload: pede orientação antes de enviar em lote
  const handleMultiUploaded = async (url: string) => {
    if (!url) return;
    if (!multiAspect) {
      toast({ title: "⚠️ Selecione a orientação antes de enviar em lote", variant: "destructive" });
      return;
    }
    const locations = addLocations.length ? addLocations : ["geral"];
    const { error } = await supabase.from("videos").insert({
      title: "",
      video_url: url,
      video_type: "upload",
      thumbnail_url: "",
      category: primaryCategory(locations),
      locations,
      is_featured: locations.includes("home"),
      orientation: multiAspect,
      likes_count: 0, is_active: true, published_at: new Date().toISOString(),
    } as any);
    if (error) throw error;
    fetchVideos();
  };

  const handleDelete = async () => {
    if (!deleteVideo) return;
    try {
      if (deleteVideo.video_type === "upload" && deleteVideo.video_url?.includes("/levillepet-media/")) {
        const path = deleteVideo.video_url.split("/levillepet-media/")[1];
        if (path) await supabase.storage.from("levillepet-media").remove([path]);
      }
      await supabase.from("video_likes").delete().eq("video_id", deleteVideo.id);
      const { error } = await supabase.from("videos").delete().eq("id", deleteVideo.id);
      if (error) throw error;
      toast({ title: "✅ Vídeo removido" });
      setVideos(prev => prev.filter(v => v.id !== deleteVideo.id));
    } catch (e: any) {
      toast({ title: "Erro ao excluir", description: e.message, variant: "destructive" });
    }
    setDeleteVideo(null);
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    await supabase.from("videos").update({ is_active: !current }).eq("id", id);
    fetchVideos();
  };

  const toggleAddLocation = (loc: string) => {
    setAddLocations(prev => prev.includes(loc) ? prev.filter(x => x !== loc) : [...prev, loc]);
  };

  const handleToggleFeatured = async (video: any) => {
    const locations = normalizeLocations(video);
    const nextFeatured = !locations.includes("home");
    const nextLocations = nextFeatured ? Array.from(new Set([...locations, "home"])) : locations.filter(l => l !== "home");
    await supabase.from("videos").update({ is_featured: nextFeatured, locations: nextLocations } as any).eq("id", video.id);
    toast({ title: nextFeatured ? "⭐ Vídeo também aparece no destaque da Home" : "Removido do destaque da Home" });
    fetchVideos();
  };

  const handleToggleLocation = async (video: any, loc: string) => {
    const current = normalizeLocations(video);
    const next = current.includes(loc) ? current.filter(l => l !== loc) : [...current, loc];
    const safeNext = next.length ? next : ["geral"];
    await supabase.from("videos").update({ locations: safeNext, category: primaryCategory(safeNext), is_featured: safeNext.includes("home") } as any).eq("id", video.id);
    fetchVideos();
  };

  const handleChangeOrientation = async (video: any, orientation: string) => {
    await supabase.from("videos").update({ orientation } as any).eq("id", video.id);
    fetchVideos();
  };

  const filtered = videos.filter(v => {
    if (tab === "all") return true;
    return normalizeLocations(v).includes(tab);
  });

  return (
    <AdminLayout title="Gerenciar Vídeos">
      {/* Locais para novos vídeos */}
      <div className="bg-[#18181B] rounded-xl p-4 border border-white/[0.07] mb-4">
        <p className="text-xs text-[#A1A1AA] mb-2 font-heading">Onde os novos vídeos vão aparecer:</p>
        <div className="flex flex-wrap gap-2">
          {LOCATIONS.map(loc => (
            <button key={loc.key} onClick={() => toggleAddLocation(loc.key)}
              className={`px-3 py-2 rounded-lg text-xs font-heading transition-colors ${addLocations.includes(loc.key) ? "bg-primary text-black font-semibold" : "bg-[#27272A] text-[#A1A1AA] hover:text-white"}`}>
              {addLocations.includes(loc.key) ? "✓ " : "+ "}{loc.label}
            </button>
          ))}
        </div>
      </div>

      {/* Add via Link */}
      <div className="bg-[#18181B] rounded-2xl p-6 border border-white/[0.07] mb-4">
        <h3 className="font-heading font-semibold text-sm flex items-center gap-2 mb-4">
          <Link2 className="w-4 h-4 text-primary" /> Adicionar via Link (YouTube / URL)
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-4">
          <input value={linkTitle} onChange={e => setLinkTitle(e.target.value)} placeholder="Título do vídeo" className="bg-[#27272A] border border-[#3F3F46] rounded-lg px-3 py-2 text-sm text-white" />
          <input value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." className="bg-[#27272A] border border-[#3F3F46] rounded-lg px-3 py-2 text-sm text-white" />
          <button onClick={handleAddLink} className="btn-primary text-sm">Adicionar Link</button>
        </div>
        <OrientationPicker value={linkAspect} onChange={setLinkOrientation} />
        <p className="text-[11px] text-[#71717A] mt-2">💡 YouTube é sempre horizontal. Mude só se for um vídeo vertical em outro link.</p>
      </div>

      {/* Upload único */}
      <div className="bg-[#18181B] rounded-2xl p-6 border border-white/[0.07] mb-4">
        <h3 className="font-heading font-semibold text-sm mb-4 flex items-center gap-2">
          <Upload className="w-4 h-4 text-primary" /> Enviar Arquivo de Vídeo
        </h3>
        <input value={uploadTitle} onChange={e => setUploadTitle(e.target.value)} placeholder="Título (opcional)" className="w-full mb-3 bg-[#27272A] border border-[#3F3F46] rounded-lg px-3 py-2 text-sm text-white" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs text-[#A1A1AA] mb-2 block">🎬 Vídeo *</label>
            <MediaUploader accept="video" pathPrefix={`videos/${primaryCategory(addLocations)}`} currentUrl={pendingVideoUrl} onUploaded={handleUploadedVideo} label="" />
          </div>
          <div>
            <label className="text-xs text-[#A1A1AA] mb-2 block">🖼️ Capa (opcional)</label>
            <MediaUploader accept="image" pathPrefix="videos/thumbs" currentUrl={uploadThumb} onUploaded={(url) => setUploadThumb(url)} label="" />
          </div>
        </div>
        <div className="mb-4">
          <OrientationPicker value={uploadAspect} onChange={setUploadOrientation} />
        </div>
        <button onClick={handleConfirmUpload} disabled={!pendingVideoUrl || !uploadAspect} className="btn-primary text-sm w-full disabled:opacity-50 disabled:cursor-not-allowed">
          ➕ Adicionar vídeo enviado
        </button>
      </div>

      {/* Multi-upload */}
      <div className="bg-[#18181B] rounded-2xl p-6 border border-white/[0.07] mb-8">
        <h3 className="font-heading font-semibold text-sm mb-2 flex items-center gap-2">
          <Upload className="w-4 h-4 text-primary" /> Envio rápido em lote
        </h3>
        <p className="text-xs text-[#71717A] mb-4">Arraste vários vídeos de uma vez. A orientação escolhida abaixo será aplicada a todos.</p>
        <div className="mb-4">
          <OrientationPicker value={multiAspect} onChange={setMultiOrientation} />
        </div>
        <div className={!multiAspect ? "opacity-40 pointer-events-none" : ""}>
          <MediaUploader accept="video" multiple pathPrefix={`videos/${primaryCategory(addLocations)}`} onUploaded={handleMultiUploaded} label="" />
        </div>
        {!multiAspect && (
          <p className="text-[11px] text-yellow-400 mt-2">⚠️ Selecione a orientação para habilitar o upload em lote</p>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-body transition-colors ${tab === t.key ? "bg-primary text-black font-semibold" : "bg-[#18181B] text-[#A1A1AA] hover:text-white"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tabela */}
      <div className="bg-[#18181B] rounded-2xl border border-white/[0.07] overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead><tr className="border-b border-[#27272A]">
            <th className="text-left p-4 text-[#71717A]">Vídeo</th>
            <th className="text-left p-4 text-[#71717A]">Orientação</th>
            <th className="text-left p-4 text-[#71717A]">Tipo</th>
            <th className="text-left p-4 text-[#71717A]">Locais</th>
            <th className="text-center p-4 text-[#71717A]">❤️</th>
            <th className="text-right p-4 text-[#71717A]">Ações</th>
          </tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center text-[#71717A]">Carregando...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-[#71717A]">Nenhum vídeo nesta categoria.</td></tr>
            ) : filtered.map(v => (
              <tr key={v.id} className="border-b border-[#27272A] last:border-0">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {v.thumbnail_url && <img src={v.thumbnail_url} alt="" className="w-16 h-10 rounded object-cover bg-[#27272A]" />}
                    <span className="text-[#ccc]">{v.title} {v.is_featured && <span className="text-primary">⭐</span>}</span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleChangeOrientation(v, "horizontal")}
                      title="Horizontal"
                      className={`p-1.5 rounded-lg border transition-colors ${(v.orientation || "horizontal") === "horizontal" ? "border-primary bg-primary/10 text-primary" : "border-[#3F3F46] text-[#666] hover:border-[#52525B]"}`}
                    >
                      <Maximize2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleChangeOrientation(v, "vertical")}
                      title="Vertical"
                      className={`p-1.5 rounded-lg border transition-colors ${v.orientation === "vertical" ? "border-primary bg-primary/10 text-primary" : "border-[#3F3F46] text-[#666] hover:border-[#52525B]"}`}
                    >
                      <RectangleVertical className="w-3 h-3" />
                    </button>
                  </div>
                </td>
                <td className="p-4 text-[#71717A] text-xs">{v.video_type}</td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-1 max-w-[300px]">
                    {LOCATIONS.map(loc => {
                      const active = normalizeLocations(v).includes(loc.key);
                      return <button key={loc.key} onClick={() => handleToggleLocation(v, loc.key)}
                        className={`px-2 py-1 rounded text-[11px] font-heading transition-colors ${active ? "bg-primary text-black" : "bg-[#27272A] text-[#A1A1AA] hover:text-white"}`}>
                        {active ? "✓ " : "+ "}{loc.label}
                      </button>;
                    })}
                  </div>
                </td>
                <td className="p-4 text-center text-primary font-bold">{v.likes_count}</td>
                <td className="p-4 text-right">
                  <div className="flex gap-1 justify-end">
                    <button onClick={() => handleToggleFeatured(v)} title="Destaque na Home" className="p-2 rounded hover:bg-white/5">
                      <Star className={`w-4 h-4 ${normalizeLocations(v).includes("home") ? "text-primary fill-primary" : "text-[#71717A]"}`} />
                    </button>
                    <button onClick={() => handleToggleActive(v.id, v.is_active)} className="p-2 rounded hover:bg-white/5">
                      {v.is_active ? <Eye className="w-4 h-4 text-green-400" /> : <EyeOff className="w-4 h-4 text-red-400" />}
                    </button>
                    <button onClick={() => setDeleteVideo(v)} className="p-2 rounded hover:bg-white/5">
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {deleteVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={() => setDeleteVideo(null)}>
          <div className="bg-[#18181B] rounded-2xl p-6 max-w-sm w-full mx-4 border border-[#3F3F46] text-center" onClick={e => e.stopPropagation()}>
            <p className="text-white mb-4">Excluir "{deleteVideo.title}"?</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setDeleteVideo(null)} className="px-4 py-2 text-sm text-[#A1A1AA]">Cancelar</button>
              <button onClick={handleDelete} className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg">Excluir</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
