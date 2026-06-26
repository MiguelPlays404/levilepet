import { Images, Play, Info } from "lucide-react";
import { useState } from "react";
import { aspectStyle } from "@/components/AspectRatioPicker";

interface Props {
  album: {
    id: string;
    title: string;
    description?: string | null;
    cover_url?: string | null;
    cover_type?: string | null;
    aspect_ratio?: string | null;
  };
  itemCount: number;
  videoCount?: number;
  onClick: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function AlbumCard({ album, itemCount, videoCount = 0, onClick, className = "", size = "md" }: Props) {
  const ar = album.aspect_ratio || "4:3";
  const isVideoCover = album.cover_type === "video" || /\.(mp4|webm|mov|m4v)(\?|$)/i.test(album.cover_url || "");

  return (
    <button
      onClick={onClick}
      className={`group relative rounded-2xl overflow-hidden bg-[#1a1a1a] shadow-md hover:shadow-[0_15px_40px_-10px_rgba(245,192,0,0.45)] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 text-left ${className}`}
      style={aspectStyle(ar)}
      aria-label={`Abrir álbum ${album.title}`}
    >
      {/* Cover */}
      {album.cover_url ? (
        isVideoCover ? (
          <video
            src={album.cover_url}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.07]"
            muted
            loop
            playsInline
            autoPlay
          />
        ) : (
          <img
            src={album.cover_url}
            alt={album.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.07]"
            onError={(e) => ((e.target as HTMLImageElement).src = "/placeholder.svg")}
          />
        )
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#2a2a2a] to-[#0f0f0f]">
          <Images className="w-12 h-12 text-primary/50" />
        </div>
      )}

      {/* Stacked-album effect (paper layers) */}
      <div className="pointer-events-none absolute -bottom-1.5 left-3 right-3 h-2 rounded-b-2xl bg-black/30 blur-[2px] opacity-70" />
      <div className="pointer-events-none absolute -bottom-3 left-6 right-6 h-2 rounded-b-2xl bg-black/20 blur-[2px] opacity-60" />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/30" />

      {/* Top-right badge: count */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/70 backdrop-blur px-2.5 py-1 rounded-full">
        <Images className="w-3.5 h-3.5 text-primary" />
        <span className="text-white text-[11px] font-heading font-semibold">{itemCount}</span>
        {videoCount > 0 && (
          <>
            <span className="w-px h-3 bg-white/30" />
            <Play className="w-3 h-3 text-primary fill-primary" />
            <span className="text-white text-[11px] font-heading font-semibold">{videoCount}</span>
          </>
        )}
      </div>

      {/* Top-left badge */}
      <div className="absolute top-3 left-3">
        <span className="inline-block bg-primary text-black text-[10px] font-heading font-extrabold uppercase tracking-[0.12em] px-2 py-0.5 rounded-full">
          Álbum
        </span>
      </div>

      {/* Title */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className={`text-white font-heading font-bold ${size === "lg" ? "text-lg" : "text-base"} leading-tight line-clamp-2`}>
          {album.title || "Álbum sem título"}
        </h3>
        {album.description && (
          <p className="text-white/90 text-xs mt-1.5 line-clamp-3 leading-snug drop-shadow">{album.description}</p>
        )}
      </div>

      {/* Hover ring */}
      <div className="absolute inset-0 rounded-2xl ring-2 ring-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </button>
  );
}
