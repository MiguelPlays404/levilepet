import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

type SupabaseAuthOAuth = {
  getAuthorizationDetails: (id: string) => Promise<{ data: any; error: any }>;
  approveAuthorization: (id: string) => Promise<{ data: any; error: any }>;
  denyAuthorization: (id: string) => Promise<{ data: any; error: any }>;
};

function authOAuth(): SupabaseAuthOAuth {
  return (supabase.auth as unknown as { oauth: SupabaseAuthOAuth }).oauth;
}

export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) {
        setError("Solicitação de autorização inválida (authorization_id ausente).");
        return;
      }
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const next = window.location.pathname + window.location.search;
        window.location.href = "/admin/login?next=" + encodeURIComponent(next);
        return;
      }
      try {
        const { data, error } = await authOAuth().getAuthorizationDetails(authorizationId);
        if (!active) return;
        if (error) {
          setError(error.message);
          return;
        }
        const immediate = data?.redirect_url ?? data?.redirect_to;
        if (immediate && !data?.client) {
          window.location.href = immediate;
          return;
        }
        setDetails(data);
      } catch (e: any) {
        setError(e?.message ?? "Falha ao carregar autorização.");
      }
    })();
    return () => {
      active = false;
    };
  }, [authorizationId]);

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    try {
      const { data, error } = approve
        ? await authOAuth().approveAuthorization(authorizationId)
        : await authOAuth().denyAuthorization(authorizationId);
      if (error) {
        setBusy(false);
        setError(error.message);
        return;
      }
      const target = data?.redirect_url ?? data?.redirect_to;
      if (!target) {
        setBusy(false);
        setError("O servidor de autorização não retornou uma URL de redirecionamento.");
        return;
      }
      window.location.href = target;
    } catch (e: any) {
      setBusy(false);
      setError(e?.message ?? "Falha ao processar a decisão.");
    }
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#0A0A0A] px-4">
        <div className="max-w-md w-full bg-[#18181B] border border-white/10 rounded-2xl p-6 text-white">
          <h1 className="font-heading text-lg mb-2">Não foi possível carregar esta autorização</h1>
          <p className="text-sm text-[#A1A1AA]">{error}</p>
        </div>
      </main>
    );
  }

  if (!details) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </main>
    );
  }

  const clientName = details.client?.name ?? details.client?.client_name ?? "um aplicativo";
  const redirectUri = details.client?.redirect_uris?.[0] ?? details.redirect_uri ?? "";
  const scopes: string[] = Array.isArray(details.scopes)
    ? details.scopes
    : typeof details.scope === "string"
      ? details.scope.split(" ").filter(Boolean)
      : [];

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0A0A0A] px-4 py-10">
      <div className="max-w-md w-full bg-[#18181B] border border-white/10 rounded-2xl p-6 text-white space-y-5">
        <div>
          <p className="text-xs uppercase tracking-widest text-primary mb-2">Autorização</p>
          <h1 className="font-heading text-xl">Conectar {clientName} à sua conta</h1>
          <p className="text-sm text-[#A1A1AA] mt-2">
            Isso permite que <span className="text-white">{clientName}</span> use as ferramentas do Le Ville Pet como você.
          </p>
        </div>

        {scopes.length > 0 && (
          <div className="bg-[#0F0F11] border border-white/10 rounded-xl p-3">
            <p className="text-[11px] uppercase tracking-wider text-[#71717A] mb-2">Permissões solicitadas</p>
            <ul className="text-sm space-y-1">
              {scopes.map((s) => (
                <li key={s} className="text-[#E4E4E7]">• {s}</li>
              ))}
            </ul>
          </div>
        )}

        {redirectUri && (
          <p className="text-[11px] text-[#71717A] break-all">
            Redirecionamento após autorizar: <span className="text-[#A1A1AA]">{redirectUri}</span>
          </p>
        )}

        <p className="text-[11px] text-[#71717A]">
          As permissões do app e as políticas de acesso do banco continuam valendo — este consentimento não as ignora.
        </p>

        <div className="flex gap-3 pt-1">
          <button
            disabled={busy}
            onClick={() => decide(true)}
            className="flex-1 py-2.5 rounded-lg bg-primary text-black font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {busy ? "Processando..." : "Autorizar"}
          </button>
          <button
            disabled={busy}
            onClick={() => decide(false)}
            className="flex-1 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm hover:bg-white/10 disabled:opacity-50 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </main>
  );
}
