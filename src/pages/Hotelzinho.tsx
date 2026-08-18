import { Seo, breadcrumbLd } from "@/components/Seo";
import { PublicLayout } from "@/components/PublicLayout";
import { PageHero } from "@/components/PageHero";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Shield, Heart, CheckCircle, MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { getSiteConfig, getHotelzinhoContent, getPhotos } from "@/lib/dataCache";
import { Lightbox } from "@/components/Lightbox";
import { DestaquesSection } from "@/components/DestaquesSection";
import { AlbumsRail } from "@/components/AlbumsRail";

const Hotelzinho = () => {
  const [content, setContent] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [waNum, setWaNum] = useState('5514997145610');
  const [cfg, setCfg] = useState<any>(null);
  useScrollAnimation();

  const mediaLocations = (item: any) => Array.from(new Set([...(Array.isArray(item.locations) ? item.locations : []), item.category, item.is_featured ? "home" : null].filter(Boolean)));

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getHotelzinhoContent(),
      getPhotos(),
      getSiteConfig(),
    ]).then(([hotelContent, allPhotos, siteConfig]) => {
      if (cancelled) return;
      setContent(hotelContent);
      setPhotos((allPhotos || []).filter(media => mediaLocations(media).includes("hotelzinho")));
      if (siteConfig) { setWaNum(siteConfig.whatsapp_number || '5514997145610'); setCfg(siteConfig); }
    });
    return () => { cancelled = true; };
  }, []);

  const iconMap: Record<string, typeof Shield> = { '🛡️': Shield, '❤️': Heart, '🍽️': CheckCircle };
  const highlights = content ? [
    { icon: iconMap[content.highlight_1_icon] || Shield, title: content.highlight_1_title, text: content.highlight_1_text },
    { icon: iconMap[content.highlight_2_icon] || Heart, title: content.highlight_2_title, text: content.highlight_2_text },
    { icon: iconMap[content.highlight_3_icon] || CheckCircle, title: content.highlight_3_title, text: content.highlight_3_text },
  ] : [];

  const waMsg = encodeURIComponent(content?.whatsapp_message || 'Olá! Gostaria de agendar o hotelzinho para o meu pet.');

  return (
    <PublicLayout>
      <Seo title="Hotelzinho para Pets em Bauru" description="Hospedagem para cães e gatos em Bauru-SP com monitoramento, conforto e carinho o dia todo. Conheça o hotelzinho do Le Ville Pet." path="/hotelzinho" jsonLd={breadcrumbLd("Hotelzinho para Pets em Bauru", "/hotelzinho")} />
      <PageHero
        badge="🏨 Hotelzinho"
        title={content?.page_title || "Nosso Hotelzinho"}
        subtitle={content?.page_subtitle || "O lar temporário do seu pet"}
        bgImage={cfg?.hotel_hero_image_url || undefined}
      />

      {/* Intro — WHITE */}
      <section className="py-20" style={{ background: '#FFFFFF' }}>
        <div className="container mx-auto px-4 max-w-3xl">
          <p data-animate="fade-up" className="text-[#444] text-lg leading-[1.8] text-center" style={{ fontFamily: 'Inter' }}>
            {content?.intro_text || 'Sabemos que deixar seu pet pode ser uma decisão difícil. É por isso que criamos um espaço especialmente pensado para que ele se sinta em casa.'}
          </p>
        </div>
      </section>

      {/* Highlights — PEARL */}
      {highlights.length > 0 && (
        <section className="py-20" style={{ background: '#F8F8F6' }}>
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {highlights.map((h, i) => (
                <div key={i} data-animate="card" data-delay={String(i)} className="bg-white rounded-[18px] p-8 text-center border border-[#E8E8E8] shadow-sm">
                  <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <h.icon className="w-8 h-8 text-black" />
                  </div>
                  <h2 className="font-heading font-bold text-lg text-black mb-2">{h.title}</h2>
                  <p className="text-[#525252] text-sm leading-relaxed" style={{ fontFamily: 'Inter' }}>{h.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Description Blocks — WHITE */}
      {(content?.description_block_1 || content?.description_block_2 || content?.description_block_3) && (
        <section className="py-20" style={{ background: '#FFFFFF' }}>
          <div className="container mx-auto px-4 max-w-3xl space-y-6">
            {[content?.description_block_1, content?.description_block_2, content?.description_block_3].filter(Boolean).map((block: string, i: number) => (
              <p key={i} data-animate="fade-up" data-delay={String(i)} className="text-[#444] text-base leading-[1.8]" style={{ fontFamily: 'Inter' }}>{block}</p>
            ))}
          </div>
        </section>
      )}

      {/* Destaques da Semana */}
      <DestaquesSection
        locationKey="destaques_hotel"
        title={cfg?.destaques_hotel_title || "Destaques da Semana"}
        subtitle={cfg?.destaques_hotel_subtitle || "Pets que passaram por aqui"}
        background="#FAFAF8"
      />

      <AlbumsRail
        location="hotelzinho"
        title="Álbuns do Hotelzinho"
        subtitle="Coleções dos nossos hóspedes"
        background="#FFFFFF"
      />


      {/* Gallery — DARK */}
      {photos.length > 0 && (
        <section className="py-20" style={{ background: '#0D0D0D' }}>
          <div className="container mx-auto px-4">
            <h2 data-animate="fade-up" className="section-title text-white text-center mb-10">{cfg?.hotel_gallery_section_title || 'Nosso Espaço'}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {photos.map((photo, i) => (
                <button key={photo.id} aria-label={photo.title ? `Ver foto: ${photo.title}` : "Ver foto"} data-animate="fade-scale" data-delay={String(Math.min(i, 5))} onClick={() => setLightboxIndex(i)}
                  className="group relative aspect-[4/3] rounded-[14px] overflow-hidden bg-[#333]">
                  <img src={photo.image_url} alt={photo.title || "Foto do hotelzinho Le Ville Pet"}
                    className="w-full h-full object-cover group-hover:scale-[1.08] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                    loading="lazy"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                    <span className="text-primary text-2xl opacity-0 group-hover:opacity-100 transition-opacity">🔍</span>
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
            {cfg?.hotel_cta_title || 'Quer agendar uma estadia para o seu pet?'}
          </h2>
          <a data-animate="fade-up" data-delay="1" href={`https://wa.me/${waNum}?text=${waMsg}`} target="_blank" rel="noopener noreferrer" className="btn-dark inline-flex items-center gap-2 text-lg">
            <MessageCircle className="w-6 h-6" />
            {content?.cta_text || 'Agendar pelo WhatsApp 🐾'}
          </a>
        </div>
      </section>

      {lightboxIndex !== null && (
        <Lightbox images={photos.map(p => ({ url: p.image_url, title: p.title }))} initialIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />
      )}
    </PublicLayout>
  );
};

export default Hotelzinho;
