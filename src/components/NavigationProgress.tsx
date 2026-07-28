/**
 * NavigationProgress — barra de progresso no topo durante navegação
 *
 * Otimização: a barra animava `width`, que dispara layout + paint a cada
 * mudança (5 por navegação, na frente de toda a árvore da página).
 * Agora ela ocupa 100% da largura e é animada por `transform: scaleX()`,
 * resolvido só pelo compositor — custo praticamente zero.
 */
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

export const NavigationProgress = () => {
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timersRef = useRef<number[]>([]);
  const isFirstRef = useRef(true);

  const clearAllTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  useEffect(() => {
    // Primeira montagem: sem animação
    if (isFirstRef.current) { isFirstRef.current = false; return; }

    clearAllTimers();

    setVisible(true);
    setProgress(15);

    const t = (delay: number, fn: () => void) => {
      const id = window.setTimeout(fn, delay);
      timersRef.current.push(id);
    };

    t(70,  () => setProgress(48));
    t(170, () => setProgress(76));
    t(280, () => setProgress(94));
    t(360, () => setProgress(100));
    t(540, () => { setVisible(false); setProgress(0); });

    return clearAllTimers;
  }, [location.pathname]);

  if (!visible && progress === 0) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        transformOrigin: 'left center',
        transform: `scaleX(${progress / 100})`,
        background: 'linear-gradient(90deg, #F5C000, #FFD700)',
        zIndex: 99999,
        transition: 'transform 0.18s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.25s ease',
        opacity: visible ? 1 : 0,
        boxShadow: '0 0 10px rgba(245,192,0,0.6)',
        pointerEvents: 'none',
        willChange: 'transform',
      }}
    />
  );
};
