import { useEffect, useState } from "react";
import { PublicLayout } from "@/components/PublicLayout";
import { PageHero } from "@/components/PageHero";
import { SectionHeader, GlassCard, InfoPill } from "@/components/ModernBlocks";
import { getSiteConfig } from "@/lib/dataCache";
import { Instagram, MapPin, MessageCircle, Phone, Sparkles } from "lucide-react";

type Config = {
  faleconosco_title?: string;
  faleconosco_subtitle?: string;
  faleconosco_hero_image_url?: string;
  faleconosco_info_title?: string;
  faleconosco_card_title?: string;
  faleconosco_card_text?: string;
  faleconosco_visit_text?: string;
  faleconosco_btn_text?: string;
  instagram_url?: string;
  instagram_handle?: string;
  whatsapp_number?: string;
  whatsapp_message?: string;
  fixed_phone?: string;
  address_line1?: string;
  address_line2?: string;
  address_line3?: string;
  google_maps_url?: string;
  phone?: string;
};

export default function FaleConosco() {
  const [c, setC] = useState<Config | null>(null);

  useEffect(() => {
    getSiteConfig().then((data) => setC(data));
  }, []);

  const waNum = c?.whatsapp_number || "5514997145610";
  const waMsg = encodeURIComponent(c?.whatsapp_message || "Olá! Vim pelo site Le Ville Pet e quero falar com vocês.");
  const phone = c?.fixed_phone || c?.phone || "";
  const maps = c?.google_maps_url || "https://maps.app.goo.gl/nkuDnVyBe6ZHYNbS8";

  return (
    <PublicLayout>
      <PageHero
        badge="✦ contato"
        title={c?.faleconosco_title || "Fale com a equipe"}
        subtitle={c?.faleconosco_subtitle || "Atendimento claro, rápido e com o visual que acompanha a experiência do projeto."}
        bgImage={c?.faleconosco_hero_image_url || undefined}
      />

      <section id="conteudo" className="py-16 lg:py-20">
        <div className="container-safe grid gap-8 lg:grid-cols-[1.1fr_.9fr]">
          <div className="grid gap-6">
            <SectionHeader
              kicker="canais"
              title={c?.faleconosco_info_title || "Escolha o canal mais rápido"}
              subtitle="WhatsApp, telefone, Instagram e localização em blocos curtos e legíveis."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <GlassCard className="p-5">
                <InfoPill icon={<MessageCircle className="h-4 w-4" />} label="WhatsApp" />
                <div className="mt-4 text-lg font-bold text-white">Conversa direta</div>
                <p className="mt-2 text-sm leading-7 text-slate-300">Envie uma mensagem e receba atendimento com agilidade.</p>
                <a href={`https://wa.me/${waNum}?text=${waMsg}`} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex text-sm font-semibold text-primary">
                  Abrir WhatsApp
                </a>
              </GlassCard>

              <GlassCard className="p-5">
                <InfoPill icon={<Phone className="h-4 w-4" />} label="Telefone" />
                <div className="mt-4 text-lg font-bold text-white">Ligação rápida</div>
                <p className="mt-2 text-sm leading-7 text-slate-300">{phone || "Telefone não informado no momento."}</p>
                {phone ? (
                  <a href={`tel:${phone}`} className="mt-5 inline-flex text-sm font-semibold text-primary">
                    Ligar agora
                  </a>
                ) : null}
              </GlassCard>

              <GlassCard className="p-5">
                <InfoPill icon={<Instagram className="h-4 w-4" />} label="Instagram" />
                <div className="mt-4 text-lg font-bold text-white">Conteúdo e novidades</div>
                <p className="mt-2 text-sm leading-7 text-slate-300">{c?.instagram_handle || "@levillepetbauru"}</p>
                {c?.instagram_url ? (
                  <a href={c.instagram_url} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex text-sm font-semibold text-primary">
                    Abrir perfil
                  </a>
                ) : null}
              </GlassCard>

              <GlassCard className="p-5">
                <InfoPill icon={<MapPin className="h-4 w-4" />} label="Localização" />
                <div className="mt-4 text-lg font-bold text-white">Visita presencial</div>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  {c?.address_line1 || "Villaggio Mall Center"}<br />
                  {c?.address_line2 || "Av. Affonso José Aiello, 14-45 - Loja 19"}<br />
                  {c?.address_line3 || "Vila Aviação, Bauru-SP"}
                </p>
                <a href={maps} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex text-sm font-semibold text-primary">
                  Abrir mapa
                </a>
              </GlassCard>
            </div>
          </div>

          <GlassCard className="p-6 lg:p-8">
            <SectionHeader
              kicker="mensagem"
              title={c?.faleconosco_card_title || "Escreva uma mensagem curta"}
              subtitle={c?.faleconosco_card_text || "Use a frase pronta do botão para facilitar o primeiro contato."}
            />
            <div className="mt-8 grid gap-4 rounded-[24px] border border-white/8 bg-white/[0.04] p-5">
              <textarea className="input-glass min-h-[160px] resize-none" placeholder="Digite sua mensagem aqui..." defaultValue={c?.faleconosco_visit_text || ""} />
              <div className="flex flex-col gap-3 sm:flex-row">
                <a href={`https://wa.me/${waNum}?text=${waMsg}`} target="_blank" rel="noopener noreferrer" className="btn-dark">
                  {c?.faleconosco_btn_text || "Enviar pelo WhatsApp"}
                  <Sparkles className="h-4 w-4" />
                </a>
                <a href={maps} target="_blank" rel="noopener noreferrer" className="btn-ghost-dark">
                  Ver no mapa
                </a>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>
    </PublicLayout>
  );
}
