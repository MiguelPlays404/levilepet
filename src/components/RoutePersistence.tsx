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

export function useRoutePersistence() {
  const location = useLocation();

  useEffect(() => {
    if (PUBLIC_PATHS.includes(location.pathname)) {
      localStorage.setItem(LAST_PATH_KEY, location.pathname);
    }
  }, [location.pathname]);
}

export function RoutePersistence({ children }: { children: React.ReactNode }) {
  useRoutePersistence();
  return <>{children}</>;
}
