import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: React.ReactNode;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Sem fade na primeira renderização — já está visível
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Delay reduzido de 220ms → 100ms para transição mais rápida
    setIsVisible(false);
    const timer = setTimeout(() => {
      setIsVisible(true);
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 100);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div
      style={{
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.2s ease',
        minHeight: '100vh',
      }}
    >
      {children}
    </div>
  );
};
