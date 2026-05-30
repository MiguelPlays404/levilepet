import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Image, Video, Hotel, Eye, Settings, Share2, Shield, LogOut, ExternalLink, Home, Type, Palette, Compass, BookOpen, Star, Truck } from "lucide-react";
import { destroyAdminSession, getSessionAge } from "@/lib/adminSession";
import { useToast } from "@/hooks/use-toast";

const navItems = [
  { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { type: "separator", label: "CONTEÚDO" },
  { label: "Gerenciar Home", path: "/admin/home", icon: Home },
  { label: "Fotos", path: "/admin/fotos", icon: Image },
  { label: "Destaques da Semana", path: "/admin/destaques", icon: Star },
  { label: "Vídeos", path: "/admin/videos", icon: Video },
  { label: "Hotelzinho", path: "/admin/hotelzinho", icon: Hotel },
  { label: "Transporte", path: "/admin/transporte", icon: Truck },
  { label: "Venha Nos Conhecer", path: "/admin/conhecer", icon: Eye },
  { label: "Textos das Páginas", path: "/admin/textos-paginas", icon: Type },
  { type: "separator", label: "APARÊNCIA" },
  { label: "Branding", path: "/admin/branding", icon: Palette },
  { label: "Navbar & Rodapé", path: "/admin/navbar-footer", icon: Compass },
  { label: "Configurações", path: "/admin/config", icon: Settings },
  { type: "separator", label: "CONTATO" },
  { label: "Redes Sociais", path: "/admin/social", icon: Share2 },
  { type: "separator", label: "SISTEMA" },
  { label: "Segurança", path: "/admin/seguranca", icon: Shield },
  { label: "Guia & Ajuda", path: "/admin/guia", icon: BookOpen },
];

export function AdminLayout({ children, title }: { children: React.ReactNode; title: string }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (confirm("Deseja sair do painel administrativo?")) {
      destroyAdminSession();
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#09090B', color: '#fff' }}>
      {/* Sidebar */}
      <aside className="w-[260px] shrink-0 h-screen sticky top-0 flex flex-col" style={{ background: '#111113', borderRight: '1px solid rgba(245,192,0,0.15)' }}>
        <div className="p-5 border-b" style={{ borderColor: 'rgba(245,192,0,0.15)' }}>
          <img src="/images/logo-levillepet.png" alt="Le Ville Pet" className="h-10 rounded" />
          <p className="text-primary text-xs font-heading italic mt-1">Painel Admin</p>
        </div>
        <nav className="flex-1 py-3 overflow-y-auto">
          {navItems.map((item, i) => {
            if (item.type === "separator") {
              return <div key={i} className="px-5 pt-5 pb-2 text-[10px] text-[#71717A] font-heading font-semibold tracking-[0.1em] uppercase">{item.label}</div>;
            }
            const active = location.pathname === item.path;
            const Icon = item.icon!;
            return (
              <Link key={item.path} to={item.path!}
                className="flex items-center gap-3 px-5 py-3 text-sm font-body transition-all duration-200"
                style={{
                  background: active ? 'rgba(245,192,0,0.10)' : 'transparent',
                  color: active ? '#F5C000' : '#A1A1AA',
                  borderLeft: active ? '3px solid #F5C000' : '3px solid transparent',
                }}
                onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = '#1C1C1E'; (e.currentTarget as HTMLElement).style.color = '#fff'; } }}
                onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#A1A1AA'; } }}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 space-y-2" style={{ borderTop: '1px solid rgba(245,192,0,0.15)' }}>
          <a href="/" target="_blank" className="flex items-center gap-2 text-xs text-[#71717A] hover:text-primary transition-colors">
            <ExternalLink className="w-3.5 h-3.5" /> Ver Site
          </a>
          <button onClick={handleLogout} className="flex items-center gap-2 text-xs text-[#71717A] hover:text-red-400 transition-colors">
            <LogOut className="w-3.5 h-3.5" /> Sair
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 min-h-screen" style={{ background: '#09090B' }}>
        <header className="h-16 flex items-center px-8" style={{ background: '#111113', borderBottom: '1px solid rgba(245,192,0,0.15)' }}>
          <h1 className="font-heading font-bold text-lg">{title}</h1>
        </header>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
