import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useDragScroll } from "@/hooks/useDragScroll";
import { AlbumCard } from "@/components/AlbumCard";
import { AlbumModal, type AlbumItem } from "@/components/AlbumModal";
import { getAlbums, getAlbumsSync } from "@/lib/dataCache";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  location: string;
  title?: string;
  subtitle?: string;
  background?: string;
  textOnDark?: boolean;
  badge?: string;
}

export function AlbumsRail({
  location,
  title = "Álbuns",
  subtitle,
  background = "transparent",
  textOnDark = false,
  badge = "📚 Coleções",
}: Props) {
  const [albums, setAlbums] = useState<any[]>(() =>
    getAlbumsSync().filter((a: any) => (a.locations || []).includes(location))
  );
  const [openId, setOpenId] = useState<string | null>(null);
  const [openItems, setOpenItems] = useState<AlbumItem[]>([]);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    getAlbums().then((data) => {
      if (cancelled) return;
      setAlbums((data || []).filter((a: any) => (a.locations || []).includes(location)));
    });
    return () => { cancelled = true; };
  }, [location]);

  const open = async (album: any) => {
    const { data } = await supabase
      .from("album_items")
      .select("*")
      .eq("album_id", album.id)
      .order("position", { ascending: true });
    setOpenItems((data || []) as AlbumItem[]);
    setOpenId(album.id);
  };

  useDragScroll(scrollerRef, [albums.length]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-album-card]");
    const step = card ? card.offsetWidth + 16 : 320;
    el.scrollBy({ left: dir === "left" ? -step : step, behavior: "smooth" });
  };

  if (albums.length === 0) return null;

  const headingClass = textOnDark ? "text-white" : "text-black";
  const subClass = textOnDark ? "text-[#A1A1AA]" : "text-[#666]";
  const openAlbum = openId ? albums.find((a) => a.id === openId) : null;

  return (
    <section className="py-16 lg:py-20" style={{ background }}>
      <div className="container mx-auto px-6">
        <div className="flex items-end justify-between mb-8 gap-4">
          <div>
            <span
              className="inline-block text-primary text-xs font-heading font-semibold tracking-[0.15em] uppercase px-4 py-1.5 rounded-full mb-3"
              style={{ background: "rgba(245,192,0,0.12)", border: "1px solid rgba(245,192,0,0.35)" }}
            >
              {badge}
            </span>
            <h2 className={`font-heading font-extrabold text-2xl lg:text-3xl ${headingClass}`}>{title}</h2>
            {subtitle && <p className={`text-sm mt-1 ${subClass}`}>{subtitle}</p>}
          </div>
          {albums.length > 3 && (
            <div className="hidden md:flex gap-2">
              <button
                onClick={() => scroll("left")}
                className="w-9 h-9 rounded-full bg-black/10 hover:bg-primary hover:text-black text-current flex items-center justify-center transition-colors"
                aria-label="Anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scroll("right")}
                className="w-9 h-9 rounded-full bg-black/10 hover:bg-primary hover:text-black text-current flex items-center justify-center transition-colors"
                aria-label="Próxima"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div
          ref={scrollerRef}
          className="flex gap-4 overflow-x-auto drag-rail snap-x snap-mandatory pb-3 -mx-6 px-6"
          style={{ scrollbarWidth: "none" }}
        >
          {albums.map((album) => (
            <div
              key={album.id}
              data-album-card
              className="snap-start shrink-0 w-[78vw] sm:w-[44vw] md:w-[30vw] lg:w-[22vw]"
            >
              <AlbumCard
                album={album}
                itemCount={album.item_count ?? 0}
                videoCount={album.video_count ?? 0}
                onClick={() => open(album)}
                className="w-full"
              />
            </div>
          ))}
        </div>
      </div>

      {openAlbum && (
        <AlbumModal
          title={openAlbum.title || "Álbum"}
          items={openItems}
          onClose={() => setOpenId(null)}
        />
      )}
    </section>
  );
}
