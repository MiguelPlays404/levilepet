// Valida que as variáveis públicas do backend existem antes do build.
const { existsSync, readFileSync } = require("fs");
const { resolve } = require("path");

const REQUIRED = ["VITE_SUPABASE_URL", "VITE_SUPABASE_PUBLISHABLE_KEY"];
const fromFile = {};
const envPath = resolve(".env");

if (existsSync(envPath)) {
  const content = readFileSync(envPath, "utf8");
  content.split("\n").forEach(line => {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) fromFile[m[1]] = m[2].replace(/^["']|["']$/g, "");
  });
}

const missing = REQUIRED.filter((k) => !(process.env[k] || fromFile[k]));

if (missing.length) {
  console.warn(
    `\n[build] Aviso: variáveis não detectadas neste ambiente: ${missing.join(", ")}\n` +
      `Se o site publicado não conectar ao backend, adicione-as no provedor de hospedagem.\n`
  );
} else {
  console.log("env ok:", REQUIRED.join(", "));
}
