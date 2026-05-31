/**
 * PageTransition — versão definitiva
 *
 * Arquitetura correta:
 * - UM ÚNICO wrapper em volta de <Routes> no App.tsx (não por rota)
 * - CSS animation (hardware-accelerated) em vez de JS setTimeout + opacity state
 * - pointer-events: none durante a transição → sem cliques "acumulados"
 * - Sem estado React → sem re-renders causados pelo próprio componente
 * - Sem risco de timer orphan (clearTimeout no cleanup do useEffect)
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
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    // Primeira montagem: sem animação
    if (isFirstRef.current) {
      isFirstRef.current = false;
      return;
    }

    // Mesma rota (hash change, query param, etc.): sem animação
    if (prevPathRef.current === location.pathname) return;
    prevPathRef.current = location.pathname;

    const el = wrapperRef.current;
    if (!el) return;

    // Cancela qualquer timer anterior (caso navegação ultra-rápida)
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // Bloqueia cliques durante a transição → evita race conditions
    el.style.pointerEvents = 'none';

    // Força reinício da animation CSS (reflow trick)
    el.style.animation = 'none';
    void el.offsetHeight; // flush reflow
    el.style.animation = 'pageEnter 0.32s cubic-bezier(0.4, 0, 0.2, 1) both';

    // Libera cliques ao fim da animação
    timerRef.current = window.setTimeout(() => {
      if (wrapperRef.current) {
        wrapperRef.current.style.animation = '';
        wrapperRef.current.style.pointerEvents = '';
      }
      timerRef.current = null;
    }, 350); // ~10ms de margem além dos 320ms da animation

    // Cleanup: cancela timer se o componente desmontar (admin redirect, etc.)
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (wrapperRef.current) {
        wrapperRef.current.style.pointerEvents = '';
        wrapperRef.current.style.animation = '';
      }
    };
  }, [location.pathname]);

  return (
    <div ref={wrapperRef}>
      {children}
    </div>
  );
};
