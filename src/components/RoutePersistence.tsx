import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const LAST_PATH_KEY = "levillepet_last_path";

export function RoutePersistence({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isReady, setIsReady] = useState(false);

  // 1. On mount, check if we should restore a path
  useEffect(() => {
    const lastPath = localStorage.getItem(LAST_PATH_KEY);
    
    // Only redirect if we're at root and there's a stored path that isn't root
    if (location.pathname === "/" && lastPath && lastPath !== "/") {
      // Avoid redirecting to admin or maintenance from root automatically 
      // unless specifically intended, but here we'll allow standard pages
      if (!lastPath.startsWith("/admin") && lastPath !== "/manutencao") {
        navigate(lastPath, { replace: true });
      }
    }
    setIsReady(true);
  }, []);

  // 2. Track path changes and save to localStorage
  useEffect(() => {
    // Only save public user-facing paths (exclude maintenance and error pages if possible)
    const publicPaths = [
      "/",
      "/hotelzinho",
      "/transporte",
      "/venha-nos-conhecer",
      "/localizacao",
      "/fotos",
      "/videos",
      "/siga-nos",
      "/fale-conosco"
    ];

    if (publicPaths.includes(location.pathname)) {
      localStorage.setItem(LAST_PATH_KEY, location.pathname);
    }
  }, [location.pathname]);

  if (!isReady) return null;

  return <>{children}</>;
}
