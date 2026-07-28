/**
 * PageTransition — transição entre rotas
 *
 * Otimizações desta versão:
 * - Web Animations API em vez do truque `style.animation = 'none'` +
 *   `void el.offsetHeight`. Aquele reflow forçado acontecia exatamente no
 *   frame da navegação (o momento mais caro), somando um layout síncrono a
 *   um commit já pesado. `el.animate()` reinicia sem tocar no layout.
 * - `finished` do próprio animation em vez de `setTimeout` de 450ms — nada
 *   de timer dessincronizado do compositor.
 * - Só opacity + transform (sem `filter: blur`, que forçava repaint em GPU
 *   da árvore inteira e criava containing block quebrando `position: fixed`).
 * - Sem animação alguma quando o usuário pede redução de movimento.
 */
import React, { useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: React.ReactNode;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const location = useLocation();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const prevPathRef = useRef(location.pathname);
  const isFirstRef = useRef(true);
  const animRef = useRef<Animation | null>(null);

  useEffect(() => {
    // Primeira montagem: sem animação
    if (isFirstRef.current) {
      isFirstRef.current = false;
      return;
    }

    // Mesma rota (hash, query param): sem animação
    if (prevPathRef.current === location.pathname) return;
    const prevPath = prevPathRef.current;
    prevPathRef.current = location.pathname;

    // Admin: a transição é controlada por AdminShell (fade só no conteúdo).
    if (location.pathname.startsWith('/admin') && prevPath.startsWith('/admin')) return;

    const el = wrapperRef.current;
    if (!el || typeof el.animate !== 'function') return;

    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    // Cancela animação anterior (navegação ultra-rápida)
    animRef.current?.cancel();

    // Bloqueia cliques durante a transição → evita race conditions
    el.style.pointerEvents = 'none';

    const anim = el.animate(
      [
        { opacity: 0, transform: 'translate3d(0, 10px, 0)' },
        { opacity: 1, transform: 'translate3d(0, 0, 0)' },
      ],
      { duration: 360, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'both' }
    );
    animRef.current = anim;

    const release = () => {
      if (animRef.current !== anim) return;
      anim.cancel(); // remove o fill → o elemento volta a não ter estilo inline
      animRef.current = null;
      if (wrapperRef.current) wrapperRef.current.style.pointerEvents = '';
    };

    anim.finished.then(release).catch(() => {
      /* cancelada por nova navegação — o próximo ciclo assume */
    });

    return () => {
      animRef.current?.cancel();
      animRef.current = null;
      if (wrapperRef.current) wrapperRef.current.style.pointerEvents = '';
    };
  }, [location.pathname]);

  return <div ref={wrapperRef}>{children}</div>;
};
