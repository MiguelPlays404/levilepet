import { useState, useEffect, createContext, useContext, Suspense } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { LayoutDashboard, Image, Video, Hotel, Eye, Settings, Share2, Shield, LogOut, ExternalLink, Home, Type, Palette, Compass, BookOpen, Star, Truck, CalendarClock, Tv2, Briefcase, Archive, Images, DownloadCloud, ScrollText } from "lucide-react";
import { destroyAdminSession } from "@/lib/adminSession";

/** Loader temático mostrado enquanto o chunk da próxima página admin carrega. */
function AdminContentLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] animate-admin-fade">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-primary/15" />
          <div
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary"
            style={{ animation: 'spinSmooth 0.9s linear infinite' }}
          />
        </div>
        <p className="text-[#71717A] text-xs font-heading tracking-[0.15em] uppercase">Carregando…</p>
      </div>
    </div>
  );
}

const navItems = [
  { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { type: "separator", label: "CONTEÚDO" },
  { label: "Gerenciar Home", path: "/admin/home", icon: Home },
  { label: "Hoje no Le Ville", path: "/admin/hoje-le-ville", icon: Tv2 },
  { label: "Fotos", path: "/admin/fotos", icon: Image },
  { label: "Destaques da Semana", path: "/admin/destaques", icon: Star },
  { label: "Vídeos", path: "/admin/videos", icon: Video },
  { label: "Álbuns", path: "/admin/albuns", icon: Images },
  { label: "Agendamento", path: "/admin/agendamento", icon: CalendarClock },
  { label: "Hotelzinho", path: "/admin/hotelzinho", icon: Hotel },
  { label: "Transporte", path: "/admin/transporte", icon: Truck },
  { label: "Venha Nos Conhecer", path: "/admin/conhecer", icon: Eye },
  { label: "Vagas / Trabalhe Conosco", path: "/admin/vagas", icon: Briefcase },
  { label: "Textos das Páginas", path: "/admin/textos-paginas", icon: Type },
  { type: "separator", label: "APARÊNCIA" },
  { label: "Branding", path: "/admin/branding", icon: Palette },
  { label: "Navbar & Rodapé", path: "/admin/navbar-footer", icon: Compass },
  { label: "Configurações", path: "/admin/config", icon: Settings },
  { type: "separator", label: "CONTATO" },
  { label: "Redes Sociais", path: "/admin/social", icon: Share2 },
  { type: "separator", label: "SISTEMA" },
  { label: "Segurança", path: "/admin/seguranca", icon: Shield },
  { label: "Auditoria & Registros", path: "/admin/auditoria", icon: ScrollText },
  { label: "Backup & Restauração", path: "/admin/backup", icon: Archive },
  { label: "Downloads em Massa", path: "/admin/downloads", icon: DownloadCloud },
  { label: "Guia & Ajuda", path: "/admin/guia", icon: BookOpen },
];

// Context para o título do header — preenchido pela página atual
const AdminTitleContext = createContext<{ setTitle: (t: string) => void }>({ setTitle: () => {} });

/**
 * AdminShell — layout persistente (sidebar + header). Renderizado UMA VEZ
 * via rota-layout. Apenas a área de conteúdo (<Outlet/>) troca entre páginas,
 * eliminando o "flash" de remount da sidebar.
 */
export function AdminShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");

  const handleLogout = async () => {
    if (confirm("Deseja sair do painel administrativo?")) {
      await destroyAdminSession();
      navigate("/admin/login");
    }
  };

  return (
    <AdminTitleContext.Provider value={{ setTitle }}>
      <div className="min-h-screen flex" style={{ background: '#09090B', color: '#fff' }}>
        <aside className="w-[260px] shrink-0 h-screen sticky top-0 flex flex-col" style={{ background: '#111113', borderRight: '1px solid rgba(245,192,0,0.15)' }}>
          <div className="p-5 border-b" style={{ borderColor: 'rgba(245,192,0,0.15)' }}>
            <img src="/images/logo-levillepet.png" alt="Le Ville Pet" className="h-10 w-10 object-contain rounded" width={40} height={40} />
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

        <main className="flex-1 min-h-screen" style={{ background: '#09090B' }}>
          <header className="h-16 flex items-center px-8" style={{ background: '#111113', borderBottom: '1px solid rgba(245,192,0,0.15)' }}>
            <h1 className="font-heading font-bold text-lg">{title}</h1>
          </header>
          {/* key={pathname} dispara fade suave apenas no conteúdo, sem remontar a shell.
              Suspense local: enquanto o chunk da próxima página admin carrega,
              mostramos um loader temático em vez do flash branco do Suspense global. */}
          <div key={location.pathname} className="p-8 animate-admin-fade">
            <Suspense fallback={<AdminContentLoader />}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>
    </AdminTitleContext.Provider>
  );
}

/**
 * AdminLayout — wrapper compatível usado pelas páginas existentes.
 * Não renderiza mais a shell (que agora vive em AdminShell). Apenas
 * define o título do header via contexto e devolve os filhos.
 */
export function AdminLayout({ children, title }: { children: React.ReactNode; title: string }) {
  const { setTitle } = useContext(AdminTitleContext);
  useEffect(() => { setTitle(title); }, [title, setTitle]);
  return <>{children}</>;
}
