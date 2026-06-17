import { Link } from "react-router-dom";
import { MapPin, Phone, Instagram } from "lucide-react";
import { AdminAccessField } from "./AdminAccessField";
import { useState, useEffect } from "react";
import { getSiteConfig, getNavItems, getSiteConfigSync, getNavItemsSync } from "@/lib/dataCache";

export function Footer() {
  const [c, setC] = useState<any>(() => getSiteConfigSync());
  const [footerLinks, setFooterLinks] = useState<any[]>(() => getNavItemsSync().filter((n: any) => n.show_in_footer));

  useEffect(() => {
    let cancelled = false;
    Promise.all([getSiteConfig(), getNavItems()]).then(([cfg, nav]) => {
      if (cancelled) return;
      setC(cfg);
      setFooterLinks((nav || []).filter((n: any) => n.show_in_footer));
    });
    return () => { cancelled = true; };
  }, []);

  const waNum = c?.whatsapp_number || '5514997145610';

  return (
    <footer style={{ background: '#0A0A0A' }} className="py-5 border-t border-white/[0.06]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 group">
            <img src={c?.logo_url || "/images/logo-levillepet.png"} alt={c?.site_name || 'Le Ville Pet'} className="h-8 rounded-md" />
            <span className="font-heading italic text-primary text-xs hidden sm:inline">"{c?.site_slogan || 'a gente se entende'}"</span>
          </Link>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            {footerLinks.slice(0, 5).map((link) => (
              <Link key={link.id} to={link.path}
                className="text-[#888] text-xs hover:text-primary transition-colors"
                style={{ fontFamily: 'Inter' }}>
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4 text-[#666] text-xs" style={{ fontFamily: 'Inter' }}>
            {c?.address && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-primary" />
                {c.address}
              </span>
            )}
            {c?.phone && (
              <a href={`tel:${c.phone}`} className="flex items-center gap-1 hover:text-primary transition-colors">
                <Phone className="w-3 h-3 text-primary" />
                {c.phone}
              </a>
            )}
            {c?.instagram_url && (
              <a href={c.instagram_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-primary transition-colors">
                <Instagram className="w-3 h-3 text-primary" />
                Instagram
              </a>
            )}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[#444] text-[11px]" style={{ fontFamily: 'Inter' }}>
            © {new Date().getFullYear()} {c?.site_name || 'Le Ville Pet'}. Todos os direitos reservados.
          </p>
          <AdminAccessField />
        </div>
      </div>
    </footer>
  );
}
