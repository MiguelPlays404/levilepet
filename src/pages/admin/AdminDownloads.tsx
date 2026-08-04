import { useEffect, useState, useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Image as ImageIcon, Video as VideoIcon, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import {
  RATIOS,
  ratioOf,
  bulkDownloadStore,
  startBulkDownload,
  type Ratio,
} from "@/lib/bulkDownload";

type RangeState = { from: string; to: string };

function sliceByRange(items: any[], range: RangeState) {
  const from = Math.max(1, parseInt(range.from) || 1);
  const to = Math.min(items.length, parseInt(range.to) || items.length);
  if (to < from) return [];
  return items.slice(from - 1, to);
}

export default function AdminDownloads() {
  const [photos, setPhotos] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupByRatio, setGroupByRatio] = useState(true);
  const [cropPhotos, setCropPhotos] = useState(true);
  const [customPhotos, setCustomPhotos] = useState(false);
  const [customVideos, setCustomVideos] = useState(false);
  const [photoRange, setPhotoRange] = useState<RangeState>({ from: "1", to: "" });
  const [videoRange, setVideoRange] = useState<RangeState>({ from: "1", to: "" });
  const [photoRatios, setPhotoRatios] = useState<Ratio[]>([]);
  const [videoRatios, setVideoRatios] = useState<Ratio[]>([]);

  const state = useSyncExternalStore(bulkDownloadStore.subscribe, bulkDownloadStore.getSnapshot);
  const busy = state.running;

  useEffect(() => {
    (async () => {
      const [p, v] = await Promise.all([
        supabase.from("photos").select("*").order("created_at", { ascending: true }),
        supabase.from("videos").select("*").order("created_at", { ascending: true }),
      ]);
      setPhotos(p.data || []);
      setVideos(v.data || []);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (state.finishedMessage) {
      toast.success(state.finishedMessage);
      bulkDownloadStore.clearMessages();
    }
    if (state.errorMessage) {
      toast.error(state.errorMessage);
      bulkDownloadStore.clearMessages();
    }
  }, [state.finishedMessage, state.errorMessage]);

  const downloadableVideos = videos.filter((v) => v.video_type === "upload" && v.video_url);
  const externalVideos = videos.filter((v) => v.video_type !== "upload");

  const filterRatios = (items: any[], ratios: Ratio[]) =>
    ratios.length ? items.filter((i) => ratios.includes(ratioOf(i))) : items;

  const selectedPhotos = customPhotos
    ? sliceByRange(filterRatios(photos, photoRatios), photoRange)
    : photos;
  const selectedVideos = customVideos
    ? sliceByRange(filterRatios(downloadableVideos, videoRatios), videoRange)
    : downloadableVideos;

  function toggleRatio(list: Ratio[], set: (v: Ratio[]) => void, r: Ratio) {
    set(list.includes(r) ? list.filter((x) => x !== r) : [...list, r]);
  }

  function downloadPhotos() {
    if (!selectedPhotos.length) return toast.error("Nenhuma foto na seleção.");
    startBulkDownload({
      kind: "fotos",
      items: selectedPhotos,
      urlOf: (p) => p.image_url,
      fallbackExt: "jpg",
      namePrefix: "foto",
      groupByRatio,
      crop: cropPhotos,
    });
  }

  function downloadVideos() {
    if (!selectedVideos.length) return toast.error("Nenhum vídeo na seleção.");
    startBulkDownload({
      kind: "videos",
      items: selectedVideos,
      urlOf: (v) => v.video_url,
      fallbackExt: "mp4",
      namePrefix: "video",
      groupByRatio,
      crop: false,
      extraFiles: externalVideos.length
        ? [
            {
              name: "links-externos.txt",
              content: externalVideos
                .map((v, i) => `${i + 1}. ${v.title || "sem título"} — ${v.video_url}`)
                .join("\n"),
            },
          ]
        : [],
    });
  }

  const counts = (items: any[]) =>
    RATIOS.map((r) => ({ r, n: items.filter((i) => ratioOf(i) === r).length })).filter((x) => x.n > 0);

  const rangeEditor = (
    total: number,
    range: RangeState,
    setRange: (r: RangeState) => void,
    ratios: Ratio[],
    setRatios: (r: Ratio[]) => void,
    selected: number
  ) => (
    <div className="space-y-3 mb-4 rounded-lg bg-[#0F0F11] border border-white/[0.06] p-3">
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Label className="text-[11px] text-[#71717A]">De</Label>
          <Input
            inputMode="numeric"
            value={range.from}
            onChange={(e) => setRange({ ...range, from: e.target.value.replace(/\D/g, "") })}
            placeholder="1"
            className="h-8 text-sm"
          />
        </div>
        <div className="flex-1">
          <Label className="text-[11px] text-[#71717A]">Até</Label>
          <Input
            inputMode="numeric"
            value={range.to}
            onChange={(e) => setRange({ ...range, to: e.target.value.replace(/\D/g, "") })}
            placeholder={String(total)}
            className="h-8 text-sm"
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {RATIOS.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => toggleRatio(ratios, setRatios, r)}
            aria-label={`Filtrar proporção ${r}`}
            className={`px-2 py-1 rounded-md text-[11px] font-body border ${
              ratios.includes(r)
                ? "bg-primary text-black border-primary"
                : "bg-transparent text-[#A1A1AA] border-white/10"
            }`}
          >
            {r}
          </button>
        ))}
      </div>
      <p className="text-[11px] text-[#71717A] font-body">{selected} item(ns) selecionado(s)</p>
    </div>
  );

  return (
    <AdminLayout title="Downloads em Massa">
      <div className="max-w-4xl space-y-6">
        <p className="text-[#A1A1AA] text-sm font-body">
          Baixe fotos ou vídeos em um único ZIP, já numerados
          (<span className="text-primary">foto 1, foto 2…</span> / <span className="text-primary">video 1, video 2…</span>)
          e mantendo a proporção usada no site. Os arquivos são baixados em paralelo e o download
          continua rodando mesmo se você navegar para outra página do painel.
        </p>

        <Card className="bg-[#18181B] border-white/[0.07] p-5 space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <Checkbox checked={groupByRatio} onCheckedChange={(v) => setGroupByRatio(!!v)} />
            <span className="text-sm text-[#ccc] font-body">Separar em pastas por proporção (16x9, 9x16…)</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <Checkbox checked={cropPhotos} onCheckedChange={(v) => setCropPhotos(!!v)} />
            <span className="text-sm text-[#ccc] font-body">
              Recortar fotos exatamente na proporção exibida no site (recomendado)
            </span>
          </label>
        </Card>

        <div className="grid md:grid-cols-2 gap-4">
          <Card className="bg-[#18181B] border-white/[0.07] p-6">
            <div className="flex items-center gap-3 mb-3">
              <ImageIcon className="w-5 h-5 text-blue-400" />
              <h2 className="font-heading font-semibold text-white">Fotos</h2>
            </div>
            <p className="text-3xl font-heading font-extrabold text-white mb-1">
              {loading ? "…" : photos.length}
            </p>
            <p className="text-xs text-[#71717A] font-body mb-3">
              {counts(photos).map((c) => `${c.n}× ${c.r}`).join(" · ") || "Nenhuma foto"}
            </p>

            <label className="flex items-center gap-3 cursor-pointer mb-3">
              <Checkbox checked={customPhotos} onCheckedChange={(v) => setCustomPhotos(!!v)} />
              <span className="text-xs text-[#ccc] font-body">Quantidade personalizada</span>
            </label>
            {customPhotos &&
              rangeEditor(photos.length, photoRange, setPhotoRange, photoRatios, setPhotoRatios, selectedPhotos.length)}

            <Button onClick={downloadPhotos} disabled={!!busy || loading} className="w-full">
              {busy === "fotos" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
              Baixar {customPhotos ? `${selectedPhotos.length} fotos` : "todas as fotos"} (.zip)
            </Button>
          </Card>

          <Card className="bg-[#18181B] border-white/[0.07] p-6">
            <div className="flex items-center gap-3 mb-3">
              <VideoIcon className="w-5 h-5 text-purple-400" />
              <h2 className="font-heading font-semibold text-white">Vídeos</h2>
            </div>
            <p className="text-3xl font-heading font-extrabold text-white mb-1">
              {loading ? "…" : downloadableVideos.length}
            </p>
            <p className="text-xs text-[#71717A] font-body mb-3">
              {counts(downloadableVideos).map((c) => `${c.n}× ${c.r}`).join(" · ") || "Nenhum vídeo enviado"}
            </p>

            <label className="flex items-center gap-3 cursor-pointer mb-3">
              <Checkbox checked={customVideos} onCheckedChange={(v) => setCustomVideos(!!v)} />
              <span className="text-xs text-[#ccc] font-body">Quantidade personalizada</span>
            </label>
            {customVideos &&
              rangeEditor(
                downloadableVideos.length,
                videoRange,
                setVideoRange,
                videoRatios,
                setVideoRatios,
                selectedVideos.length
              )}

            <Button onClick={downloadVideos} disabled={!!busy || loading} className="w-full">
              {busy === "videos" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
              Baixar {customVideos ? `${selectedVideos.length} vídeos` : "todos os vídeos"} (.zip)
            </Button>
          </Card>
        </div>

        {externalVideos.length > 0 && (
          <Card className="bg-[#18181B] border-yellow-500/20 p-4 flex gap-3">
            <AlertTriangle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-[#A1A1AA] font-body">
              {externalVideos.length} vídeo(s) são links externos (YouTube/Instagram) e não podem ser
              baixados diretamente — os endereços vão dentro do ZIP em <code>links-externos.txt</code>.
            </p>
          </Card>
        )}

        {busy && (
          <Card className="bg-[#18181B] border-white/[0.07] p-5">
            <p className="text-sm text-[#ccc] font-body mb-2">{state.label}</p>
            <div className="h-2 rounded-full bg-[#27272A] overflow-hidden">
              <div className="h-full bg-primary transition-all" style={{ width: `${state.percent}%` }} />
            </div>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
