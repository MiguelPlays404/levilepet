import { Link } from "react-router-dom";
import { MapPin, Phone, Instagram, MessageCircle, Clock } from "lucide-react";
import { AdminAccessField } from "./AdminAccessField";
import { useState, useEffect } from "react";
import { getSiteConfig, getNavItems } from "@/lib/dataCache";

export function Footer() {
  const [c, setC] = useState<any>(null);
  const [footerLinks, setFooterLinks] = useState<any[]>([]);

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
  const waMsg = encodeURIComponent(c?.whatsapp_message || 'Olá! Vim pelo site Le Ville Pet!');

  return (
    <footer style={{ background: '#080808' }} className="border-t border-white/[0.07]">
      {/* Linha principal */}
      <div className="container mx-auto px-4 py-10 lg:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">

          {/* Col 1 — Identidade */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-3 group">
              <img
                src={c?.logo_url || "/images/logo-levillepet.png"}
                alt={c?.site_name || 'Le Ville Pet'}
                className="h-10 rounded-lg"
              />
            </Link>
            <p className="font-heading italic text-primary text-sm mb-4">
              "{c?.site_slogan || 'a gente se entende'}"
            </p>
            <p className="text-[#555] text-xs leading-relaxed" style={{ fontFamily: 'Inter' }}>
              {c?.footer_description || 'Petshop em Bauru-SP com hotelzinho, banho & tosa e muito carinho para o seu pet.'}
            </p>
          </div>

          {/* Col 2 — Navegação */}
          <div>
            <h4 className="font-heading font-semibold text-[#888] text-[11px] tracking-[0.12em] uppercase mb-4">Navegação</h4>
            <nav className="flex flex-col gap-2.5">
              {footerLinks.slice(0, 6).map((link) => (
                <Link
                  key={link.id}
                  to={link.path}
                  className="text-[#666] text-sm hover:text-primary transition-colors"
                  style={{ fontFamily: 'Inter' }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Col 3 — Contato */}
          <div>
            <h4 className="font-heading font-semibold text-[#888] text-[11px] tracking-[0.12em] uppercase mb-4">Contato</h4>
            <div className="flex flex-col gap-3">
              <a
                href={`https://wa.me/${waNum}?text=${waMsg}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-[#666] text-sm hover:text-primary transition-colors"
                style={{ fontFamily: 'Inter' }}
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#25D366] shrink-0" />
                {`(${waNum.slice(2,4)}) ${waNum.slice(4,9)}-${waNum.slice(9)}`}
              </a>
              {c?.fixed_phone && (
                <a
                  href={`tel:${c.fixed_phone.replace(/\D/g, '')}`}
                  className="flex items-center gap-2.5 text-[#666] text-sm hover:text-primary transition-colors"
                  style={{ fontFamily: 'Inter' }}
                >
                  <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                  {c.fixed_phone}
                </a>
              )}
              {c?.instagram_url && (
                <a
                  href={c.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-[#666] text-sm hover:text-primary transition-colors"
                  style={{ fontFamily: 'Inter' }}
                >
                  <Instagram className="w-3.5 h-3.5 text-primary shrink-0" />
                  {c?.instagram_handle || '@levillepetbauru'}
                </a>
              )}
              {(c?.address_line1 || c?.address_line3) && (
                <a
                  href={c?.google_maps_url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2.5 text-[#666] text-sm hover:text-primary transition-colors"
                  style={{ fontFamily: 'Inter' }}
                >
                  <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-[2px]" />
                  <span>
                    {c?.address_line1 || 'Villaggio Mall Center'}<br />
                    <span className="text-[#444]">{c?.address_line3 || 'Bauru-SP'}</span>
                  </span>
                </a>
              )}
            </div>
          </div>

          {/* Col 4 — Horários */}
          <div>
            <h4 className="font-heading font-semibold text-[#888] text-[11px] tracking-[0.12em] uppercase mb-4">Horário</h4>
            <div className="flex flex-col gap-2">
              {c?.business_hours ? (
                <p className="text-[#666] text-sm leading-relaxed whitespace-pre-line" style={{ fontFamily: 'Inter' }}>{c.business_hours}</p>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-[#666] text-sm" style={{ fontFamily: 'Inter' }}>
                    <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>Seg–Sex: 8h às 18h</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#666] text-sm pl-[22px]" style={{ fontFamily: 'Inter' }}>
                    <span>Sáb: 8h às 14h</span>
                  </div>
                </>
              )}
            </div>

            {/* CTA WhatsApp */}
            <a
              href={`https://wa.me/${waNum}?text=${waMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] text-white font-heading font-semibold text-sm px-4 py-2.5 rounded-lg mt-5 hover:bg-[#1da851] transition-colors min-h-[40px]"
            >
              <MessageCircle className="w-4 h-4" />
              Falar no WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Rodapé inferior */}
      <div className="border-t border-white/[0.05]">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[#3A3A3A] text-[11px]" style={{ fontFamily: 'Inter' }}>
            © {new Date().getFullYear()} {c?.site_name || 'Le Ville Pet'}. Todos os direitos reservados.
          </p>
          <AdminAccessField />
        </div>
      </div>
    </footer>
  );
}
