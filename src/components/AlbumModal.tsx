import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X, Play } from "lucide-react";
import { aspectStyle } from "@/components/AspectRatioPicker";
import { detectPlatform, getEmbedUrl } from "@/lib/albumLinks";

export interface AlbumItem {
  id: string;
  media_type: string;
  source_type: string;
  media_url: string;
  thumb_url?: string | null;
  aspect_ratio?: string | null;
  caption?: string | null;
}

interface Props {
  title: string;
  items: AlbumItem[];
  onClose: () => void;
  initialIndex?: number;
}

export function AlbumModal({ title, items, onClose, initialIndex = 0 }: Props) {
  const [index, setIndex] = useState(initialIndex);
  const item = items[index];

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setIndex((i) => Math.min(i + 1, items.length - 1));
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(i - 1, 0));
    };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [items.length, onClose]);

  if (!item) return null;

  const ar = item.aspect_ratio || "16:9";
  const isVertical = ar === "9:16" || ar === "3:4";
  const platform = item.media_type === "video" ? detectPlatform(item.media_url) : "unknown";
  const isUploadVideo = item.media_type === "video" && (item.source_type === "upload" || platform === "url");
  const isEmbedVideo = item.media_type === "video" && (platform === "youtube" || platform === "instagram" || platform === "tiktok");

  return (
    <div
      className="fixed inset-0 z-[10000] bg-black/95 backdrop-blur-sm flex flex-col"
      onClick={onClose}
    >
      <header className="flex items-center justify-between px-5 h-14 shrink-0 border-b border-white/10" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-primary text-[11px] font-heading font-semibold uppercase tracking-[0.15em]">
            Álbum
          </span>
          <h2 className="text-white font-heading font-semibold text-base truncate">{title}</h2>
          <span className="text-white/50 text-xs whitespace-nowrap">
            {index + 1} / {items.length}
          </span>
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 flex items-center justify-center bg-white/5 hover:bg-white/15 rounded-full text-white transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>
      </header>

      <div className="flex-1 flex items-center justify-center px-3 relative" onClick={(e) => e.stopPropagation()}>
        {items.length > 1 && (
          <>
            <button
              onClick={() => setIndex((i) => Math.max(i - 1, 0))}
              disabled={index === 0}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-primary hover:text-black rounded-full text-white transition-colors disabled:opacity-20 z-10"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIndex((i) => Math.min(i + 1, items.length - 1))}
              disabled={index === items.length - 1}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-primary hover:text-black rounded-full text-white transition-colors disabled:opacity-20 z-10"
              aria-label="Próxima"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        <div
          className="rounded-2xl overflow-hidden bg-black flex items-center justify-center"
          style={{ ...aspectStyle(ar), width: "auto", maxWidth: isVertical ? "min(420px, 92vw)" : "min(1100px, 92vw)", maxHeight: "calc(100vh - 180px)" }}
        >
          {item.media_type === "photo" ? (
            <img
              src={item.media_url}
              alt={item.caption || ""}
              className="w-full h-full object-contain"
              onError={(e) => ((e.target as HTMLImageElement).src = "/placeholder.svg")}
            />
          ) : isUploadVideo ? (
            <video src={item.media_url} className="w-full h-full object-contain" controls autoPlay playsInline />
          ) : isEmbedVideo ? (
            <iframe
              src={getEmbedUrl(item.media_url, platform)}
              className="w-full h-full"
              allowFullScreen
              allow="autoplay; encrypted-media; picture-in-picture"
            />
          ) : (
            <a href={item.media_url} target="_blank" rel="noreferrer" className="text-primary underline p-6">
              Abrir mídia em nova aba
            </a>
          )}
        </div>
      </div>

      {/* Thumbnails strip */}
      <div className="shrink-0 px-3 pb-3 pt-2" onClick={(e) => e.stopPropagation()}>
        {item.caption && (
          <p className="text-center text-white/80 text-sm mb-2 max-w-3xl mx-auto">{item.caption}</p>
        )}
        <div className="flex gap-2 overflow-x-auto py-1 justify-start lg:justify-center" style={{ scrollbarWidth: "none" }}>
          {items.map((it, i) => {
            const active = i === index;
            const thumb = it.thumb_url || (it.media_type === "photo" ? it.media_url : null) || "/placeholder.svg";
            return (
              <button
                key={it.id}
                onClick={() => setIndex(i)}
                className={`relative shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  active ? "border-primary scale-105" : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <img src={thumb} alt="" className="w-full h-full object-cover" onError={(e) => ((e.target as HTMLImageElement).src = "/placeholder.svg")} />
                {it.media_type === "video" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Play className="w-4 h-4 text-white fill-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
