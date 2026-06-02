import { useEffect, useState } from "react";
import { PublicLayout } from "@/components/PublicLayout";
import { PageHero } from "@/components/PageHero";
import { SectionHeader, GlassCard } from "@/components/ModernBlocks";
import { getSiteConfig, getVideos } from "@/lib/dataCache";
import { PlayCircle, Video } from "lucide-react";

const getYoutubeId = (url: string) => {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{6,})/i);
  return match?.[1] || null;
};

const toEmbedUrl = (url: string) => {
  if (/\.(mp4|webm|mov|m4v)(\?|$)/i.test(url)) return url;
  const yt = getYoutubeId(url);
  return yt ? `https://www.youtube.com/embed/${yt}?autoplay=1&rel=0&modestbranding=1` : url;
};

export default function Videos() {
  const [c, setC] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [openUrl, setOpenUrl] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getSiteConfig(), getVideos()]).then(([cfg, allVideos]) => {
      setC(cfg);
      setVideos(allVideos || []);
    });
  }, []);

  return (
    <PublicLayout>
      <PageHero
        badge="🎥 vídeos"
        title={c?.videos_page_title || "Vídeos em destaque"}
        subtitle={c?.videos_page_subtitle || "Cards limpos, thumbnails grandes e um modal simples para abrir o conteúdo."}
        bgImage={c?.videos_hero_image_url || undefined}
      />

      <section id="conteudo" className="py-16 lg:py-20">
        <div className="container-safe">
          <SectionHeader
            kicker="conteúdo"
            title="Vídeos organizados para não pesar a página"
            subtitle="Cada bloco mostra o preview e abre o vídeo por cima sem quebrar a navegação."
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {videos.map((video) => {
              const thumb = video.thumbnail_url || (getYoutubeId(video.video_url) ? `https://img.youtube.com/vi/${getYoutubeId(video.video_url)}/hqdefault.jpg` : "/placeholder.svg");
              return (
                <GlassCard key={video.id} className="overflow-hidden p-0">
                  <button type="button" onClick={() => setOpenUrl(video.video_url)} className="block w-full text-left">
                    <div className="relative aspect-video bg-slate-900">
                      <img src={thumb} alt={video.title || "Vídeo"} className="h-full w-full object-cover" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }} />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-xl">
                          <PlayCircle className="h-8 w-8 text-white" />
                        </div>
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-slate-500">
                        <Video className="h-3.5 w-3.5 text-primary" />
                        vídeo
                      </div>
                      <h3 className="mt-3 text-lg font-bold text-white">{video.title || "Sem título"}</h3>
                      {video.description ? <p className="mt-2 text-sm leading-7 text-slate-300">{video.description}</p> : null}
                    </div>
                  </button>
                </GlassCard>
              );
            })}
          </div>
        </div>
      </section>

      {openUrl ? (
        <div className="fixed inset-0 z-[10000] bg-slate-950/95 p-4 backdrop-blur-2xl">
          <button type="button" onClick={() => setOpenUrl(null)} className="absolute right-4 top-4 btn-ghost-dark px-4 py-2">
            Fechar
          </button>
          <div className="mx-auto flex h-full max-w-5xl items-center justify-center">
            <GlassCard className="w-full overflow-hidden">
              {/\.(mp4|webm|mov|m4v)(\?|$)/i.test(openUrl) ? (
                <video src={openUrl} className="aspect-video w-full" controls autoPlay playsInline />
              ) : (
                <iframe
                  src={toEmbedUrl(openUrl)}
                  title="Vídeo selecionado"
                  className="aspect-video w-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </GlassCard>
          </div>
        </div>
      ) : null}
    </PublicLayout>
  );
}
