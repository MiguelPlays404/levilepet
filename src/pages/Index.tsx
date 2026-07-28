import { Seo } from "@/components/Seo";
import { Link } from "react-router-dom";
import { PublicLayout } from "@/components/PublicLayout";
import { useState, useEffect } from "react";
import { Lightbox } from "@/components/Lightbox";
import { DestaquesSection } from "@/components/DestaquesSection";
import { HojeNoLeVilleSection } from "@/components/HojeNoLeVilleSection";
import { AlbumsRail } from "@/components/AlbumsRail";
import { getVideoThumbnail } from "@/lib/videoThumb";
import { getSiteConfig, getHomeSections, getPhotos, getVideos, getSiteConfigSync, getHomeSectionsSync, getPhotosSync, getVideosSync } from "@/lib/dataCache";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { supabase } from "@/integrations/supabase/client";
import {
  Hotel, Camera, Video, MapPin, MessageCircle, Share2,
  Search, Heart, Phone, Truck, Sparkles, Briefcase, Clock, CheckCircle2
} from "lucide-react";

const iconMap: Record<string, any> = { Home: Hotel, Camera, Video, MapPin, MessageCircle, Heart: Share2, Truck, Sparkles };

const Index = () => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [vagaImageOpen, setVagaImageOpen] = useState(false);
  // Seed inicial vindo do cache síncrono (localStorage) — evita flash de defaults
  const [sections, setSections] = useState<any[]>(() => getHomeSectionsSync());
  const [photos, setPhotos] = useState<any[]>(() => getPhotosSync().filter((p: any) => p.is_featured).slice(0, 6));
  const [featuredVideos, setFeaturedVideos] = useState<any[]>(() => getVideosSync().filter((v: any) => v.is_featured).slice(0, 8));
  const [showMoreVideos, setShowMoreVideos] = useState(false);
  const [config, setConfig] = useState<any>(() => getSiteConfigSync());
  const [vagas, setVagas] = useState<any[]>([]);

  useScrollAnimation();

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getSiteConfig(),
      getHomeSections(),
      getPhotos(),
      getVideos(),
    ]).then(([cfg, sections, allPhotos, allVideos]) => {
      if (cancelled) return;
      setConfig(cfg);
      setSections(sections || []);
      setPhotos((allPhotos || []).filter((p: any) => p.is_featured).slice(0, 6));
      setFeaturedVideos((allVideos || []).filter((v: any) => v.is_featured).slice(0, 8));
    });
    supabase.from("vagas").select("*").eq("is_active", true).order("display_order").then(({ data }) => {
      if (!cancelled) setVagas(data || []);
    });
    return () => { cancelled = true; };
  }, []);

  const c = config || {};
  const waNum = c.whatsapp_number || '5514997145610';
  const waMsg = encodeURIComponent(c.whatsapp_message || 'Olá! Vim pelo site Le Ville Pet! 🐾');
  const renderMedia = (url: string | undefined, fallback: string, alt: string, className = "w-full h-full object-cover", priority = false) => {
    const src = url || fallback;
    const isVideo = /\.(mp4|webm|mov|m4v)(\?|$)/i.test(src);
    return isVideo ? (
      <video src={src} className={className} autoPlay muted loop playsInline controls={false} />
    ) : (
      <img
        src={src}
        alt={alt}
        className={className}
        loading={priority ? "eager" : "lazy"}
        // @ts-expect-error fetchPriority ainda não tipado em todas as versões do React
        fetchpriority={priority ? "high" : undefined}
        decoding={priority ? "sync" : "async"}
        onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
      />
    );

  };

  return (
    <PublicLayout>
      <Seo title="Le Ville Pet — Petshop e Hotelzinho em Bauru-SP" description="Le Ville Pet: petshop em Bauru-SP com hotelzinho, transporte, banho e tosa. Atendimento personalizado no Villaggio Mall Center." path="/" />
      {/* ═══ HERO — ESCURO ═══ */}
      <section className="relative min-h-screen flex items-center overflow-hidden" style={{ background: 'radial-gradient(ellipse at 65% 35%, #1C1500 0%, #080808 55%, #000000 100%)' }}>
        {c.hero_bg_image_url && (
          <div className="absolute inset-0">
            <div className="absolute inset-0 opacity-30 lg:opacity-45">
              {renderMedia(c.hero_bg_image_url, '', 'Fachada do Le Ville Pet, petshop em Bauru-SP', 'w-full h-full object-cover object-center', true)}
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/85 lg:from-black/55 lg:via-black/45 lg:to-black/60" />
          </div>
        )}
        {/* Halos ambientes: `gpu` promove cada um à sua própria camada de
            composição — sem isso, o scale infinito repintava uma área de
            700x700px a cada frame no main thread. No mobile o CSS desliga
            estas animações por completo. */}
        <div className="absolute top-[10%] right-[5%] w-[700px] h-[700px] rounded-full pointer-events-none animate-scale-breath gpu" style={{ background: 'radial-gradient(circle, rgba(245,192,0,0.14) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[5%] left-[-5%] w-[500px] h-[500px] rounded-full pointer-events-none gpu" style={{ background: 'radial-gradient(circle, rgba(245,192,0,0.07) 0%, transparent 70%)', animation: 'scaleBreath 6s ease-in-out infinite 2.5s' }} />
        <div className="absolute inset-0 paw-pattern-bg pointer-events-none" />
        {[0,1,2,3,4].map(i => (
          <div key={i} className="absolute pointer-events-none select-none hidden md:block gpu" aria-hidden="true" style={{ fontSize: `${16 + i * 5}px`, opacity: 0.12, animation: `floatPaw ${4.5 + i}s ease-in-out infinite ${i * 0.8}s`, top: `${15 + i * 15}%`, right: `${5 + i * 8}%`, color: '#F5C000' }}>🐾</div>
        ))}
        <div className="absolute right-[18%] top-[10%] bottom-[10%] w-px pointer-events-none hidden lg:block animate-line-grow-v" style={{ background: 'linear-gradient(to bottom, transparent, rgba(245,192,0,0.35), transparent)' }}>
          {[20,40,60,80].map((p,i) => (
            <div key={i} className="absolute w-2 h-2 rounded-full bg-primary" style={{ top: `${p}%`, left: '-3.5px', animation: `fadeIn 0.5s ease ${0.8 + i * 0.3}s both` }} />
          ))}
        </div>

        <div className="relative z-10 container mx-auto px-6 lg:px-12 pt-28 pb-20 lg:pt-32 lg:pb-24">
          <div className="max-w-[680px]">
            <div data-animate="fade-up" className="inline-flex items-center gap-2.5 rounded-full px-5 py-2 mb-9" style={{ background: 'rgba(245,192,0,0.12)', border: '1px solid rgba(245,192,0,0.45)', animation: 'heroBadgePop 0.6s ease 0.2s both' }}>
              <span className="font-heading font-semibold text-xs tracking-[0.1em] uppercase text-primary">{c.hero_badge_text || '🐾 Petshop em Bauru-SP'}</span>
            </div>

            <h1 data-animate="fade-up" data-delay="1" className="hero-title text-white mb-7">
              {(() => {
                const title = c.hero_title || 'Porque seu pet merece o melhor.';
                const highlight = c.hero_highlight_word || 'melhor.';
                const idx = title.toLowerCase().lastIndexOf(highlight.toLowerCase());
                if (idx === -1) return title;
                const before = title.slice(0, idx);
                const word = title.slice(idx, idx + highlight.length);
                const after = title.slice(idx + highlight.length);
                return (
                  <>
                    {before}
                    <span className="relative inline-block" style={{ color: '#F5C000' }}>
                      {word}
                      <span className="absolute -bottom-[5px] left-0 w-full h-1 rounded" style={{ background: 'linear-gradient(90deg, #F5C000, #FFD700, #F5C000)', transformOrigin: 'left', transform: 'scaleX(0)', animation: 'lineGrow 0.7s ease 1.3s forwards' }} />
                    </span>
                    {after}
                  </>
                );
              })()}
              <span className="sr-only"> Le Ville Pet — Petshop e Hotelzinho em Bauru-SP</span>
            </h1>


            <p data-animate="fade-up" data-delay="2" className="text-[#BBBBBB] text-lg leading-relaxed mb-11 max-w-[520px]" style={{ fontFamily: 'Inter' }}>
              {c.hero_subtitle || 'No Le Ville Pet, cuidamos do seu companheiro com todo o carinho, amor e profissionalismo que ele merece.'}{' '}
              <em className="text-primary italic">"{c.site_slogan || 'a gente se entende'}"</em> 🐾
            </p>

            <div data-animate="fade-up" data-delay="3" className="flex flex-col sm:flex-row gap-4 mb-[72px]">
              <a href={`https://wa.me/${waNum}?text=${waMsg}`} target="_blank" rel="noopener noreferrer" className="btn-primary text-base py-4 px-8">
                {c.hero_btn_primary_text || '💬 Fale no WhatsApp'}
              </a>
              <Link to="/hotelzinho" className="btn-ghost">{c.hero_btn_secondary_text || 'Conheça o Hotelzinho →'}</Link>
            </div>

            <div data-animate="fade-up" data-delay="4" className="flex gap-12 flex-wrap pt-9" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              {[
                { num: c.hero_stat_1_num || '500+', label: c.hero_stat_1_label || 'Pets Atendidos' },
                { num: c.hero_stat_2_num || '5★', label: c.hero_stat_2_label || 'Avaliação Google' },
                { num: c.hero_stat_3_num || '3+', label: c.hero_stat_3_label || 'Anos de Experiência' },
              ].map((s, i) => (
                <div key={i}>
                  <div className="font-heading font-extrabold text-[1.85rem] text-primary leading-none">{s.num}</div>
                  <div style={{ fontFamily: 'Inter', fontSize: '12px', color: '#666', marginTop: '5px' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <a href="#sobre" className="absolute bottom-9 left-1/2 -translate-x-1/2 text-primary/60 text-[22px] animate-bounce-down no-underline">↓</a>
      </section>

      {/* ═══ SOBRE — CLARO (#FFFFFF) ═══ */}
      <section id="sobre" className="py-24 lg:py-28" style={{ background: '#FFFFFF' }}>
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
            <div className="lg:col-span-3">
              <span data-animate="fade-up" className="inline-block text-primary text-sm font-body px-4 py-1.5 rounded-full mb-4" style={{ background: 'var(--yellow-badge)' }}>{c.sobre_badge_text || 'Quem Somos'}</span>
              <h2 data-animate="fade-up" data-delay="1" className="section-title text-black mb-5">
                {c.sobre_title || 'O Le Ville Pet — onde seu pet se sente em casa'}
              </h2>
              <p data-animate="fade-up" data-delay="2" className="text-[#444] text-lg leading-[1.8] mb-5" style={{ fontFamily: 'Inter' }}>
                {c.sobre_text || 'Somos um petshop em Bauru-SP dedicado a oferecer os melhores cuidados para o seu companheiro de quatro patas.'}
              </p>
              <p data-animate="fade-up" data-delay="3" className="text-primary italic text-xl font-heading mb-5">"{c.site_slogan || 'a gente se entende'}"</p>
              <Link data-animate="fade-up" data-delay="4" to="/venha-nos-conhecer" className="text-primary font-heading font-semibold hover:underline transition-all inline-flex items-center gap-1 group">
                {c.sobre_cta_text || 'Venha nos conhecer'} <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
            <div className="lg:col-span-2" data-animate="fade-right" data-delay="2">
              <div className="relative">
                <div className="absolute -inset-4 bg-primary/15 rounded-3xl rotate-3" />
                <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border-[3px] border-primary shadow-xl bg-[#E5E5E5]">
                  {renderMedia(c.sobre_image_url, "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&h=450&fit=crop", "Pets no Le Ville Pet")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ VAGAS DISPONÍVEIS — AMARELO (#F5C000) ═══ */}
      {c.vagas_section_active !== false && vagas.length > 0 && (
        <section className="py-20 lg:py-24 relative overflow-hidden" style={{ background: '#F5C000' }}>
          <div className="absolute inset-0 paw-pattern-bg opacity-[0.07] pointer-events-none" />
          <div className="container mx-auto px-6 relative">
            <div className="text-center mb-12">
              <span data-animate="fade-up" className="inline-flex items-center gap-2 bg-black/10 text-black text-sm font-heading font-semibold px-4 py-1.5 rounded-full mb-4">
                <Briefcase className="w-4 h-4" /> {c.vagas_section_badge || 'Trabalhe Conosco'}
              </span>
              <h2 data-animate="fade-up" data-delay="1" className="section-title text-black mb-3">{c.vagas_section_title || 'Vagas Disponíveis'}</h2>
              <p data-animate="fade-up" data-delay="2" className="text-black/70 text-base lg:text-lg" style={{ fontFamily: 'Inter' }}>{c.vagas_section_subtitle || 'Faça parte da nossa equipe!'}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center max-w-6xl mx-auto">
              <button
                onClick={() => setVagaImageOpen(true)}
                data-animate="fade-right"
                className="group relative block w-full focus:outline-none"
                aria-label="Ampliar imagem"
              >
                <div className="absolute -inset-3 bg-black/15 rounded-3xl rotate-[-2deg] transition-transform group-hover:rotate-[-3deg] max-w-sm mx-auto" />
                <div className="relative aspect-[9/16] max-w-sm mx-auto rounded-3xl overflow-hidden border-[4px] border-black shadow-2xl bg-black/10">
                  <img
                    src={c.vagas_section_image_url || '/__l5e/assets-v1/54501d92-7544-4502-8c7b-207bccc137ff/vaga-banhista.jpg'}
                    alt="Vaga em destaque"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <Search className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </button>

              <div className="space-y-6">
                {vagas.map((vaga, i) => {
                  const msg = encodeURIComponent(vaga.whatsapp_message || `Olá! Vim pelo site do Le Ville Pet e tenho interesse na vaga: ${vaga.title}`);
                  return (
                    <div key={vaga.id} data-animate="fade-up" data-delay={String(i)} className="bg-black text-white rounded-[24px] p-7 lg:p-8 shadow-2xl border-2 border-black/80">
                      <h3 className="font-heading font-extrabold text-2xl lg:text-3xl text-primary mb-5 leading-tight">{vaga.title}</h3>
                      {vaga.schedule && (
                        <div className="flex items-start gap-3 mb-4">
                          <Clock className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                          <div>
                            <p className="font-heading font-semibold text-sm text-primary/90 mb-0.5">Disponibilidade necessária</p>
                            <p className="text-white/80 text-sm" style={{ fontFamily: 'Inter' }}>{vaga.schedule}</p>
                          </div>
                        </div>
                      )}
                      {vaga.requirements && (
                        <div className="flex items-start gap-3 mb-6">
                          <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                          <div>
                            <p className="font-heading font-semibold text-sm text-primary/90 mb-0.5">Requisitos mínimos</p>
                            <p className="text-white/80 text-sm" style={{ fontFamily: 'Inter' }}>{vaga.requirements}</p>
                          </div>
                        </div>
                      )}
                      <a
                        href={`https://wa.me/${waNum}?text=${msg}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe57] text-white font-heading font-bold px-6 py-3 rounded-xl transition-colors min-h-[44px]"
                      >
                        <MessageCircle className="w-5 h-5" />
                        Falar no WhatsApp
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {vagaImageOpen && (
            <Lightbox
              images={[{ url: c.vagas_section_image_url || '/__l5e/assets-v1/54501d92-7544-4502-8c7b-207bccc137ff/vaga-banhista.jpg', title: vagas[0]?.title }]}
              initialIndex={0}
              onClose={() => setVagaImageOpen(false)}
            />
          )}
        </section>
      )}

      {/* ═══ HOJE NO LE VILLE — AGENDADO AUTOMÁTICO ═══ */}
      <HojeNoLeVilleSection />

      {/* ═══ DESTAQUES DA SEMANA — HOME ═══ */}
      <DestaquesSection
        locationKey="destaques_home"
        title={c.destaques_home_title || "Destaques da Semana"}
        subtitle={c.destaques_home_subtitle || "Os momentos mais especiais"}
        background="#FAFAF8"
      />

      {/* ═══ ÁLBUNS — HOME ═══ */}
      <AlbumsRail
        location="home"
        title={c.albuns_home_title || "Nossos Álbuns"}
        subtitle={c.albuns_home_subtitle || "Coleções de momentos especiais"}
        background="#FFFFFF"
      />

      {/* ═══ CARDS — CLARO (#F8F8F6) ═══ */}
      <section className="py-20 lg:py-24 cv-auto" style={{ background: '#F8F8F6' }}>
        <div className="container mx-auto px-6">
          <div className="text-center mb-14">
            <h2 data-animate="fade-up" className="section-title text-black mb-3">{c.home_explore_title || 'Explore o Le Ville Pet'}</h2>
            <p data-animate="fade-up" data-delay="1" className="section-subtitle mx-auto">{c.home_explore_subtitle || 'Descubra tudo que preparamos para você e seu pet'}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {(sections.length > 0 ? sections : [
              { icon: 'Home', title: 'Nosso Hotelzinho', description: 'Seu pet em boas mãos enquanto você viaja.', link_url: '/hotelzinho' },
              { icon: 'Camera', title: 'Galeria de Fotos', description: 'Confira nosso espaço e nossos pets.', link_url: '/fotos' },
              { icon: 'Video', title: 'Vídeos', description: 'Momentos especiais em vídeo.', link_url: '/videos' },
              { icon: 'Truck', title: 'Transporte', description: 'Levamos e buscamos seu pet com segurança.', link_url: '/transporte' },
              { icon: 'Sparkles', title: 'Venha Nos Conhecer', description: 'Agende uma visita ao Le Ville Pet.', link_url: '/venha-nos-conhecer' },
              { icon: 'MapPin', title: 'Localização', description: 'Villaggio Mall Center, Bauru-SP.', link_url: '/localizacao' },
              { icon: 'MessageCircle', title: 'Fale Conosco', description: 'Atendimento rápido pelo WhatsApp.', link_url: '/fale-conosco' },
              { icon: 'Heart', title: 'Redes Sociais', description: 'Siga a gente nas redes!', link_url: '/siga-nos' },
            ]).map((card: any, i: number) => {
              const Icon = iconMap[card.icon] || Hotel;
              return (
                <Link key={card.link_url || i} to={card.link_url} data-animate="card" data-delay={String(i)}
                  className="card-light group block p-8 hover:cursor-pointer">
                  <div className="w-16 h-16 bg-primary rounded-[18px] flex items-center justify-center mb-5 group-hover:animate-[rotatePaw_0.5s_ease]">
                    <Icon className="w-7 h-7 text-black" />
                  </div>
                  <h3 className="font-heading font-bold text-[19px] text-black mb-2">{card.title}</h3>
                  <p className="text-[#666] text-[15px] mb-3" style={{ fontFamily: 'Inter' }}>{card.description}</p>
                  <span className="text-primary text-sm font-heading font-semibold opacity-0 group-hover:opacity-100 transition-opacity">{c.home_card_cta_text || 'Saiba mais →'}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ PREÇOS — CLARO (#FAFAF8) ═══ */}
      <section className="py-20 lg:py-24 cv-auto" style={{ background: '#FAFAF8' }}>
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <span data-animate="fade-up" className="inline-block text-primary text-sm font-body px-4 py-1.5 rounded-full mb-4" style={{ background: 'var(--yellow-badge)' }}>Preços</span>
            <h2 data-animate="fade-up" data-delay="1" className="section-title text-black mb-3">Nossos Valores</h2>
            <p data-animate="fade-up" data-delay="2" className="section-subtitle mx-auto">Consulte condições e pacotes especiais para o seu pet</p>
          </div>
          <div data-animate="fade-scale" data-delay="2" className="max-w-xl mx-auto bg-white rounded-[24px] p-10 lg:p-12 text-center border-[3px] border-primary" style={{ boxShadow: 'var(--shadow-xl)' }}>
            <div className="w-16 h-16 mx-auto bg-primary rounded-[18px] flex items-center justify-center mb-6">
              <Phone className="w-7 h-7 text-black" />
            </div>
            <h3 className="font-heading font-extrabold text-3xl lg:text-4xl text-black mb-3">Consultar</h3>
            <p className="text-[#666] text-base mb-8" style={{ fontFamily: 'Inter' }}>
              Entre em contato pelo WhatsApp para receber valores atualizados e condições personalizadas.
            </p>
            <a
              href={`https://wa.me/${waNum}?text=${encodeURIComponent('Olá, vim pelo site e gostaria de saber sobre os preços')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex items-center gap-2 text-base py-4 px-8"
            >
              <MessageCircle className="w-5 h-5" />
              Falar no WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ═══ GALERIA — ESCURO (#0D0D0D) ═══ */}
      {photos.length > 0 && (
        <section className="py-20 lg:py-24" style={{ background: '#0D0D0D' }}>
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 data-animate="fade-up" className="section-title text-white mb-3">{c.gallery_section_title || 'Momentos Especiais'}</h2>
              <p data-animate="fade-up" data-delay="1" className="section-subtitle text-[#888] mx-auto">{c.gallery_section_subtitle || 'Confira alguns dos nossos pets favoritos'}</p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5">
              {photos.map((photo: any, i: number) => (
                <button key={photo.id} data-animate="fade-scale" data-delay={String(i)} onClick={() => setLightboxIndex(i)}
                  className="group relative aspect-square rounded-[14px] overflow-hidden bg-[#333]">
                  <img src={photo.image_url} alt={photo.title} className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.08]" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }} />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center">
                    <Search className="w-8 h-8 text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 scale-0 group-hover:scale-100" />
                  </div>
                </button>
              ))}
            </div>
            <div className="text-center mt-10" data-animate="fade-up">
              <Link to="/fotos" className="btn-secondary">{c.featured_photos_btn_text || 'Ver Todas as Fotos'}</Link>
            </div>
          </div>
        </section>
      )}

      {/* ═══ VÍDEOS DESTAQUE — CLARO (#FAFAF8) ═══ */}
      {featuredVideos.length > 0 && (() => {
        const visible = showMoreVideos ? featuredVideos : featuredVideos.slice(0, 1);
        const renderVideo = (v: any) => (
          v.video_type === 'upload' ? (
            <video src={v.video_url} className="w-full h-full" controls preload="metadata" poster={getVideoThumbnail(v)} />
          ) : (
            <iframe
              src={v.video_url.includes('embed') ? v.video_url : `https://www.youtube.com/embed/${v.video_url.match(/(?:v=|youtu\.be\/)([^&\s]+)/)?.[1] || ''}`}
              className="w-full h-full" allowFullScreen loading="lazy" title={v.title || 'Vídeo'}
            />
          )
        );
        const getAspectClass = (v: any) => {
          const ar = v.aspect_ratio || (v.orientation === 'vertical' ? '9:16' : '16:9');
          return { '16:9': 'aspect-video', '4:3': 'aspect-[4/3]', '1:1': 'aspect-square', '3:4': 'aspect-[3/4]', '9:16': 'aspect-[9/16]' }[ar] || 'aspect-video';
        };
        const getMaxW = (v: any) => {
          const ar = v.aspect_ratio || (v.orientation === 'vertical' ? '9:16' : '16:9');
          return (ar === '9:16' || ar === '3:4') ? 'max-w-xs' : (ar === '1:1' ? 'max-w-md' : 'max-w-3xl');
        };
        return (
          <section className="py-20 lg:py-24" style={{ background: '#FAFAF8' }}>
            <div className="container mx-auto px-6">
              <div className="text-center mb-10">
                <h2 data-animate="fade-up" className="section-title text-black mb-3">{c.video_section_title || 'Em Destaque'}</h2>
                <p data-animate="fade-up" data-delay="1" className="section-subtitle mx-auto">{c.video_section_subtitle || 'Assista aos nossos vídeos favoritos'}</p>
              </div>
              <div className="mx-auto space-y-8">
                {visible.map((v, i) => (
                  <div key={v.id} data-animate="fade-scale" data-delay={String(Math.min(i + 1, 4))} className={`${getMaxW(v)} mx-auto`}>
                    <div className={`${getAspectClass(v)} rounded-[20px] overflow-hidden bg-black`} style={{ boxShadow: 'var(--shadow-xl)' }}>
                      {renderVideo(v)}
                    </div>
                    {v.title && <p className="text-center mt-3 font-heading font-semibold text-black/80">{v.title}</p>}
                  </div>
                ))}
              </div>
              <div className="text-center mt-8 flex flex-wrap justify-center gap-3" data-animate="fade-up" data-delay="3">
                {featuredVideos.length > 1 && !showMoreVideos && (
                  <button onClick={() => setShowMoreVideos(true)} className="btn-primary">
                    ⭐ Ver mais destaques ({featuredVideos.length - 1})
                  </button>
                )}
                {showMoreVideos && featuredVideos.length > 1 && (
                  <button onClick={() => setShowMoreVideos(false)} className="btn-primary">
                    Mostrar menos
                  </button>
                )}
                <Link to="/videos" className="btn-dark">{c.featured_videos_btn_text || 'Ver Todos os Vídeos'}</Link>
              </div>
            </div>
          </section>
        );
      })()}

      {/* ═══ CTA HOTELZINHO — AMARELO (#F5C000) ═══ */}
      <section className="py-20 lg:py-24 cv-auto" style={{ background: '#F5C000' }}>
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span data-animate="fade-up" className="inline-flex items-center gap-2 text-black/60 text-sm font-body mb-3"><Hotel className="w-5 h-5" /> {c.cta_hotel_badge_text || 'Nosso Hotelzinho'}</span>
              <h2 data-animate="fade-up" data-delay="1" className="font-heading font-extrabold text-black text-3xl lg:text-4xl mb-5">{c.cta_hotel_title || 'Vai viajar? Deixe seu pet com a gente!'}</h2>
              <p data-animate="fade-up" data-delay="2" className="text-black/70 text-base lg:text-lg leading-relaxed mb-8" style={{ fontFamily: 'Inter' }}>{c.cta_hotel_text || 'Nosso hotelzinho oferece um ambiente seguro, confortável e cheio de carinho para o seu pet enquanto você viaja com tranquilidade.'}</p>
              <div data-animate="fade-up" data-delay="3" className="flex flex-col sm:flex-row gap-3">
                <Link to="/hotelzinho" className="btn-dark">{c.cta_hotel_btn1_text || '🐾 Conhecer Hotelzinho'}</Link>
                <a href={`https://wa.me/${waNum}?text=${encodeURIComponent('Olá! Gostaria de informações sobre o hotelzinho.')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 border-2 border-black text-black font-heading font-bold px-7 py-3.5 rounded-xl hover:bg-black/10 transition-colors min-h-[44px]">
                  {c.cta_hotel_btn2_text || '💬 Agendar pelo WhatsApp'}
                </a>
              </div>
            </div>
            <div data-animate="fade-right" data-delay="2">
              <div className="aspect-[4/3] rounded-[20px] overflow-hidden shadow-2xl bg-[#E5E5E5]">
                {renderMedia(c.cta_hotel_image_url, "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600&h=450&fit=crop", "Hotelzinho Le Ville Pet")}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CONTATO — ESCURO (#111111) ═══ */}
      <section className="py-20 lg:py-24 cv-auto" style={{ background: '#111111' }}>
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 data-animate="fade-up" className="section-title text-white">{c.contact_section_title || 'Entre em Contato'}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <MessageCircle className="w-7 h-7 text-[#25D366]" />, bg: 'rgba(37,211,102,0.15)', title: 'WhatsApp', value: `(${(waNum || '').slice(2,4)}) ${(waNum || '').slice(4,9)}-${(waNum || '').slice(9)}`, color: '#F5C000', btnText: c.contact_whatsapp_btn_text || 'Chamar no WhatsApp', btnBg: '#25D366', href: `https://wa.me/${waNum}` },
              { icon: <Phone className="w-7 h-7 text-primary" />, bg: 'rgba(245,192,0,0.15)', title: c.contact_fixed_phone_title || 'Telefone Fixo', value: c.fixed_phone || '(14) 3204-7040', color: '#F5C000', btnText: c.contact_fixed_phone_btn_text || 'Ligar agora', btnBg: '#F5C000', href: `tel:${(c.fixed_phone || '(14) 3204-7040').replace(/\D/g, '')}`, darkText: true },
              { icon: <MapPin className="w-7 h-7 text-primary" />, bg: 'rgba(245,192,0,0.15)', title: 'Localização', value: `${c.address_line1 || 'Villaggio Mall Center'}\n${c.address_line3 || 'Bauru-SP'}`, color: '#999', btnText: c.contact_maps_btn_text || 'Ver no Mapa', btnBg: '#F5C000', href: '/localizacao', internal: true },
              { icon: <svg className="w-7 h-7 text-pink-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>, bg: 'rgba(236,72,153,0.15)', title: 'Instagram', value: c.instagram_handle || '@levillepetbauru', color: '#F5C000', btnText: c.contact_instagram_btn_text || 'Seguir', btnBg: 'linear-gradient(135deg, #F56040, #E1306C, #833AB4)', href: c.instagram_url || 'https://www.instagram.com/levillepetbauru/' },
            ].map((card, i) => (
              <div key={i} data-animate="card" data-delay={String(i)} className="rounded-[20px] p-8 text-center border border-white/5" style={{ background: '#1A1A1A' }}>
                <div className="w-14 h-14 rounded-[14px] flex items-center justify-center mx-auto mb-4" style={{ background: card.bg }}>{card.icon}</div>
                <h3 className="font-heading font-semibold text-white text-lg mb-1">{card.title}</h3>
                <p className="font-heading font-bold text-lg mb-4 whitespace-pre-line" style={{ color: card.color }}>{card.value}</p>
                {card.internal ? (
                  <Link to={card.href} className="inline-flex items-center justify-center gap-2 text-black font-heading font-bold px-6 py-3 rounded-xl transition-colors min-h-[44px]" style={{ background: card.btnBg }}>{card.btnText}</Link>
                ) : (
                  <a href={card.href} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center justify-center gap-2 font-heading font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-all min-h-[44px] ${card.darkText ? 'text-black' : 'text-white'}`} style={{ background: card.btnBg }}>{card.btnText}</a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {lightboxIndex !== null && (
        <Lightbox images={photos.map(p => ({ url: p.image_url, title: p.title }))} initialIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />
      )}
    </PublicLayout>
  );
};

export default Index;
