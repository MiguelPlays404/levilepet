import { supabase } from "@/integrations/supabase/client";

export type AuditEntry = {
  action: string;
  entity?: string;
  entity_id?: string;
  details?: Record<string, unknown>;
};

/**
 * Registra uma ação administrativa na tabela `audit_log`.
 * Só administradores autenticados conseguem gravar (garantido por RLS).
 * Nunca lança erro — auditoria jamais deve quebrar o fluxo do painel.
 */
export async function logAudit(entry: AuditEntry): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("audit_log").insert({
      actor_id: user.id,
      actor_email: user.email ?? null,
      action: entry.action,
      entity: entry.entity ?? null,
      entity_id: entry.entity_id ?? null,
      details: (entry.details ?? {}) as never,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 300) : null,
    });
  } catch {
    /* silencioso */
  }
}
