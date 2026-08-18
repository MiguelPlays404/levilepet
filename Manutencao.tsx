import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { MediaUploader } from "@/components/MediaUploader";
import { AspectRatioPicker, aspectToOrientation, aspectStyle, type AspectRatio } from "@/components/AspectRatioPicker";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Trash2, Eye, EyeOff, Clock, CheckCircle, XCircle,
  Plus, ArrowUp, ArrowDown, Calendar,
  AlertCircle, Info
} from "lucide-react";

type Status = "live" | "scheduled" | "expired";

interface HojeItem {
  id: string;
  title: string | null;
  description: string | null;
  media_url: string;
  media_type: string;
  orientation: string;
  aspect_ratio: string | null;
  published_at: string;
  expires_at: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

const getStatus = (item: HojeItem): Status => {
  const now = new Date();
  const pub = new Date(item.published_at);
  if (!item.is_active) return "expired";
  if (pub > now) return "scheduled";
  if (item.expires_at && new Date(item.expires_at) <= now) return "expired";
  return "live";
};

const STATUS_TABS: { key: Status | "all"; label: string; icon: any; color: string }[] = [
  { key: "all",       label: "Todos",      icon: Calendar,     color: "text-white" },
  { key: "live",      label: "No ar agora",icon: CheckCircle,  color: "text-green-400" },
  { key: "scheduled", label: "Agendados",  icon: Clock,        color: "text-yellow-400" },
  { key: "expired",   label: "Expirados",  icon: XCircle,      color: "text-[#666]" },
];

const toLocalDatetime = (iso: string) => {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const nowLocalDatetime = () => toLocalDatetime(new Date().toISOString());

export default function AdminHojeNoLeVille() {
  const [items, setItems]       = useState<HojeItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState<Status | "all">("all");
  const [showForm, setShowForm] = useState(false);
  const { toast }               = useToast();

  // Form state
  const [fTitle, setFTitle]               = useState("");
  const [fDesc, setFDesc]                 = useState("");
  const [fMediaUrl, setFMediaUrl]         = useState("");
  const [fMediaType, setFMediaType]       = useState<"image"|"video">("image");
  const [fAspect, setFAspect]             = useState<AspectRatio | "">("");
  const [fPublishedAt, setFPublishedAt]   = useState(nowLocalDatetime());
  const [fExpiresAt, setFExpiresAt]       = useState("");
  const [fHasExpiry, setFHasExpiry]       = useState(false);
  const [fSaving, setFSaving]             = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("hoje_no_le_ville")
      .select("*")
      .order("display_order", { ascending: true })
      .order("published_at", { ascending: false });
    setItems((data as any) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = tab === "all" ? items : items.filter(i => getStatus(i) === tab);

  // Contar por status
  const counts = items.reduce((acc, i) => {
    const s = getStatus(i);
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {} as Record<Status, number>);

  const handleUploaded = (url: string) => {
    setFMediaUrl(url);
    const isVid = /\.(mp4|webm|mov|avi|mkv)(\?|$)/i.test(url);
    setFMediaType(isVid ? "video" : "image");
    if (isVid) {
      setFAspect(""); // forçar escolha ao salvar
    }
  };

  const resetForm = () => {
    setFTitle(""); setFDesc(""); setFMediaUrl(""); setFMediaType("image");
    setFAspect(""); setFPublishedAt(nowLocalDatetime()); setFExpiresAt("");
    setFHasExpiry(false); setShowForm(false);
  };

  const handleSave = async () => {
    if (!fMediaUrl) {
      toast({ title: "Envie uma imagem ou vídeo antes de salvar", variant: "destructive" }); return;
    }
    if (!fAspect) {
      toast({ title: "⚠️ Selecione a proporção (obrigatório)", variant: "destructive" }); return;
    }
    setFSaving(true);
    const { error } = await supabase.from("hoje_no_le_ville").insert({
      title: fTitle || null,
      description: fDesc || null,
      media_url: fMediaUrl,
      media_type: fMediaType,
      orientation: aspectToOrientation(fAspect),
      aspect_ratio: fAspect,
      published_at: new Date(fPublishedAt).toISOString(),
      expires_at: fHasExpiry && fExpiresAt ? new Date(fExpiresAt).toISOString() : null,
      is_active: true,
      display_order: items.length,
    });
    setFSaving(false);
    if (error) { toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" }); return; }
    toast({ title: "✅ Publicação salva!" });
    resetForm();
    load();
  };

  const toggleActive = async (item: HojeItem) => {
    await supabase.from("hoje_no_le_ville").update({ is_active: !item.is_active }).eq("id", item.id);
    load();
  };

  const remove = async (item: HojeItem) => {
    if (!confirm(`Excluir "${item.title || "este item"}"? Esta ação não pode ser desfeita.`)) return;
    if (item.media_url?.includes("/levillepet-media/")) {
      const path = item.media_url.split("/levillepet-media/")[1];
      if (path) await supabase.storage.from("levillepet-media").remove([path]);
    }
    await supabase.from("hoje_no_le_ville").delete().eq("id", item.id);
    toast({ title: "✅ Removido" });
    load();
  };

  const reorder = async (item: HojeItem, dir: -1 | 1) => {
    await supabase.from("hoje_no_le_ville")
      .update({ display_order: (item.display_order || 0) + dir })
      .eq("id", item.id);
    load();
  };

  const updateExpiry = async (item: HojeItem, val: string) => {
    const expires_at = val ? new Date(val).toISOString() : null;
    await supabase.from("hoje_no_le_ville").update({ expires_at }).eq("id", item.id);
    load();
  };

  const liveCount = counts["live"] || 0;

  return (
    <AdminLayout title="Hoje no Le Ville">
      {/* Info banner */}
      <div className="flex items-start gap-3 bg-primary/10 border border-primary/30 rounded-xl px-4 py-3 mb-6 text-sm">
        <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <div>
          <p className="text-white font-heading font-semibold mb-0.5">Publicação 100% automática</p>
          <p className="text-[#A1A1AA]">
            O conteúdo aparece e some no horário exato que você definir — sem precisar estar online ou entrar no site. O site verifica automaticamente a cada 60 segundos.
          </p>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_TABS.map(t => {
          const count = t.key === "all" ? items.length : (counts[t.key as Status] || 0);
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-heading transition-colors ${
                tab === t.key ? "bg-primary text-black font-semibold" : "bg-[#18181B] text-[#A1A1AA] hover:text-white"
              }`}
            >
              <Icon className={`w-4 h-4 ${tab === t.key ? "text-black" : t.color}`} />
              {t.label}
              {count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === t.key ? "bg-black/20" : "bg-[#27272A]"}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Warning se muitos no ar */}
      {liveCount > 6 && (
        <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-4 py-3 mb-5 text-yellow-300 text-sm">
          <AlertCircle className="w-4 h-4" />
          Há {liveCount} itens no ar ao mesmo tempo. O site mostra todos — considere expirar alguns mais antigos.
        </div>
      )}

      {/* Botão novo */}
      <div className="flex justify-end mb-5">
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-2 bg-primary text-black font-heading font-bold px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Nova publicação
        </button>
      </div>

      {/* FORM */}
      {showForm && (
        <div className="bg-[#18181B] rounded-2xl p-6 mb-6 border border-primary/30 space-y-5">
          <h3 className="font-heading font-bold text-white text-base">Nova publicação — Hoje no Le Ville</h3>

          {/* Upload */}
          <div>
            <label className="block text-xs text-[#A1A1AA] mb-2 font-heading">
              Mídia (imagem ou vídeo) <span className="text-red-400">*</span>
            </label>
            <MediaUploader
              accept="both"
              pathPrefix="hoje-le-ville"
              onUploaded={handleUploaded}
              currentUrl={fMediaUrl}
              label=""
            />
            {fMediaUrl && (
              <p className="text-[11px] text-green-400 mt-1.5 font-heading">
                ✅ {fMediaType === "video" ? "Vídeo" : "Imagem"} carregado
              </p>
            )}
          </div>

          {/* Proporção — OBRIGATÓRIO */}
          <AspectRatioPicker value={fAspect} onChange={setFAspect} required />


          {/* Título e descrição */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#A1A1AA] mb-1.5 font-heading">Título (opcional)</label>
              <input
                value={fTitle}
                onChange={e => setFTitle(e.target.value)}
                placeholder="Ex: Semana da Vacinação 🐶"
                className="w-full bg-[#27272A] border border-[#3F3F46] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#52525B]"
              />
            </div>
            <div>
              <label className="block text-xs text-[#A1A1AA] mb-1.5 font-heading">Descrição (opcional)</label>
              <input
                value={fDesc}
                onChange={e => setFDesc(e.target.value)}
                placeholder="Ex: Só esta semana, desconto de 20%"
                className="w-full bg-[#27272A] border border-[#3F3F46] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#52525B]"
              />
            </div>
          </div>

          {/* Publicar em */}
          <div>
            <label className="block text-xs text-[#A1A1AA] mb-1.5 font-heading">
              Publicar em <span className="text-[#71717A]">(data e hora em que aparece no site)</span>
            </label>
            <input
              type="datetime-local"
              value={fPublishedAt}
              onChange={e => setFPublishedAt(e.target.value)}
              className="w-full bg-[#27272A] border border-[#3F3F46] rounded-lg px-3 py-2.5 text-sm text-white"
            />
            <p className="text-[11px] text-[#71717A] mt-1">
              Deixe como agora para publicar imediatamente. Ou agende para o futuro — aparece automaticamente no horário.
            </p>
          </div>

          {/* Expirar */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <button
                type="button"
                onClick={() => setFHasExpiry(v => !v)}
                className={`relative w-10 h-5 rounded-full transition-colors ${fHasExpiry ? "bg-primary" : "bg-[#3F3F46]"}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${fHasExpiry ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
              <label className="text-xs text-[#A1A1AA] font-heading cursor-pointer" onClick={() => setFHasExpiry(v => !v)}>
                Definir data/hora de expiração (some automaticamente)
              </label>
            </div>
            {fHasExpiry && (
              <>
                <input
                  type="datetime-local"
                  value={fExpiresAt}
                  onChange={e => setFExpiresAt(e.target.value)}
                  min={fPublishedAt}
                  className="w-full bg-[#27272A] border border-[#3F3F46] rounded-lg px-3 py-2.5 text-sm text-white"
                />
                <p className="text-[11px] text-[#71717A] mt-1">
                  Nesse horário exato o conteúdo some do site automaticamente.
                </p>
              </>
            )}
          </div>

          {/* Ações */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={handleSave}
              disabled={fSaving || !fMediaUrl || !fAspect}
              className="flex-1 bg-primary text-black font-heading font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {fSaving ? "Salvando..." : "✅ Salvar publicação"}
            </button>
            <button
              onClick={resetForm}
              className="px-5 py-3 rounded-xl bg-[#27272A] text-[#A1A1AA] hover:text-white font-heading text-sm transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-square skeleton rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-[#18181B] rounded-2xl border border-white/[0.07]">
          <Clock className="w-10 h-10 text-primary/40 mx-auto mb-3" />
          <p className="text-[#A1A1AA] text-sm">
            {tab === "all" ? "Nenhuma publicação ainda." :
             tab === "live" ? "Nada no ar agora." :
             tab === "scheduled" ? "Nenhum item agendado." :
             "Nenhum item expirado."}
          </p>
          <p className="text-[#71717A] text-xs mt-1">Use o botão "Nova publicação" acima.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((item) => {
            const status = getStatus(item);
            const isVideo = item.media_type === "video";
            const ar = (item.aspect_ratio || (item.orientation === "vertical" ? "9:16" : "16:9"));
            const isVertical = ar === "9:16" || ar === "3:4";

            const statusBadge = {
              live:      { label: "🟢 No ar", cls: "bg-green-500/20 text-green-300 border-green-500/30" },
              scheduled: { label: "🕐 Agendado", cls: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" },
              expired:   { label: "⛔ Expirado", cls: "bg-[#27272A] text-[#666] border-[#3F3F46]" },
            }[status];

            const pubDate = new Date(item.published_at).toLocaleString("pt-BR", { day:"2-digit", month:"2-digit", year:"2-digit", hour:"2-digit", minute:"2-digit" });
            const expDate = item.expires_at ? new Date(item.expires_at).toLocaleString("pt-BR", { day:"2-digit", month:"2-digit", year:"2-digit", hour:"2-digit", minute:"2-digit" }) : null;

            return (
              <div
                key={item.id}
                className={`bg-[#18181B] rounded-xl overflow-hidden border transition-opacity ${
                  status === "expired" ? "border-[#27272A] opacity-50" :
                  status === "live" ? "border-green-500/30" : "border-yellow-500/30"
                }`}
              >
                {/* Preview */}
                <div
                  className="relative bg-black overflow-hidden"
                  style={{ ...aspectStyle(ar), maxHeight: isVertical ? "240px" : "180px" }}
                >
                  {isVideo ? (
                    <video
                      src={item.media_url}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                      preload="metadata"
                    />
                  ) : (
                    <img
                      src={item.media_url}
                      alt={item.title || ""}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
                    />
                  )}
                  {/* Status badge */}
                  <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded border ${statusBadge.cls}`}>
                    {statusBadge.label}
                  </span>
                  {/* Orientation badge */}
                  <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded bg-black/60 text-white border border-white/10">
                    {ar}
                  </span>
                </div>

                {/* Info */}
                <div className="p-3 space-y-2.5">
                  {item.title && (
                    <p className="text-white text-xs font-heading font-semibold truncate">{item.title}</p>
                  )}

                  {/* Datas */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-[10px] text-[#71717A]">
                      <span className="text-green-400">▶</span>
                      <span>Publicado: <span className="text-[#A1A1AA]">{pubDate}</span></span>
                    </div>

                    {/* Expiry editor inline */}
                    <div className="flex items-center gap-1 text-[10px] text-[#71717A]">
                      <span className="text-red-400">■</span>
                      <span>Expira:</span>
                      <input
                        type="datetime-local"
                        defaultValue={item.expires_at ? toLocalDatetime(item.expires_at) : ""}
                        onChange={(e) => updateExpiry(item, e.target.value)}
                        className="flex-1 bg-[#27272A] border border-[#3F3F46] rounded px-1.5 py-0.5 text-[10px] text-white"
                        title="Deixe vazio para nunca expirar"
                      />
                    </div>
                    {expDate && (
                      <p className="text-[10px] text-[#71717A] pl-3">→ {expDate}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 pt-1">
                    <button
                      onClick={() => reorder(item, -1)}
                      title="Subir"
                      className="flex-1 py-1.5 rounded bg-[#27272A] hover:bg-primary/20 text-white transition-colors"
                    >
                      <ArrowUp className="w-3 h-3 mx-auto" />
                    </button>
                    <button
                      onClick={() => reorder(item, 1)}
                      title="Descer"
                      className="flex-1 py-1.5 rounded bg-[#27272A] hover:bg-primary/20 text-white transition-colors"
                    >
                      <ArrowDown className="w-3 h-3 mx-auto" />
                    </button>
                    <button
                      onClick={() => toggleActive(item)}
                      title={item.is_active ? "Ocultar" : "Mostrar"}
                      className="flex-1 py-1.5 rounded bg-[#27272A] hover:bg-white/10 text-white transition-colors"
                    >
                      {item.is_active
                        ? <Eye className="w-3 h-3 mx-auto text-green-400" />
                        : <EyeOff className="w-3 h-3 mx-auto text-red-400" />}
                    </button>
                    <button
                      onClick={() => remove(item)}
                      title="Excluir"
                      className="px-2.5 py-1.5 rounded bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}
