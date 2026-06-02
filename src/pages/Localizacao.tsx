import { useEffect, useState } from "react";
import { PublicLayout } from "@/components/PublicLayout";
import { PageHero } from "@/components/PageHero";
import { SectionHeader, GlassCard } from "@/components/ModernBlocks";
import { getSiteConfig } from "@/lib/dataCache";
import { MapPin, Navigation } from "lucide-react";

const DEFAULT_EMBED = "https://maps.google.com/maps?q=Villaggio+Mall+Center+Bauru+SP&t=&z=15&ie=UTF8&iwloc=&output=embed";

export default function Localizacao() {
  const [c, setC] = useState<any>(null);

  useEffect(() => {
    getSiteConfig().then(setC);
  }, []);

  const mapsUrl = c?.google_maps_url || "https://maps.app.goo.gl/nkuDnVyBe6ZHYNbS8";
  const embedUrl = c?.google_maps_embed || DEFAULT_EMBED;
  const safeEmbed = embedUrl.includes("output=embed") || embedUrl.includes("/embed") ? embedUrl : DEFAULT_EMBED;

  return (
    <PublicLayout>
      <PageHero
        badge="📍 localização"
        title={c?.localizacao_title || "Nossa localização"}
        subtitle={c?.localizacao_subtitle || "Um endereço claro e bem apresentado, com mapa embutido e ação rápida."}
        bgImage={c?.localizacao_hero_image_url || undefined}
      />

      <section id="conteudo" className="py-16 lg:py-20">
        <div className="container-safe grid gap-8 lg:grid-cols-[.92fr_1.08fr]">
          <GlassCard className="p-6 lg:p-8">
            <SectionHeader
              kicker="endereço"
              title={c?.site_name || "Le Ville Pet"}
              subtitle={c?.address_full || "Villaggio Mall Center — Av. Affonso José Aiello, 14-45, Loja 19, Vila Aviação, Bauru-SP, 17018-520"}
            />
            <div className="mt-8 grid gap-3">
              <div className="rounded-3xl border border-white/8 bg-white/[0.04] p-4">
                <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Referência</div>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  {c?.address_line1 || "Villaggio Mall Center"}<br />
                  {c?.address_line2 || "Av. Affonso José Aiello, 14-45 - Loja 19"}<br />
                  {c?.address_line3 || "Vila Aviação, Bauru-SP"}
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-dark">
                  <MapPin className="h-4 w-4" />
                  Abrir no Maps
                </a>
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost-dark">
                  <Navigation className="h-4 w-4" />
                  Calcular rota
                </a>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="overflow-hidden">
            <iframe
              src={safeEmbed}
              width="100%"
              height="100%"
              title="Mapa do Le Ville Pet"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="min-h-[420px] border-0"
            />
          </GlassCard>
        </div>
      </section>
    </PublicLayout>
  );
}
