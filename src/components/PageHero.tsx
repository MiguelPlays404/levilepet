import { useScrollAnimation } from "@/hooks/useScrollAnimation";

interface PageHeroProps {
  badge: string;
  title: string;
  subtitle?: string;
  bgImage?: string;
  tall?: boolean;
}

export function PageHero({ badge, title, subtitle, bgImage, tall }: PageHeroProps) {
  useScrollAnimation();
  const isVideo = !!bgImage && /\.(mp4|webm|mov|m4v)(\?|$)/i.test(bgImage);

  return (
    <section
      className={`relative flex items-center justify-center text-center overflow-hidden ${
        tall ? "min-h-[400px] lg:min-h-[420px]" : "min-h-[260px] lg:min-h-[320px]"
      }`}
      style={{
        background: bgImage
          ? undefined
          : 'radial-gradient(ellipse at 50% 120%, rgba(245,192,0,0.07) 0%, #000000 55%)',
      }}
    >
      {bgImage && (
        <>
          {isVideo ? (
            <video src={bgImage} className="absolute inset-0 w-full h-full object-cover" autoPlay muted loop playsInline />
          ) : (
            <img src={bgImage} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }} />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/65 to-black/45" />
        </>
      )}

      {/* Decorative left line */}
      <div
        className="absolute hidden lg:block"
        style={{
          left: '5%', top: '20%', bottom: '20%', width: '1px',
          background: 'linear-gradient(to bottom, transparent, rgba(245,192,0,0.25), transparent)',
        }}
      />
      {/* Decorative right line */}
      <div
        className="absolute hidden lg:block"
        style={{
          right: '5%', top: '20%', bottom: '20%', width: '1px',
          background: 'linear-gradient(to bottom, transparent, rgba(245,192,0,0.25), transparent)',
        }}
      />

      <div className="relative z-10 container mx-auto px-4 py-20 lg:py-24">
        <div
          data-animate="fade-up"
          className="inline-flex items-center gap-2 rounded-full px-5 py-2 mb-6"
          style={{ background: 'rgba(245,192,0,0.12)', border: '1px solid rgba(245,192,0,0.4)' }}
        >
          <span className="font-heading font-semibold text-xs text-primary tracking-[0.08em] uppercase">
            {badge}
          </span>
        </div>

        <h1
          data-animate="fade-up"
          data-delay="1"
          className="font-heading font-extrabold text-white mb-4"
          style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '-0.03em', lineHeight: 1.1 }}
        >
          {title}
        </h1>

        {subtitle && (
          <p
            data-animate="fade-up"
            data-delay="2"
            className="text-[#AAAAAA] max-w-[500px] mx-auto"
            style={{ fontFamily: 'Inter', fontSize: '1.1rem' }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
