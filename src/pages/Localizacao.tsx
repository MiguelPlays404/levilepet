import { Seo, breadcrumbLd } from "@/components/Seo";
import { PublicLayout } from "@/components/PublicLayout";
import { PageHero } from "@/components/PageHero";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { MapPin, Navigation } from "lucide-react";
import { useState, useEffect } from "react";
import { getSiteConfig } from "@/lib/dataCache";

const DEFAULT_EMBED = "https://maps.google.com/maps?q=Villaggio+Mall+Center+Bauru+SP&t=&z=15&ie=UTF8&iwloc=&output=embed";

const Localizacao = () => {
  useScrollAnimation();
  const [c, setC] = useState<any>(null);

  useEffect(() => {
    getSiteConfig().then((data) => setC(data));
  }, []);

  const mapsUrl = c?.google_maps_url || "https://maps.app.goo.gl/nkuDnVyBe6ZHYNbS8";
  const embedUrl = c?.google_maps_embed || DEFAULT_EMBED;
  // If someone pasted a short link instead of embed URL, use the query fallback
  const safeEmbed = embedUrl.includes('output=embed') || embedUrl.includes('/embed') ? embedUrl : DEFAULT_EMBED;

  return (
    <PublicLayout>
      <Seo title="Localização e Como Chegar" description="Le Ville Pet fica no Villaggio Mall Center, em Bauru-SP. Veja o mapa, endereço completo e a melhor forma de chegar até nós." path="/localizacao" jsonLd={breadcrumbLd("Localização e Como Chegar", "/localizacao")} />
      <PageHero badge="📍 Nossa Localização" title={c?.localizacao_title || "Nossa Localização"} subtitle={c?.localizacao_subtitle || "Venha nos visitar em Bauru-SP"} bgImage={c?.localizacao_hero_image_url || undefined} />

      <section className="py-20" style={{ background: '#FFFFFF' }}>
        <div className="container mx-auto px-4 max-w-[700px]">
          <div data-animate="fade-scale" className="rounded-[24px] p-10 lg:p-12 text-center" style={{ background: '#F5C000', boxShadow: 'var(--shadow-yellow-lg)' }}>
            <div className="w-12 h-12 bg-black/10 rounded-[14px] flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-7 h-7 text-black" />
            </div>
            <h2 className="font-heading font-extrabold text-black text-[28px] mb-2">{c?.site_name || 'Le Ville Pet'}</h2>
            <div className="mb-6">
              <p className="font-heading font-bold text-black text-xl">{c?.address_line1 || 'Villaggio Mall Center'}</p>
              <p className="font-heading font-semibold text-[#333] text-[17px]">{c?.address_line2 || 'Av. Affonso José Aiello, 14-45 - Loja 19'}</p>
              <p className="text-[#444] text-[15px] mt-1" style={{ fontFamily: 'Inter' }}>{c?.address_line3 || 'Vila Aviação, Bauru-SP, 17018-520'}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-dark inline-flex items-center justify-center gap-2">
                <MapPin className="w-5 h-5" /> {c?.localizacao_maps_btn_text || 'Abrir no Google Maps'}
              </a>
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-dark inline-flex items-center justify-center gap-2">
                <Navigation className="w-5 h-5" /> {c?.localizacao_route_btn_text || 'Calcular Rota'}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10" style={{ background: '#FAFAF8' }}>
        <div className="container mx-auto px-4 max-w-4xl">
          <div data-animate="fade-up" className="rounded-[20px] overflow-hidden" style={{ boxShadow: 'var(--shadow-xl)' }}>
            <iframe
              src={safeEmbed}
              width="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Localização Le Ville Pet"
              className="w-full h-[300px] lg:h-[450px]"
            />
          </div>
        </div>
      </section>

      {c?.localizacao_howto_text && (
        <section className="py-16" style={{ background: '#FFFFFF' }}>
          <div className="container mx-auto px-4 max-w-3xl">
            <h3 data-animate="fade-up" className="font-heading font-bold text-black text-xl mb-4 text-center">{c?.localizacao_howto_title || 'Como Chegar'}</h3>
            <p data-animate="fade-up" data-delay="1" className="text-[#444] text-base leading-[1.8] text-center" style={{ fontFamily: 'Inter' }}>{c.localizacao_howto_text}</p>
          </div>
        </section>
      )}
    </PublicLayout>
  );
};

export default Localizacao;
