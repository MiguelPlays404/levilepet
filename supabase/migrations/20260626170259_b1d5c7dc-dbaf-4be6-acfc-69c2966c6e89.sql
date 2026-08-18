CREATE OR REPLACE FUNCTION public.admin_list_tables()
RETURNS TABLE(table_name text)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  RETURN QUERY
  SELECT c.relname::text
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
    AND c.relkind = 'r'
    AND c.relname NOT LIKE 'pg_%';
END;
$$;

REVOKE ALL ON FUNCTION public.admin_list_tables() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_tables() TO authenticated, service_role;