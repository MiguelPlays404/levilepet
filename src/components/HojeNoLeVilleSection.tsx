import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, ChevronRight, Play, X, Clock } from "lucide-react";

import { aspectStyle } from "@/components/AspectRatioPicker";

interface HojeItem {
  id: string;
  title: string | null;
  description: string | null;
  media_url: string;
  media_type: string;
  orientation: string;
  aspect_ratio: string | null;
  expires_at: string | null;
  display_order: number;
}

function TimeLeft({ expiresAt }: { expiresAt: string | null }) {
  const [label, setLabel] = useState("");

  useEffect(() => {
    if (!expiresAt) return;
    const update = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) { setLabel(""); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      if (h >= 24) setLabel(`${Math.floor(h / 24)}d restantes`);
      else if (h > 0) setLabel(`${h}h ${m}m restantes`);
      else setLabel(`${m}m restantes`);
    };
    update();
    const t = setInterval(update, 30000);
    return () => clearInterval(t);
  }, [expiresAt]);

  if (!label) return null;
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-heading font-semibold text-black bg-primary px-2 py-0.5 rounded-full">
      <Clock className="w-2.5 h-2.5" /> {label}
    </span>
  );
}

interface LightboxProps {
  items: HojeItem[];
  index: number;
  onClose: () => void;
  onNav: (i: number) => void;
}

function HojeLightbox({ items, index, onClose, onNav }: LightboxProps) {
  const item = items[index];
  const isVideo = item.media_type === "video";
  const ar = item.aspect_ratio || (item.orientation === "vertical" ? "9:16" : "16:9");
  const isVertical = ar === "9:16" || ar === "3:4";

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNav(Math.min(index + 1, items.length - 1));
      if (e.key === "ArrowLeft") onNav(Math.max(index - 1, 0));
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [index, items.length, onClose, onNav]);

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10"
      >
        <X className="w-5 h-5" />
      </button>

      {items.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); onNav(Math.max(index - 1, 0)); }}
            disabled={index === 0}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors disabled:opacity-30 z-10"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onNav(Math.min(index + 1, items.length - 1)); }}
            disabled={index === items.length - 1}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors disabled:opacity-30 z-10"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      <div
        className="relative max-h-[90vh] flex flex-col items-center gap-3"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: isVertical ? "400px" : "900px", width: "100%" }}
      >
        <div
          className="rounded-2xl overflow-hidden bg-black w-full"
          style={{ ...aspectStyle(ar), maxHeight: isVertical ? "80vh" : undefined }}
        >
          {isVideo ? (
            <video
              src={item.media_url}
              className="w-full h-full object-contain"
              controls
              autoPlay
              playsInline
            />
          ) : (
            <img
              src={item.media_url}
              alt={item.title || "Hoje no Le Ville"}
              className="w-full h-full object-contain"
            />
          )}
        </div>
        {(item.title || item.description) && (
          <div className="text-center">
            {item.title && <p className="text-white font-heading font-semibold text-lg">{item.title}</p>}
            {item.description && <p className="text-white/70 text-sm mt-1">{item.description}</p>}
          </div>
        )}
        {items.length > 1 && (
          <div className="flex gap-1.5">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => onNav(i)}
                className={`w-2 h-2 rounded-full transition-colors ${i === index ? "bg-primary" : "bg-white/30"}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function HojeNoLeVilleSection() {
  const [items, setItems] = useState<HojeItem[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout> | null = null;

    const fetchItems = async () => {
      const now = new Date().toISOString();
      const { data } = await supabase
        .from("hoje_no_le_ville")
        .select("*")
        .eq("is_active", true)
        .lte("published_at", now)
        .or(`expires_at.is.null,expires_at.gt.${now}`)
        .order("display_order", { ascending: true })
        .order("published_at", { ascending: false });

      if (cancelled) return;
      const rows = ((data as any) || []) as HojeItem[];
      setItems(rows);
      setLoading(false);

      // Próximo evento (publicação/expiração) — calcula a partir dos dados já em mãos.
      // Antes fazíamos uma SEGUNDA query separada só pra isso; agora 0 queries extras.
      if (timeout) clearTimeout(timeout);
      let nextMs = 5 * 60_000; // fallback: 5 min
      const tnow = Date.now();
      const candidates: number[] = [];
      for (const r of rows) {
        if (r.expires_at) {
          const e = new Date(r.expires_at).getTime();
          if (e > tnow) candidates.push(e - tnow);
        }
      }
      if (candidates.length) {
        nextMs = Math.max(15_000, Math.min(5 * 60_000, Math.min(...candidates) + 500));
      }
      timeout = setTimeout(() => { fetchItems(); }, nextMs);
    };

    fetchItems();

    // Refetch ao voltar para a aba
    const onVisible = () => { if (document.visibilityState === "visible") fetchItems(); };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      if (timeout) clearTimeout(timeout);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const scroll = (dir: "left" | "right") => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-hoje-card]");
    const step = card ? card.offsetWidth + 12 : 260;
    el.scrollBy({ left: dir === "left" ? -step : step, behavior: "smooth" });
  };

  if (loading || items.length === 0) return null;

  return (
    <>
      <section className="py-16 lg:py-20" style={{ background: "#FFFFFF" }}>
        <div className="container mx-auto px-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="inline-block text-primary text-xs font-heading font-semibold tracking-[0.15em] uppercase px-4 py-1.5 rounded-full"
                  style={{ background: "rgba(245,192,0,0.12)", border: "1px solid rgba(245,192,0,0.35)" }}
                >
                  📍 Agora
                </span>
              </div>
              <h2 className="font-heading font-extrabold text-black text-2xl lg:text-3xl">
                Hoje no Le Ville
              </h2>
            </div>
            {items.length > 1 && (
              <div className="hidden md:flex gap-2">
                <button
                  onClick={() => scroll("left")}
                  className="w-9 h-9 rounded-full bg-[#F5F5F5] hover:bg-primary hover:text-black text-black/60 flex items-center justify-center transition-colors"
                  aria-label="Anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scroll("right")}
                  className="w-9 h-9 rounded-full bg-[#F5F5F5] hover:bg-primary hover:text-black text-black/60 flex items-center justify-center transition-colors"
                  aria-label="Próxima"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Carousel */}
          <div
            ref={scrollerRef}
            className="flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-3 -mx-6 px-6"
            style={{ scrollbarWidth: "none" }}
          >
            {items.map((item, i) => {
              const isVideo = item.media_type === "video";
              const ar = item.aspect_ratio || (item.orientation === "vertical" ? "9:16" : "16:9");
              const isVertical = ar === "9:16" || ar === "3:4";

              return (
                <button
                  key={item.id}
                  data-hoje-card
                  onClick={() => setLightboxIndex(i)}
                  className={`snap-start shrink-0 group relative rounded-2xl overflow-hidden bg-black shadow-md hover:shadow-[0_10px_30px_-8px_rgba(245,192,0,0.4)] transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 ${
                    isVertical
                      ? "w-[52vw] sm:w-[32vw] md:w-[22vw] lg:w-[16vw]"
                      : "w-[78vw] sm:w-[46vw] md:w-[36vw] lg:w-[28vw]"
                  }`}
                  style={aspectStyle(ar)}
                  aria-label={item.title || "Ver item"}
                >
                  {/* Mídia */}
                  {isVideo ? (
                    <video
                      src={item.media_url}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                      muted
                      loop
                      playsInline
                      autoPlay
                    />
                  ) : (
                    <img
                      src={item.media_url}
                      alt={item.title || "Hoje no Le Ville"}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                      onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
                    />
                  )}

                  {/* Gradiente + info */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                  {/* Badge vídeo */}
                  {isVideo && (
                    <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center">
                      <Play className="w-3.5 h-3.5 text-white fill-white ml-0.5" />
                    </div>
                  )}

                  {/* Time left badge */}
                  {item.expires_at && (
                    <div className="absolute top-3 right-3">
                      <TimeLeft expiresAt={item.expires_at} />
                    </div>
                  )}

                  {/* Título */}
                  {item.title && (
                    <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-0">
                      <p className="text-white text-sm font-heading font-semibold truncate text-left">
                        {item.title}
                      </p>
                      {item.description && (
                        <p className="text-white/60 text-xs truncate text-left mt-0.5">
                          {item.description}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Hover ring */}
                  <div className="absolute inset-0 rounded-2xl ring-2 ring-primary ring-offset-2 ring-offset-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {lightboxIndex !== null && (
        <HojeLightbox
          items={items}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNav={setLightboxIndex}
        />
      )}
    </>
  );
}
