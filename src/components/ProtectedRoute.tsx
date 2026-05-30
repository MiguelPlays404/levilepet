import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkAdminSession } from "@/lib/adminSession";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (checkAdminSession()) {
      setAuthorized(true);
    } else {
      navigate("/", { replace: true });
    }
    setChecking(false);
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
