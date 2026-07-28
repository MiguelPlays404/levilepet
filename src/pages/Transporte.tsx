import { Seo, breadcrumbLd } from "@/components/Seo";
import { PublicLayout } from "@/components/PublicLayout";
import { PageHero } from "@/components/PageHero";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import {
  MessageCircle, Truck, Shield, Heart, Clock, MapPin, PawPrint,
  Snowflake, Star, CheckCircle, Phone, Calendar, Home, ArrowRight, Play, X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getSiteConfig, getTransporteContent, getPhotos, getVideos } from "@/lib/dataCache";
import { getYoutubeId } from "@/lib/youtube";
import { Lightbox } from "@/components/Lightbox";

const ICON_MAP: Record<string, any> = {
  Truck, Shield, Heart, Clock, MapPin, PawPrint, Snowflake, Star, CheckCircle, Phone, Calendar, Home,
};

const normalizeLocations = (p: any) =>
  Array.from(new Set([...(Array.isArray(p.locations) ? p.locations : []), p.category].filter(Boolean)));

const Transporte = () => {
  const [content, setContent] = useState<any>(null);
  const [waNum, setWaNum] = useState("5514997145610");
  const [extraPhotos, setExtraPhotos] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [playerVideo, setPlayerVideo] = useState<any>(null);
  const [lightbox, setLightbox] = useState<number | null>(null);
  useScrollAnimation();

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getTransporteContent(),
      getSiteConfig(),
      getPhotos(),
      getVideos(),
    ]).then(([transporteData, siteConfig, allPhotos, allVideos]) => {
      if (cancelled) return;
      setContent(transporteData);
      if (siteConfig?.whatsapp_number) setWaNum(siteConfig.whatsapp_number);
      setExtraPhotos((allPhotos || []).filter(p => normalizeLocations(p).includes("transporte")));
      setVideos((allVideos || []).filter(v => normalizeLocations(v).includes("transporte")));
    });
    return () => { cancelled = true; };
  }, []);

  const getThumbnail = (video: any) => {
    if (video.thumbnail_url) return video.thumbnail_url;
    const ytId = getYoutubeId(video.video_url);
    return ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : '/placeholder.svg';
  };
  const getEmbedUrl = (url: string) => {
    const ytId = getYoutubeId(url);
    return ytId ? `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1` : url;
  };
  const aspectClassFor = (v: any) => (({'16:9':'aspect-video','4:3':'aspect-[4/3]','1:1':'aspect-square','3:4':'aspect-[3/4]','9:16':'aspect-[9/16]'} as any)[v.aspect_ratio || (v.orientation === 'vertical' ? '9:16' : '16:9')] || 'aspect-video');

  const highlights = content ? [1, 2, 3, 4, 5, 6].map(n => ({
    icon: content[`highlight_${n}_icon`],
    title: content[`highlight_${n}_title`],
    text: content[`highlight_${n}_text`],
  })).filter(h => h.title) : [];

  const steps = content ? [1, 2, 3, 4].map(n => ({
    title: content[`step_${n}_title`],
    text: content[`step_${n}_text`],
  })).filter(s => s.title) : [];

  const faqs = content ? [1, 2, 3, 4].map(n => ({
    q: content[`faq_q${n}`],
    a: content[`faq_a${n}`],
  })).filter(f => f.q) : [];

  const allLightboxImages = [
    content?.photo_main_url ? { url: content.photo_main_url, title: content.driver_name || "Motorista" } : null,
    ...extraPhotos.map(p => ({ url: p.image_url, title: p.title || "Transporte" })),
  ].filter(Boolean) as { url: string; title: string }[];

  const waMsg = encodeURIComponent(content?.whatsapp_message || "Olá! Gostaria de agendar o transporte para o meu pet.");
  const waHref = `https://wa.me/${waNum}?text=${waMsg}`;
  const neighborhoods = (content?.coverage_neighborhoods || "").split("·").map((s: string) => s.trim()).filter(Boolean);

  return (
    <PublicLayout>
      <Seo title="Transporte de Pets em Bauru" description="Leva e traz de cães e gatos em Bauru-SP com segurança e motoristas treinados. Veja cobertura, valores e agende pelo WhatsApp." path="/transporte" jsonLd={breadcrumbLd("Transporte de Pets em Bauru", "/transporte")} />
      <PageHero
        badge="🚐 Transporte"
        title={content?.page_title || "Transporte Pet"}
        subtitle={content?.page_subtitle || "Buscamos e levamos seu pet com segurança e carinho"}
        bgImage={content?.hero_image_url || undefined}
      />

      {/* Intro */}
      <section className="py-20" style={{ background: "#FFFFFF" }}>
        <div className="container mx-auto px-4 max-w-3xl">
          <p data-animate="fade-up" className="text-[#444] text-lg leading-[1.8] text-center" style={{ fontFamily: "Inter" }}>
            {content?.intro_text}
          </p>
        </div>
      </section>

      {/* Highlights / Selos — Pearl */}
      {highlights.length > 0 && (
        <section className="py-20" style={{ background: "#F8F8F6" }}>
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {highlights.map((h, i) => {
                const Icon = ICON_MAP[h.icon] || Truck;
                return (
                  <div key={i} data-animate="card" data-delay={String(Math.min(i, 5))} className="bg-white rounded-[18px] p-8 text-center border border-[#E8E8E8] shadow-sm">
                    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-8 h-8 text-black" strokeWidth={2} />
                    </div>
                    <h3 className="font-heading font-bold text-lg text-black mb-2">{h.title}</h3>
                    <p className="text-[#666] text-sm leading-relaxed" style={{ fontFamily: "Inter" }}>{h.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Description block — White */}
      {content?.description_text && (
        <section className="py-20" style={{ background: "#FFFFFF" }}>
          <div className="container mx-auto px-4 max-w-3xl">
            <p data-animate="fade-up" className="text-[#444] text-base leading-[1.8] text-center" style={{ fontFamily: "Inter" }}>
              {content.description_text}
            </p>
          </div>
        </section>
      )}

      {/* How it works steps — Pearl */}
      {steps.length > 0 && (
        <section className="py-20" style={{ background: "#F8F8F6" }}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 data-animate="fade-up" className="section-title text-black mb-3">{content?.how_it_works_title}</h2>
              {content?.how_it_works_subtitle && <p data-animate="fade-up" data-delay="1" className="text-[#666] max-w-xl mx-auto" style={{ fontFamily: "Inter" }}>{content.how_it_works_subtitle}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {steps.map((s, i) => (
                <div key={i} data-animate="card" data-delay={String(i)} className="relative bg-white rounded-2xl p-6 border border-[#E8E8E8] shadow-sm">
                  <div className="absolute -top-4 left-6 w-10 h-10 bg-primary text-black font-heading font-extrabold text-lg rounded-full flex items-center justify-center shadow-md">{i + 1}</div>
                  <h3 className="font-heading font-bold text-base text-black mt-4 mb-2">{s.title}</h3>
                  <p className="text-[#666] text-sm leading-relaxed" style={{ fontFamily: "Inter" }}>{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Driver section + main photo — Dark */}
      {(content?.driver_section_title || content?.photo_main_url) && (
        <section className="py-20" style={{ background: "#0D0D0D" }}>
          <div className="container mx-auto px-4 max-w-5xl">
            {content?.driver_section_title && (
              <h2 data-animate="fade-up" className="section-title text-white text-center mb-4">{content.driver_section_title}</h2>
            )}
            {content?.driver_text && (
              <p data-animate="fade-up" data-delay="1" className="text-[#AAA] text-center max-w-2xl mx-auto mb-10" style={{ fontFamily: "Inter" }}>
                {content.driver_text}
              </p>
            )}
            {content?.photo_main_url && (
              <button
                data-animate="fade-scale"
                onClick={() => setLightbox(0)}
                className="block w-full rounded-2xl overflow-hidden bg-[#222] aspect-[16/10] group"
              >
                <img loading="lazy" decoding="async"
                  src={content.photo_main_url}
                  alt={content.driver_name || "Motorista"}
                  className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
                />
              </button>
            )}
          </div>
        </section>
      )}

      {/* Safety — White */}
      {content?.safety_text && (
        <section className="py-20" style={{ background: "#FFFFFF" }}>
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <div data-animate="fade-up" className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Shield className="w-7 h-7 text-black" />
            </div>
            <h2 data-animate="fade-up" data-delay="1" className="section-title text-black mb-4">{content.safety_title}</h2>
            <p data-animate="fade-up" data-delay="2" className="text-[#444] leading-[1.8]" style={{ fontFamily: "Inter" }}>{content.safety_text}</p>
          </div>
        </section>
      )}

      {/* Coverage — Pearl */}
      {content?.coverage_text && (
        <section className="py-20" style={{ background: "#F8F8F6" }}>
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center mb-8">
              <div data-animate="fade-up" className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-5">
                <MapPin className="w-7 h-7 text-black" />
              </div>
              <h2 data-animate="fade-up" data-delay="1" className="section-title text-black mb-4">{content.coverage_title}</h2>
              <p data-animate="fade-up" data-delay="2" className="text-[#444] leading-[1.8]" style={{ fontFamily: "Inter" }}>{content.coverage_text}</p>
            </div>
            {neighborhoods.length > 0 && (
              <div data-animate="fade-up" data-delay="3" className="flex flex-wrap justify-center gap-2 mt-6">
                {neighborhoods.map((n: string, i: number) => (
                  <span key={i} className="bg-white border border-[#E8E8E8] text-black text-sm font-heading font-medium px-4 py-2 rounded-full shadow-sm">
                    {n}
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Extra gallery (unlimited photos from photos table) */}
      {extraPhotos.length > 0 && (
        <section className="py-20" style={{ background: "#FAFAF8" }}>
          <div className="container mx-auto px-4">
            {content?.gallery_section_title && (
              <h2 data-animate="fade-up" className="section-title text-black text-center mb-10">{content.gallery_section_title}</h2>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {extraPhotos.map((p, idx) => (
                <button
                  key={p.id}
                  data-animate="fade-scale"
                  data-delay={String(Math.min(idx, 5))}
                  onClick={() => setLightbox((content?.photo_main_url ? 1 : 0) + idx)}
                  className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#222] shadow-md hover:shadow-[0_15px_40px_-10px_rgba(245,192,0,0.4)] transition-all duration-500"
                >
                  <img
                    src={p.image_url}
                    alt={p.title || `Transporte ${idx + 1}`}
                    loading="lazy"
                    onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
                    className="w-full h-full object-cover group-hover:scale-[1.08] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  />
                  {p.title && (
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <p className="text-white text-sm font-heading font-semibold truncate">{p.title}</p>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Videos — White */}
      {videos.length > 0 && (
        <section className="py-20" style={{ background: "#FFFFFF" }}>
          <div className="container mx-auto px-4">
            <h2 data-animate="fade-up" className="section-title text-black text-center mb-10">
              {content?.videos_section_title || "Vídeos do Transporte"}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
              {videos.map((video, i) => (
                <button
                  key={video.id}
                  data-animate="card"
                  data-delay={String(Math.min(i, 5))}
                  onClick={() => setPlayerVideo(video)}
                  className="bg-white rounded-[14px] overflow-hidden border border-[#E5E5E5] shadow-sm group text-left"
                >
                  <div className={`relative ${aspectClassFor(video)} overflow-hidden bg-[#E5E5E5]`}>
                    <img
                      src={getThumbnail(video)}
                      alt={video.title}
                      loading="lazy"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 flex items-center justify-center group-hover:bg-black/20 transition-all">
                      <div className="w-[60px] h-[60px] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform" style={{ background: 'rgba(245,192,0,0.92)' }}>
                        <Play className="w-7 h-7 text-black ml-1" fill="currentColor" />
                      </div>
                    </div>
                  </div>
                  {video.title && (
                    <div className="p-4">
                      <h3 className="font-heading font-semibold text-black text-base line-clamp-2">{video.title}</h3>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}



      {/* Pricing — White */}
      {content?.pricing_text && (
        <section className="py-20" style={{ background: "#FFFFFF" }}>
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <h2 data-animate="fade-up" className="section-title text-black mb-4">{content.pricing_title}</h2>
            <p data-animate="fade-up" data-delay="1" className="text-[#444] leading-[1.8] mb-6" style={{ fontFamily: "Inter" }}>{content.pricing_text}</p>
            <a data-animate="fade-up" data-delay="2" href={waHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary font-heading font-semibold hover:gap-3 transition-all">
              Pedir orçamento <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </section>
      )}

      {/* Testimonial — Dark */}
      {content?.testimonial_text && (
        <section className="py-20" style={{ background: "#0D0D0D" }}>
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <div data-animate="fade-up" className="flex justify-center gap-1 mb-5">
              {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-5 h-5 fill-primary text-primary" />)}
            </div>
            <p data-animate="fade-up" data-delay="1" className="text-white text-xl lg:text-2xl font-heading italic leading-relaxed mb-5">
              “{content.testimonial_text}”
            </p>
            {content.testimonial_author && (
              <p data-animate="fade-up" data-delay="2" className="text-primary font-heading font-semibold tracking-wide">— {content.testimonial_author}</p>
            )}
          </div>
        </section>
      )}

      {/* FAQ — Pearl */}
      {faqs.length > 0 && (
        <section className="py-20" style={{ background: "#F8F8F6" }}>
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 data-animate="fade-up" className="section-title text-black text-center mb-10">{content?.faq_title}</h2>
            <div className="space-y-3">
              {faqs.map((f, i) => (
                <details key={i} data-animate="fade-up" data-delay={String(Math.min(i, 5))} className="group bg-white rounded-2xl border border-[#E8E8E8] overflow-hidden shadow-sm">
                  <summary className="cursor-pointer px-5 py-4 font-heading font-bold text-black flex items-center justify-between gap-4 list-none">
                    <span>{f.q}</span>
                    <span className="text-primary text-xl shrink-0 transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <div className="px-5 pb-5 text-[#555] text-sm leading-relaxed" style={{ fontFamily: "Inter" }}>{f.a}</div>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA — Yellow */}
      <section className="py-20" style={{ background: "#F5C000" }}>
        <div className="container mx-auto px-4 text-center">
          <h2 data-animate="fade-up" className="font-heading font-extrabold text-black text-2xl lg:text-3xl mb-6">
            {content?.cta_title || "Quer agendar o transporte?"}
          </h2>
          <a data-animate="fade-up" data-delay="1" href={waHref} target="_blank" rel="noopener noreferrer" className="btn-dark inline-flex items-center gap-2 text-lg">
            <MessageCircle className="w-6 h-6" />
            {content?.cta_btn_text || "🚐 Agendar pelo WhatsApp"}
          </a>
        </div>
      </section>

      {lightbox !== null && allLightboxImages.length > 0 && (
        <Lightbox
          images={allLightboxImages}
          initialIndex={Math.min(lightbox, allLightboxImages.length - 1)}
          onClose={() => setLightbox(null)}
        />
      )}

      {playerVideo && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.96)', backdropFilter: 'blur(8px)' }}
          onClick={() => setPlayerVideo(null)}
        >
          <div className="w-full max-w-[920px] mx-4 relative" onClick={(e) => e.stopPropagation()} style={{ animation: 'lightboxOpen 0.25s ease both' }}>
            <button onClick={() => setPlayerVideo(null)} className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors">
              <X className="w-9 h-9" />
            </button>
            <div className={`${aspectClassFor(playerVideo)} rounded-2xl overflow-hidden bg-black`}>
              {playerVideo.video_type === 'upload' ? (
                <video src={playerVideo.video_url} className="w-full h-full" controls autoPlay />
              ) : (
                <iframe src={getEmbedUrl(playerVideo.video_url)} className="w-full h-full" allowFullScreen allow="autoplay" />
              )}
            </div>
            {playerVideo.title && <h3 className="text-white font-heading font-semibold text-lg mt-4">{playerVideo.title}</h3>}
          </div>
        </div>
      )}
    </PublicLayout>
  );
};

export default Transporte;
