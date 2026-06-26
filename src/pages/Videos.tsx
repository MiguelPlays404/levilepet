import { PublicLayout } from "@/components/PublicLayout";
import { PageHero } from "@/components/PageHero";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Heart, Play, Video, X } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getSiteConfig } from "@/lib/dataCache";
import { getYoutubeId } from "@/lib/youtube";
import { AlbumsRail } from "@/components/AlbumsRail";

function getUserId(): string {
  let id = localStorage.getItem("lvp_user_id");
  if (!id) { id = crypto.randomUUID(); localStorage.setItem("lvp_user_id", id); }
  return id;
}

const Videos = () => {
  const [videos, setVideos] = useState<any[]>([]);
  const [likedSet, setLikedSet] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [playerVideo, setPlayerVideo] = useState<any>(null);
  const [cfg, setCfg] = useState<any>(null);
  useScrollAnimation();

  useEffect(() => {
    loadData();
    getSiteConfig().then((data) => setCfg(data));
    const localLikes = JSON.parse(localStorage.getItem("lvp_likes") || "[]");
    setLikedSet(new Set(localLikes));
  }, []);

  const loadData = async () => {
    const { data } = await supabase.from("videos").select("*").eq("is_active", true).order("published_at", { ascending: false });
    setVideos(data || []);
    setLoading(false);
  };

  const toggleLike = async (videoId: string) => {
    const userId = getUserId();
    const isLiked = likedSet.has(videoId);
    const video = videos.find(v => v.id === videoId);
    if (!video) return;

    const newLiked = new Set(likedSet);

    if (isLiked) {
      newLiked.delete(videoId);
      await supabase.from("video_likes").delete().eq("video_id", videoId).eq("device_id", userId);
      await supabase.from("videos").update({ likes_count: Math.max(0, (video.likes_count || 1) - 1) }).eq("id", videoId);
    } else {
      newLiked.add(videoId);
      await supabase.from("video_likes").insert({ video_id: videoId, device_id: userId });
      await supabase.from("videos").update({ likes_count: (video.likes_count || 0) + 1 }).eq("id", videoId);
    }

    setLikedSet(newLiked);
    localStorage.setItem("lvp_likes", JSON.stringify([...newLiked]));
    setVideos(prev => prev.map(v =>
      v.id === videoId ? { ...v, likes_count: isLiked ? Math.max(0, (v.likes_count || 1) - 1) : (v.likes_count || 0) + 1 } : v
    ));
  };

  const getThumbnail = (video: any) => {
    if (video.thumbnail_url) return video.thumbnail_url;
    const ytId = getYoutubeId(video.video_url);
    return ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : '/placeholder.svg';
  };

  const getEmbedUrl = (url: string) => {
    const ytId = getYoutubeId(url);
    return ytId ? `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1` : url;
  };

  const getTimeAgo = (date: string) => {
    const days = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
    if (days === 0) return "hoje";
    if (days === 1) return "há 1 dia";
    return `há ${days} dias`;
  };

  return (
    <PublicLayout>
      <PageHero badge="🎥 Vídeos" title={cfg?.videos_page_title || "Nossos Vídeos"} subtitle={cfg?.videos_page_subtitle || "Curta, compartilhe, sorria!"} bgImage={cfg?.videos_hero_image_url || undefined} />

      <AlbumsRail location="videos" title="Álbuns de vídeo" subtitle="Coleções e séries especiais" background="#FAFAF8" />

      <section className="py-16" style={{ background: '#FFFFFF' }}>
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="aspect-video bg-[#E5E5E5] rounded-[14px] animate-pulse" />)}
            </div>
          ) : videos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {videos.map((video, i) => {
                const isLiked = likedSet.has(video.id);
                return (
                  <div key={video.id} data-animate="card" data-delay={String(Math.min(i, 5))} className="bg-white rounded-[14px] overflow-hidden border border-[#E5E5E5] shadow-sm group">
                    <div className={`relative ${({'16:9':'aspect-video','4:3':'aspect-[4/3]','1:1':'aspect-square','3:4':'aspect-[3/4]','9:16':'aspect-[9/16]'} as any)[video.aspect_ratio || (video.orientation === 'vertical' ? '9:16' : '16:9')] || 'aspect-video'} cursor-pointer overflow-hidden bg-[#E5E5E5]`} onClick={() => setPlayerVideo(video)}>
                      <img src={getThumbnail(video)} alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                        <div className="w-[60px] h-[60px] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"
                          style={{ background: 'rgba(245,192,0,0.92)' }}>
                          <Play className="w-7 h-7 text-black ml-1" fill="currentColor" />
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-heading font-semibold text-black text-base mb-1 line-clamp-2">{video.title}</h3>
                      <p className="text-[#AAA] text-[13px] mb-3" style={{ fontFamily: 'Inter' }}>{getTimeAgo(video.published_at)}</p>
                      <button onClick={() => toggleLike(video.id)} className="flex items-center gap-2 group/like">
                        <Heart className={`w-5 h-5 transition-all ${isLiked ? "text-primary fill-primary" : "text-[#A1A1AA] group-hover/like:text-primary"}`}
                          style={isLiked ? { animation: 'heartBeat 0.5s ease' } : undefined} />
                        <span className={`text-sm ${isLiked ? 'text-primary' : 'text-[#A1A1AA]'}`} style={{ fontFamily: 'Inter', fontWeight: 500 }}>
                          {video.likes_count || 0}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <Video className="w-16 h-16 text-primary mx-auto mb-4" />
              <p className="text-[#888] text-lg" style={{ fontFamily: 'Inter' }}>Nenhum vídeo ainda.</p>
            </div>
          )}
        </div>
      </section>

      {playerVideo && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.96)', backdropFilter: 'blur(8px)' }} onClick={() => setPlayerVideo(null)}>
          <div className="w-full max-w-[920px] mx-4" onClick={e => e.stopPropagation()} style={{ animation: 'lightboxOpen 0.25s ease both' }}>
            <button onClick={() => setPlayerVideo(null)} className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors">
              <X className="w-9 h-9" />
            </button>
            <div className={`${({'16:9':'aspect-video','4:3':'aspect-[4/3]','1:1':'aspect-square','3:4':'aspect-[3/4]','9:16':'aspect-[9/16]'} as any)[playerVideo.aspect_ratio || (playerVideo.orientation === 'vertical' ? '9:16' : '16:9')] || 'aspect-video'} rounded-2xl overflow-hidden bg-black`}>
              {playerVideo.video_type === 'upload' ? (
                <video src={playerVideo.video_url} className="w-full h-full" controls autoPlay />
              ) : (
                <iframe src={getEmbedUrl(playerVideo.video_url)} className="w-full h-full" allowFullScreen allow="autoplay" />
              )}
            </div>
            <div className="mt-4 flex items-center justify-between">
              <h3 className="text-white font-heading font-semibold text-lg">{playerVideo.title}</h3>
              <button onClick={() => toggleLike(playerVideo.id)} className="flex items-center gap-2">
                <Heart className={`w-5 h-5 ${likedSet.has(playerVideo.id) ? "text-primary fill-primary" : "text-white/60 hover:text-primary"}`} />
                <span className="text-sm text-white/60">{videos.find(v => v.id === playerVideo.id)?.likes_count || 0}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </PublicLayout>
  );
};

export default Videos;
