import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<any>(null);
  const [navItems, setNavItems] = useState<any[]>([]);
  const location = useLocation();

  useEffect(() => { setIsOpen(false); }, [location.pathname]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      supabase.from("site_config").select("*").limit(1).maybeSingle(),
      supabase.from("nav_items").select("*").eq("is_active", true).eq("show_in_navbar", true).order("display_order"),
    ]).then(([c, n]) => {
      if (cancelled) return;
      setConfig(c.data);
      setNavItems(n.data || []);
    });
    return () => { cancelled = true; };
  }, []);

  const waNum = config?.whatsapp_number || '5514997145610';
  const waMsg = encodeURIComponent(config?.whatsapp_message || 'Olá! Vim pelo site Le Ville Pet!');
  const waText = config?.nav_whatsapp_btn_text || '💬 WhatsApp';

  return (
    <nav className="fixed top-0 left-0 right-0 z-[9999] transition-all duration-300 bg-[#0D0D0D] shadow-lg border-b border-[rgba(245,192,0,0.15)]" style={{ position: 'fixed', transform: 'translateZ(0)', isolation: 'isolate' }}>
      <div className="container mx-auto flex items-center justify-between h-16 lg:h-[72px] px-4">
        <Link to="/" className="flex items-center gap-2 hover:scale-[1.04] transition-transform">
          <img src={config?.logo_url || "/images/logo-levillepet.png"} alt={config?.site_name || 'Le Ville Pet'} className="h-10 lg:h-[46px] rounded-lg" />
        </Link>

        <div className="hidden lg:flex items-center gap-1">
          {navItems.map((link) => {
            const active = location.pathname === link.path;
            return (
              <Link key={link.id} to={link.path}
                className={`relative px-3 py-2 rounded-lg text-[15px] transition-colors duration-200 ${active ? "text-primary" : "text-white hover:text-primary"}`}
                style={{ fontFamily: 'Inter', fontWeight: 500 }}>
                {link.label}
                {active && <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-primary rounded-full" style={{ animation: 'lineGrow 0.3s ease forwards' }} />}
              </Link>
            );
          })}
        </div>

        <div className="hidden lg:block">
          <a href={`https://wa.me/${waNum}?text=${waMsg}`} target="_blank" rel="noopener noreferrer" className="btn-primary text-sm py-2.5 px-5">
            {waText}
          </a>
        </div>

        <button onClick={() => setIsOpen(true)} className="lg:hidden text-white p-2" aria-label="Abrir menu">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {isOpen && <div className="fixed inset-0 bg-[#0D0D0D] z-[9998] lg:hidden" onClick={() => setIsOpen(false)} />}

      <div className={`fixed top-0 right-0 h-dvh w-[280px] z-[10000] transform transition-transform duration-300 lg:hidden shadow-2xl ${isOpen ? "translate-x-0" : "translate-x-full"}`} style={{ background: '#0D0D0D', isolation: 'isolate' }}>
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(245,192,0,0.15)', background: '#0D0D0D' }}>
          <span className="font-heading font-bold text-primary text-lg">{config?.site_name || 'Le Ville Pet'}</span>
          <button onClick={() => setIsOpen(false)} className="text-white p-2"><X className="w-6 h-6" /></button>
        </div>
        <div className="flex flex-col py-4">
          {navItems.map((link, i) => (
            <Link key={link.id} to={link.path}
              className={`px-6 py-4 font-heading font-semibold text-xl transition-colors ${location.pathname === link.path ? "text-primary bg-primary/10 border-l-[3px] border-primary" : "text-white hover:text-primary hover:bg-primary/5"}`}
              style={{ animation: `fadeInLeft 0.3s ease ${i * 0.05}s both` }}>
              {link.label}
            </Link>
          ))}
          <div className="px-6 pt-4">
            <a href={`https://wa.me/${waNum}?text=${waMsg}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-[#25D366] text-white font-heading font-bold text-base w-full py-3.5 rounded-xl hover:bg-[#128C7E] transition-colors">
              <MessageCircle className="w-5 h-5" /> Fale no WhatsApp
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
