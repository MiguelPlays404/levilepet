import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: React.ReactNode;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const location = useLocation();
  const [opacity, setOpacity] = useState(1);
  const prevPath = useRef(location.pathname);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Primeira renderização — sem animação
    if (prevPath.current === location.pathname) return;
    prevPath.current = location.pathname;

    // Cancelar qualquer timer anterior
    if (timerRef.current) clearTimeout(timerRef.current);

    // 1. Fade out suave (150ms)
    setOpacity(0);

    // 2. Durante o fade-out, scroll para o topo (invisível para o usuário)
    timerRef.current = setTimeout(() => {
      window.scrollTo(0, 0);
      // 3. Fade in suave (200ms)
      setOpacity(1);
    }, 150);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [location.pathname]);

  return (
    <div
      style={{
        opacity,
        transition: opacity === 0
          ? 'opacity 0.15s ease-out'
          : 'opacity 0.2s ease-in',
        minHeight: '100vh',
        willChange: 'opacity',
      }}
    >
      {children}
    </div>
  );
};
