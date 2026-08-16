import { useState, useRef } from "react";
import JSZip from "jszip";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Download,
  Upload,
  Database,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  FileArchive,
  HardDrive,
} from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "@/components/AdminLayout";

const STORAGE_BUCKET = "levillepet-media";

// Projeto Supabase atual. Backups antigos guardam URLs do projeto anterior;
// ao restaurar dados nós reescrevemos o domínio para o projeto atual.
const CURRENT_SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || "").replace(/\/$/, "");

function rewriteLegacyHosts<T>(value: T): T {
  if (!CURRENT_SUPABASE_URL) return value;
  if (typeof value === "string") {
    return value.replace(
      /https:\/\/[a-z0-9]+\.supabase\.co(?=\/storage\/v1\/)/g,
      CURRENT_SUPABASE_URL
    ) as unknown as T;
  }
  if (Array.isArray(value)) return value.map((v) => rewriteLegacyHosts(v)) as unknown as T;
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = rewriteLegacyHosts(v);
    }
    return out as unknown as T;
  }
  return value;
}

// Ordem de restauração: tabelas "pais" antes das "filhas".
// As demais tabelas descobertas dinamicamente entram em ordem alfabética no final.
const RESTORE_ORDER_HINT = [
  "site_config",
  "home_sections",
  "nav_items",
  "user_roles",
  "hotelzinho_content",
  "transporte_content",
  "conhecer_content",
  "guia_articles",
  "hoje_no_le_ville",
  "vagas",
  "photos",
  "videos",
  "video_likes",
  "albums",
  "album_items",
];

// Tabelas que NUNCA devem ser exportadas/restauradas (segurança / managed by auth)
const SKIP_TABLES = new Set<string>([]);

interface BackupManifest {
  version: 2;
  created_at: string;
  app: "le-ville-pet";
  tables: string[];
  counts: Record<string, number>;
  storage: {
    bucket: string;
    files: number;
    bytes: number;
  };
}

function sortForRestore(tables: string[]): string[] {
  const set = new Set(tables);
  const ordered: string[] = [];
  for (const t of RESTORE_ORDER_HINT) if (set.has(t)) ordered.push(t);
  for (const t of tables.sort()) if (!ordered.includes(t)) ordered.push(t);
  return ordered;
}

// Lista recursivamente todos arquivos do bucket
async function listAllStorageFiles(bucket: string, prefix = ""): Promise<string[]> {
  const out: string[] = [];
  let page = 0;
  const limit = 1000;
  while (true) {
    const { data, error } = await supabase.storage.from(bucket).list(prefix, {
      limit,
      offset: page * limit,
      sortBy: { column: "name", order: "asc" },
    });
    if (error) throw new Error(`Storage list ${prefix}: ${error.message}`);
    if (!data || data.length === 0) break;
    for (const entry of data) {
      const full = prefix ? `${prefix}/${entry.name}` : entry.name;
      // Pastas têm id null. Recursão.
      if ((entry as any).id === null || (entry.metadata == null && !entry.name.includes("."))) {
        const nested = await listAllStorageFiles(bucket, full);
        out.push(...nested);
      } else {
        out.push(full);
      }
    }
    if (data.length < limit) break;
    page++;
  }
  return out;
}

function AdminBackupInner() {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState<string>("");
  const [percent, setPercent] = useState<number>(0);
  const [lastResult, setLastResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [includeStorage, setIncludeStorage] = useState(true);
  const [mediaOnly, setMediaOnly] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleExport() {
    setExporting(true);
    setLastResult(null);
    setPercent(0);
    try {
      const zip = new JSZip();
      const counts: Record<string, number> = {};

      // 1) Descobre todas as tabelas dinamicamente
      setProgress("Descobrindo tabelas…");
      setPercent(2);
      const { data: tableRows, error: tablesErr } = await supabase.rpc("admin_list_tables");
      if (tablesErr) throw new Error(`Listar tabelas: ${tablesErr.message}`);
      const allTables = (tableRows || [])
        .map((r: any) => r.table_name as string)
        .filter((n: string) => !SKIP_TABLES.has(n));

      // Reservamos: 5% início, 25% tabelas, 65% storage, 5% compactação
      const tablesShare = includeStorage ? 25 : 90;
      // 2) Dump de cada tabela
      for (let ti = 0; ti < allTables.length; ti++) {
        const table = allTables[ti];
        setProgress(`Exportando tabela ${table}…`);
        setPercent(5 + Math.round(((ti + 1) / allTables.length) * tablesShare));
        const { data, error } = await supabase.from(table as any).select("*");
        if (error) { console.warn(`Pulando ${table}: ${error.message}`); continue; }
        const rows = data || [];
        counts[table] = rows.length;
        zip.file(`data/${table}.json`, JSON.stringify(rows, null, 2));
      }

      // 3) Storage: lista e baixa todos arquivos do bucket
      let storageFiles = 0;
      let storageBytes = 0;
      if (includeStorage) {
        setProgress("Listando arquivos do storage…");
        setPercent(32);
        const paths = await listAllStorageFiles(STORAGE_BUCKET);
        for (let i = 0; i < paths.length; i++) {
          const p = paths[i];
          setProgress(`Baixando arquivo ${i + 1}/${paths.length}: ${p}`);
          setPercent(35 + Math.round(((i + 1) / Math.max(paths.length, 1)) * 60));
          const { data: blob, error } = await supabase.storage.from(STORAGE_BUCKET).download(p);
          if (error || !blob) { console.warn(`Falha ao baixar ${p}: ${error?.message}`); continue; }
          const buf = await blob.arrayBuffer();
          zip.file(`storage/${STORAGE_BUCKET}/${p}`, buf);
          storageFiles++;
          storageBytes += buf.byteLength;
        }
      }

      const manifest: BackupManifest = {
        version: 2,
        created_at: new Date().toISOString(),
        app: "le-ville-pet",
        tables: allTables,
        counts,
        storage: { bucket: STORAGE_BUCKET, files: storageFiles, bytes: storageBytes },
      };
      zip.file("manifest.json", JSON.stringify(manifest, null, 2));
      zip.file(
        "README.txt",
        `Backup Le Ville Pet (v2 — completo)\nGerado em: ${manifest.created_at}\nTabelas: ${allTables.length}\nArquivos de mídia: ${storageFiles} (${(storageBytes / 1024 / 1024).toFixed(2)} MB)\n\nNão edite os arquivos manualmente.\nPara restaurar, vá em Admin → Backup & Restauração → Selecionar ZIP.\n`
      );

      setProgress("Compactando ZIP…");
      setPercent(96);
      const blob = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: { level: 6 },
      }, (meta) => setPercent(96 + Math.round(meta.percent * 0.04)));

      const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `levillepet-backup-${stamp}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      const totalRows = Object.values(counts).reduce((a, b) => a + b, 0);
      setLastResult({
        ok: true,
        msg: `Backup completo: ${allTables.length} tabelas, ${totalRows} registros, ${storageFiles} arquivos.`,
      });
      toast.success("Backup baixado com sucesso!");
      setPercent(100);
    } catch (e: any) {
      setLastResult({ ok: false, msg: e.message || "Falha ao gerar backup" });
      toast.error("Erro ao gerar backup: " + (e.message || ""));
    } finally {
      setExporting(false);
      setProgress("");
      setTimeout(() => setPercent(0), 800);
    }
  }

  async function handleImport(file: File) {
    if (!file) return;
    if (
      !confirm(
        mediaOnly
          ? "Restaurar SOMENTE as fotos e vídeos do ZIP. Os textos e configurações atuais do site NÃO serão alterados.\n\nDeseja continuar?"
          : "ATENÇÃO: A restauração vai SUBSTITUIR TODOS os dados do site (tabelas e arquivos de mídia) pelos do backup.\n\nDeseja continuar?"
      )
    )
      return;

    setImporting(true);
    setLastResult(null);
    setPercent(0);
    try {
      setProgress("Lendo arquivo ZIP…");
      setPercent(3);
      const zip = await JSZip.loadAsync(file);
      const manifestFile = zip.file("manifest.json");
      if (!manifestFile) throw new Error("Arquivo inválido: manifest.json não encontrado.");
      const manifest: BackupManifest = JSON.parse(await manifestFile.async("string"));
      if (manifest.app !== "le-ville-pet") throw new Error("Backup de outra aplicação.");

      // 1) Restaura tabelas em ordem segura (pulado no modo "somente mídias")
      const order = sortForRestore(manifest.tables);
      let totalRestored = 0;

      if (!mediaOnly) {
        for (let ti = 0; ti < order.length; ti++) {
          const table = order[ti];
          if (SKIP_TABLES.has(table)) continue;
          const f = zip.file(`data/${table}.json`);
          if (!f) continue;
          setProgress(`Restaurando tabela ${table}…`);
          setPercent(5 + Math.round(((ti + 1) / order.length) * 35));
          const rows: any[] = rewriteLegacyHosts(JSON.parse(await f.async("string")));

          const { error: delErr } = await supabase.from(table as any).delete().not("id", "is", null);
          if (delErr) { console.warn(`Limpar ${table}: ${delErr.message}`); continue; }

          for (let i = 0; i < rows.length; i += 500) {
            const chunk = rows.slice(i, i + 500);
            if (chunk.length === 0) continue;
            const { error: insErr } = await supabase.from(table as any).insert(chunk);
            if (insErr) throw new Error(`Inserir ${table}: ${insErr.message}`);
          }
          totalRestored += rows.length;
        }
      }


      // 2) Restaura arquivos de storage
      let storageRestored = 0;
      const storageFolder = zip.folder(`storage/${STORAGE_BUCKET}`);
      if (storageFolder) {
        const files: { path: string; entry: JSZip.JSZipObject }[] = [];
        zip.forEach((relPath, entry) => {
          const prefix = `storage/${STORAGE_BUCKET}/`;
          if (relPath.startsWith(prefix) && !entry.dir) {
            files.push({ path: relPath.slice(prefix.length), entry });
          }
        });

        for (let i = 0; i < files.length; i++) {
          const { path, entry } = files[i];
          setProgress(`Restaurando mídia ${i + 1}/${files.length}: ${path}`);
          setPercent(42 + Math.round(((i + 1) / Math.max(files.length, 1)) * 56));
          const blob = await entry.async("blob");
          const { error: upErr } = await supabase.storage
            .from(STORAGE_BUCKET)
            .upload(path, blob, { upsert: true });
          if (upErr) { console.warn(`Upload ${path}: ${upErr.message}`); continue; }
          storageRestored++;
        }
      }

      setLastResult({
        ok: true,
        msg: `Restauração concluída: ${totalRestored} registros, ${storageRestored} arquivos.`,
      });
      setPercent(100);
      toast.success("Backup restaurado! Recarregando…");
      setTimeout(() => window.location.reload(), 1500);
    } catch (e: any) {
      setLastResult({ ok: false, msg: e.message || "Falha ao restaurar" });
      toast.error("Erro ao restaurar: " + (e.message || ""));
    } finally {
      setImporting(false);
      setProgress("");
      setTimeout(() => setPercent(0), 800);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const busy = exporting || importing;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-heading text-white">Backup & Restauração</h1>
        <p className="text-sm text-[#A1A1AA] mt-1">
          Backup completo do site: <strong>todas</strong> as tabelas do banco e <strong>todos</strong> os arquivos
          de mídia (fotos, vídeos, logos). Use o mesmo ZIP para restaurar o site exatamente como estava.
        </p>
      </div>

      <Card className="p-4 bg-[#111113] border-[#27272A] flex items-center gap-3">
        <Checkbox
          id="include-storage"
          checked={includeStorage}
          onCheckedChange={(c) => setIncludeStorage(c === true)}
        />
        <label htmlFor="include-storage" className="text-sm text-[#D4D4D8] cursor-pointer flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-primary" />
          Incluir arquivos de mídia (fotos/vídeos) — recomendado. Desmarcar gera backup só do banco (mais leve).
        </label>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-6 bg-[#111113] border-[#27272A] space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-white font-heading">Gerar Backup Completo</h2>
              <p className="text-xs text-[#71717A]">Tudo do site em um único ZIP.</p>
            </div>
          </div>
          <p className="text-sm text-[#A1A1AA]">
            Detecta automaticamente todas as tabelas do banco e baixa todos os arquivos do storage. Nada é deixado
            de fora — qualquer seção nova é incluída sem precisar atualizar este código.
          </p>
          <Button
            onClick={handleExport}
            disabled={busy}
            className="w-full bg-primary text-black hover:bg-primary/90"
          >
            {exporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
            {exporting ? "Gerando…" : "Baixar ZIP de Backup"}
          </Button>
        </Card>

        <Card className="p-6 bg-[#111113] border-[#27272A] space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/15 text-red-400 flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-white font-heading">Restaurar Backup</h2>
              <p className="text-xs text-[#71717A]">Sobrescreve banco e mídias.</p>
            </div>
          </div>
          <div className="flex items-start gap-2 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-md p-3">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>
              Esta ação apaga TODOS os dados e arquivos atuais e substitui pelos do ZIP. Gere um backup antes.
            </span>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".zip,application/zip"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleImport(f);
            }}
          />
          <Button
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            variant="outline"
            className="w-full border-red-500/40 text-red-400 hover:bg-red-500/10 hover:text-red-300"
          >
            {importing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileArchive className="w-4 h-4 mr-2" />}
            {importing ? "Restaurando…" : "Selecionar ZIP para Restaurar"}
          </Button>
        </Card>
      </div>

      {(progress || lastResult || percent > 0) && (
        <Card className="p-4 bg-[#111113] border-[#27272A] space-y-3">
          {progress && (
            <div className="flex items-center gap-2 text-sm text-[#A1A1AA]">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="truncate">{progress}</span>
            </div>
          )}
          {(busy || percent > 0) && (
            <div>
              <div className="flex items-center justify-between text-[11px] text-[#A1A1AA] mb-1 font-heading">
                <span>{exporting ? "Gerando backup" : importing ? "Restaurando backup" : "Concluído"}</span>
                <span className="text-primary font-bold">{percent}%</span>
              </div>
              <div className="h-2 w-full bg-[#27272A] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-yellow-300 transition-all duration-300 ease-out"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          )}
          {lastResult && !progress && (
            <div className={`flex items-center gap-2 text-sm ${lastResult.ok ? "text-emerald-400" : "text-red-400"}`}>
              {lastResult.ok ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              {lastResult.msg}
            </div>
          )}
        </Card>
      )}

      <Card className="p-5 bg-[#111113] border-[#27272A] space-y-3">
        <div className="flex items-center gap-2 text-white font-heading">
          <Database className="w-4 h-4 text-primary" /> O que está incluso
        </div>
        <ul className="text-sm text-[#A1A1AA] space-y-1.5 list-disc pl-5">
          <li><strong>Todas</strong> as tabelas do banco de dados (descobertas automaticamente)</li>
          <li>Configurações do site, branding, textos, botões, redes sociais</li>
          <li>Seções da Home, navbar, rodapé, vagas, hotelzinho, transporte, etc.</li>
          <li>Fotos, vídeos, legendas, agendamentos e curtidas</li>
          <li>Todos os arquivos físicos do storage (fotos e vídeos enviados)</li>
        </ul>
      </Card>
    </div>
  );
}

export default function AdminBackup() {
  return (
    <AdminLayout title="Backup & Restauração">
      <AdminBackupInner />
    </AdminLayout>
  );
}
