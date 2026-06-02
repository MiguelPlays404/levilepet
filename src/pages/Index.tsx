import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { PublicLayout } from "@/components/PublicLayout";
import { Lightbox } from "@/components/Lightbox";
import { SectionHeader, GlassCard, StatCard, InfoPill } from "@/components/ModernBlocks";
import { getHomeSections, getPhotos, getSiteConfig, getVideos } from "@/lib/dataCache";
import { ArrowRight, Camera, Dog, MapPin, MessageCircle, ShieldCheck, Sparkles, Truck, Video, House } from "lucide-react";

type Config = {
  hero_title?: string;
  hero_subtitle?: string;
  site_name?: string;
  site_slogan?: string;
  address_full?: string;
  whatsapp_number?: string;
  whatsapp_message?: string;
  logo_url?: string;
};

const iconMap: Record<string, any> = {
  Home: House,
  Camera,
  Video,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Truck,
  Dog,
};

export default function Index() {
  const [config, setConfig] = useState<Config | null>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getSiteConfig(), getHomeSections(), getPhotos(), getVideos()]).then(([cfg, homeSections, allPhotos, allVideos]) => {
      if (cancelled) return;
      setConfig(cfg);
      setSections(homeSections || []);
      setPhotos((allPhotos || []).filter((item: any) => item.is_featured).slice(0, 6));
      setVideos((allVideos || []).filter((item: any) => item.is_featured).slice(0, 6));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const waNum = config?.whatsapp_number || "5514997145610";
  const waMsg = encodeURIComponent(config?.whatsapp_message || "Olá! Vim pelo site Le Ville Pet e quero saber mais.");
  const heroMedia = photos[0]?.image_url || config?.logo_url || "/images/logo-levillepet.png";

  const metrics = useMemo(() => [
    { label: "Equipe", value: "9 anos", helper: "de atendimento pet" },
    { label: "Segurança", value: "24h", helper: "com comunicação clara" },
    { label: "Experiência", value: "100%", helper: "foco no conforto do pet" },
  ], []);

  const featuredPhotos = photos.slice(0, 4);

  return (
    <PublicLayout>
      <section className="relative overflow-hidden">
        <div className="container-safe grid min-h-[calc(100dvh-4rem)] items-center gap-10 py-14 lg:grid-cols-[1.05fr_.95fr] lg:py-20">
          <div className="relative z-10 max-w-3xl">
            <div className="hero-kicker mb-5 w-fit" data-animate="fade-in">
              <span className="text-[10px] text-primary">●</span>
              {config?.site_slogan || "a gente se entende"}
            </div>

            <h1 className="max-w-3xl text-5xl font-black tracking-[-0.065em] text-white md:text-7xl lg:text-8xl" data-animate="fade-in-up">
              {config?.hero_title || "Porque seu pet merece mais que rotina."}
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 md:text-lg" data-animate="fade-in-up">
              {config?.hero_subtitle || "Hotelzinho, transporte, banho e momentos de cuidado em um espaço bonito, claro e preparado para receber com carinho."}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row" data-animate="fade-in-up">
              <a href={`https://wa.me/${waNum}?text=${waMsg}`} target="_blank" rel="noopener noreferrer" className="btn-dark">
                Falar no WhatsApp
                <MessageCircle className="h-4 w-4" />
              </a>
              <Link to="/fotos" className="btn-ghost-dark">
                Ver galeria
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-3" data-animate="fade-in-up">
              <InfoPill icon={<ShieldCheck className="h-4 w-4" />} label="cuidado e segurança" />
              <InfoPill icon={<Truck className="h-4 w-4" />} label="transporte local" />
              <InfoPill icon={<Sparkles className="h-4 w-4" />} label="visual premium" />
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3" data-animate="fade-in-up">
              {metrics.map((metric) => (
                <StatCard key={metric.label} {...metric} />
              ))}
            </div>
          </div>

          <div className="relative">
            <GlassCard className="p-3 lg:p-4">
              <div className="media-frame relative aspect-[4/5] bg-slate-900">
                <img
                  src={heroMedia}
                  alt={config?.site_name || "Le Ville Pet"}
                  className="h-full w-full object-cover"
                  loading="eager"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <div className="glass-panel rounded-3xl p-4">
                    <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Visão do espaço</div>
                    <div className="mt-2 text-xl font-bold text-white">{config?.site_name || "Le Ville Pet"}</div>
                    <div className="mt-2 text-sm leading-6 text-slate-300">
                      {config?.address_full || "Villaggio Mall Center — Bauru-SP"}
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>

            <div className="absolute -left-6 top-8 hidden rounded-3xl border border-white/10 bg-slate-950/85 p-4 shadow-2xl backdrop-blur-xl lg:block">
              <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Serviços</div>
              <div className="mt-3 grid gap-2 text-sm text-slate-200">
                <Link to="/hotelzinho" className="hover:text-white">Hotelzinho</Link>
                <Link to="/transporte" className="hover:text-white">Transporte</Link>
                <Link to="/fale-conosco" className="hover:text-white">Contato</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="conteudo" className="py-8 lg:py-14">
        <div className="container-safe">
          <SectionHeader
            kicker="mapa do site"
            title="Atalhos para o que importa"
            subtitle="Tudo organizado para levar o visitante direto ao conteúdo certo, sem excesso nem ruído."
          />
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {sections.slice(0, 8).map((section) => {
              const Icon = iconMap[section.icon] || Dog;
              return (
                <GlassCard key={section.id} className="p-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-xl font-bold text-white">{section.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{section.description}</p>
                  <Link to={section.link_url} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                    Abrir seção <ArrowRight className="h-4 w-4" />
                  </Link>
                </GlassCard>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-14 lg:py-20">
        <div className="container-safe grid gap-8 lg:grid-cols-[.95fr_1.05fr]">
          <GlassCard className="p-6 lg:p-8">
            <SectionHeader
              kicker="galeria"
              title="Imagens com luz, contraste e ritmo."
              subtitle="Uma seleção curta para apresentar o espaço sem lotar a página de bloco repetido."
            />
            <div className="mt-8 grid grid-cols-2 gap-3">
              {featuredPhotos.map((photo, index) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => setLightboxIndex(index)}
                  className={index === 0 ? "col-span-2 overflow-hidden rounded-[28px]" : "overflow-hidden rounded-[24px]"}
                >
                  <img
                    src={photo.image_url}
                    alt={photo.title || "Foto"}
                    className="aspect-square h-full w-full object-cover transition-transform duration-300 hover:scale-[1.03]"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder.svg";
                    }}
                  />
                </button>
              ))}
            </div>
          </GlassCard>

          <div className="grid gap-4">
            <SectionHeader
              kicker="destaques"
              title="O que já está pronto no projeto"
              subtitle="Conteúdo preservado, agora apresentado com melhor leitura, contraste e atmosfera."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <GlassCard className="p-5">
                <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Hotelzinho</div>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  Área dedicada ao cuidado, hospedagem e rotina com calma visual.
                </p>
                <Link to="/hotelzinho" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                  Abrir hotelzinho <ArrowRight className="h-4 w-4" />
                </Link>
              </GlassCard>
              <GlassCard className="p-5">
                <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Transporte</div>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  Transporte com apresentação mais premium e CTA claro.
                </p>
                <Link to="/transporte" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                  Abrir transporte <ArrowRight className="h-4 w-4" />
                </Link>
              </GlassCard>
              <GlassCard className="p-5 sm:col-span-2">
                <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Vídeos</div>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  Trechos em destaque para reforçar confiança e dar movimento ao site.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link to="/videos" className="btn-dark">
                    Ver vídeos
                  </Link>
                  <Link to="/fale-conosco" className="btn-ghost-dark">
                    Entrar em contato
                  </Link>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 lg:py-20">
        <div className="container-safe">
          <SectionHeader
            kicker="vídeos"
            title="Clipes rápidos, sem poluição."
            subtitle="Os vídeos dão movimento ao site e ajudam a mostrar o ambiente sem depender de blocos longos."
          />
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {videos.map((video) => (
              <GlassCard key={video.id} className="overflow-hidden">
                <div className="aspect-video bg-slate-900">
                  <img
                    src={video.thumbnail_url || "/placeholder.svg"}
                    alt={video.title || "Vídeo"}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder.svg";
                    }}
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-slate-500">
                    <Video className="h-3.5 w-3.5 text-primary" />
                    vídeo em destaque
                  </div>
                  <h3 className="mt-3 text-lg font-bold text-white">{video.title || "Sem título"}</h3>
                  {video.description ? <p className="mt-2 text-sm leading-7 text-slate-300">{video.description}</p> : null}
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      <section id="contato" className="py-16 lg:py-24">
        <div className="container-safe">
          <GlassCard className="overflow-hidden">
            <div className="grid gap-0 lg:grid-cols-[1.05fr_.95fr]">
              <div className="p-8 lg:p-12">
                <SectionHeader
                  kicker="contato"
                  title="Preparado para falar com a equipe?"
                  subtitle="Contato rápido, leitura fácil e chamadas de ação visíveis sem exagero."
                />
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <a href={`https://wa.me/${waNum}?text=${waMsg}`} target="_blank" rel="noopener noreferrer" className="btn-dark">
                    WhatsApp
                    <MessageCircle className="h-4 w-4" />
                  </a>
                  <Link to="/localizacao" className="btn-ghost-dark">
                    Ver localização
                  </Link>
                </div>
              </div>
              <div className="relative min-h-[320px] bg-[radial-gradient(circle_at_top_right,rgba(245,192,0,0.28),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] p-8 lg:p-12">
                <div className="absolute inset-0 soft-grid opacity-30" />
                <div className="relative grid h-full content-end gap-3">
                  <InfoPill icon={<MapPin className="h-4 w-4" />} label={config?.address_full || "Villaggio Mall Center — Bauru-SP"} />
                  <InfoPill icon={<MessageCircle className="h-4 w-4" />} label="atendimento via WhatsApp" />
                  <InfoPill icon={<Dog className="h-4 w-4" />} label="cuidado com identidade visual forte" />
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {lightboxIndex !== null && featuredPhotos.length > 0 ? (
        <Lightbox
          images={featuredPhotos.map((photo) => ({ url: photo.image_url, title: photo.title }))}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      ) : null}
    </PublicLayout>
  );
}
