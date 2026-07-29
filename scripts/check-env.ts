// Valida que as variáveis públicas do backend existem antes do build.
// Rodado no prebuild — falha cedo em vez de publicar um site quebrado.

import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

const REQUIRED = ["VITE_SUPABASE_URL", "VITE_SUPABASE_PUBLISHABLE_KEY"];

const fromFile: Record<string, string> = {};
const envPath = resolve(".env");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) fromFile[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const missing = REQUIRED.filter((k) => !(process.env[k] || fromFile[k]));

if (missing.length) {
  console.error(
    `\n[build] Variáveis de ambiente faltando: ${missing.join(", ")}\n` +
      `Adicione-as em Site settings > Environment variables no Netlify (ou no .env local) e refaça o deploy.\n`,
  );
  process.exit(1);
}

console.log("env ok:", REQUIRED.join(", "));
