import { RefObject, useEffect } from "react";

interface SwipeHandlers {
  onLeft?: () => void;
  onRight?: () => void;
}

/**
 * Swipe horizontal com o dedo (ou arrasto de mouse) sobre um elemento.
 * Ignora gestos majoritariamente verticais para não atrapalhar a rolagem.
 */
export function useSwipe(ref: RefObject<HTMLElement>, handlers: SwipeHandlers, deps: unknown[] = []) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let startX = 0;
    let startY = 0;
    let tracking = false;

    const onStart = (e: TouchEvent) => {
      const t = e.touches[0];
      startX = t.clientX;
      startY = t.clientY;
      tracking = true;
    };

    const onEnd = (e: TouchEvent) => {
      if (!tracking) return;
      tracking = false;
      const t = e.changedTouches[0];
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
      if (dx < 0) handlers.onLeft?.();
      else handlers.onRight?.();
    };

    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchend", onEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
