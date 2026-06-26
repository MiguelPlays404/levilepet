/**
 * Detecção de plataforma + embed URLs para vídeos por link
 * (YouTube, Instagram, TikTok, MP4 direto).
 */
export type LinkPlatform = "youtube" | "instagram" | "tiktok" | "url" | "unknown";

export function detectPlatform(url: string): LinkPlatform {
  if (!url) return "unknown";
  const u = url.trim().toLowerCase();
  if (/youtube\.com|youtu\.be/.test(u)) return "youtube";
  if (/instagram\.com/.test(u)) return "instagram";
  if (/tiktok\.com/.test(u)) return "tiktok";
  if (/\.(mp4|webm|mov|m4v)(\?|$)/.test(u)) return "url";
  return "unknown";
}

export function getYoutubeId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function getInstagramId(url: string): string | null {
  const m = url.match(/instagram\.com\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/i);
  return m ? m[1] : null;
}

function getTiktokId(url: string): string | null {
  const m = url.match(/tiktok\.com\/.*\/video\/(\d+)/i);
  return m ? m[1] : null;
}

/** Devolve uma URL pronta para usar dentro de <iframe>. */
export function getEmbedUrl(url: string, platform?: LinkPlatform): string {
  const p = platform || detectPlatform(url);
  if (p === "youtube") {
    const id = getYoutubeId(url);
    return id
      ? `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`
      : url;
  }
  if (p === "instagram") {
    const id = getInstagramId(url);
    return id ? `https://www.instagram.com/p/${id}/embed` : url;
  }
  if (p === "tiktok") {
    const id = getTiktokId(url);
    return id ? `https://www.tiktok.com/embed/v2/${id}` : url;
  }
  return url;
}

/** Thumbnail "automático" quando possível. */
export function getLinkThumbnail(url: string, platform?: LinkPlatform): string | null {
  const p = platform || detectPlatform(url);
  if (p === "youtube") {
    const id = getYoutubeId(url);
    return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
  }
  return null;
}
