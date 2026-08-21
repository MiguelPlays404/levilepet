import { supabase } from "@/integrations/supabase/client";

/**
 * O PostgREST limita cada resposta a 1000 linhas. Este helper pagina com
 * `.range()` até trazer TODOS os registros da tabela.
 */
export async function fetchAllRows(
  table: string,
  orderColumn: string,
  ascending = false,
  pageSize = 1000
): Promise<any[]> {
  const all: any[] = [];
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from(table as any)
      .select("*")
      .order(orderColumn, { ascending })
      .range(from, from + pageSize - 1);
    if (error) break;
    const rows = data || [];
    all.push(...rows);
    if (rows.length < pageSize) break;
  }
  return all;
}

/** Contagem real (sem baixar linhas). */
export async function countRows(
  table: string,
  filter?: (q: any) => any
): Promise<number> {
  let q = supabase.from(table as any).select("id", { count: "exact", head: true });
  if (filter) q = filter(q);
  const { count } = await q;
  return count || 0;
}
