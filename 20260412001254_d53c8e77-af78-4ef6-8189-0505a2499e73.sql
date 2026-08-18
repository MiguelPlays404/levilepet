import { Seo, breadcrumbLd } from "@/components/Seo";
import { useEffect, useState } from "react";
import { PublicLayout } from "@/components/PublicLayout";
import { PageHero } from "@/components/PageHero";
import { AlbumCard } from "@/components/AlbumCard";
import { AlbumModal, type AlbumItem } from "@/components/AlbumModal";
import { getAlbums, getSiteConfig } from "@/lib/dataCache";
import { supabase } from "@/integrations/supabase/client";
import { Images } from "lucide-react";

const Albuns = () => {
  const [albums, setAlbums] = useState<any[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [openItems, setOpenItems] = useState<AlbumItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cfg, setCfg] = useState<any>(null);

  useEffect(() => {
    getAlbums().then((d) => { setAlbums(d || []); setLoading(false); });
    getSiteConfig().then(setCfg);
  }, []);

  const open = async (a: any) => {
    const { data } = await supabase
      .from("album_items")
      .select("*")
      .eq("album_id", a.id)
      .order("position", { ascending: true });
    setOpenItems((data || []) as AlbumItem[]);
    setOpenId(a.id);
  };

  const current = openId ? albums.find((x) => x.id === openId) : null;

  return (
    <PublicLayout>
      <Seo title="Álbuns de Fotos e Vídeos" description="Explore os álbuns do Le Ville Pet organizados por tema: hotelzinho, passeios, transporte e momentos dos nossos pets." path="/albuns" jsonLd={breadcrumbLd("Álbuns de Fotos e Vídeos", "/albuns")} />
      <PageHero
        badge="📚 Álbuns"
        title={cfg?.albuns_page_title || "Nossos Álbuns"}
        subtitle={cfg?.albuns_page_subtitle || "Coleções de momentos especiais"}
        bgImage={cfg?.albuns_hero_image_url || undefined}
      />

      <section className="py-16" style={{ background: "#FFFFFF" }}>
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[4/3] bg-[#E5E5E5] rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : albums.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {albums.map((a) => (
                <AlbumCard
                  key={a.id}
                  album={a}
                  itemCount={a.item_count ?? 0}
                  videoCount={a.video_count ?? 0}
                  onClick={() => open(a)}
                  size="lg"
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Images className="w-16 h-16 text-primary mx-auto mb-4" />
              <p className="text-[#888] text-lg" style={{ fontFamily: "Inter" }}>
                Nenhum álbum publicado ainda.
              </p>
            </div>
          )}
        </div>
      </section>

      {current && (
        <AlbumModal
          title={current.title || "Álbum"}
          items={openItems}
          onClose={() => setOpenId(null)}
        />
      )}
    </PublicLayout>
  );
};

export default Albuns;
