import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

let maintenanceChecked = false;
let maintenanceActive = false;

export function MaintenanceGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const ranRef = useRef(false);

  useEffect(() => {
    if (location.pathname === "/manutencao" || location.pathname.startsWith("/admin")) return;
    if (sessionStorage.getItem("maintenance_bypass") === "true") return;

    if (maintenanceChecked) {
      if (maintenanceActive) navigate("/manutencao", { replace: true });
      return;
    }

    if (ranRef.current) return;
    ranRef.current = true;

    supabase
      .from("site_config")
      .select("maintenance_mode")
      .maybeSingle()
      .then(({ data }) => {
        maintenanceChecked = true;
        maintenanceActive = data?.maintenance_mode ?? false;
        if (maintenanceActive) navigate("/manutencao", { replace: true });
      })
      .catch(() => {
        maintenanceChecked = true;
        maintenanceActive = false;
      });
  }, [location.pathname, navigate]);

  return <>{children}</>;
}
