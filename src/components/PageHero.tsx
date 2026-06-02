import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface PageHeroProps {
  badge: string;
  title: string;
  subtitle?: string;
  bgImage?: string;
  tall?: boolean;
}

export function PageHero({ badge, title, subtitle, bgImage, tall }: PageHeroProps) {
  const isVideo = useMemo(() => !!bgImage && /\.(mp4|webm|mov|m4v)(\?|$)/i.test(bgImage), [bgImage]);

  return (
    <section className={cn("relative isolate overflow-hidden", tall ? "min-h-[500px]" : "min-h-[420px]")}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(245,192,0,0.22),transparent_24%),radial-gradient(circle_at_80%_15%,rgba(255,255,255,0.08),transparent_22%),linear-gradient(180deg,rgba(8,9,14,0.76),rgba(8,9,14,0.94))]" />
      {bgImage ? (
        <>
          {isVideo ? (
            <video
              src={bgImage}
              className="absolute inset-0 h-full w-full object-cover opacity-35"
              autoPlay
              muted
              loop
              playsInline
            />
          ) : (
            <img
              src={bgImage}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-35"
              loading="eager"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder.svg";
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/35 via-slate-950/65 to-slate-950/95" />
        </>
      ) : null}

      <div className="container-safe relative z-10 flex min-h-[inherit] items-center py-20 lg:py-24">
        <div className="max-w-4xl">
          <div className="hero-kicker mb-5 w-fit" data-animate="fade-in">
            <span className="text-[10px] text-primary">●</span>
            {badge}
          </div>
          <h1 className="max-w-4xl text-4xl font-black tracking-[-0.055em] text-white md:text-6xl lg:text-7xl" data-animate="fade-in-up">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 md:text-lg" data-animate="fade-in-up">
              {subtitle}
            </p>
          ) : null}
          <div className="mt-8 flex flex-wrap gap-3" data-animate="fade-in-up">
            <a href="#conteudo" className="btn-dark">
              Ver conteúdo
              <ChevronRight className="h-4 w-4" />
            </a>
            <a href="#contato" className="btn-ghost-dark">
              Falar com a equipe
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
