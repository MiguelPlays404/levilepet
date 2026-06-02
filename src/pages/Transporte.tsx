import { useEffect, useMemo, useState } from "react";
import { PublicLayout } from "@/components/PublicLayout";
import { PageHero } from "@/components/PageHero";
import { Lightbox } from "@/components/Lightbox";
import { SectionHeader, GlassCard, StatCard } from "@/components/ModernBlocks";
import { getPhotos, getSiteConfig, getTransporteContent } from "@/lib/dataCache";
import { CheckCircle2, Clock3, MapPinned, ShieldCheck, Sparkles, Truck, Waves } from "lucide-react";

const ICON_MAP: Record<string, any> = {
  Truck,
  ShieldCheck,
  Clock3,
  MapPinned,
  Sparkles,
  Waves,
  CheckCircle2,
};

const norm = (value: string | undefined) => (value || "").toLowerCase().replace(/\s+/g, "");

export default function Transporte() {
  const [content, setContent] = useState<any>(null);
  const [waNum, setWaNum] = useState("5514997145610");
  const [photos, setPhotos] = useState<any[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getTransporteContent(), getSiteConfig(), getPhotos()]).then(([data, site, allPhotos]) => {
      if (cancelled) return;
      setContent(data);
      if (site?.whatsapp_number) setWaNum(site.whatsapp_number);
      setPhotos((allPhotos || []).filter((photo: any) => ["transporte", "transport", "home"].includes(norm(photo.category)) || (photo.locations || []).some((loc: string) => norm(loc) === "transporte")).slice(0, 8));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const highlights = useMemo(() => {
    return [1, 2, 3, 4, 5, 6]
      .map((n) => ({
        icon: content?.[`highlight_${n}_icon`],
        title: content?.[`highlight_${n}_title`],
        text: content?.[`highlight_${n}_text`],
      }))
      .filter((item) => item.title);
  }, [content]);

  const steps = useMemo(() => {
    return [1, 2, 3, 4]
      .map((n) => ({
        title: content?.[`step_${n}_title`],
        text: content?.[`step_${n}_text`],
      }))
      .filter((item) => item.title);
  }, [content]);

  const neighborhoods = (content?.coverage_neighborhoods || "").split("·").map((s: string) => s.trim()).filter(Boolean);

  return (
    <PublicLayout>
      <PageHero
        badge="🚐 transporte"
        title={content?.page_title || "Transporte pet com segurança e presença"}
        subtitle={content?.page_subtitle || "Uma apresentação visual mais forte para um serviço que precisa transmitir confiança em segundos."}
        bgImage={content?.hero_image_url || undefined}
      />

      <section id="conteudo" className="py-16 lg:py-20">
        <div className="container-safe grid gap-8 lg:grid-cols-[.9fr_1.1fr]">
          <GlassCard className="p-6 lg:p-8">
            <SectionHeader
              kicker="resumo"
              title="O serviço ganhou leitura imediata."
              subtitle={content?.intro_text || content?.description_text || "Buscamos e levamos seu pet com carinho, ar-condicionado e atenção ao percurso."}
            />
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <StatCard label="Motorista" value={content?.driver_name || "Tio João"} helper={content?.driver_section_title || "experiência e cuidado"} />
              <StatCard label="Cobertura" value={neighborhoods.length ? `${neighborhoods.length}+` : "Local"} helper="regiões próximas" />
            </div>
            <div className="mt-8 grid gap-4">
              {highlights.map((item: any) => {
                const Icon = ICON_MAP[item.icon] || Sparkles;
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

          <GlassCard className="p-6 lg:p-8">
            <SectionHeader
              kicker="como funciona"
              title={content?.how_it_works_title || "Como o transporte foi organizado"}
              subtitle={content?.how_it_works_subtitle || "Processo simples, com passos claros e sem texto demais."}
            />
            <div className="mt-8 grid gap-4">
              {steps.map((step, index) => (
                <div key={step.title} className="rounded-3xl border border-white/8 bg-white/[0.04] p-5">
                  <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Passo {index + 1}</div>
                  <h3 className="mt-2 text-lg font-bold text-white">{step.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-300">{step.text}</p>
                </div>
              ))}
            </div>
            {content?.pricing_text ? <p className="mt-6 text-sm leading-7 text-slate-300">{content.pricing_text}</p> : null}
            {content?.safety_text ? <p className="mt-3 text-sm leading-7 text-slate-300">{content.safety_text}</p> : null}
            {content?.testimonial_text ? <p className="mt-3 text-sm leading-7 text-slate-300">{content.testimonial_text}</p> : null}
          </GlassCard>
        </div>
      </section>

      <section className="py-14 lg:py-20">
        <div className="container-safe grid gap-8 lg:grid-cols-[.95fr_1.05fr]">
          <div>
            <SectionHeader
              kicker="cobertura"
              title={content?.cta_title || "Regiões atendidas"}
              subtitle={content?.coverage_text || "Lista visível de bairros e pontos atendidos para reduzir dúvida do visitante."}
            />
            <div className="mt-6 flex flex-wrap gap-2">
              {neighborhoods.length ? neighborhoods.map((n: string) => (
                <span key={n} className="badge-soft">{n}</span>
              )) : <span className="badge-soft">Região local</span>}
            </div>
          </div>

          <GlassCard className="p-6 lg:p-8">
            <SectionHeader
              kicker="galeria"
              title={content?.gallery_section_title || "Imagens do transporte"}
              subtitle="Um mosaico simples para reforçar o serviço sem quebrar a página em blocos iguais."
            />
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {photos.map((photo, index) => (
                <button key={photo.id} type="button" onClick={() => setLightboxIndex(index)} className="overflow-hidden rounded-[26px]">
                  <img
                    src={photo.image_url}
                    alt={photo.title || "Transporte pet"}
                    className="aspect-[4/3] h-full w-full object-cover transition-transform duration-300 hover:scale-[1.03]"
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

      <section className="py-16 lg:py-20">
        <div className="container-safe">
          <GlassCard className="overflow-hidden">
            <div className="grid gap-0 lg:grid-cols-[1fr_.85fr]">
              <div className="p-8 lg:p-12">
                <SectionHeader
                  kicker="contato"
                  title={content?.cta_title || "Pronto para agendar o percurso?"}
                  subtitle={content?.cta_text || "Uma chamada de ação direta, sem dispersar o visitante."}
                />
                <a href={`https://wa.me/${waNum}?text=${encodeURIComponent(content?.whatsapp_message || "Olá! Quero agendar o transporte.")}`} target="_blank" rel="noopener noreferrer" className="btn-dark mt-8 w-fit">
                  Agendar no WhatsApp
                </a>
              </div>
              <div className="relative min-h-[280px] bg-[radial-gradient(circle_at_top_right,rgba(245,192,0,0.28),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] p-8 lg:p-12">
                <div className="absolute inset-0 soft-grid opacity-30" />
                <div className="relative grid gap-3 content-end">
                  <span className="hero-kicker w-fit">segurança + conforto</span>
                  <p className="text-sm leading-7 text-slate-300">{content?.driver_text || "Transporte com atenção e experiência local."}</p>
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
