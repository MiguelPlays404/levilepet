import { Seo, breadcrumbLd } from "@/components/Seo";
import { PublicLayout } from "@/components/PublicLayout";
import { PageHero } from "@/components/PageHero";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Video, MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { Lightbox } from "@/components/Lightbox";
import { getSiteConfig, getConhecerContent, getPhotos } from "@/lib/dataCache";

const VenhaNosConhecer = () => {
  const [content, setContent] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [waNum, setWaNum] = useState('5514997145610');
  const [waMsg, setWaMsg] = useState('Olá! Vim pelo site e gostaria de conhecer o Le Ville Pet.');
  const [cfg, setCfg] = useState<any>(null);
  useScrollAnimation();

  const mediaLocations = (item: any) => Array.from(new Set([...(Array.isArray(item.locations) ? item.locations : []), item.category, item.is_featured ? "home" : null].filter(Boolean)));

  useEffect(() => {
    let cancelled = false;
    Promise.all([getConhecerContent(), getPhotos(), getSiteConfig()]).then(([conhecerData, allPhotos, siteConfig]) => {
      if (cancelled) return;
      setContent(conhecerData);
      setPhotos((allPhotos || []).filter((media: any) => mediaLocations(media).includes("conhecer")));
      if (siteConfig) {
        setWaNum(siteConfig.whatsapp_number);
        setWaMsg(siteConfig.whatsapp_message || 'Olá! Vim pelo site e gostaria de conhecer o Le Ville Pet.');
        setCfg(siteConfig);
      }
    });
    return () => { cancelled = true; };
  }, []);

  return (
    <PublicLayout>
      <Seo title="Venha Nos Conhecer" description="Conheça o espaço do Le Ville Pet em Bauru-SP: estrutura, produtos utilizados e galeria de fotos do nosso petshop." path="/venha-nos-conhecer" jsonLd={breadcrumbLd("Venha Nos Conhecer", "/venha-nos-conhecer")} />
      <PageHero
        badge="📍 Venha Nos Conhecer"
        title={content?.page_title || "Conheça o Nosso Espaço"}
        subtitle={content?.page_subtitle || "Um ambiente preparado com amor para você e seu pet"}
        bgImage={cfg?.conhecer_hero_image_url || undefined}
      />

      {/* About — WHITE */}
      <section className="py-20" style={{ background: '#FFFFFF' }}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 data-animate="fade-up" className="section-title text-black mb-5">
                {cfg?.conhecer_about_title || 'Sobre o Le Ville Pet'}
              </h2>
              <div data-animate="fade-up" data-delay="1" className="text-[#444] text-base leading-relaxed whitespace-pre-line" style={{ fontFamily: 'Inter' }}>
                {content?.about_text || 'O Le Ville Pet nasceu do amor pelos animais e da vontade de oferecer um espaço de confiança.'}
              </div>
            </div>
            <div data-animate="fade-right" data-delay="2" className="grid grid-cols-2 gap-3">
              {photos.slice(0, 3).map((photo, i) => (
                <button
                  key={photo.id}
                  className={`rounded-xl overflow-hidden cursor-pointer group bg-[#E5E5E5] ${i === 0 ? "col-span-2 aspect-[16/9]" : "aspect-square"}`}
                  onClick={() => setLightboxIndex(i)}
                >
                  <img src={photo.image_url} alt={photo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Produtos que utilizamos — PEARL */}
      {cfg && (cfg.conhecer_produtos_title || cfg.conhecer_produtos_image_url) && (
        <section className="py-14 lg:py-20" style={{ background: '#F8F8F6' }}>
          <div className="container mx-auto px-5 sm:px-6 max-w-4xl">
            <div className="text-center mb-7 lg:mb-10">
              {cfg.conhecer_produtos_badge && (
                <span data-animate="fade-up" className="inline-block bg-primary/15 text-black border border-primary/30 px-3 py-1 rounded-full text-xs font-heading font-semibold mb-4">{cfg.conhecer_produtos_badge}</span>
              )}
              <h2 data-animate="fade-up" data-delay="1" className="section-title text-black px-2">{cfg.conhecer_produtos_title || 'Produtos que utilizamos'}</h2>
            </div>
            <div data-animate="fade-up" data-delay="2" className="rounded-2xl overflow-hidden bg-[#E5E5E5] aspect-[4/3] sm:aspect-[16/10] lg:aspect-[16/9] mb-7 lg:mb-9 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.18)]">
              {cfg.conhecer_produtos_image_url && /\.(mp4|webm|mov)(\?|$)/i.test(cfg.conhecer_produtos_image_url) ? (
                <video src={cfg.conhecer_produtos_image_url} className="w-full h-full object-cover" autoPlay muted loop playsInline />
              ) : (
                <img src={cfg.conhecer_produtos_image_url || '/placeholder.svg'} alt={cfg.conhecer_produtos_title} className="w-full h-full object-cover" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }} />
              )}
            </div>
            <p data-animate="fade-up" data-delay="3" className="text-[#444] text-[15px] sm:text-base leading-relaxed whitespace-pre-line text-center max-w-2xl mx-auto px-1" style={{ fontFamily: 'Inter' }}>{cfg.conhecer_produtos_text || ''}</p>
          </div>
        </section>
      )}

      {/* Gallery — PEARL */}
      {photos.length > 0 && (
        <section className="py-20" style={{ background: '#F8F8F6' }}>
          <div className="container mx-auto px-4">
            <h2 data-animate="fade-up" className="section-title text-black text-center mb-10">{cfg?.conhecer_gallery_title || 'Galeria do Espaço'}</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {photos.map((photo, i) => (
                <button key={photo.id} data-animate="fade-scale" data-delay={String(Math.min(i, 7))}
                  onClick={() => setLightboxIndex(i)}
                  className="group relative aspect-square rounded-xl overflow-hidden bg-[#E5E5E5]">
                  <img src={photo.image_url} alt={photo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }} />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                    <span className="text-primary text-xl opacity-0 group-hover:opacity-100 transition-opacity">🔍</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA — YELLOW */}
      <section className="py-20" style={{ background: '#F5C000' }}>
        <div className="container mx-auto px-4 text-center">
          <h2 data-animate="fade-up" className="font-heading font-extrabold text-black text-2xl lg:text-3xl mb-6">
            {cfg?.conhecer_cta_title || 'Venha nos visitar!'}
          </h2>
          <a
            data-animate="fade-up"
            data-delay="1"
            href={`https://wa.me/${waNum}?text=${encodeURIComponent(waMsg)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-dark inline-flex items-center gap-2"
          >
            <MessageCircle className="w-6 h-6" />
            {cfg?.conhecer_cta_btn_text || 'Fale Conosco'}
          </a>
        </div>
      </section>

      {lightboxIndex !== null && (
        <Lightbox images={photos.map(p => ({ url: p.image_url, title: p.title }))} initialIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />
      )}
    </PublicLayout>
  );
};

export default VenhaNosConhecer;
