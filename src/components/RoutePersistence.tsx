import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

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

export function RoutePersistence({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isReady, setIsReady] = useState(false);
  // Flag para detectar se o usuário navegou intencionalmente para "/"
  const intentionalHomeNav = useRef(false);

  // 1. Na montagem, restaurar última rota apenas uma vez
  useEffect(() => {
    const lastPath = localStorage.getItem(LAST_PATH_KEY);

    // Só redireciona se:
    // - está em "/"
    // - tem uma rota salva diferente de "/"
    // - NÃO foi uma navegação intencional para Home
    // - não é rota admin/manutenção
    if (
      location.pathname === "/" &&
      lastPath &&
      lastPath !== "/" &&
      !intentionalHomeNav.current &&
      !lastPath.startsWith("/admin") &&
      lastPath !== "/manutencao"
    ) {
      navigate(lastPath, { replace: true });
    }

    setIsReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Rastrear mudanças de rota e salvar no localStorage
  useEffect(() => {
    if (PUBLIC_PATHS.includes(location.pathname)) {
      localStorage.setItem(LAST_PATH_KEY, location.pathname);
    }

    // Se navegou para "/", limpar o "last path" para que próximos
    // acessos ao site comecem da home também
    if (location.pathname === "/") {
      intentionalHomeNav.current = false;
      localStorage.setItem(LAST_PATH_KEY, "/");
    }
  }, [location.pathname]);

  if (!isReady) return null;

  return <>{children}</>;
}

// Exporta helper para o Navbar sinalizar navegação intencional para Home
// Não é mais necessário com a nova lógica de salvar "/" no localStorage
