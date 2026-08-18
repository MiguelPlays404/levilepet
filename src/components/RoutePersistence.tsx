// RoutePersistence foi removido — era a causa do bug de "não volta ao início"
// e do flash de tela branca. O componente foi substituído por um hook simples
// que não bloqueia o render.

import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const LAST_PATH_KEY = "levillepet_last_path";

const PUBLIC_PATHS = [
  "/",
  "/hotelzinho",
  "/transporte",
  "/venha-nos-conhecer",
  "/localizacao",
  "/fotos",
  "/videos",
  "/siga-nos",
  "/fale-conosco",
];

import { useNavigate } from "react-router-dom";

// Hook que rastreia a rota atual e, na 1ª montagem em "/", reabre a última página
export function useRoutePersistence() {
  const location = useLocation();
  const navigate = useNavigate();

  // Restauração: roda UMA vez no boot. Se o usuário recarregou e caiu em "/",
  // mas a última página pública visitada foi outra, volta para lá.
  useEffect(() => {
    if (location.pathname !== "/") return;
    try {
      const last = localStorage.getItem(LAST_PATH_KEY);
      if (last && last !== "/" && PUBLIC_PATHS.includes(last)) {
        navigate(last, { replace: true });
      }
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tracking contínuo da rota atual
  useEffect(() => {
    if (PUBLIC_PATHS.includes(location.pathname)) {
      localStorage.setItem(LAST_PATH_KEY, location.pathname);
    }
  }, [location.pathname]);
}

// Componente wrapper que NÃO bloqueia o render — só rastreia
export function RoutePersistence({ children }: { children: React.ReactNode }) {
  useRoutePersistence();
  return <>{children}</>;
}
