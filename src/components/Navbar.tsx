import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, MessageCircle, PawPrint } from "lucide-react";
import { getNavItems, getSiteConfig } from "@/lib/dataCache";
import { cn } from "@/lib/utils";

type NavItem = { id?: string; label: string; path: string; show_in_navbar?: boolean };

type SiteConfig = {
  site_name?: string;
  site_slogan?: string;
  logo_url?: string;
  whatsapp_number?: string;
  whatsapp_message?: string;
};

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getSiteConfig(), getNavItems()]).then(([cfg, nav]) => {
      if (cancelled) return;
      setConfig(cfg);
      setNavItems((nav || []).filter((item: NavItem) => item.show_in_navbar !== false));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const waNum = config?.whatsapp_number || "5514997145610";
  const waMsg = encodeURIComponent(config?.whatsapp_message || "Olá! Vim pelo site Le Ville Pet e gostaria de conhecer melhor.");
  const items = useMemo(() => navItems.slice(0, 6), [navItems]);

  return (
    <header className="fixed inset-x-0 top-0 z-[10000] border-b border-white/8 bg-slate-950/72 backdrop-blur-2xl">
      <div className="container-safe flex h-16 items-center justify-between gap-3 lg:h-[72px]">
        <Link to="/" className="group flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-lg">
            <img
              src={config?.logo_url || "/images/logo-levillepet.png"}
              alt={config?.site_name || "Le Ville Pet"}
              className="h-8 w-8 rounded-xl object-contain"
            />
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              {config?.site_name || "Le Ville Pet"}
              <PawPrint className="h-4 w-4 text-primary" />
            </div>
            <div className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
              {config?.site_slogan || "a gente se entende"}
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {items.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "rounded-2xl px-4 py-2 text-sm font-medium transition-all",
                  active
                    ? "bg-white/10 text-white"
                    : "text-slate-300 hover:bg-white/6 hover:text-white"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href={`https://wa.me/${waNum}?text=${waMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost-dark px-4 py-2"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
          <a href="#contato" className="btn-dark px-4 py-2">
            Agendar visita
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpen((s) => !s)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white lg:hidden"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div
        className={cn(
          "border-t border-white/8 bg-slate-950/95 backdrop-blur-2xl transition-all duration-300 lg:hidden",
          open ? "max-h-[75dvh] opacity-100" : "pointer-events-none max-h-0 overflow-hidden opacity-0"
        )}
      >
        <div className="container-safe py-4">
          <div className="grid gap-2">
            {items.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3 text-sm text-slate-100"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <a
              href={`https://wa.me/${waNum}?text=${waMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-dark"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
            <a href="#contato" className="btn-ghost-dark">
              Agendar visita
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
