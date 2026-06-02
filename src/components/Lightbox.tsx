import { useState, useCallback, useEffect, useRef } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface LightboxProps {
  images: { url: string; title?: string }[];
  initialIndex: number;
  onClose: () => void;
}

export function Lightbox({ images, initialIndex, onClose }: LightboxProps) {
  const [current, setCurrent] = useState(initialIndex);

  const prev = useCallback(() => setCurrent((c) => (c > 0 ? c - 1 : images.length - 1)), [images.length]);
  const next = useCallback(() => setCurrent((c) => (c < images.length - 1 ? c + 1 : 0)), [images.length]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, prev, next]);

  // Touch swipe
  const [touchStart, setTouchStart] = useState(0);
  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.touches[0].clientX);
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStart - e.changedTouches[0].clientX;
    if (diff > 50) next();
    if (diff < -50) prev();
  };

  return (
    <div
      className="fixed inset-0 z-[10000] bg-surface-dark/95 flex items-center justify-center"
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <button onClick={onClose} className="absolute top-4 right-4 text-text-on-dark z-10 hover:text-primary transition-colors">
        <X className="w-8 h-8" />
      </button>

      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-text-on-dark hover:text-primary transition-colors z-10"
          >
            <ChevronLeft className="w-10 h-10" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-on-dark hover:text-primary transition-colors z-10"
          >
            <ChevronRight className="w-10 h-10" />
          </button>
        </>
      )}

      <div className="flex flex-col items-center max-w-[90vw] max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
        {/* preload neighbors */}
        {images.length > 1 && (
          <>
            <link rel="preload" as="image" href={images[(current + 1) % images.length].url} />
            <link rel="preload" as="image" href={images[(current - 1 + images.length) % images.length].url} />
          </>
        )}
        <img
          key={images[current].url}
          src={images[current].url}
          alt={images[current].title || "Foto"}
          className="max-w-full max-h-[80vh] object-contain rounded-lg animate-[fadeIn_0.25s_ease]"
        />
        {images[current].title && (
          <p className="text-text-on-dark text-sm mt-3 font-body">{images[current].title}</p>
        )}
      </div>
    </div>
  );
}
