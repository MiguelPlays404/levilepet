import React from 'react';

interface PageTransitionProps {
  children: React.ReactNode;
}

// PageTransition simplificado — sem opacity animation que causava flash branco.
// A animação de entrada agora é feita via CSS (fade-in da própria página),
// não via estado React que pode causar tela branca durante transições.
export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  return (
    <div style={{ minHeight: '100vh' }}>
      {children}
    </div>
  );
};
