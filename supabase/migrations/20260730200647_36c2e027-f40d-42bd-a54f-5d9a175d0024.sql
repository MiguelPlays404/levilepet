CREATE TABLE public.auth_attempts (
  id uuid primary key default gen_random_uuid(),
  ident text not null,
  ip text,
  email text,
  kind text not null default 'login',
  success boolean not null default false,
  created_at timestamptz not null default now()
);
CREATE INDEX auth_attempts_ident_idx ON public.auth_attempts (ident, created_at DESC);
GRANT SELECT ON public.auth_attempts TO authenticated;
GRANT ALL ON public.auth_attempts TO service_role;
ALTER TABLE public.auth_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_attempts_admin_read" ON public.auth_attempts FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.auth_lockouts (
  ident text primary key,
  fail_count integer not null default 0,
  stage integer not null default 0,
  locked_until timestamptz,
  updated_at timestamptz not null default now()
);
GRANT SELECT ON public.auth_lockouts TO authenticated;
GRANT ALL ON public.auth_lockouts TO service_role;
ALTER TABLE public.auth_lockouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_lockouts_admin_read" ON public.auth_lockouts FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  actor_email text,
  action text not null,
  entity text,
  entity_id text,
  details jsonb not null default '{}'::jsonb,
  ip text,
  user_agent text,
  created_at timestamptz not null default now()
);
CREATE INDEX audit_log_created_idx ON public.audit_log (created_at DESC);
CREATE INDEX audit_log_action_idx ON public.audit_log (action);
GRANT SELECT, INSERT ON public.audit_log TO authenticated;
GRANT ALL ON public.audit_log TO service_role;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_log_admin_read" ON public.audit_log FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "audit_log_admin_insert" ON public.audit_log FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin') AND actor_id = auth.uid());