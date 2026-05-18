import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export function MaintenanceGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkMaintenance = async () => {
      // 1. Skip check if already on maintenance or admin pages
      if (location.pathname === "/manutencao" || location.pathname.startsWith("/admin")) {
        setLoading(false);
        return;
      }

      // 2. Check if user has bypass (entered the secret code)
      const bypass = sessionStorage.getItem("maintenance_bypass") === "true";
      if (bypass) {
        setLoading(false);
        return;
      }

      // 3. Check database
      const { data } = await supabase
        .from("site_config")
        .select("maintenance_mode")
        .maybeSingle();

      if (data?.maintenance_mode) {
        navigate("/manutencao");
      }
      setLoading(false);
    };

    checkMaintenance();
  }, [location.pathname, navigate]);

  if (loading) return null;

  return <>{children}</>;
}
