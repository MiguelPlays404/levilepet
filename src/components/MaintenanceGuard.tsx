import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getSiteConfig } from "@/lib/dataCache";

/**
 * MaintenanceGuard
 * Antes fazia uma query separada a `site_config.maintenance_mode` em CADA visita
 * de usuário (464 chamadas no pg_stat_statements). Agora reutiliza o cache global
 * `getSiteConfig()` — que já é buscado uma única vez e persistido em localStorage.
 * Resultado: 0 queries extras, mesmo comportamento.
 */
export function MaintenanceGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const ranRef = useRef(false);

  useEffect(() => {
    // Nunca verificar em rotas admin ou na própria página de manutenção
    if (
      location.pathname === "/manutencao" ||
      location.pathname.startsWith("/admin")
    ) {
      return;
    }

    // Bypass de sessão (usuário inseriu código secreto)
    if (sessionStorage.getItem("maintenance_bypass") === "true") {
      return;
    }

    if (ranRef.current) return;
    ranRef.current = true;

    // Reaproveita o cache compartilhado — não dispara request novo se já houve.
    getSiteConfig()
      .then((data) => {
        if (data?.maintenance_mode) {
          navigate("/manutencao", { replace: true });
        }
      })
      .catch(() => { /* offline → não bloqueia */ });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return <>{children}</>;
}
