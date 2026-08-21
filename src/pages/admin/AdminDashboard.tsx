import { useState, useEffect, useRef } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { fetchAllRows, countRows } from "@/lib/fetchAll";
import { Image, Video, Heart, Hotel, Camera, Settings, Share2, Shield, BookOpen, Palette, Compass, Type, CalendarClock } from "lucide-react";
import { Link } from "react-router-dom";

function AnimatedCounter({ end, duration = 1200 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<number>();
  useEffect(() => {
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * end));
      if (progress < 1) ref.current = requestAnimationFrame(animate);
    };
    ref.current = requestAnimationFrame(animate);
    return () => { if (ref.current) cancelAnimationFrame(ref.current); };
  }, [end, duration]);
  return <>{count}</>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({ photos: 0, videos: 0, likes: 0, hotelPhotos: 0 });
  const [topVideos, setTopVideos] = useState<any[]>([]);
  const [recentPhotos, setRecentPhotos] = useState<any[]>([]);

  useEffect(() => {
    loadStats();
    const t = setInterval(loadStats, 20000);
    const onFocus = () => loadStats();
    window.addEventListener("focus", onFocus);
    return () => { clearInterval(t); window.removeEventListener("focus", onFocus); };
  }, []);

  const loadStats = async () => {
    const [photosCount, videosCount, hotelCount, likesRows] = await Promise.all([
      countRows("photos"),
      countRows("videos"),
      countRows("photos", (q: any) => q.eq("category", "hotelzinho")),
      fetchAllRows("videos", "published_at", false),
    ]);
    const totalLikes = likesRows.reduce((acc: number, v: any) => acc + (v.likes_count || 0), 0);
    setStats({ photos: photosCount, videos: videosCount, likes: totalLikes, hotelPhotos: hotelCount });

    const { data: top } = await supabase.from("videos").select("*").order("likes_count", { ascending: false }).limit(5);
    setTopVideos(top || []);
    const { data: recent } = await supabase.from("photos").select("*").order("created_at", { ascending: false }).limit(8);
    setRecentPhotos(recent || []);
  };


  const statCards = [
    { label: "Total de Fotos", value: stats.photos, icon: Image, color: "text-blue-400" },
    { label: "Total de Vídeos", value: stats.videos, icon: Video, color: "text-purple-400" },
    { label: "Total de Curtidas", value: stats.likes, icon: Heart, color: "text-pink-400" },
    { label: "Fotos Hotelzinho", value: stats.hotelPhotos, icon: Hotel, color: "text-primary" },
  ];

  const quickActions = [
    { label: "Guia & Ajuda", path: "/admin/guia", icon: BookOpen },
    { label: "Hoje no Le Ville", path: "/admin/hoje-le-ville", icon: CalendarClock },
    { label: "Branding", path: "/admin/branding", icon: Palette },
    { label: "Navbar & Rodapé", path: "/admin/navbar-footer", icon: Compass },
    { label: "Textos das Páginas", path: "/admin/textos-paginas", icon: Type },
    { label: "Gerenciar Fotos", path: "/admin/fotos", icon: Camera },
    { label: "Gerenciar Vídeos", path: "/admin/videos", icon: Video },
    { label: "Configurações", path: "/admin/config", icon: Settings },
    { label: "Redes Sociais", path: "/admin/social", icon: Share2 },
    { label: "Segurança", path: "/admin/seguranca", icon: Shield },
  ];

  return (
    <AdminLayout title="Dashboard">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((s, i) => (
          <div key={s.label} className="bg-[#18181B] rounded-2xl p-6 border border-white/[0.07] animate-admin-card-pop" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="flex items-center gap-3 mb-3">
              <s.icon className={`w-5 h-5 ${s.color}`} />
              <span className="text-[#A1A1AA] text-sm font-body">{s.label}</span>
            </div>
            <div className="font-heading font-extrabold text-3xl text-white"><AnimatedCounter end={s.value} /></div>
          </div>
        ))}
      </div>

      <div className="mb-8">
        <h2 className="font-heading font-semibold text-base mb-4 text-[#A1A1AA]">Ações Rápidas</h2>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {quickActions.map((a) => (
            <Link key={a.path} to={a.path} className="bg-[#18181B] border border-white/[0.07] rounded-xl p-4 text-center hover:border-primary/40 hover:bg-primary/5 transition-all">
              <a.icon className="w-6 h-6 text-primary mx-auto mb-2" />
              <span className="text-sm font-body text-[#ccc]">{a.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="font-heading font-semibold text-base mb-4 text-[#A1A1AA]">Vídeos Mais Curtidos</h2>
        <div className="bg-[#18181B] rounded-2xl border border-white/[0.07] overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-[#27272A]">
              <th className="text-left p-4 text-[#71717A] font-body">Título</th>
              <th className="text-right p-4 text-[#71717A] font-body">Curtidas</th>
            </tr></thead>
            <tbody>
              {topVideos.map((v) => (
                <tr key={v.id} className="border-b border-[#27272A] last:border-0">
                  <td className="p-4 text-[#ccc] font-body">{v.title}</td>
                  <td className="p-4 text-right text-primary font-heading font-bold">{v.likes_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="font-heading font-semibold text-base mb-4 text-[#A1A1AA]">Fotos Recentes</h2>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {recentPhotos.map((p) => (
            <div key={p.id} className="w-24 h-24 rounded-xl overflow-hidden shrink-0 border border-[#27272A]">
              <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
