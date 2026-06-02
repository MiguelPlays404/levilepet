import { PublicLayout } from "@/components/PublicLayout";
import { PageHero } from "@/components/PageHero";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { MessageCircle, MapPin, Phone } from "lucide-react";
import { useState, useEffect } from "react";
import { getSiteConfig } from "@/lib/dataCache";

const FaleConosco = () => {
  useScrollAnimation();
  const [c, setC] = useState<any>(null);

  useEffect(() => {
    getSiteConfig().then((data) => setC(data));
  }, []);

  const waNum = c?.whatsapp_number || '5514997145610';
  const waMsg = encodeURIComponent(c?.whatsapp_message || 'Olá! Vim pelo site Le Ville Pet e gostaria de mais informações. 🐾');
  const phone = `(${waNum.slice(2,4)}) ${waNum.slice(4,9)}-${waNum.slice(9)}`;
  const contactMedia = c?.faleconosco_image_url || "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=500&h=375&fit=crop";
  const isContactVideo = /\.(mp4|webm|mov|m4v)(\?|$)/i.test(contactMedia);

  return (
    <PublicLayout>
      <PageHero badge="💬 Contato" title={c?.faleconosco_title || "Fale com o Le Ville Pet"} subtitle={c?.faleconosco_subtitle || "Estamos prontos para te atender"} bgImage={c?.faleconosco_hero_image_url || undefined} />

      {/* WhatsApp Card — WHITE bg */}
      <section className="py-20" style={{ background: '#FFFFFF' }}>
        <div className="container mx-auto px-4">
          <div data-animate="fade-scale" className="max-w-[580px] mx-auto rounded-[28px] p-12 lg:p-[52px] text-center" style={{ background: '#F5C000', boxShadow: 'var(--shadow-yellow-lg)' }}>
            <div className="w-[72px] h-[72px] bg-[#25D366] rounded-2xl flex items-center justify-center mx-auto mb-5">
              <MessageCircle className="w-9 h-9 text-white" />
            </div>
            <h2 className="font-heading font-extrabold text-black text-[28px] mb-3">{c?.faleconosco_card_title || 'Chame no WhatsApp!'}</h2>
            <p className="text-black/60 mb-4" style={{ fontFamily: 'Inter' }}>
              {c?.faleconosco_card_text || 'Tire suas dúvidas, agende serviços ou venha nos conhecer. Respondemos rapidinho!'}
            </p>
            <p className="font-heading font-black text-black text-4xl mb-6">{phone}</p>
            <a
              href={`https://wa.me/${waNum}?text=${waMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-[#25D366] text-white font-heading font-bold text-lg w-full py-4 rounded-[14px] hover:bg-[#128C7E] transition-colors min-h-[60px]"
            >
              <MessageCircle className="w-6 h-6" />
              {c?.faleconosco_btn_text || 'Abrir WhatsApp Agora'}
            </a>
          </div>
        </div>
      </section>

      {/* Info — CREAM */}
      <section className="py-16" style={{ background: '#FAFAF8' }}>
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 data-animate="fade-up" className="font-heading font-semibold text-black text-xl mb-4">{c?.faleconosco_info_title || 'Informações de Contato'}</h3>
              <div className="space-y-4 text-sm" style={{ fontFamily: 'Inter' }}>
                {c?.fixed_phone && (
                  <a data-animate="fade-up" href={`tel:${c.fixed_phone.replace(/\D/g,'')}`} className="flex items-center gap-3 text-[#444] hover:text-primary transition-colors">
                    <Phone className="w-5 h-5 text-primary shrink-0" />
                    {c.fixed_phone} <span className="text-[10px] text-[#888]">Telefone Fixo</span>
                  </a>
                )}
                <a data-animate="fade-up" data-delay="1" href={`https://wa.me/${waNum}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-[#444] hover:text-primary transition-colors">
                  <Phone className="w-5 h-5 text-primary shrink-0" />
                  {phone} <span className="text-[10px] text-[#25D366]">WhatsApp</span>
                </a>
                <a data-animate="fade-up" data-delay="2" href={c?.instagram_url || "https://www.instagram.com/levillepetbauru/"} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-[#444] hover:text-primary transition-colors">
                  <svg className="w-5 h-5 text-primary shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                  {c?.instagram_handle || '@levillepetbauru'}
                </a>
                <a data-animate="fade-up" data-delay="3" href={c?.google_maps_url || "https://maps.app.goo.gl/nkuDnVyBe6ZHYNbS8"} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 text-[#444] hover:text-primary transition-colors">
                  <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span>{c?.address_line1 || 'Villaggio Mall Center'}<br/>{c?.address_line2 || 'Av. Affonso José Aiello, 14-45 - Loja 19'}<br/>{c?.address_line3 || 'Vila Aviação, Bauru-SP, 17018-520'}</span>
                </a>
              </div>
            </div>
            <div data-animate="fade-right" data-delay="2" className="aspect-[4/3] rounded-2xl overflow-hidden bg-[#E5E5E5]">
              {isContactVideo ? (
                <video src={contactMedia} className="w-full h-full object-cover" autoPlay muted loop playsInline />
              ) : (
                <img src={contactMedia} alt="Le Ville Pet" className="w-full h-full object-cover" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }} />
              )}
            </div>
          </div>
          <p data-animate="fade-up" className="text-center text-[#888] text-sm mt-10" style={{ fontFamily: 'Inter' }}>
            {c?.faleconosco_visit_text || 'Venha nos visitar! Estamos te esperando 🐾'}
          </p>
        </div>
      </section>
    </PublicLayout>
  );
};

export default FaleConosco;
