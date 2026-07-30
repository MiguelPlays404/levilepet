import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { verifyAccessCode } from "@/lib/adminGate";
import { Hammer, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";


export default function Manutencao() {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "admin">("idle");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Check if maintenance mode is actually on
    supabase.from("site_config").select("maintenance_mode").maybeSingle().then(({ data }) => {
      if (data && !data.maintenance_mode) {
        navigate("/");
      }
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setError("");
    setLoading(true);

    // Validação 100% no servidor (com bloqueio progressivo e auditoria).
    const res = await verifyAccessCode(code.trim());
    setLoading(false);
    setCode("");

    if (!res.ok) {
      setError(
        res.locked
          ? `Muitas tentativas. Aguarde ${res.retryAfter ?? 30}s.`
          : res.error || "Código incorreto."
      );
      return;
    }
    setStatus("admin");
    setTimeout(() => navigate("/admin/login"), 500);
  };


  return (
    <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center p-6 overflow-hidden relative">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-[#18181B] border border-white/[0.08] rounded-3xl p-8 md:p-12 shadow-2xl relative z-10"
      >
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-2">
            <Hammer className="w-10 h-10 text-primary" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-white tracking-tight">
              Voltaremos em breve
            </h1>
            <p className="text-[#A1A1AA] text-sm md:text-base leading-relaxed">
              Estamos realizando melhorias para oferecer a melhor experiência para você e seu pet.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {status === "idle" ? (
              <motion.form 
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onSubmit={handleSubmit}
                className="w-full space-y-4 pt-4"
              >
                <div className="relative group">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Digite seu nome..."
                    className="w-full bg-[#0A0A0B] border border-[#3F3F46] focus:border-primary/50 rounded-xl px-5 py-4 text-white text-sm outline-none transition-all placeholder:text-[#52525B] group-hover:border-[#52525B]"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-4 rounded-xl flex items-center justify-center gap-2 group transition-all"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  ) : (
                    <>
                      Enviar <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </motion.form>
            ) : status === "success" ? (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="pt-6 space-y-4 text-center"
              >
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="text-xl font-heading font-semibold text-white">
                  Obrigado, {name}!
                </h2>
                <p className="text-[#A1A1AA] text-sm leading-relaxed">
                  Avisaremos assim que retornarmos. Fique de olho em nossas redes sociais para novidades!
                </p>
                <button 
                  onClick={() => setStatus("idle")}
                  className="text-xs text-primary hover:underline pt-4"
                >
                  Voltar
                </button>
              </motion.div>
            ) : (
              <motion.div 
                key="admin"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="pt-6 space-y-4 text-center"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-xl font-heading font-semibold text-white">
                  Acesso Autorizado
                </h2>
                <p className="text-[#A1A1AA] text-sm">
                  Redirecionando você para o site...
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
      
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] text-[#3F3F46] font-heading uppercase tracking-widest">
        Le Ville Pet &copy; {new Date().getFullYear()}
      </div>
    </div>
  );
}
