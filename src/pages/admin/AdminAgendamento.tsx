import { useState, useEffect, useCallback, useRef } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { MediaUploader } from "@/components/MediaUploader";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getYoutubeThumbnail } from "@/lib/youtube";
import {
  Clock, Calendar, Timer, ImageIcon, Video, Link2, Upload,
  Trash2, Eye, CheckCircle2, Zap, X, RefreshCw, Play,
  Bell, AlertCircle, Hourglass, PauseCircle
} from "lucide-react";

// ── CONSTANTS ───────────────────────────────────────────────────────────────

const PHOTO_LOCATIONS = [
  { key: "galeria",        label: "Galeria Geral",           emoji: "🖼️" },
  { key: "home",           label: "Momentos da Home",         emoji: "🏠" },
  { key: "hotelzinho",     label: "Hotelzinho",               emoji: "🐾" },
  { key: "conhecer",       label: "Venha Nos Conhecer",       emoji: "👁️" },
  { key: "transporte",     label: "Transporte",               emoji: "🚐" },
  { key: "destaques_home", label: "Destaques Home",           emoji: "⭐" },
  { key: "destaques_hotel",label: "Destaques Hotelzinho",     emoji: "⭐" },
];

const VIDEO_LOCATIONS = [
  { key: "geral",      label: "Geral",               emoji: "🎬" },
  { key: "home",       label: "Destaque na Home",    emoji: "🏠" },
  { key: "hotelzinho", label: "Hotelzinho",           emoji: "🐾" },
  { key: "conhecer",   label: "Venha Nos Conhecer",  emoji: "👁️" },
];

const primaryPhotoLoc = (locs: string[]) => locs.find((l) => l !== "home") ?? "galeria";
const primaryVideoLoc = (locs: string[]) => locs.find((l) => l !== "home") ?? "geral";

// ── HELPERS ─────────────────────────────────────────────────────────────────

function formatCountdown(targetIso: string): string {
  const diff = new Date(targetIso).getTime() - Date.now();
  if (diff <= 0) return "Publicando...";
  const totalSec = Math.floor(diff / 1000);
  const s = totalSec % 60;
  const totalMin = Math.floor(totalSec / 60);
  const m = totalMin % 60;
  const totalHr = Math.floor(totalMin / 60);
  const h = totalHr % 24;
  const d = Math.floor(totalHr / 24);
  if (d > 0) return `${d}d ${h}h ${m}min`;
  if (h > 0) return `${h}h ${m}min ${s}s`;
  if (m > 0) return `${m}min ${s}s`;
  return `${s}s`;
}

function formatBR(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function computePublishAt(
  mode: "now" | "datetime" | "timer",
  dateStr: string,
  timeStr: string,
  timerVal: number,
  timerUnit: "seconds" | "minutes" | "hours" | "days"
): Date | null {
  if (mode === "now") return null;
  if (mode === "datetime") {
    const combined = `${dateStr}T${timeStr}`;
    const d = new Date(combined);
    return isNaN(d.getTime()) ? null : d;
  }
  // timer
  const multMap = { seconds: 1000, minutes: 60000, hours: 3600000, days: 86400000 };
  return new Date(Date.now() + timerVal * multMap[timerUnit]);
}

// ── COUNTDOWN COMPONENT ──────────────────────────────────────────────────────

function Countdown({ targetIso }: { targetIso: string }) {
  const [, tick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => tick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = new Date(targetIso).getTime() - Date.now();
  const urgent = diff < 5 * 60 * 1000; // < 5 min
  return (
    <span className={`font-mono font-bold text-sm ${urgent ? "text-orange-400 animate-pulse" : "text-primary"}`}>
      {formatCountdown(targetIso)}
    </span>
  );
}

// ── SCHEDULE PREVIEW ─────────────────────────────────────────────────────────

function SchedulePreview({
  mode, dateStr, timeStr, timerVal, timerUnit,
}: {
  mode: "now" | "datetime" | "timer";
  dateStr: string; timeStr: string;
  timerVal: number; timerUnit: "seconds" | "minutes" | "hours" | "days";
}) {
  const target = computePublishAt(mode, dateStr, timeStr, timerVal, timerUnit);
  if (mode === "now") {
    return (
      <div className="flex items-center gap-2 text-xs text-green-400 bg-green-400/10 border border-green-400/20 rounded-lg px-3 py-2">
        <Zap className="w-3.5 h-3.5" /> Publicação imediata ao confirmar
      </div>
    );
  }
  if (!target || isNaN(target.getTime())) {
    return (
      <div className="flex items-center gap-2 text-xs text-[#71717A] bg-[#27272A] border border-[#3F3F46] rounded-lg px-3 py-2">
        <AlertCircle className="w-3.5 h-3.5" /> Defina data/hora ou timer válido
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 text-xs text-primary bg-primary/10 border border-primary/20 rounded-lg px-3 py-2">
      <Bell className="w-3.5 h-3.5" />
      Publicar em: <strong>{formatBR(target.toISOString())}</strong>
      <span className="ml-auto text-[#A1A1AA]">({formatCountdown(target.toISOString())})</span>
    </div>
  );
}

// ── QUEUE ITEM ──────────────────────────────────────────────────────────────

function QueueItem({
  item, onPublishNow, onCancel,
}: {
  item: any; onPublishNow: () => void; onCancel: () => void;
}) {
  const isPhoto = item._kind === "photo";
  const thumb = isPhoto ? item.image_url : (item.thumbnail_url || item.video_url);
  const locs = isPhoto
    ? [...(item.locations ?? [item.category ?? "galeria"])]
    : [...(item.locations ?? [item.category ?? "geral"])];
  const allLocs = isPhoto ? PHOTO_LOCATIONS : VIDEO_LOCATIONS;

  return (
    <div className="bg-[#18181B] rounded-xl border border-[#27272A] overflow-hidden flex items-stretch gap-0">
      {/* Thumbnail */}
      <div className="w-24 shrink-0 bg-black relative">
        {thumb ? (
          <img src={thumb} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#3F3F46]">
            {isPhoto ? <ImageIcon className="w-6 h-6" /> : <Video className="w-6 h-6" />}
          </div>
        )}
        <span className={`absolute top-1 left-1 text-[9px] font-bold px-1.5 py-0.5 rounded ${isPhoto ? "bg-blue-500 text-white" : "bg-purple-500 text-white"}`}>
          {isPhoto ? "FOTO" : "VÍDEO"}
        </span>
      </div>

      {/* Info */}
      <div className="flex-1 p-3 min-w-0">
        <p className="text-sm text-white font-medium truncate mb-1">{item.title || "Sem título"}</p>
        <div className="flex flex-wrap gap-1 mb-2">
          {locs.map((l: string) => {
            const loc = allLocs.find((x) => x.key === l);
            return loc ? (
              <span key={l} className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded font-heading">
                {loc.emoji} {loc.label}
              </span>
            ) : null;
          })}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[11px] text-[#71717A]">
            <Calendar className="w-3 h-3" />
            {item.publish_at ? formatBR(item.publish_at) : "—"}
          </div>
          {item.publish_at && (
            <div className="flex items-center gap-1.5">
              <Hourglass className="w-3 h-3 text-[#71717A]" />
              <Countdown targetIso={item.publish_at} />
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-1 p-2 border-l border-[#27272A] justify-center">
        <button
          onClick={onPublishNow}
          title="Publicar agora"
          className="p-2 rounded-lg bg-green-500/20 hover:bg-green-500 text-green-400 hover:text-white transition-colors"
        >
          <Play className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onCancel}
          title="Cancelar agendamento"
          className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function AdminAgendamento() {
  const { toast } = useToast();

  // ─ UI State ─
  const [tab, setTab] = useState<"new" | "queue" | "recent">("new");
  const [mediaType, setMediaType] = useState<"photo" | "video">("photo");
  const [videoMode, setVideoMode] = useState<"link" | "upload">("link");

  // ─ Form State ─
  const [title, setTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [thumbUrl, setThumbUrl] = useState("");
  const [locations, setLocations] = useState<string[]>(["galeria"]);
  const [saving, setSaving] = useState(false);

  // ─ Schedule State ─
  const [schedMode, setSchedMode] = useState<"now" | "datetime" | "timer">("now");
  const today = new Date().toISOString().split("T")[0];
  const nowTime = new Date().toTimeString().slice(0, 5);
  const [schedDate, setSchedDate] = useState(today);
  const [schedTime, setSchedTime] = useState(nowTime);
  const [timerVal, setTimerVal] = useState(30);
  const [timerUnit, setTimerUnit] = useState<"seconds" | "minutes" | "hours" | "days">("minutes");

  // ─ Queue & Recent ─
  const [queueItems, setQueueItems] = useState<any[]>([]);
  const [recentItems, setRecentItems] = useState<any[]>([]);
  const [loadingQueue, setLoadingQueue] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  // ─ Helpers ─
  const currentLocs = mediaType === "photo" ? PHOTO_LOCATIONS : VIDEO_LOCATIONS;
  const defaultLoc = mediaType === "photo" ? "galeria" : "geral";

  const toggleLoc = (key: string) =>
    setLocations((prev) =>
      prev.includes(key) ? (prev.length > 1 ? prev.filter((l) => l !== key) : prev) : [...prev, key]
    );

  const resetForm = () => {
    setTitle("");
    setLinkUrl("");
    setUploadedUrl("");
    setThumbUrl("");
    setLocations([defaultLoc]);
    setSchedMode("now");
    setSchedDate(today);
    setSchedTime(nowTime);
    setTimerVal(30);
    setTimerUnit("minutes");
  };

  // ─ Switch media type → reset locations ─
  useEffect(() => {
    setLocations([defaultLoc]);
  }, [mediaType]);

  // ─ Fetch Queue ───────────────────────────────────────────────────────────

  const fetchQueue = useCallback(async () => {
    setLoadingQueue(true);
    const [{ data: photos }, { data: videos }] = await Promise.all([
      supabase.from("photos").select("*").eq("is_active", false).not("publish_at", "is", null).order("publish_at"),
      supabase.from("videos").select("*").eq("is_active", false).not("publish_at", "is", null).order("publish_at"),
    ]);
    const merged = [
      ...(photos ?? []).map((p) => ({ ...p, _kind: "photo" })),
      ...(videos ?? []).map((v) => ({ ...v, _kind: "video" })),
    ].sort((a, b) => new Date(a.publish_at).getTime() - new Date(b.publish_at).getTime());
    setQueueItems(merged);
    setLoadingQueue(false);
  }, []);

  // ─ Fetch Recent ──────────────────────────────────────────────────────────

  const fetchRecent = useCallback(async () => {
    const cutoff = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
    const [{ data: photos }, { data: videos }] = await Promise.all([
      supabase.from("photos").select("*").eq("is_active", true).gte("created_at", cutoff).order("created_at", { ascending: false }).limit(20),
      supabase.from("videos").select("*").eq("is_active", true).gte("published_at", cutoff).order("published_at", { ascending: false }).limit(20),
    ]);
    const merged = [
      ...(photos ?? []).map((p) => ({ ...p, _kind: "photo" })),
      ...(videos ?? []).map((v) => ({ ...v, _kind: "video" })),
    ].sort((a, b) => {
      const aDate = a._kind === "photo" ? a.created_at : a.published_at;
      const bDate = b._kind === "photo" ? b.created_at : b.published_at;
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    });
    setRecentItems(merged);
  }, []);

  useEffect(() => {
    fetchQueue();
    fetchRecent();
  }, [fetchQueue, fetchRecent]);

  // ─ Auto-publisher (checks every 15s) ─────────────────────────────────────

  useEffect(() => {
    const check = async () => {
      const now = new Date().toISOString();
      const [{ data: duePhotos }, { data: dueVideos }] = await Promise.all([
        supabase.from("photos").select("id, title").eq("is_active", false).not("publish_at", "is", null).lte("publish_at" as any, now),
        supabase.from("videos").select("id, title").eq("is_active", false).not("publish_at", "is", null).lte("publish_at" as any, now),
      ]);

      const photoIds = (duePhotos ?? []).map((p) => p.id);
      const videoIds = (dueVideos ?? []).map((v) => v.id);

      if (photoIds.length > 0) {
        await supabase.from("photos").update({ is_active: true, publish_at: null } as any).in("id", photoIds);
      }
      if (videoIds.length > 0) {
        await supabase.from("videos").update({ is_active: true, publish_at: null } as any).in("id", videoIds);
      }

      const total = photoIds.length + videoIds.length;
      if (total > 0) {
        toast({ title: `✅ ${total} mídia${total > 1 ? "s" : ""} publicada${total > 1 ? "s" : ""} automaticamente!` });
        fetchQueue();
        fetchRecent();
      }
      setLastCheck(new Date());
    };

    check();
    const id = setInterval(check, 15000);
    return () => clearInterval(id);
  }, [fetchQueue, fetchRecent, toast]);

  // ─ Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    const mediaUrl = mediaType === "photo" ? uploadedUrl : (videoMode === "link" ? linkUrl : uploadedUrl);
    if (!mediaUrl.trim()) {
      toast({ title: "⚠️ Adicione a mídia antes de agendar", variant: "destructive" });
      return;
    }
    if (locations.length === 0) {
      toast({ title: "⚠️ Selecione ao menos uma categoria", variant: "destructive" });
      return;
    }

    const publishAt = computePublishAt(schedMode, schedDate, schedTime, timerVal, timerUnit);
    if (schedMode !== "now" && (!publishAt || isNaN(publishAt.getTime()))) {
      toast({ title: "⚠️ Defina um horário válido", variant: "destructive" });
      return;
    }
    if (publishAt && publishAt.getTime() <= Date.now() + 5000) {
      toast({ title: "⚠️ O horário precisa ser no futuro", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const isNow = schedMode === "now";

      if (mediaType === "photo") {
        await supabase.from("photos").insert({
          title: title || "Foto",
          image_url: mediaUrl,
          category: primaryPhotoLoc(locations),
          locations,
          is_featured: locations.includes("home"),
          is_active: isNow,
          publish_at: publishAt ? publishAt.toISOString() : null,
        } as any);
      } else {
        const thumb = videoMode === "link" ? getYoutubeThumbnail(linkUrl) : thumbUrl;
        const isYt = linkUrl.includes("youtube") || linkUrl.includes("youtu.be");
        await supabase.from("videos").insert({
          title: title || "Vídeo",
          video_url: mediaUrl,
          video_type: videoMode === "link" ? (isYt ? "youtube" : "link") : "upload",
          thumbnail_url: thumb || "",
          category: primaryVideoLoc(locations),
          locations,
          is_featured: locations.includes("home"),
          is_active: isNow,
          likes_count: 0,
          published_at: isNow ? new Date().toISOString() : null,
          publish_at: publishAt ? publishAt.toISOString() : null,
        } as any);
      }

      if (isNow) {
        toast({ title: "✅ Publicado imediatamente!" });
        fetchRecent();
      } else {
        toast({ title: `⏰ Agendado para ${formatBR(publishAt!.toISOString())}` });
        fetchQueue();
        setTab("queue");
      }
      resetForm();
    } catch (e: any) {
      toast({ title: "Erro ao salvar", description: e.message, variant: "destructive" });
    }
    setSaving(false);
  };

  // ─ Publish Now from Queue ─────────────────────────────────────────────────

  const handlePublishNow = async (item: any) => {
    const table = item._kind === "photo" ? "photos" : "videos";
    const extra = item._kind === "video" ? { published_at: new Date().toISOString() } : {};
    await supabase.from(table).update({ is_active: true, publish_at: null, ...extra } as any).eq("id", item.id);
    toast({ title: `✅ "${item.title || "Sem título"}" publicado!` });
    fetchQueue();
    fetchRecent();
  };

  // ─ Cancel from Queue ──────────────────────────────────────────────────────

  const handleCancelSchedule = async () => {
    if (!deleteTarget) return;
    const table = deleteTarget._kind === "photo" ? "photos" : "videos";
    // Remove the item entirely (it was never published)
    try {
      if (deleteTarget._kind === "photo" && deleteTarget.image_url?.includes("/levillepet-media/")) {
        const path = deleteTarget.image_url.split("/levillepet-media/")[1];
        if (path) await supabase.storage.from("levillepet-media").remove([path]);
      }
      if (deleteTarget._kind === "video" && deleteTarget.video_type === "upload" && deleteTarget.video_url?.includes("/levillepet-media/")) {
        const path = deleteTarget.video_url.split("/levillepet-media/")[1];
        if (path) await supabase.storage.from("levillepet-media").remove([path]);
      }
      await supabase.from(table).delete().eq("id", deleteTarget.id);
      toast({ title: "🗑️ Agendamento cancelado e mídia removida" });
    } catch {
      await supabase.from(table).delete().eq("id", deleteTarget.id);
      toast({ title: "🗑️ Agendamento cancelado" });
    }
    setDeleteTarget(null);
    fetchQueue();
  };

  // ─ RENDER ─────────────────────────────────────────────────────────────────

  const queueCount = queueItems.length;

  return (
    <AdminLayout title="📅 Agendamento de Mídia">

      {/* ── Tabs ── */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {[
          { key: "new",    label: "➕ Agendar Nova Mídia", },
          { key: "queue",  label: `⏳ Fila${queueCount > 0 ? ` (${queueCount})` : ""}`, },
          { key: "recent", label: "✅ Publicados Recentemente", },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as any)}
            className={`px-5 py-2.5 rounded-xl text-sm font-heading font-semibold transition-all ${
              tab === t.key
                ? "bg-primary text-black shadow-[0_0_20px_rgba(245,192,0,0.3)]"
                : "bg-[#18181B] text-[#A1A1AA] hover:text-white border border-[#27272A]"
            }`}
          >
            {t.label}
          </button>
        ))}
        {/* Auto-check indicator */}
        <div className="ml-auto flex items-center gap-2 text-[11px] text-[#3F3F46]">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          Auto-publish ativo · última verificação {lastCheck.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        </div>
      </div>

      {/* ══════════════════════ TAB: NOVA MÍDIA ══════════════════════ */}
      {tab === "new" && (
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">

          {/* Left: Form */}
          <div className="space-y-5">

            {/* Media Type */}
            <div className="bg-[#18181B] rounded-2xl p-5 border border-white/[0.07]">
              <p className="text-xs text-[#71717A] font-heading mb-3 uppercase tracking-wider">Tipo de mídia</p>
              <div className="flex gap-3">
                {[
                  { value: "photo", label: "📷 Foto", icon: ImageIcon },
                  { value: "video", label: "🎬 Vídeo", icon: Video },
                ].map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setMediaType(t.value as any)}
                    className={`flex-1 py-3 rounded-xl text-sm font-heading font-semibold transition-all border ${
                      mediaType === t.value
                        ? "bg-primary text-black border-primary"
                        : "bg-[#27272A] text-[#A1A1AA] border-[#3F3F46] hover:text-white"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div className="bg-[#18181B] rounded-2xl p-5 border border-white/[0.07]">
              <label className="text-xs text-[#71717A] font-heading uppercase tracking-wider block mb-2">Título (opcional)</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={mediaType === "photo" ? "Ex: Dia de banho do Totó" : "Ex: Tour pelo Hotelzinho"}
                className="w-full bg-[#27272A] border border-[#3F3F46] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-[#52525B] outline-none focus:border-primary/50 transition-colors"
              />
            </div>

            {/* Media Input */}
            <div className="bg-[#18181B] rounded-2xl p-5 border border-white/[0.07]">
              <p className="text-xs text-[#71717A] font-heading uppercase tracking-wider mb-3">
                {mediaType === "photo" ? "📷 Arquivo de foto" : "🎬 Vídeo"}
              </p>

              {mediaType === "photo" && (
                <MediaUploader
                  accept="image"
                  pathPrefix={`agendamento/fotos/${primaryPhotoLoc(locations)}`}
                  currentUrl={uploadedUrl}
                  onUploaded={(url) => setUploadedUrl(url)}
                  label=""
                />
              )}

              {mediaType === "video" && (
                <>
                  <div className="flex gap-2 mb-4">
                    {[
                      { value: "link", label: "🔗 Link YouTube" },
                      { value: "upload", label: "📤 Upload Arquivo" },
                    ].map((m) => (
                      <button
                        key={m.value}
                        onClick={() => setVideoMode(m.value as any)}
                        className={`flex-1 py-2 rounded-lg text-xs font-heading transition-all ${
                          videoMode === m.value
                            ? "bg-primary text-black"
                            : "bg-[#27272A] text-[#A1A1AA] hover:text-white"
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>

                  {videoMode === "link" && (
                    <div className="space-y-3">
                      <input
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        placeholder="https://youtube.com/watch?v=..."
                        className="w-full bg-[#27272A] border border-[#3F3F46] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-[#52525B] outline-none focus:border-primary/50"
                      />
                      {linkUrl && getYoutubeThumbnail(linkUrl) && (
                        <img src={getYoutubeThumbnail(linkUrl)} alt="thumb" className="w-full h-32 object-cover rounded-xl" />
                      )}
                    </div>
                  )}

                  {videoMode === "upload" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-[#A1A1AA] mb-2 block">🎬 Arquivo de vídeo *</label>
                        <MediaUploader
                          accept="video"
                          pathPrefix={`agendamento/videos/${primaryVideoLoc(locations)}`}
                          currentUrl={uploadedUrl}
                          onUploaded={(url) => setUploadedUrl(url)}
                          label=""
                        />
                      </div>
                      <div>
                        <label className="text-xs text-[#A1A1AA] mb-2 block">🖼️ Capa (opcional)</label>
                        <MediaUploader
                          accept="image"
                          pathPrefix="agendamento/videos/thumbs"
                          currentUrl={thumbUrl}
                          onUploaded={(url) => setThumbUrl(url)}
                          label=""
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Locations */}
            <div className="bg-[#18181B] rounded-2xl p-5 border border-white/[0.07]">
              <p className="text-xs text-[#71717A] font-heading uppercase tracking-wider mb-3">
                Onde essa mídia deve aparecer?
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {currentLocs.map((loc) => {
                  const active = locations.includes(loc.key);
                  return (
                    <button
                      key={loc.key}
                      onClick={() => toggleLoc(loc.key)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-heading transition-all border ${
                        active
                          ? "bg-primary/20 text-primary border-primary/40"
                          : "bg-[#27272A] text-[#A1A1AA] border-[#3F3F46] hover:text-white hover:border-[#52525B]"
                      }`}
                    >
                      <span>{loc.emoji}</span>
                      <span className="truncate">{loc.label}</span>
                      {active && <CheckCircle2 className="w-3 h-3 ml-auto shrink-0" />}
                    </button>
                  );
                })}
              </div>
              {locations.length === 0 && (
                <p className="text-xs text-red-400 mt-2">⚠️ Selecione ao menos um local</p>
              )}
            </div>
          </div>

          {/* Right: Scheduling panel */}
          <div className="space-y-5">

            {/* Schedule Mode */}
            <div className="bg-[#18181B] rounded-2xl p-5 border border-white/[0.07]">
              <p className="text-xs text-[#71717A] font-heading uppercase tracking-wider mb-3">⏰ Quando publicar?</p>
              <div className="space-y-2 mb-4">
                {[
                  { value: "now",      label: "⚡ Agora",         sub: "Publica imediatamente" },
                  { value: "datetime", label: "📅 Data e Hora",   sub: "Escolha dia e horário exato" },
                  { value: "timer",    label: "⏱️ Timer",          sub: "Conta regressiva a partir de agora" },
                ].map((m) => (
                  <button
                    key={m.value}
                    onClick={() => setSchedMode(m.value as any)}
                    className={`w-full flex items-start gap-3 px-4 py-3 rounded-xl text-left transition-all border ${
                      schedMode === m.value
                        ? "bg-primary/10 border-primary/40 text-primary"
                        : "bg-[#27272A] border-[#3F3F46] text-[#A1A1AA] hover:text-white hover:border-[#52525B]"
                    }`}
                  >
                    <span className="font-heading font-semibold text-sm">{m.label}</span>
                    <span className="text-[11px] ml-auto text-[#71717A] mt-0.5">{m.sub}</span>
                  </button>
                ))}
              </div>

              {/* DateTime Inputs */}
              {schedMode === "datetime" && (
                <div className="space-y-3 mt-4">
                  <div>
                    <label className="text-xs text-[#A1A1AA] mb-1.5 block flex items-center gap-1"><Calendar className="w-3 h-3" /> Data</label>
                    <input
                      type="date"
                      value={schedDate}
                      min={today}
                      onChange={(e) => setSchedDate(e.target.value)}
                      className="w-full bg-[#27272A] border border-[#3F3F46] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-primary/50 [color-scheme:dark]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#A1A1AA] mb-1.5 block flex items-center gap-1"><Clock className="w-3 h-3" /> Horário</label>
                    <input
                      type="time"
                      value={schedTime}
                      onChange={(e) => setSchedTime(e.target.value)}
                      className="w-full bg-[#27272A] border border-[#3F3F46] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-primary/50 [color-scheme:dark]"
                    />
                  </div>
                </div>
              )}

              {/* Timer Inputs */}
              {schedMode === "timer" && (
                <div className="mt-4">
                  <label className="text-xs text-[#A1A1AA] mb-1.5 block flex items-center gap-1"><Timer className="w-3 h-3" /> Publicar daqui a</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min={1}
                      value={timerVal}
                      onChange={(e) => setTimerVal(Math.max(1, parseInt(e.target.value) || 1))}
                      className="flex-1 bg-[#27272A] border border-[#3F3F46] rounded-xl px-4 py-2.5 text-sm text-white text-center outline-none focus:border-primary/50"
                    />
                    <select
                      value={timerUnit}
                      onChange={(e) => setTimerUnit(e.target.value as any)}
                      className="flex-1 bg-[#27272A] border border-[#3F3F46] rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-primary/50 [color-scheme:dark]"
                    >
                      <option value="seconds">segundos</option>
                      <option value="minutes">minutos</option>
                      <option value="hours">horas</option>
                      <option value="days">dias</option>
                    </select>
                  </div>
                  {/* Quick presets */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {[
                      { val: 30, unit: "minutes", label: "30min" },
                      { val: 1,  unit: "hours",   label: "1h" },
                      { val: 2,  unit: "hours",   label: "2h" },
                      { val: 6,  unit: "hours",   label: "6h" },
                      { val: 12, unit: "hours",   label: "12h" },
                      { val: 1,  unit: "days",    label: "1 dia" },
                    ].map((p) => (
                      <button
                        key={p.label}
                        onClick={() => { setTimerVal(p.val); setTimerUnit(p.unit as any); }}
                        className="px-2.5 py-1 rounded-lg text-[11px] bg-[#27272A] text-[#A1A1AA] hover:bg-primary/20 hover:text-primary transition-colors font-heading"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview */}
              <div className="mt-4">
                <SchedulePreview
                  mode={schedMode}
                  dateStr={schedDate}
                  timeStr={schedTime}
                  timerVal={timerVal}
                  timerUnit={timerUnit}
                />
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="w-full py-4 rounded-2xl font-heading font-bold text-base bg-primary text-black hover:bg-primary/90 disabled:opacity-50 transition-all shadow-[0_0_30px_rgba(245,192,0,0.25)] hover:shadow-[0_0_40px_rgba(245,192,0,0.4)]"
            >
              {saving
                ? "⏳ Salvando..."
                : schedMode === "now"
                  ? "⚡ Publicar Agora"
                  : "📅 Confirmar Agendamento"
              }
            </button>

            {/* Info box */}
            <div className="bg-[#27272A] rounded-xl p-4 border border-[#3F3F46] text-xs text-[#71717A] space-y-1.5">
              <p className="text-[#A1A1AA] font-heading font-semibold mb-1">ℹ️ Como funciona</p>
              <p>• Mídias agendadas ficam <strong className="text-white">invisíveis no site</strong> até a hora certa.</p>
              <p>• O sistema verifica e publica automaticamente a cada <strong className="text-white">15 segundos</strong>.</p>
              <p>• Você pode publicar antecipadamente na aba <strong className="text-white">Fila</strong>.</p>
              <p>• O agendamento funciona <strong className="text-white">mesmo com o painel fechado</strong>, pois a verificação acontece no servidor via Supabase.</p>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════ TAB: FILA ══════════════════════ */}
      {tab === "queue" && (
        <div>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-heading font-bold text-lg">Fila de Agendamentos</h2>
              <p className="text-[#71717A] text-xs mt-0.5">
                {queueCount === 0
                  ? "Nenhuma mídia aguardando publicação"
                  : `${queueCount} mídia${queueCount > 1 ? "s" : ""} aguardando publicação automática`}
              </p>
            </div>
            <button
              onClick={() => fetchQueue()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#27272A] text-sm text-[#A1A1AA] hover:text-white transition-colors border border-[#3F3F46]"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Atualizar
            </button>
          </div>

          {loadingQueue ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-[#18181B] rounded-xl border border-[#27272A] animate-pulse" />
              ))}
            </div>
          ) : queueCount === 0 ? (
            <div className="text-center py-20 text-[#3F3F46]">
              <PauseCircle className="w-12 h-12 mx-auto mb-3" />
              <p className="text-sm">Fila vazia. Agende novas mídias na aba anterior.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {queueItems.map((item) => (
                <QueueItem
                  key={`${item._kind}-${item.id}`}
                  item={item}
                  onPublishNow={() => handlePublishNow(item)}
                  onCancel={() => setDeleteTarget(item)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════ TAB: RECENTES ══════════════════════ */}
      {tab === "recent" && (
        <div>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-heading font-bold text-lg">Publicados Recentemente</h2>
              <p className="text-[#71717A] text-xs mt-0.5">Últimos 7 dias · fotos e vídeos</p>
            </div>
            <button onClick={() => fetchRecent()} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#27272A] text-sm text-[#A1A1AA] hover:text-white border border-[#3F3F46]">
              <RefreshCw className="w-3.5 h-3.5" /> Atualizar
            </button>
          </div>

          {recentItems.length === 0 ? (
            <div className="text-center py-20 text-[#3F3F46]">
              <Eye className="w-12 h-12 mx-auto mb-3" />
              <p className="text-sm">Nenhuma publicação nos últimos 7 dias.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {recentItems.map((item) => {
                const thumb = item._kind === "photo" ? item.image_url : (item.thumbnail_url || "");
                const date = item._kind === "photo" ? item.created_at : item.published_at;
                return (
                  <div key={`${item._kind}-${item.id}`} className="bg-[#18181B] rounded-xl overflow-hidden border border-[#27272A] group">
                    <div className="relative aspect-video bg-black">
                      {thumb ? (
                        <img src={thumb} alt={item.title} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#3F3F46]">
                          <Video className="w-8 h-8" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-green-400" />
                      </div>
                      <span className={`absolute top-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded ${item._kind === "photo" ? "bg-blue-500 text-white" : "bg-purple-500 text-white"}`}>
                        {item._kind === "photo" ? "FOTO" : "VÍDEO"}
                      </span>
                    </div>
                    <div className="p-2.5">
                      <p className="text-xs text-white font-medium truncate">{item.title || "Sem título"}</p>
                      <p className="text-[10px] text-[#52525B] mt-0.5">{date ? formatBR(date) : "—"}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setDeleteTarget(null)}>
          <div className="bg-[#18181B] rounded-2xl p-6 max-w-sm w-full mx-4 border border-[#3F3F46] text-center" onClick={(e) => e.stopPropagation()}>
            <Trash2 className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <p className="text-white font-heading font-bold mb-1">Cancelar agendamento?</p>
            <p className="text-[#71717A] text-sm mb-5">
              "{deleteTarget.title || "Sem título"}" será removido da fila e a mídia deletada do storage.
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setDeleteTarget(null)} className="px-5 py-2 text-sm text-[#A1A1AA] hover:text-white bg-[#27272A] rounded-xl">
                Manter
              </button>
              <button onClick={handleCancelSchedule} className="px-5 py-2 text-sm bg-red-500 text-white rounded-xl hover:bg-red-600">
                Cancelar e Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
