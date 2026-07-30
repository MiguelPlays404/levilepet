import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { Lock } from "lucide-react";


/** Aceita apenas caminhos relativos same-origin (previne open redirect). */
function safeNext(raw: string | null): string {
  if (!raw) return "/admin";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/admin";
  return raw;
}

export default function AdminLogin() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const nextPath = safeNext(params.get("next"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lockedFor, setLockedFor] = useState(0);

  // Contagem regressiva do bloqueio progressivo (30s → 60s → 15min)
  useEffect(() => {
    if (lockedFor <= 0) return;
    const t = setInterval(() => setLockedFor((s) => (s <= 1 ? 0 : s - 1)), 1000);
    return () => clearInterval(t);
  }, [lockedFor]);


  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      // Se veio de um consent OAuth, deixa entrar mesmo sem role admin.
      const isOAuthConsent = nextPath.startsWith("/.lovable/oauth/consent");
      if (isOAuthConsent) {
        window.location.href = nextPath;
        return;
      }
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
      if (data) navigate(nextPath, { replace: true });
    });
  }, [navigate, nextPath]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Login validado NO SERVIDOR (edge function `admin-gate`), com rate limiting
    // progressivo e registro de auditoria. O cliente nunca decide se pode entrar.
    const { data, error: fnErr } = await supabase.functions.invoke("admin-gate", {
      body: { action: "login", email: email.trim(), password },
    });

    if (fnErr || !data?.ok || !data?.session) {
      let msg = "Credenciais inválidas";
      if (fnErr instanceof FunctionsHttpError) {
        try {
          const payload = await fnErr.context.json();
          msg = payload?.error || msg;
          if (payload?.locked) {
            setLockedFor(Number(payload.retryAfter) || 30);
            msg = "Muitas tentativas. Aguarde o tempo indicado.";
          } else if (typeof payload?.remaining === "number") {
            msg = `${payload.error} Restam ${payload.remaining} tentativa(s).`;
          }
        } catch { /* mantém mensagem padrão */ }
      }
      setError(msg);
      setLoading(false);
      return;
    }

    const { error: sessErr } = await supabase.auth.setSession({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    });
    if (sessErr) {
      setError("Não foi possível iniciar a sessão. Tente novamente.");
      setLoading(false);
      return;
    }

    if (nextPath.startsWith("/.lovable/oauth/consent")) {
      window.location.href = nextPath;
      return;
    }
    navigate(nextPath, { replace: true });
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
