import cover169 from "@/assets/video-cover-16-9.jpg";
import cover43 from "@/assets/video-cover-4-3.jpg";
import cover11 from "@/assets/video-cover-1-1.jpg";
import cover34 from "@/assets/video-cover-3-4.jpg";
import cover916 from "@/assets/video-cover-9-16.jpg";
import { getYoutubeId } from "@/lib/youtube";
import { withVersion } from "@/lib/mediaVersion";

/** Capas padrão oficiais do Le Ville Pet, uma para cada proporção suportada. */
export const DEFAULT_VIDEO_COVERS: Record<string, string> = {
  "16:9": cover169,
  "4:3": cover43,
  "1:1": cover11,
  "3:4": cover34,
  "9:16": cover916,
};

/** Resolve a proporção efetiva de um vídeo (com fallback para orientação antiga). */
export function resolveAspect(video: any): string {
  const ar = video?.aspect_ratio;
  if (ar && DEFAULT_VIDEO_COVERS[ar]) return ar;
  if (video?.orientation === "vertical") return "9:16";
  return "16:9";
}

/** Capa padrão do sistema para a proporção informada. */
export function defaultVideoCover(aspectOrVideo: any): string {
  const ar = typeof aspectOrVideo === "string" ? aspectOrVideo : resolveAspect(aspectOrVideo);
  return DEFAULT_VIDEO_COVERS[ar] || DEFAULT_VIDEO_COVERS["16:9"];
}

/**
 * Thumbnail final de um vídeo:
 * 1. capa personalizada (thumbnail_url)
 * 2. thumbnail do YouTube quando for link do YouTube
 * 3. capa padrão do Le Ville Pet na proporção correta
 */
export function getVideoThumbnail(video: any): string {
  if (video?.thumbnail_url) return withVersion(video.thumbnail_url, video?.updated_at);
  const ytId = video?.video_url ? getYoutubeId(video.video_url) : null;
  if (ytId) return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
  return defaultVideoCover(video);
}
