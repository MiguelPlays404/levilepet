import { useEffect, useState } from "react";
import { PublicLayout } from "@/components/PublicLayout";
import { PageHero } from "@/components/PageHero";
import { Lightbox } from "@/components/Lightbox";
import { SectionHeader, GlassCard } from "@/components/ModernBlocks";
import { getConhecerContent, getPhotos, getSiteConfig } from "@/lib/dataCache";
import { ArrowRight, Camera, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function VenhaNosConhecer() {
  const [content, setContent] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [waNum, setWaNum] = useState("5514997145610");
  const [waMsg, setWaMsg] = useState("Olá! Vim pelo site e gostaria de conhecer o Le Ville Pet.");
  const [cfg, setCfg] = useState<any>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getConhecerContent(), getPhotos(), getSiteConfig()]).then(([data, allPhotos, site]) => {
      if (cancelled) return;
      setContent(data);
      setPhotos((allPhotos || []).filter((item: any) => ["conhecer", "home"].includes((item.category || "").toLowerCase())).slice(0, 6));
      setCfg(site);
      if (site?.whatsapp_number) setWaNum(site.whatsapp_number);
      if (site?.whatsapp_message) setWaMsg(site.whatsapp_message);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <PublicLayout>
      <PageHero
        badge="📍 conhecer"
        title={content?.page_title || "Conheça o nosso espaço"}
        subtitle={content?.page_subtitle || "Uma página para mostrar o ambiente com mais espaço, mais contraste e mais calma visual."}
        bgImage={cfg?.conhecer_hero_image_url || undefined}
      />

      <section id="conteudo" className="py-16 lg:py-20">
        <div className="container-safe grid gap-8 lg:grid-cols-[1fr_.95fr]">
          <div>
            <SectionHeader
              kicker="sobre"
              title={cfg?.conhecer_about_title || "Sobre o Le Ville Pet"}
              subtitle={content?.about_text || "O espaço foi pensado para quem gosta de clareza, carinho e apresentação visual bem resolvida."}
            />
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href={`https://wa.me/${waNum}?text=${encodeURIComponent(waMsg)}`} target="_blank" rel="noopener noreferrer" className="btn-dark">
                Falar no WhatsApp
                <MessageCircle className="h-4 w-4" />
              </a>
              <Link to="/localizacao" className="btn-ghost-dark">
                Ver localização
              </Link>
            </div>
          </div>

          <GlassCard className="p-6 lg:p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              {photos.slice(0, 4).map((photo, index) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => setLightboxIndex(index)}
                  className={index === 0 ? "sm:col-span-2 overflow-hidden rounded-[28px]" : "overflow-hidden rounded-[24px]"}
                >
                  <img
                    src={photo.image_url}
                    alt={photo.title || "Conheça o espaço"}
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
        </div>
      </section>

      <section className="py-14 lg:py-20">
        <div className="container-safe">
          <GlassCard className="overflow-hidden">
            <div className="grid gap-0 lg:grid-cols-[.9fr_1.1fr]">
              <div className="relative min-h-[280px] bg-[radial-gradient(circle_at_top_right,rgba(245,192,0,0.25),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] p-8 lg:p-12">
                <div className="absolute inset-0 soft-grid opacity-30" />
                <div className="relative grid h-full content-end">
                  <span className="hero-kicker w-fit">ambiente</span>
                  <div className="mt-4 text-3xl font-black tracking-[-0.05em] text-white">Recepção, carinho e identidade visual.</div>
                </div>
              </div>
              <div className="p-8 lg:p-12">
                <SectionHeader
                  kicker="galeria"
                  title={cfg?.conhecer_gallery_title || "Galeria do espaço"}
                  subtitle="Seis imagens no máximo para manter a página elegante e rápida."
                />
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link to="/fotos" className="btn-dark">
                    Ver todas as fotos
                    <Camera className="h-4 w-4" />
                  </Link>
                  <a href={`https://wa.me/${waNum}?text=${encodeURIComponent(waMsg)}`} target="_blank" rel="noopener noreferrer" className="btn-ghost-dark">
                    Agendar visita
                  </a>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {lightboxIndex !== null && photos.length ? (
        <Lightbox images={photos.map((p) => ({ url: p.image_url, title: p.title }))} initialIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />
      ) : null}
    </PublicLayout>
  );
}
