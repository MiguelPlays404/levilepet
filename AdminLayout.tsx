/**
 * ScrollToTop — global, para TODAS as rotas
 * 
 * Rola para o topo imediatamente ao mudar de rota.
 * Como o PageTransition começa com opacity:0 (primeiro frame da animation),
 * o usuário nunca vê o scroll acontecendo.
 */
import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

export function ScrollToTop() {
  const { pathname } = useLocation();
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) { isFirst.current = false; return; }
    // behavior: 'instant' garante que não há scroll animado conflitando com PageTransition
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}
