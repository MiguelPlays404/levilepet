import { Seo, breadcrumbLd } from "@/components/Seo";
import { PublicLayout } from "@/components/PublicLayout";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { MessageCircle, Phone } from "lucide-react";
import { useState, useEffect } from "react";
import { getSiteConfig } from "@/lib/dataCache";

const SigaNos = () => {
  useScrollAnimation();
  const [c, setC] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSiteConfig().then((data) => {
      setC(data);
      setLoading(false);
    });
  }, []);

  const socialLinks = c ? [
    c.instagram_active ? {
      name: "Instagram",
      handle: c.instagram_handle || "@levillepetbauru",
      url: c.instagram_url || "https://www.instagram.com/levillepetbauru/",
      bg: "linear-gradient(135deg, #F56040 0%, #E1306C 50%, #833AB4 100%)",
      btnText: c.instagram_btn_text || "Seguir no Instagram",
      icon: <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>,
    } : null,
    c.whatsapp_active ? {
      name: "WhatsApp",
      handle: `(${(c.whatsapp_number||'').slice(2,4)}) ${(c.whatsapp_number||'').slice(4,9)}-${(c.whatsapp_number||'').slice(9)}`,
      url: `https://wa.me/${c.whatsapp_number || '5514997145610'}`,
      bg: "#25D366",
      btnText: c.whatsapp_btn_text || "Chamar no WhatsApp",
      icon: <MessageCircle className="w-7 h-7" />,
    } : null,
    c.facebook_active ? {
      name: "Facebook",
      handle: c.facebook_handle || "",
      url: c.facebook_url || "#",
      bg: "#1877F2",
      btnText: c.facebook_btn_text || "Curtir no Facebook",
      icon: <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
    } : null,
    c.tiktok_active ? {
      name: "TikTok",
      handle: c.tiktok_handle || "",
      url: c.tiktok_url || "#",
      bg: "#000000",
      btnText: c.tiktok_btn_text || "Seguir no TikTok",
      icon: <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>,
    } : null,
    c.youtube_active ? {
      name: "YouTube",
      handle: c.youtube_handle || "",
      url: c.youtube_url || "#",
      bg: "#FF0000",
      btnText: c.youtube_btn_text || "Inscrever-se",
      icon: <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>,
    } : null,
  ].filter(Boolean) as any[] : [];

  return (
    <PublicLayout>
      <Seo title="Siga o Le Ville Pet nas Redes" description="Acompanhe o Le Ville Pet no Instagram, WhatsApp e demais redes sociais para novidades e o dia a dia dos pets em Bauru-SP." path="/siga-nos" jsonLd={breadcrumbLd("Siga o Le Ville Pet nas Redes", "/siga-nos")} />
      <section className="min-h-screen flex items-center justify-center py-16" style={{ background: '#0D0D0D' }}>
        <div className="w-full max-w-[520px] mx-auto px-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <div className="text-center mb-10">
                {c?.logo_url ? (
                  <img data-animate="fade-scale" src={c.logo_url} alt={c?.site_name || 'Le Ville Pet'} className="h-[110px] w-[110px] rounded-2xl mx-auto mb-4 object-contain" />
                ) : (
                  <div data-animate="fade-scale" className="h-[110px] w-[110px] bg-primary rounded-2xl mx-auto mb-4 flex items-center justify-center">
                    <img src="/images/logo-levillepet.png" alt="Le Ville Pet" className="h-20 w-20 object-contain" />
                  </div>
                )}
                <h1 data-animate="fade-up" data-delay="1" className="font-heading font-bold text-white text-[26px] mb-1">{c?.site_name || 'Le Ville Pet'}</h1>
                <p data-animate="fade-up" data-delay="2" className="font-heading italic text-primary text-[17px]">"{c?.site_slogan || 'a gente se entende'}"</p>
                <div data-animate="fade-up" data-delay="3" className="mt-4 h-[1px] w-32 mx-auto" style={{ background: 'linear-gradient(90deg, transparent, #F5C000, transparent)' }} />
              </div>

              <div className="flex flex-col gap-3 mb-6 max-w-[440px] mx-auto">
                {c?.fixed_phone && (
                  <a
                    href={`tel:${c.fixed_phone.replace(/\D/g,'')}`}
                    className="flex items-center gap-3 w-full min-h-[64px] py-3 font-heading font-semibold rounded-2xl px-5 transition-all hover:-translate-y-1 hover:shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #F5C000 0%, #FFD700 100%)', color: '#000' }}
                  >
                    <Phone className="w-6 h-6 shrink-0" />
                    <div className="flex-1 min-w-0 flex flex-col text-left">
                      <span className="text-base leading-tight">Ligar agora</span>
                      <span className="text-xs opacity-75 font-normal truncate" style={{ fontFamily: 'Inter' }}>{c.fixed_phone}</span>
                    </div>
                  </a>
                )}
                {socialLinks.map((link: any) => (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 w-full min-h-[64px] py-3 text-white font-heading font-semibold rounded-2xl px-5 transition-all hover:-translate-y-1 hover:shadow-lg"
                    style={{ background: link.bg }}
                  >
                    <span className="shrink-0">{link.icon}</span>
                    <div className="flex-1 min-w-0 flex flex-col text-left">
                      <span className="text-base leading-tight truncate">{link.btnText || link.name}</span>
                      {link.handle && <span className="text-xs opacity-75 font-normal truncate" style={{ fontFamily: 'Inter' }}>{link.handle}</span>}
                    </div>
                  </a>
                ))}
                {socialLinks.length === 0 && !c?.fixed_phone && (
                  <p className="text-center text-[#666] text-sm" style={{ fontFamily: 'Inter' }}>Nenhum contato configurado.</p>
                )}
              </div>

              <p data-animate="fade-up" data-delay="4" className="text-center text-[#666] text-sm" style={{ fontFamily: 'Inter' }}>
                {c?.siganos_footer_text || '🐾 Feito com amor para você e seu pet'}
              </p>
            </>
          )}
        </div>
      </section>
    </PublicLayout>
  );
};

export default SigaNos;
