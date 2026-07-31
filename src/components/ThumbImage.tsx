import { useState } from "react";
import { ImageOff } from "lucide-react";
import { defaultVideoCover } from "@/lib/videoThumb";

interface Props {
  src: string;
  alt?: string;
  /** classe do wrapper (deve conter o aspect-ratio) */
  className?: string;
  imgClassName?: string;
  /** capa padrão a usar caso o src falhe */
  fallbackSrc?: string;
  loading?: "lazy" | "eager";
}

/**
 * Imagem com cadeia de fallback: src → capa padrão → placeholder visual.
 * Mantém sempre a área com o aspect-ratio correto, sem colapsar o layout.
 */
export function ThumbImage({ src, alt = "", className = "", imgClassName = "", fallbackSrc, loading = "lazy" }: Props) {
  const [stage, setStage] = useState<0 | 1 | 2>(0);
  const fallback = fallbackSrc || defaultVideoCover("16:9");
  const current = stage === 0 ? src || fallback : stage === 1 ? fallback : null;

  return (
    <div className={`relative overflow-hidden bg-[#E5E5E5] ${className}`}>
      {current ? (
        <img
          src={current}
          alt={alt}
          loading={loading}
          className={`w-full h-full object-cover ${imgClassName}`}
          onError={() => setStage((s) => (s < 2 ? ((s + 1) as 1 | 2) : s))}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#18181B] text-[#71717A]">
          <ImageOff className="w-6 h-6" />
          <span className="text-[11px] font-heading">Capa indisponível</span>
        </div>
      )}
    </div>
  );
}
