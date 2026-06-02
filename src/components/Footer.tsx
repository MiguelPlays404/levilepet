import { Link } from "react-router-dom";
import { Instagram, MapPin, Phone, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { getNavItems, getSiteConfig } from "@/lib/dataCache";
import { cn } from "@/lib/utils";

type SiteConfig = {
  site_name?: string;
  site_slogan?: string;
  logo_url?: string;
  address_full?: string;
  phone?: string;
  whatsapp_number?: string;
  instagram_url?: string;
  instagram_handle?: string;
};

export function Footer() {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [footerLinks, setFooterLinks] = useState<{ label: string; path: string }[]>([]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getSiteConfig(), getNavItems()]).then(([cfg, nav]) => {
      if (cancelled) return;
      setConfig(cfg);
      setFooterLinks((nav || []).filter((item: any) => item.show_in_footer !== false).slice(0, 6));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const waNum = config?.whatsapp_number || "5514997145610";

  return (
    <footer className="relative z-10 mt-16 border-t border-white/8 bg-slate-950/80">
      <div className="container-safe py-10 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_.8fr_.9fr]">
          <div className="max-w-md">
            <Link to="/" className="flex items-center gap-3">
              <img
                src={config?.logo_url || "/images/logo-levillepet.png"}
                alt={config?.site_name || "Le Ville Pet"}
                className="h-12 w-12 rounded-2xl object-contain ring-1 ring-white/10"
              />
              <div>
                <div className="text-lg font-bold text-white">{config?.site_name || "Le Ville Pet"}</div>
                <div className="text-sm text-slate-400">{config?.site_slogan || "a gente se entende"}</div>
              </div>
            </Link>
            <p className="mt-4 max-w-md text-sm leading-7 text-slate-300">
              Um espaço pensado para hotelzinho, transporte, banho e experiências com acabamento moderno, equipe atenciosa e comunicação clara.
            </p>
          </div>

          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-slate-500">Navegação</div>
            <div className="mt-4 grid gap-2">
              {footerLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3 text-sm text-slate-200 transition-colors hover:bg-white/[0.07] hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-slate-500">Contato</div>
            <div className="mt-4 grid gap-3 text-sm text-slate-300">
              {config?.address_full ? (
                <div className="flex gap-3 rounded-2xl border border-white/8 bg-white/[0.04] p-4">
                  <MapPin className="mt-0.5 h-4 w-4 text-primary" />
                  <span>{config.address_full}</span>
                </div>
              ) : null}
              {config?.phone ? (
                <a href={`tel:${config.phone}`} className="flex gap-3 rounded-2xl border border-white/8 bg-white/[0.04] p-4 hover:bg-white/[0.07]">
                  <Phone className="mt-0.5 h-4 w-4 text-primary" />
                  <span>{config.phone}</span>
                </a>
              ) : null}
              <a href={`https://wa.me/${waNum}`} target="_blank" rel="noopener noreferrer" className="flex gap-3 rounded-2xl border border-white/8 bg-white/[0.04] p-4 hover:bg-white/[0.07]">
                <MessageCircle className="mt-0.5 h-4 w-4 text-primary" />
                <span>WhatsApp</span>
              </a>
              {config?.instagram_url ? (
                <a href={config.instagram_url} target="_blank" rel="noopener noreferrer" className="flex gap-3 rounded-2xl border border-white/8 bg-white/[0.04] p-4 hover:bg-white/[0.07]">
                  <Instagram className="mt-0.5 h-4 w-4 text-primary" />
                  <span>{config.instagram_handle || "Instagram"}</span>
                </a>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/8 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Le Ville Pet. Todos os direitos reservados.</span>
          <span className={cn("text-slate-500")}>Design refeito com foco em velocidade, legibilidade e presença visual.</span>
        </div>
      </div>
    </footer>
  );
}
