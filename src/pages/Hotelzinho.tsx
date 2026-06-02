import { useEffect, useMemo, useState } from "react";
import { PublicLayout } from "@/components/PublicLayout";
import { PageHero } from "@/components/PageHero";
import { Lightbox } from "@/components/Lightbox";
import { SectionHeader, GlassCard } from "@/components/ModernBlocks";
import { getHotelzinhoContent, getPhotos, getSiteConfig } from "@/lib/dataCache";
import { ArrowRight, CalendarHeart, ShieldCheck, Sparkles, UtensilsCrossed } from "lucide-react";
import { Link } from "react-router-dom";

export default function Hotelzinho() {
  const [content, setContent] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [waNum, setWaNum] = useState("5514997145610");
  const [waMsg, setWaMsg] = useState("Olá! Quero saber mais sobre o hotelzinho.");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getHotelzinhoContent(), getPhotos(), getSiteConfig()]).then(([data, allPhotos, site]) => {
      if (cancelled) return;
      setContent(data);
      setPhotos((allPhotos || []).filter((photo: any) => ["hotel", "hotelzinho", "home"].includes((photo.category || "").toLowerCase()) || photo.is_featured).slice(0, 8));
      if (site?.whatsapp_number) setWaNum(site.whatsapp_number);
      if (site?.whatsapp_message) setWaMsg(site.whatsapp_message);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const highlights = useMemo(() => [
    { icon: ShieldCheck, title: content?.highlight_1_title || "Segurança", text: content?.highlight_1_text || "Ambiente pensado para a tranquilidade do pet." },
    { icon: UtensilsCrossed, title: content?.highlight_2_title || "Rotina", text: content?.highlight_2_text || "Atenção à alimentação, descanso e horários." },
    { icon: Sparkles, title: content?.highlight_3_title || "Conforto", text: content?.highlight_3_text || "Tudo organizado para uma estadia agradável." },
  ], [content]);

  return (
    <PublicLayout>
      <PageHero
        badge="🏨 hotelzinho"
        title={content?.page_title || "Hotelzinho com clima de casa"}
        subtitle={content?.intro_text || "Hospedagem com presença, cuidado e um visual mais sofisticado para valorizar o serviço."}
        bgImage={content?.hotel_hero_image_url || undefined}
      />

      <section id="conteudo" className="py-16 lg:py-20">
        <div className="container-safe grid gap-8 lg:grid-cols-[.95fr_1.05fr]">
          <div className="grid gap-4">
            <SectionHeader
              kicker="detalhes"
              title="O hotelzinho foi apresentado de forma mais elegante."
              subtitle="Três blocos de informação, sem poluição visual e sem repetir o mesmo layout em sequência."
            />
            <div className="grid gap-4">
              {[content?.description_block_1, content?.description_block_2, content?.description_block_3].filter(Boolean).map((text: string, index) => (
                <GlassCard key={index} className="p-5">
                  <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Bloco {index + 1}</div>
                  <p className="mt-3 text-sm leading-7 text-slate-300 whitespace-pre-line">{text}</p>
                </GlassCard>
              ))}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a href={`https://wa.me/${waNum}?text=${encodeURIComponent(waMsg)}`} target="_blank" rel="noopener noreferrer" className="btn-dark">
                {content?.cta_text || "Agendar pelo WhatsApp"}
                <ArrowRight className="h-4 w-4" />
              </a>
              <Link to="/fale-conosco" className="btn-ghost-dark">
                Falar com a equipe
              </Link>
            </div>
          </div>

          <GlassCard className="p-6 lg:p-8">
            <SectionHeader
              kicker="destaques"
              title={content?.destaques_hotel_title || "Pontos que reforçam confiança"}
              subtitle={content?.destaques_hotel_subtitle || "Seis pontos máximos para leitura rápida e objetiva."}
            />
            <div className="mt-8 grid gap-4">
              {highlights.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex gap-4 rounded-3xl border border-white/8 bg-white/[0.04] p-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{item.title}</h3>
                      <p className="mt-1 text-sm leading-7 text-slate-300">{item.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="container-safe">
          <SectionHeader
            kicker="galeria"
            title={content?.hotel_gallery_section_title || "Imagens do hotelzinho"}
            subtitle="Uma grade limpa para mostrar o ambiente sem deixar o layout pesado."
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {photos.map((photo, index) => (
              <button key={photo.id} type="button" onClick={() => setLightboxIndex(index)} className="overflow-hidden rounded-[28px]">
                <img
                  src={photo.image_url}
                  alt={photo.title || "Foto do hotelzinho"}
                  className="aspect-square h-full w-full object-cover transition-transform duration-300 hover:scale-[1.03]"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      </section>

      {lightboxIndex !== null && photos.length ? (
        <Lightbox images={photos.map((p) => ({ url: p.image_url, title: p.title }))} initialIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />
      ) : null}
    </PublicLayout>
  );
}
