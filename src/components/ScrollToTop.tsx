// ScrollToTop — apenas para rotas admin e sem PageTransition
// As rotas públicas já têm scroll gerenciado pelo PageTransition
import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

export function ScrollToTop() {
  const { pathname } = useLocation();
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) { isFirst.current = false; return; }
    // Só rola para admin (páginas públicas têm PageTransition que gerencia isso)
    if (pathname.startsWith("/admin") || pathname === "/manutencao") {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
}
