/**
 * NavigationProgress — barra de progresso no topo durante navegação
 * Corrigido: timers cancelados no cleanup, sem estado orphan.
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

    t(80,  () => setProgress(45));
    t(200, () => setProgress(72));
    t(320, () => setProgress(92));
    t(420, () => setProgress(100));
    t(620, () => { setVisible(false); setProgress(0); });

    return clearAllTimers;
  }, [location.pathname]);

  if (!visible && progress === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '3px',
        width: `${progress}%`,
        background: 'linear-gradient(90deg, #F5C000, #FFD700)',
        zIndex: 99999,
        transition: 'width 0.18s ease, opacity 0.25s ease',
        opacity: visible ? 1 : 0,
        boxShadow: '0 0 10px rgba(245,192,0,0.6)',
        borderRadius: '0 2px 2px 0',
        pointerEvents: 'none',
      }}
    />
  );
};
