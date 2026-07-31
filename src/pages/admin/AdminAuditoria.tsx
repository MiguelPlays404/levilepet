import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { ShieldAlert, ShieldCheck, RefreshCw, Search } from "lucide-react";

type AuditRow = {
  id: string;
  actor_email: string | null;
  action: string;
  entity: string | null;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  ip: string | null;
  user_agent: string | null;
  created_at: string;
};

type AttemptRow = {
  id: string;
  ip: string | null;
  email: string | null;
  kind: string;
  success: boolean;
  created_at: string;
};

const LABELS: Record<string, string> = {
  login_success: "Login bem-sucedido",
  login_failure: "Falha de login",
  login_denied_no_role: "Login negado (sem permissão)",
  code_success: "Código de acesso correto",
  code_failure: "Código de acesso incorreto",
  upload: "Upload de mídia",
  create: "Criação",
  update: "Alteração",
  delete: "Exclusão",
};

const fmt = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "medium" });

export default function AdminAuditoria() {
  const [tab, setTab] = useState<"audit" | "attempts">("audit");
  const [audit, setAudit] = useState<AuditRow[]>([]);
  const [attempts, setAttempts] = useState<AttemptRow[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [a, b] = await Promise.all([
      supabase.from("audit_log").select("*").order("created_at", { ascending: false }).limit(1000),
      supabase.from("auth_attempts").select("*").order("created_at", { ascending: false }).limit(500),
    ]);
    setAudit((a.data as unknown as AuditRow[]) ?? []);
    setAttempts((b.data as unknown as AttemptRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filteredAudit = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return audit;
    return audit.filter((r) =>
      [r.actor_email, r.action, r.entity, r.entity_id, r.ip, JSON.stringify(r.details)]
        .join(" ").toLowerCase().includes(term)
    );
  }, [audit, q]);

  const filteredAttempts = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return attempts;
    return attempts.filter((r) => [r.email, r.ip, r.kind].join(" ").toLowerCase().includes(term));
  }, [attempts, q]);

  const failures24h = attempts.filter(
    (a) => !a.success && Date.now() - new Date(a.created_at).getTime() < 86_400_000
  ).length;
  const firstRecord = audit.length ? audit[audit.length - 1].created_at : null;

  return (
    <AdminLayout title="Auditoria e Segurança">
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-[#18181B] border border-white/[0.07] rounded-2xl p-4">
            <p className="text-[11px] uppercase tracking-wider text-[#A1A1AA]">Registros de auditoria</p>
            <p className="text-2xl font-heading text-white mt-1">{audit.length}</p>
            {firstRecord && <p className="text-[11px] text-[#71717A] mt-1">desde {fmt(firstRecord)}</p>}
          </div>
          <div className="bg-[#18181B] border border-white/[0.07] rounded-2xl p-4">
            <p className="text-[11px] uppercase tracking-wider text-[#A1A1AA]">Tentativas registradas</p>
            <p className="text-2xl font-heading text-white mt-1">{attempts.length}</p>
          </div>
          <div className="bg-[#18181B] border border-white/[0.07] rounded-2xl p-4">
            <p className="text-[11px] uppercase tracking-wider text-[#A1A1AA]">Falhas nas últimas 24h</p>
            <p className={`text-2xl font-heading mt-1 ${failures24h > 0 ? "text-red-400" : "text-white"}`}>{failures24h}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setTab("audit")}
            className={`px-3 py-2 rounded-lg text-sm ${tab === "audit" ? "bg-primary text-black font-semibold" : "bg-[#27272A] text-[#A1A1AA]"}`}
          >
            Alterações e uploads
          </button>
          <button
            onClick={() => setTab("attempts")}
            className={`px-3 py-2 rounded-lg text-sm ${tab === "attempts" ? "bg-primary text-black font-semibold" : "bg-[#27272A] text-[#A1A1AA]"}`}
          >
            Tentativas de acesso
          </button>
          <div className="relative ml-auto">
            <Search className="w-4 h-4 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar e-mail, IP, ação..."
              className="bg-[#27272A] border border-[#3F3F46] rounded-lg pl-9 pr-3 py-2 text-sm text-white w-64 focus:outline-none focus:border-primary/60"
            />
          </div>
          <button onClick={load} aria-label="Atualizar registros" className="p-2 rounded-lg bg-[#27272A] text-[#A1A1AA] hover:text-white">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        <div className="bg-[#18181B] border border-white/[0.07] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            {tab === "audit" ? (
              <table className="w-full text-sm">
                <thead className="text-[11px] uppercase tracking-wider text-[#71717A] bg-white/[0.03]">
                  <tr>
                    <th className="text-left px-4 py-3">Quando</th>
                    <th className="text-left px-4 py-3">Quem</th>
                    <th className="text-left px-4 py-3">Ação</th>
                    <th className="text-left px-4 py-3">Item</th>
                    <th className="text-left px-4 py-3">Origem</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAudit.map((r) => (
                    <tr key={r.id} className="border-t border-white/[0.05]">
                      <td className="px-4 py-2.5 text-[#A1A1AA] whitespace-nowrap">{fmt(r.created_at)}</td>
                      <td className="px-4 py-2.5 text-white">{r.actor_email ?? "—"}</td>
                      <td className="px-4 py-2.5 text-white">{LABELS[r.action] ?? r.action}</td>
                      <td className="px-4 py-2.5 text-[#A1A1AA]">
                        {r.entity ?? "—"}{r.entity_id ? ` · ${r.entity_id.slice(0, 8)}` : ""}
                      </td>
                      <td className="px-4 py-2.5 text-[#71717A]">{r.ip ?? "—"}</td>
                    </tr>
                  ))}
                  {!filteredAudit.length && (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-[#71717A]">Nenhum registro encontrado.</td></tr>
                  )}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-[11px] uppercase tracking-wider text-[#71717A] bg-white/[0.03]">
                  <tr>
                    <th className="text-left px-4 py-3">Quando</th>
                    <th className="text-left px-4 py-3">Resultado</th>
                    <th className="text-left px-4 py-3">Tipo</th>
                    <th className="text-left px-4 py-3">E-mail</th>
                    <th className="text-left px-4 py-3">IP</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttempts.map((r) => (
                    <tr key={r.id} className="border-t border-white/[0.05]">
                      <td className="px-4 py-2.5 text-[#A1A1AA] whitespace-nowrap">{fmt(r.created_at)}</td>
                      <td className="px-4 py-2.5">
                        {r.success ? (
                          <span className="inline-flex items-center gap-1.5 text-emerald-400"><ShieldCheck className="w-4 h-4" /> Sucesso</span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-red-400"><ShieldAlert className="w-4 h-4" /> Falha</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-[#A1A1AA]">{r.kind}</td>
                      <td className="px-4 py-2.5 text-white">{r.email ?? "—"}</td>
                      <td className="px-4 py-2.5 text-[#71717A]">{r.ip ?? "—"}</td>
                    </tr>
                  ))}
                  {!filteredAttempts.length && (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-[#71717A]">Nenhuma tentativa registrada.</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
