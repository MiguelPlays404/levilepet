import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listAlbumsTool from "./tools/list-albums";
import listPhotosTool from "./tools/list-photos";
import listVideosTool from "./tools/list-videos";
import getSiteConfigTool from "./tools/get-site-config";
import listVagasTool from "./tools/list-vagas";

// The OAuth issuer MUST be the direct Supabase host, built from the project ref
// (never SUPABASE_URL, which may be a proxy). VITE_SUPABASE_PROJECT_ID is inlined
// by Vite at build time, keeping the module import-safe.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "le-ville-pet-mcp",
  title: "Le Ville Pet",
  version: "0.1.0",
  instructions:
    "Ferramentas do site Le Ville Pet (petshop em Bauru-SP). Permite consultar álbuns, fotos, vídeos, vagas e a configuração pública do site em nome do usuário autenticado.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listAlbumsTool, listPhotosTool, listVideosTool, getSiteConfigTool, listVagasTool],
});
