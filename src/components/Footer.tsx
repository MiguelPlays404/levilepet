import { Link } from "react-router-dom";
import { MapPin, Phone, Instagram } from "lucide-react";
import { AdminAccessField } from "./AdminAccessField";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function Footer() {
  const [c, setC] = useState<any>(null);
  const [footerLinks, setFooterLinks] = useState<any[]>([]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      supabase.from("site_config").select("*").limit(1).maybeSingle(),
      supabase.from("nav_items").select("*").eq("is_active", true).eq("show_in_footer", true).order("display_order"),
    ]).then(([cfg, nav]) => {
      if (cancelled) return;
      setC(cfg.data);
      setFooterLinks(nav.data || []);
    });
    return () => { cancelled = true; };
  }, []);

  const waNum = c?.whatsapp_number || '5514997145610';

  // Ao clicar no logo do footer, sincronizar localStorage para evitar redirect
  const handleHomeClick = () => {
    localStorage.setItem("levillepet_last_path", "/");
  };

  return (
    <footer style={{ background: '#0A0A0A' }} className="py-5 border-t border-white/[0.06]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Logo + slogan */}
          <Link to="/" onClick={handleHomeClick} className="flex items-center gap-2 group">
            <img src={c?.logo_url || "/images/logo-levillepet.png"} alt={c?.site_name || 'Le Ville Pet'} className="h-8 rounded-md" />
            <span className="font-heading italic text-primary text-xs hidden sm:inline">"{c?.site_slogan || 'a gente se entende'}"</span>
          </Link>

          {/* Quick nav */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            {footerLinks.slice(0, 5).map((link) => (
              <Link key={link.id} to={link.path}
                onClick={link.path === "/" ? handleHomeClick : undefined}
                className="text-[#888] text-xs hover:text-primary transition-colors"
                style={{ fontFamily: 'Inter' }}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Contact icons */}
          <div className="flex items-center gap-2">
            {c?.fixed_phone && (
              <a href={`tel:${c.fixed_phone.replace(/\D/g,'')}`} title={c.fixed_phone} className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:text-primary hover:border-primary/40 transition-all">
                <Phone className="w-3.5 h-3.5" />
              </a>
            )}
            {(c?.footer_show_whatsapp ?? true) && (
              <a href={`https://wa.me/${waNum}`} target="_blank" rel="noopener noreferrer" title="WhatsApp" className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:text-[#25D366] hover:border-[#25D366]/40 transition-all">
                <Phone className="w-3.5 h-3.5" />
              </a>
            )}
            {(c?.footer_show_instagram ?? true) && (
              <a href={c?.instagram_url || "https://www.instagram.com/levillepetbauru/"} target="_blank" rel="noopener noreferrer" title="Instagram" className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:text-primary hover:border-primary/40 transition-all">
                <Instagram className="w-3.5 h-3.5" />
              </a>
            )}
            <a href={c?.google_maps_url || "https://maps.app.goo.gl/nkuDnVyBe6ZHYNbS8"} target="_blank" rel="noopener noreferrer" title="Mapa" className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:text-primary hover:border-primary/40 transition-all">
              <MapPin className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-2">
          <AdminAccessField />
          <p className="text-[#444] text-[11px] text-center" style={{ fontFamily: 'Inter' }}>
            {c?.copyright_text || '© 2026 Le Ville Pet'}
          </p>
        </div>
      </div>
    </footer>
  );
}
