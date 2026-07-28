import { useCallback, useEffect, useRef } from "react";

/**
 * Arrasto lateral fluido para carrosséis.
 *
 * - Mouse: clique + arrasta (com inércia ao soltar).
 * - Dedo: usa o scroll nativo do sistema (mais fluido que qualquer JS),
 *   apenas garantindo que o snap não trave o gesto.
 * - Suprime o clique acidental no card quando o gesto foi um arrasto.
 */
export function useDragScroll<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null);

  const attach = useCallback((node: T | null) => {
    ref.current = node;
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(pointer: coarse)").matches) return; // dedo = scroll nativo

    let down = false;
    let moved = false;
    let startX = 0;
    let startScroll = 0;
    let lastX = 0;
    let lastT = 0;
    let velocity = 0;
    let raf = 0;

    const stopInertia = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      stopInertia();
      down = true;
      moved = false;
      startX = lastX = e.clientX;
      startScroll = el.scrollLeft;
      lastT = performance.now();
      velocity = 0;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 4) {
        moved = true;
        el.classList.add("is-dragging");
        el.style.scrollSnapType = "none";
        el.setPointerCapture?.(e.pointerId);
      }
      if (!moved) return;
      e.preventDefault();
      el.scrollLeft = startScroll - dx;
      const now = performance.now();
      const dt = now - lastT;
      if (dt > 0) velocity = (e.clientX - lastX) / dt;
      lastX = e.clientX;
      lastT = now;
    };

    const inertia = () => {
      velocity *= 0.94;
      el.scrollLeft -= velocity * 16;
      if (Math.abs(velocity) > 0.02) raf = requestAnimationFrame(inertia);
      else {
        raf = 0;
        el.style.scrollSnapType = "";
      }
    };

    const onPointerUp = () => {
      if (!down) return;
      down = false;
      if (moved) {
        el.classList.remove("is-dragging");
        if (Math.abs(velocity) > 0.05) raf = requestAnimationFrame(inertia);
        else el.style.scrollSnapType = "";
        // Cancela o clique que viria logo após o arrasto
        const kill = (ev: Event) => {
          ev.stopPropagation();
          ev.preventDefault();
        };
        el.addEventListener("click", kill, { capture: true, once: true });
        setTimeout(() => el.removeEventListener("click", kill, true), 0);
      }
    };

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);

    return () => {
      stopInertia();
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };
  }, []);

  return attach;
}
