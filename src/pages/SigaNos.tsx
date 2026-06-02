import { useEffect, useState } from "react";
import { PublicLayout } from "@/components/PublicLayout";
import { PageHero } from "@/components/PageHero";
import { SectionHeader, GlassCard } from "@/components/ModernBlocks";
import { getSiteConfig } from "@/lib/dataCache";
import { Instagram, MessageCircle, Youtube, Facebook, Music2 } from "lucide-react";

export default function SigaNos() {
  const [c, setC] = useState<any>(null);

  useEffect(() => {
    getSiteConfig().then(setC);
  }, []);

  const links = [
    c?.instagram_active ? {
      name: "Instagram",
      handle: c?.instagram_handle || "@levillepetbauru",
      url: c?.instagram_url || "#",
      icon: Instagram,
      tone: "bg-[radial-gradient(circle_at_top_right,rgba(225,48,108,0.35),rgba(17,24,39,0.04))]",
    } : null,
    c?.whatsapp_active ? {
      name: "WhatsApp",
      handle: c?.whatsapp_number || "5514997145610",
      url: `https://wa.me/${c?.whatsapp_number || "5514997145610"}`,
      icon: MessageCircle,
      tone: "bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.25),rgba(17,24,39,0.04))]",
    } : null,
    c?.facebook_active ? {
      name: "Facebook",
      handle: "Facebook",
      url: c?.facebook_url || "#",
      icon: Facebook,
      tone: "bg-[radial-gradient(circle_at_top_right,rgba(24,119,242,0.25),rgba(17,24,39,0.04))]",
    } : null,
    c?.youtube_active ? {
      name: "YouTube",
      handle: "YouTube",
      url: c?.youtube_url || "#",
      icon: Youtube,
      tone: "bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.25),rgba(17,24,39,0.04))]",
    } : null,
    c?.tiktok_active ? {
      name: "TikTok",
      handle: c?.tiktok_handle || "TikTok",
      url: c?.tiktok_url || "#",
      icon: Music2,
      tone: "bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.14),rgba(17,24,39,0.04))]",
    } : null,
  ].filter(Boolean);

  return (
    <PublicLayout>
      <PageHero
        badge="📣 siga-nos"
        title="Presença social com cara de projeto pronto"
        subtitle={c?.siganos_footer_text || "Uma vitrine simples para os canais que já existem no ecossistema do projeto."}
        bgImage={c?.logo_url || undefined}
      />

      <section id="conteudo" className="py-16 lg:py-20">
        <div className="container-safe">
          <SectionHeader
            kicker="redes"
            title="Canais organizados em cards grandes"
            subtitle="Cada plataforma recebeu seu próprio bloco com espaço, nome e chamada de ação."
          />
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {links.map((item: any) => {
              const Icon = item.icon;
              return (
                <GlassCard key={item.name} className={`p-6 lg:p-8 ${item.tone}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs uppercase tracking-[0.24em] text-slate-500">{item.name}</div>
                      <h3 className="mt-3 text-2xl font-bold text-white">{item.handle}</h3>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="btn-dark mt-6 w-fit">
                    Abrir canal
                  </a>
                </GlassCard>
              );
            })}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
