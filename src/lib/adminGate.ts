import { supabase } from "@/integrations/supabase/client";
import { FunctionsHttpError } from "@supabase/supabase-js";

const BYPASS_KEY = "lvp_maint_bypass";
const BYPASS_TTL_MS = 30 * 60 * 1000; // 30 minutos

export type GateResult = {
  ok: boolean;
  error?: string;
  locked?: boolean;
  retryAfter?: number;
  remaining?: number;
};

/**
 * Valida o código de acesso NO SERVIDOR. O código não existe no bundle:
 * fica apenas como secret na edge function `admin-gate`, que também aplica
 * o bloqueio progressivo e registra a tentativa na auditoria.
 */
export async function verifyAccessCode(code: string): Promise<GateResult> {
  const { data, error } = await supabase.functions.invoke("admin-gate", {
    body: { action: "verify_code", code },
  });

  if (error) {
    if (error instanceof FunctionsHttpError) {
      try {
        const payload = await error.context.json();
        return {
          ok: false,
          error: payload?.error ?? "Código incorreto.",
          locked: !!payload?.locked,
          retryAfter: payload?.retryAfter,
          remaining: payload?.remaining,
        };
      } catch { /* ignora */ }
    }
    return { ok: false, error: "Não foi possível validar agora. Tente novamente." };
  }

  if (data?.ok) {
    grantMaintenanceBypass();
    return { ok: true };
  }
  return { ok: false, error: "Código incorreto." };
}

/** Concede o bypass de manutenção por tempo limitado (após validação no servidor). */
export function grantMaintenanceBypass() {
  sessionStorage.setItem(BYPASS_KEY, JSON.stringify({ exp: Date.now() + BYPASS_TTL_MS }));
}

/** O bypass só vale se foi concedido pelo servidor e ainda não expirou. */
export function hasMaintenanceBypass(): boolean {
  try {
    const raw = sessionStorage.getItem(BYPASS_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { exp?: number };
    if (!parsed?.exp || Date.now() > parsed.exp) {
      sessionStorage.removeItem(BYPASS_KEY);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}
