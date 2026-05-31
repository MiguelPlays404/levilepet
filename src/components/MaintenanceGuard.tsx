import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

// Cache em memória para evitar query repetida a cada troca de página
let cachedMaintenanceMode: boolean | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 60_000; // 1 minuto

export function MaintenanceGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  // Começa como false para NÃO gerar tela branca inicial
  const [loading, setLoading] = useState(false);
  const checkedRef = useRef(false);

  useEffect(() => {
    // Skip em páginas admin e manutenção
    if (
      location.pathname === "/manutencao" ||
      location.pathname.startsWith("/admin")
    ) {
      return;
    }

    // Se já verificou nesta sessão e o cache ainda é válido, não faz nova query
    const now = Date.now();
    if (
      checkedRef.current &&
      cachedMaintenanceMode !== null &&
      now - cacheTimestamp < CACHE_TTL_MS
    ) {
      if (cachedMaintenanceMode) navigate("/manutencao");
      return;
    }

    // Verificar bypass de sessão
    const bypass = sessionStorage.getItem("maintenance_bypass") === "true";
    if (bypass) {
      checkedRef.current = true;
      return;
    }

    // Só mostra loading na primeira verificação real (não em cada troca de página)
    if (!checkedRef.current) {
      setLoading(true);
    }

    let cancelled = false;

    const checkMaintenance = async () => {
      try {
        const { data } = await supabase
          .from("site_config")
          .select("maintenance_mode")
          .maybeSingle();

        if (cancelled) return;

        cachedMaintenanceMode = data?.maintenance_mode ?? false;
        cacheTimestamp = Date.now();
        checkedRef.current = true;

        if (cachedMaintenanceMode) {
          navigate("/manutencao");
        }
      } catch {
        // Em caso de erro de rede, não bloqueia o usuário
        cachedMaintenanceMode = false;
        cacheTimestamp = Date.now();
        checkedRef.current = true;
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    checkMaintenance();
    return () => { cancelled = true; };
    // Intencionalmente sem location.pathname nas deps —
    // a verificação é feita apenas uma vez por sessão (com cache)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Só bloqueia na primeira carga, nunca em trocas de página
  if (loading) return null;

  return <>{children}</>;
}
