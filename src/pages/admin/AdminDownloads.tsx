import { useEffect, useState } from "react";
import JSZip from "jszip";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, Image as ImageIcon, Video as VideoIcon, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const RATIOS = ["16:9", "4:3", "1:1", "3:4", "9:16"] as const;
type Ratio = (typeof RATIOS)[number];

function ratioOf(item: any): Ratio {
  const r = item.aspect_ratio || (item.orientation === "vertical" ? "9:16" : "16:9");
  return (RATIOS as readonly string[]).includes(r) ? (r as Ratio) : "16:9";
}

function ratioValue(r: Ratio): number {
  const [w, h] = r.split(":").map(Number);
  return w / h;
}

function extFromUrl(url: string, fallback: string) {
  const clean = url.split("?")[0].split("#")[0];
  const m = clean.match(/\.([a-zA-Z0-9]{2,5})$/);
  return m ? m[1].toLowerCase() : fallback;
}

/** Recorta a imagem exatamente na proporção usada no site (object-cover centralizado). */
async function cropToRatio(blob: Blob, ratio: Ratio): Promise<{ blob: Blob; ext: string }> {
  const target = ratioValue(ratio);
  const bitmap = await createImageBitmap(blob);
  const srcRatio = bitmap.width / bitmap.height;

  let sx = 0, sy = 0, sw = bitmap.width, sh = bitmap.height;
  if (srcRatio > target) {
    sw = Math.round(bitmap.height * target);
    sx = Math.round((bitmap.width - sw) / 2);
  } else if (srcRatio < target) {
    sh = Math.round(bitmap.width / target);
    sy = Math.round((bitmap.height - sh) / 2);
  }

  const canvas = document.createElement("canvas");
  canvas.width = sw;
  canvas.height = sh;
  const ctx = canvas.getContext("2d");
  if (!ctx) return { blob, ext: "jpg" };
  ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, sw, sh);
  bitmap.close?.();

  const out: Blob = await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b || blob), "image/jpeg", 0.95)
  );
  return { blob: out, ext: "jpg" };
}

export default function AdminDownloads() {
  const [photos, setPhotos] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<"fotos" | "videos" | null>(null);
  const [progress, setProgress] = useState("");
  const [percent, setPercent] = useState(0);
  const [groupByRatio, setGroupByRatio] = useState(true);
  const [cropPhotos, setCropPhotos] = useState(true);

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

  const downloadableVideos = videos.filter((v) => v.video_type === "upload" && v.video_url);
  const externalVideos = videos.filter((v) => v.video_type !== "upload");

  function saveZip(blob: Blob, name: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }

  async function downloadPhotos() {
    if (!photos.length) return toast.error("Nenhuma foto encontrada.");
    setBusy("fotos");
    setPercent(0);
    try {
      const zip = new JSZip();
      let index = 0;
      let failed = 0;
      for (const photo of photos) {
        index++;
        setProgress(`Baixando foto ${index} de ${photos.length}…`);
        setPercent(Math.round((index / photos.length) * 100));
        try {
          const res = await fetch(photo.image_url, { mode: "cors" });
          if (!res.ok) throw new Error(String(res.status));
          let blob = await res.blob();
          let ext = extFromUrl(photo.image_url, "jpg");
          const ratio = ratioOf(photo);
          if (cropPhotos) {
            const cropped = await cropToRatio(blob, ratio);
            blob = cropped.blob;
            ext = cropped.ext;
          }
          const folder = groupByRatio ? `${ratio.replace(":", "x")}/` : "";
          zip.file(`${folder}foto ${index}.${ext}`, blob);
        } catch {
          failed++;
        }
      }
      setProgress("Compactando…");
      const out = await zip.generateAsync({ type: "blob" });
      saveZip(out, `le-ville-pet-fotos-${new Date().toISOString().slice(0, 10)}.zip`);
      toast.success(`${photos.length - failed} fotos baixadas${failed ? ` (${failed} falharam)` : ""}.`);
    } catch (e: any) {
      toast.error(`Erro ao gerar o ZIP: ${e.message}`);
    } finally {
      setBusy(null);
      setProgress("");
      setPercent(0);
    }
  }

  async function downloadVideos() {
    if (!downloadableVideos.length) return toast.error("Nenhum vídeo enviado para o site (apenas links externos).");
    setBusy("videos");
    setPercent(0);
    try {
      const zip = new JSZip();
      let index = 0;
      let failed = 0;
      for (const video of downloadableVideos) {
        index++;
        setProgress(`Baixando vídeo ${index} de ${downloadableVideos.length}…`);
        setPercent(Math.round((index / downloadableVideos.length) * 100));
        try {
          const res = await fetch(video.video_url, { mode: "cors" });
          if (!res.ok) throw new Error(String(res.status));
          const blob = await res.blob();
          const ext = extFromUrl(video.video_url, "mp4");
          const folder = groupByRatio ? `${ratioOf(video).replace(":", "x")}/` : "";
          zip.file(`${folder}video ${index}.${ext}`, blob);
        } catch {
          failed++;
        }
      }
      if (externalVideos.length) {
        zip.file(
          "links-externos.txt",
          externalVideos.map((v, i) => `${i + 1}. ${v.title || "sem título"} — ${v.video_url}`).join("\n")
        );
      }
      setProgress("Compactando…");
      const out = await zip.generateAsync({ type: "blob" });
      saveZip(out, `le-ville-pet-videos-${new Date().toISOString().slice(0, 10)}.zip`);
      toast.success(
        `${downloadableVideos.length - failed} vídeos baixados${failed ? ` (${failed} falharam)` : ""}.`
      );
    } catch (e: any) {
      toast.error(`Erro ao gerar o ZIP: ${e.message}`);
    } finally {
      setBusy(null);
      setProgress("");
      setPercent(0);
    }
  }

  const counts = (items: any[]) =>
    RATIOS.map((r) => ({ r, n: items.filter((i) => ratioOf(i) === r).length })).filter((x) => x.n > 0);

  return (
    <AdminLayout title="Downloads em Massa">
      <div className="max-w-4xl space-y-6">
        <p className="text-[#A1A1AA] text-sm font-body">
          Baixe todas as fotos ou vídeos do site de uma vez, em um único arquivo ZIP, já numerados
          (<span className="text-primary">foto 1, foto 2…</span> / <span className="text-primary">video 1, video 2…</span>)
          e mantendo a mesma proporção usada no site. Esta página é exclusiva do painel administrativo.
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
            <p className="text-xs text-[#71717A] font-body mb-4">
              {counts(photos).map((c) => `${c.n}× ${c.r}`).join(" · ") || "Nenhuma foto"}
            </p>
            <Button onClick={downloadPhotos} disabled={!!busy || loading} className="w-full">
              {busy === "fotos" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
              Baixar todas as fotos (.zip)
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
            <p className="text-xs text-[#71717A] font-body mb-4">
              {counts(downloadableVideos).map((c) => `${c.n}× ${c.r}`).join(" · ") || "Nenhum vídeo enviado"}
            </p>
            <Button onClick={downloadVideos} disabled={!!busy || loading} className="w-full">
              {busy === "videos" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
              Baixar todos os vídeos (.zip)
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
            <p className="text-sm text-[#ccc] font-body mb-2">{progress}</p>
            <div className="h-2 rounded-full bg-[#27272A] overflow-hidden">
              <div className="h-full bg-primary transition-all" style={{ width: `${percent}%` }} />
            </div>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
