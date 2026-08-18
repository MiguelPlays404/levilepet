import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

/**
 * admin-gate — portão único de acesso administrativo.
 *
 * - Rate limiting SERVER-SIDE com bloqueio progressivo:
 *     6 tentativas -> 30s -> (mais 5) 60s -> (mais 5) 15min -> reinicia o ciclo
 * - Valida o código de acesso (mantido apenas como secret no servidor)
 * - Registra TODA tentativa (sucesso e falha) com timestamp, IP e user-agent
 */

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const ACCESS_CODE = Deno.env.get("ADMIN_ACCESS_CODE") ?? "";

const MAX_ATTEMPTS = 6;
// estágio 0 -> 30s, 1 -> 60s, 2 -> 15min, depois repete o último
const PENALTIES_MS = [30_000, 60_000, 15 * 60_000];
const NEXT_WINDOW_ATTEMPTS = 5; // após o 1º bloqueio, cada 5 falhas dispara o próximo estágio

const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

function clientIp(req: Request) {
  const fwd = req.headers.get("x-forwarded-for") || "";
  return fwd.split(",")[0].trim() || req.headers.get("cf-connecting-ip") || "unknown";
}

async function audit(entry: Record<string, unknown>) {
  try {
    await admin.from("audit_log").insert(entry);
  } catch (_) { /* auditoria nunca deve quebrar o fluxo */ }
}

async function getLock(ident: string) {
  const { data } = await admin.from("auth_lockouts").select("*").eq("ident", ident).maybeSingle();
  return data as { ident: string; fail_count: number; stage: number; locked_until: string | null } | null;
}

async function registerFailure(ident: string) {
  const lock = await getLock(ident);
  const failCount = (lock?.fail_count ?? 0) + 1;
  let stage = lock?.stage ?? 0;
  let lockedUntil: string | null = lock?.locked_until ?? null;

  const threshold = stage === 0 ? MAX_ATTEMPTS : NEXT_WINDOW_ATTEMPTS;
  if (failCount >= threshold) {
    const penalty = PENALTIES_MS[Math.min(stage, PENALTIES_MS.length - 1)];
    lockedUntil = new Date(Date.now() + penalty).toISOString();
    stage = stage + 1 >= PENALTIES_MS.length ? 0 : stage + 1; // relógio reseta após o ciclo
    await admin.from("auth_lockouts").upsert({
      ident, fail_count: 0, stage, locked_until: lockedUntil, updated_at: new Date().toISOString(),
    });
    return { locked: true, retryAfter: Math.ceil(penalty / 1000), remaining: 0 };
  }

  await admin.from("auth_lockouts").upsert({
    ident, fail_count: failCount, stage, locked_until: lockedUntil, updated_at: new Date().toISOString(),
  });
  return { locked: false, retryAfter: 0, remaining: threshold - failCount };
}

async function clearFailures(ident: string) {
  await admin.from("auth_lockouts").upsert({
    ident, fail_count: 0, stage: 0, locked_until: null, updated_at: new Date().toISOString(),
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const ip = clientIp(req);
  const ua = req.headers.get("user-agent") ?? "";

  let body: { action?: string; email?: string; password?: string; code?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Corpo inválido" }, 400);
  }

  const action = String(body.action ?? "");
  if (!["login", "verify_code", "status"].includes(action)) {
    return json({ error: "Ação inválida" }, 400);
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase().slice(0, 200) : "";
  const ident = `${ip}|${action === "login" ? email : "code"}`;

  // 1) Bloqueio ativo?
  const lock = await getLock(ident);
  if (lock?.locked_until && new Date(lock.locked_until) > new Date()) {
    const retryAfter = Math.ceil((new Date(lock.locked_until).getTime() - Date.now()) / 1000);
    if (action === "status") return json({ locked: true, retryAfter });
    await admin.from("auth_attempts").insert({ ident, ip, email, kind: `${action}_blocked`, success: false });
    return json({ error: "Muitas tentativas. Aguarde para tentar novamente.", locked: true, retryAfter }, 429);
  }
  if (action === "status") return json({ locked: false, retryAfter: 0 });

  // 2) Verificação de código (bypass de manutenção / acesso restrito)
  if (action === "verify_code") {
    const code = typeof body.code === "string" ? body.code : "";
    const ok = ACCESS_CODE.length > 0 && code === ACCESS_CODE;
    await admin.from("auth_attempts").insert({ ident, ip, email: null, kind: "code", success: ok });
    await audit({ action: ok ? "code_success" : "code_failure", entity: "admin_gate", ip, user_agent: ua });
    if (!ok) {
      const res = await registerFailure(ident);
      return json({ error: "Código incorreto.", ...res }, res.locked ? 429 : 401);
    }
    await clearFailures(ident);
    return json({ ok: true });
  }

  // 3) Login com e-mail/senha validado no servidor
  const password = typeof body.password === "string" ? body.password : "";
  if (!email || password.length < 1) return json({ error: "Informe e-mail e senha." }, 400);

  const anon = createClient(SUPABASE_URL, ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await anon.auth.signInWithPassword({ email, password });

  if (error || !data.session || !data.user) {
    await admin.from("auth_attempts").insert({ ident, ip, email, kind: "login", success: false });
    await audit({ action: "login_failure", entity: "admin_gate", actor_email: email, ip, user_agent: ua });
    const res = await registerFailure(ident);
    return json({ error: "Credenciais inválidas.", ...res }, res.locked ? 429 : 401);
  }

  // Só permite sessão para contas com papel admin
  const { data: role } = await admin
    .from("user_roles").select("role").eq("user_id", data.user.id).eq("role", "admin").maybeSingle();

  if (!role) {
    await admin.from("auth_attempts").insert({ ident, ip, email, kind: "login_no_role", success: false });
    await audit({ action: "login_denied_no_role", entity: "admin_gate", actor_id: data.user.id, actor_email: email, ip, user_agent: ua });
    const res = await registerFailure(ident);
    return json({ error: "Esta conta não tem acesso administrativo.", ...res }, res.locked ? 429 : 403);
  }

  await clearFailures(ident);
  await admin.from("auth_attempts").insert({ ident, ip, email, kind: "login", success: true });
  await audit({ action: "login_success", entity: "admin_gate", actor_id: data.user.id, actor_email: email, ip, user_agent: ua });

  return json({
    ok: true,
    session: {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    },
  });
});
