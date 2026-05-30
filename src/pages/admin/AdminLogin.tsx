import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Lock } from "lucide-react";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("laura78marinho@gmail.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
      if (data) navigate("/admin", { replace: true });
    });
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { data, error: signErr } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (signErr || !data.user) {
      setError("Credenciais inválidas");
      setLoading(false);
      return;
    }
    const { data: roleRow } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id).eq("role", "admin").maybeSingle();
    if (!roleRow) {
      await supabase.auth.signOut();
      setError("Esta conta não tem acesso administrativo");
      setLoading(false);
      return;
    }
    navigate("/admin", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] px-4">
      <form onSubmit={handleLogin} className="w-full max-w-sm bg-[#18181B] border border-white/[0.07] rounded-2xl p-8 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
            <Lock className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-heading text-lg text-white">Acesso Administrativo</h1>
            <p className="text-xs text-[#A1A1AA]">Le Ville Pet</p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-[11px] uppercase tracking-wider text-[#A1A1AA] mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              className="w-full bg-[#27272A] border border-[#3F3F46] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary/60"
            />
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-wider text-[#A1A1AA] mb-1 block">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="w-full bg-[#27272A] border border-[#3F3F46] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary/60"
            />
          </div>
        </div>

        {error && <p className="text-red-400 text-xs">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-primary text-black font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>

        <button
          type="button"
          onClick={() => navigate("/")}
          className="w-full text-xs text-[#71717A] hover:text-white transition-colors"
        >
          ← Voltar ao site
        </button>
      </form>
    </div>
  );
}
