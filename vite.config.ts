import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/supabase/vite";

// Fallbacks públicos (chave anon/publicável — segura para o front-end).
// Garantem que builds fora do Lovable (Docker/Dokploy/Netlify), onde as
// variáveis podem não estar presentes, não gerem um bundle quebrado
// (tela preta por `createClient(undefined, undefined)`).
const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL || "https://wxssfflxmextixxzvtzr.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4c3NmZmx4bWV4dGl4eHp2dHpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MzcxOTEsImV4cCI6MjA5MDMxMzE5MX0.ESrNbyfZkwh_fPzPvIruu7_r5oR7dLdMgHR7jNzcr-c";
const SUPABASE_PROJECT_ID =
  process.env.VITE_SUPABASE_PROJECT_ID || "wxssfflxmextixxzvtzr";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  define: {
    "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(SUPABASE_URL),
    "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(SUPABASE_PUBLISHABLE_KEY),
    "import.meta.env.VITE_SUPABASE_PROJECT_ID": JSON.stringify(SUPABASE_PROJECT_ID),
  },
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mcpPlugin(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
  build: {
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: mode === "production",
        drop_debugger: mode === "production",
      },
      mangle: true,
      format: {
        comments: false,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom", "framer-motion"],
          ui: [
            "@radix-ui/react-accordion",
            "@radix-ui/react-alert-dialog",
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-popover",
            "@radix-ui/react-toast",
            "@radix-ui/react-tooltip",
          ],
          supabase: ["@supabase/supabase-js"],
        },
      },
    },
  },
}));
