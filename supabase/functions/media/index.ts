// Proxy público de mídias: serve arquivos do bucket privado "levillepet-media"
// URL: /functions/v1/media/levillepet-media/<caminho/do/arquivo.ext>
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

const BUCKET = "levillepet-media";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, range",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
};

const admin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

function contentTypeFor(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp",
    gif: "image/gif", avif: "image/avif", svg: "image/svg+xml", ico: "image/x-icon",
    mp4: "video/mp4", webm: "video/webm", mov: "video/quicktime", m4v: "video/x-m4v",
  };
  return map[ext] ?? "application/octet-stream";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    // remove "/functions/v1/media" e o nome do bucket, se presente
    let path = decodeURIComponent(url.pathname).replace(/^.*\/media\/?/, "");
    if (path.startsWith(`${BUCKET}/`)) path = path.slice(BUCKET.length + 1);
    if (!path) return new Response("Not found", { status: 404, headers: corsHeaders });

    const { data, error } = await admin.storage.from(BUCKET).download(path);
    if (error || !data) {
      return new Response("Not found", { status: 404, headers: corsHeaders });
    }

    return new Response(data, {
      headers: {
        ...corsHeaders,
        "Content-Type": data.type && data.type !== "application/octet-stream" ? data.type : contentTypeFor(path),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (_e) {
    return new Response("Error", { status: 500, headers: corsHeaders });
  }
});
