import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Sobe o scroll para o topo a cada mudança de rota.
 * Necessário porque o React Router v6 com BrowserRouter
 * não reseta o scroll automaticamente.
 */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
