import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";

interface AdminAccessModalProps {
  open: boolean;
  onClose: () => void;
}

export function AdminAccessModal({ open, onClose }: AdminAccessModalProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code === "190103") {
      const session = {
        authenticated: true,
        timestamp: Date.now(),
      };
      sessionStorage.setItem("levillepet_admin_session", JSON.stringify(session));
      setCode("");
      setError("");
      onClose();
      navigate("/admin");
    } else {
      setError("Código incorreto. Tente novamente.");
      setCode("");
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-surface-dark/80 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-surface-dark border border-primary rounded-2xl p-10 max-w-[380px] w-full mx-4 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end mb-4">
          <button onClick={onClose} className="text-text-muted hover:text-text-on-dark transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="text-center mb-6">
          <img src="/images/logo-levillepet.png" alt="Le Ville Pet" className="h-14 w-14 object-contain mx-auto mb-4 rounded-lg" width={56} height={56} />
          <h3 className="font-heading font-bold text-text-on-dark text-xl">Acesso Restrito</h3>
          <p className="text-text-muted text-sm mt-1">Digite o código de acesso</p>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={code}
            onChange={(e) => { setCode(e.target.value); setError(""); }}
            placeholder="••••••"
            className="w-full bg-surface-dark-muted border border-text-muted/30 text-text-on-dark rounded-lg px-4 py-3 text-center text-lg focus:outline-none focus:border-primary transition-colors mb-2"
            autoFocus
          />
          {error && <p className="text-destructive text-xs text-center mb-2">{error}</p>}
          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground font-heading font-bold py-3 rounded-lg mt-3 hover:bg-primary-vibrant transition-colors"
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full text-text-muted text-xs mt-3 hover:text-text-on-dark-muted transition-colors"
          >
            Cancelar
          </button>
        </form>
      </div>
    </div>
  );
}
