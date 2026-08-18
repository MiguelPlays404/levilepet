#!/usr/bin/env node
/**
 * Importa um backup .zip (gerado em /admin/backup) para um Supabase novo (self-hosted no Dokploy).
 *
 * Uso:
 *   SUPABASE_URL=https://api.seu-dominio.com \
 *   SUPABASE_SERVICE_ROLE_KEY=xxx \
 *   STORAGE_BUCKET=levillepet-media \
 *   node scripts/import-backup.js ./backup-levillepet.zip
 *
 * O zip deve conter:
 *   data/<tabela>.json      -> array de linhas
 *   media/<caminho...>      -> arquivos do storage (opcional)
 */
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import JSZip from "jszip";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = process.env.STORAGE_BUCKET || "levillepet-media";
const zipPath = process.argv[2];

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no ambiente.");
  process.exit(1);
}
if (!zipPath || !fs.existsSync(zipPath)) {
  console.error("Informe o caminho do arquivo .zip de backup.");
  process.exit(1);
}

// Ordem de import respeitando dependências (pais antes dos filhos).
const TABLE_ORDER = [
  "site_config",
  "nav_items",
  "home_sections",
  "photos",
  "videos",
  "albums",
  "album_items",
  "hoje_no_le_ville",
  "conhecer_content",
  "hotelzinho_content",
  "transporte_content",
  "guia_articles",
  "vagas",
  "video_likes",
];

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const chunk = (arr, size) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size),
  );

async function importTables(zip) {
  const files = Object.keys(zip.files).filter(
    (f) => f.startsWith("data/") && f.endsWith(".json"),
  );
  const byName = new Map(
    files.map((f) => [path.basename(f, ".json"), f]),
  );
  const ordered = [
    ...TABLE_ORDER.filter((t) => byName.has(t)),
    ...[...byName.keys()].filter((t) => !TABLE_ORDER.includes(t)),
  ];

  for (const table of ordered) {
    const raw = await zip.file(byName.get(table)).async("string");
    let rows;
    try {
      rows = JSON.parse(raw);
    } catch {
      console.warn(`! ${table}: JSON inválido, ignorando.`);
      continue;
    }
    if (!Array.isArray(rows) || rows.length === 0) {
      console.log(`- ${table}: vazio`);
      continue;
    }
    let ok = 0;
    for (const batch of chunk(rows, 200)) {
      const { error } = await supabase
        .from(table)
        .upsert(batch, { onConflict: "id" });
      if (error) {
        console.error(`! ${table}: ${error.message}`);
        break;
      }
      ok += batch.length;
    }
    console.log(`✓ ${table}: ${ok}/${rows.length} linhas`);
  }
}

async function importMedia(zip) {
  const files = Object.keys(zip.files).filter(
    (f) => f.startsWith("media/") && !zip.files[f].dir,
  );
  if (files.length === 0) {
    console.log("- media: nenhum arquivo no backup");
    return;
  }

  await supabase.storage.createBucket(BUCKET, { public: true }).catch(() => {});

  let done = 0;
  const queue = [...files];
  const workers = Array.from({ length: 5 }, async () => {
    while (queue.length) {
      const f = queue.shift();
      const key = f.replace(/^media\//, "");
      const buf = await zip.file(f).async("nodebuffer");
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(key, buf, { upsert: true });
      done++;
      if (error) console.error(`! ${key}: ${error.message}`);
      if (done % 25 === 0) console.log(`  media: ${done}/${files.length}`);
    }
  });
  await Promise.all(workers);
  console.log(`✓ media: ${done}/${files.length} arquivos`);
}

(async () => {
  console.log(`Lendo ${zipPath}...`);
  const zip = await JSZip.loadAsync(fs.readFileSync(zipPath));
  console.log("\n== Tabelas ==");
  await importTables(zip);
  console.log("\n== Storage ==");
  await importMedia(zip);
  console.log("\nImportação concluída.");
})().catch((e) => {
  console.error("Falha na importação:", e);
  process.exit(1);
});
