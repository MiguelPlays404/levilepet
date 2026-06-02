import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Hammer, ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Manutencao() {
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "admin">("idle");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.from("site_config").select("maintenance_mode").single().then(({ data }) => {
      if (data && !data.maintenance_mode) navigate("/");
    });
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setTimeout(() => {
      sessionStorage.setItem("maintenance_bypass", "true");
      setStatus("success");
      toast({ title: "Acesso liberado", description: "Redirecionando para a área administrativa." });
      navigate("/admin/login");
      setLoading(false);
    }, 350);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div className="fluid-orb fluid-orb--yellow left-[-6rem] top-[-6rem] h-72 w-72" />
      <div className="fluid-orb fluid-orb--white right-[-4rem] bottom-[-4rem] h-64 w-64" />
      <div className="soft-grid absolute inset-0 opacity-40" />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel-strong relative z-10 w-full max-w-lg rounded-[32px] p-8 md:p-12"
      >
        <div className="flex flex-col items-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-[28px] bg-primary/15 text-primary">
            <Hammer className="h-10 w-10" />
          </div>

          <h1 className="mt-6 text-4xl font-black tracking-[-0.05em] text-white">Voltaremos em breve</h1>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            Estamos executando melhorias no site para manter a experiência mais rápida, limpa e estável.
          </p>

          <AnimatePresence mode="wait">
            {status === "idle" ? (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                onSubmit={handleSubmit}
                className="mt-8 w-full space-y-4"
              >
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Digite seu nome"
                  className="input-glass"
                  required
                />
                <button type="submit" disabled={loading} className="btn-dark w-full">
                  {loading ? "Verificando..." : "Continuar"}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </motion.form>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-8 rounded-[28px] border border-white/10 bg-white/[0.05] p-6"
              >
                <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />
                <p className="mt-3 text-sm text-slate-200">Acesso validado. Indo para o login administrativo.</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8 flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-slate-500">
            <ShieldCheck className="h-4 w-4 text-primary" />
            modo manutenção
          </div>
        </div>
      </motion.div>
    </div>
  );
}
