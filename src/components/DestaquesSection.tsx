import { useEffect, useRef, useState } from "react";
import { getPhotos } from "@/lib/dataCache";
import { useDragScroll } from "@/hooks/useDragScroll";
import { Lightbox } from "@/components/Lightbox";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

interface Props {
  locationKey: "destaques_home" | "destaques_hotel";
  title: string;
  subtitle?: string;
  background?: string;
  textOnDark?: boolean;
}

const normalizeLocations = (p: any) =>
  Array.from(new Set([...(Array.isArray(p.locations) ? p.locations : []), p.category, p.is_featured ? "home" : null].filter(Boolean)));

export function DestaquesSection({ locationKey, title, subtitle, background = "#FAFAF8", textOnDark = false }: Props) {
  const [photos, setPhotos] = useState<any[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  useDragScroll(scrollerRef, [photos.length]);

  useEffect(() => {
    let cancelled = false;
    getPhotos().then((data) => {
      if (cancelled) return;
      const filtered = (data || []).filter((p: any) => normalizeLocations(p).includes(locationKey)).slice(0, 8);
      setPhotos(filtered);
    });
    return () => { cancelled = true; };
  }, [locationKey]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const step = card ? card.offsetWidth + 16 : 320;
    el.scrollBy({ left: dir === "left" ? -step : step, behavior: "smooth" });
  };

  if (photos.length === 0) return null;

  const headingClass = textOnDark ? "text-white" : "text-black";
  const subClass = textOnDark ? "text-[#888]" : "text-[#666]";

  return (
    <section className="py-20 lg:py-24" style={{ background }}>
      <div className="container mx-auto px-6">
        <div className="text-center mb-10">
          <span data-animate="fade-up" className="inline-block text-primary text-xs font-heading font-semibold tracking-[0.15em] uppercase px-4 py-1.5 rounded-full mb-3" style={{ background: "rgba(245,192,0,0.12)", border: "1px solid rgba(245,192,0,0.35)" }}>
            ⭐ Em alta
          </span>
          <h2 data-animate="fade-up" data-delay="1" className={`section-title mb-3 ${headingClass}`}>{title}</h2>
          {subtitle && <p data-animate="fade-up" data-delay="2" className={`section-subtitle mx-auto ${subClass}`}>{subtitle}</p>}
        </div>

        <div className="relative group/carousel">
          {photos.length > 3 && (
            <>
              <button
                onClick={() => scroll("left")}
                aria-label="Anterior"
                className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-11 h-11 rounded-full items-center justify-center bg-black/85 text-primary opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 hover:scale-110 hover:bg-primary hover:text-black shadow-lg"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scroll("right")}
                aria-label="Próxima"
                className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-11 h-11 rounded-full items-center justify-center bg-black/85 text-primary opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 hover:scale-110 hover:bg-primary hover:text-black shadow-lg"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          <div
            ref={scrollerRef}
            className={`flex gap-4 overflow-x-auto drag-rail snap-x snap-mandatory pb-4 -mx-6 px-6 scrollbar-hide ${photos.length <= 4 ? "lg:justify-center" : ""} ${photos.length === 1 ? "justify-center" : ""}`}
            style={{ scrollbarWidth: "none" }}
          >
            {photos.map((photo, i) => (
              <button
                key={photo.id}
                data-card
                data-animate="fade-up"
                data-delay={String(Math.min(i, 5))}
                onClick={() => setLightboxIndex(i)}
                className="snap-start shrink-0 w-[78%] sm:w-[46%] md:w-[31%] lg:w-[23.5%] group relative aspect-[4/5] rounded-2xl overflow-hidden bg-[#222] shadow-md hover:shadow-[0_15px_40px_-10px_rgba(245,192,0,0.4)] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5"
              >
                <img
                  src={photo.image_url}
                  alt={photo.title || "Destaque"}
                  loading="lazy"
                  onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
                  className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.08]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-5">
                  <Search className="w-7 h-7 text-primary scale-75 group-hover:scale-100 transition-transform duration-300" />
                </div>
                {photo.title && (
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-400">
                    <p className="text-white text-sm font-heading font-semibold truncate">{photo.title}</p>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          images={photos.map(p => ({ url: p.image_url, title: p.title }))}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </section>
  );
}
