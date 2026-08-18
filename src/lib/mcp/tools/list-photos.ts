import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

function supabaseForUser(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "list_photos",
  title: "Listar fotos",
  description: "Lista fotos ativas publicadas no site. Permite filtrar por página (home, hotelzinho, fotos, transporte).",
  inputSchema: {
    page: z.string().optional().describe("Filtrar por página onde a foto aparece (ex.: 'home', 'hotelzinho')."),
    limit: z.number().int().min(1).max(100).optional(),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ page, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Não autenticado" }], isError: true };
    }
    const sb = supabaseForUser(ctx);
    let q = sb.from("photos").select("id,title,url,pages,is_active,created_at").eq("is_active", true);
    if (page) q = q.contains("pages", [page]);
    const { data, error } = await q.order("created_at", { ascending: false }).limit(limit ?? 30);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { photos: data ?? [] },
    };
  },
});
