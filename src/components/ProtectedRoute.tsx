import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const verify = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        if (!cancelled) navigate("/admin/login", { replace: true });
        return;
      }
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (cancelled) return;
      if (data) {
        setAuthorized(true);
      } else {
        await supabase.auth.signOut();
        navigate("/admin/login", { replace: true });
      }
      setChecking(false);
    };

    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      if (!session) {
        setAuthorized(false);
        navigate("/admin/login", { replace: true });
      }
    });

    verify();
    return () => { cancelled = true; sub.subscription.unsubscribe(); };
  }, [navigate]);

  if (checking) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0A0A0A]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full" style={{ animation: 'spinSmooth 1s linear infinite' }} />
      </div>
    );
  }

  return authorized ? <>{children}</> : null;
}
