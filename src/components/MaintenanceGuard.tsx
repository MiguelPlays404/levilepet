import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

// Cache de módulo — persiste durante a sessão do browser
let maintenanceChecked = false;
let maintenanceActive = false;

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

    // Já verificou nesta sessão — usar resultado em cache
    if (maintenanceChecked) {
      if (maintenanceActive) navigate("/manutencao", { replace: true });
      return;
    }

    // Evitar double-run em React StrictMode dev
    if (ranRef.current) return;
    ranRef.current = true;

    // Verificar silenciosamente — SEM loading, SEM return null, SEM bloqueio
    supabase
      .from("site_config")
      .select("maintenance_mode")
      .maybeSingle()
      .then(({ data }) => {
        maintenanceChecked = true;
        maintenanceActive = data?.maintenance_mode ?? false;
        if (maintenanceActive) {
          navigate("/manutencao", { replace: true });
        }
      }, () => {
        // Em caso de falha de rede, não bloqueia o usuário
        maintenanceChecked = true;
        maintenanceActive = false;
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // NUNCA bloqueia o render — renderiza os filhos imediatamente sempre
  return <>{children}</>;
}
