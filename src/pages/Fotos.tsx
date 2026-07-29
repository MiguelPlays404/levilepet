import { Seo, breadcrumbLd } from "@/components/Seo";
import { PublicLayout } from "@/components/PublicLayout";
import { PageHero } from "@/components/PageHero";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useState, useEffect } from "react";
import { Lightbox } from "@/components/Lightbox";
import { Search, Camera, Eye, Heart } from "lucide-react";
import { getSiteConfig, getPhotos } from "@/lib/dataCache";
import { AlbumsRail } from "@/components/AlbumsRail";
import { publicViewsLabel, publicLikesLabel } from "@/lib/socialStats";
import { withVersion } from "@/lib/mediaVersion";

const catKeys = ["all", "galeria", "hotelzinho", "conhecer"] as const;

const photoLocations = (photo: any) => {
  const list = Array.isArray(photo.locations) ? photo.locations : [];
  const legacy = [photo.category || "galeria", photo.is_featured ? "home" : null].filter(Boolean);
  return Array.from(new Set([...list, ...legacy]));
};

const Fotos = () => {
  const [activeKey, setActiveKey] = useState<typeof catKeys[number]>("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(12);
  const [cfg, setCfg] = useState<any>(null);
  useScrollAnimation();

  useEffect(() => {
    getPhotos().then((data) => {
      setPhotos(data || []);
      setLoading(false);
    });
    getSiteConfig().then((data) => setCfg(data));
  }, []);

  const filterLabels: Record<typeof catKeys[number], string> = {
    all: cfg?.fotos_filter_all || "Todas",
    galeria: cfg?.fotos_filter_galeria || "Galeria",
    hotelzinho: cfg?.fotos_filter_hotel || "Hotelzinho",
    conhecer: cfg?.fotos_filter_conhecer || "Nosso Espaço",
  };

  const filtered = activeKey === "all" ? photos : photos.filter((p) => photoLocations(p).includes(activeKey));
  const visible = filtered.slice(0, visibleCount);

  return (
    <PublicLayout>
      <Seo title="Fotos dos Nossos Pets" description="Galeria de fotos do Le Ville Pet: pets hospedados, banho e tosa e o dia a dia do nosso petshop em Bauru-SP." path="/fotos" jsonLd={breadcrumbLd("Fotos dos Nossos Pets", "/fotos")} />
      <PageHero badge="📸 Fotos" title={cfg?.fotos_page_title || "Galeria de Momentos"} subtitle={cfg?.fotos_page_subtitle || "Os pets mais lindos de Bauru"} bgImage={cfg?.fotos_hero_image_url || undefined} />

      <AlbumsRail location="fotos" title="Álbuns da galeria" subtitle="Coleções organizadas por momento" background="#FAFAF8" />

      <section className="py-16" style={{ background: '#FFFFFF' }}>
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-2 justify-center mb-10">
            {catKeys.map((k) => (
              <button key={k} onClick={() => { setActiveKey(k); setVisibleCount(12); }}
                className={`px-5 py-2 rounded-full text-sm font-heading font-semibold transition-all min-h-[44px] ${
                  activeKey === k
                    ? "bg-primary text-black"
                    : "bg-transparent border border-[#D4D4D4] text-[#666] hover:border-primary hover:text-primary"
                }`}>
                {filterLabels[k]}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-square bg-[#E5E5E5] rounded-xl animate-pulse" />)}
            </div>
          ) : visible.length > 0 ? (
            <>
              <p className="text-center text-[#888] text-sm mb-4" style={{ fontFamily: 'Inter' }}>
                Exibindo {visible.length} de {filtered.length} fotos
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {visible.map((photo, i) => (
                  <button key={photo.id} aria-label={photo.title ? `Ver foto: ${photo.title}` : "Ver foto"} data-animate="fade-scale" data-delay={String(Math.min(i, 6))}
                    onClick={() => setLightboxIndex(i)}
                    className="group relative aspect-square rounded-[12px] overflow-hidden bg-[#E5E5E5]">
                    <img src={withVersion(photo.image_url, photo.updated_at)} alt={photo.title || "Foto do Le Ville Pet"}
                      className="w-full h-full object-cover group-hover:scale-[1.08] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                      loading="lazy"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center">
                      <Search className="w-7 h-7 text-primary opacity-0 group-hover:opacity-100 transition-all scale-0 group-hover:scale-100" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 px-2.5 py-2 text-white text-[11px] bg-gradient-to-t from-black/70 to-transparent" style={{ fontFamily: 'Inter', fontWeight: 500 }}>
                      <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {publicViewsLabel(photo)}</span>
                      <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 fill-primary text-primary" /> {publicLikesLabel(photo)}</span>
                    </div>
                  </button>
                ))}
              </div>
              {visibleCount < filtered.length && (
                <div className="text-center mt-8">
                  <button onClick={() => setVisibleCount(c => c + 12)} className="btn-secondary">Ver mais fotos</button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <Camera className="w-16 h-16 text-primary mx-auto mb-4" />
              <p className="text-[#888] text-lg" style={{ fontFamily: 'Inter' }}>Nenhuma foto nesta categoria.</p>
            </div>
          )}
        </div>
      </section>

      {lightboxIndex !== null && (
        <Lightbox images={visible.map(p => ({ url: p.image_url, title: p.title }))} initialIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />
      )}
    </PublicLayout>
  );
};

export default Fotos;
