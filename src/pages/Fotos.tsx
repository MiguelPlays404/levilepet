import { useEffect, useMemo, useState } from "react";
import { PublicLayout } from "@/components/PublicLayout";
import { PageHero } from "@/components/PageHero";
import { Lightbox } from "@/components/Lightbox";
import { SectionHeader, GlassCard } from "@/components/ModernBlocks";
import { getPhotos, getSiteConfig } from "@/lib/dataCache";

const FILTERS = ["all", "galeria", "hotel", "conhecer"];

export default function Fotos() {
  const [c, setC] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([getSiteConfig(), getPhotos()]).then(([cfg, allPhotos]) => {
      setC(cfg);
      setPhotos(allPhotos || []);
    });
  }, []);

  const filtered = useMemo(() => {
    if (filter === "all") return photos;
    return photos.filter((photo) => (photo.category || "").toLowerCase() === filter);
  }, [photos, filter]);

  return (
    <PublicLayout>
      <PageHero
        badge="🖼 fotos"
        title={c?.fotos_page_title || "Galeria de fotos"}
        subtitle={c?.fotos_page_subtitle || "Um fluxo limpo para navegar por imagens sem perder a sensação premium."}
        bgImage={c?.fotos_hero_image_url || undefined}
      />

      <section id="conteudo" className="py-16 lg:py-20">
        <div className="container-safe">
          <SectionHeader
            kicker="filtros"
            title="Escolha o recorte da galeria"
            subtitle="Botões simples, sem excesso, para organizar o conteúdo por tema."
          />
          <div className="mt-6 flex flex-wrap gap-2">
            {FILTERS.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={filter === key ? "btn-dark px-4 py-2" : "btn-ghost-dark px-4 py-2"}
              >
                {key === "all" ? c?.fotos_filter_all || "Tudo" :
                 key === "galeria" ? c?.fotos_filter_galeria || "Galeria" :
                 key === "hotel" ? c?.fotos_filter_hotel || "Hotelzinho" :
                 c?.fotos_filter_conhecer || "Conhecer"}
              </button>
            ))}
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((photo, index) => (
              <GlassCard key={photo.id} className="overflow-hidden p-0">
                <button type="button" onClick={() => setLightboxIndex(index)} className="block w-full">
                  <img
                    src={photo.image_url}
                    alt={photo.title || "Foto"}
                    className="aspect-[4/3] h-full w-full object-cover transition-transform duration-300 hover:scale-[1.03]"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder.svg";
                    }}
                  />
                </button>
                <div className="p-4">
                  <h3 className="text-base font-bold text-white">{photo.title || "Sem título"}</h3>
                  <p className="mt-1 text-xs uppercase tracking-[0.22em] text-slate-500">{photo.category || "galeria"}</p>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {lightboxIndex !== null && filtered.length ? (
        <Lightbox images={filtered.map((p) => ({ url: p.image_url, title: p.title }))} initialIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />
      ) : null}
    </PublicLayout>
  );
}
