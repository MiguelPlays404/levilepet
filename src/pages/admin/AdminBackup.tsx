import { useState, useRef } from "react";
import JSZip from "jszip";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Upload, Database, Loader2, AlertTriangle, CheckCircle2, FileArchive } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "@/components/AdminLayout";

// Tabelas incluídas no backup. A ordem importa para o restore (singletons primeiro).
const TABLES = [
  "site_config",
  "home_sections",
  "nav_items",
  "hotelzinho_content",
  "transporte_content",
  "conhecer_content",
  "guia_articles",
  "hoje_no_le_ville",
  "vagas",
  "photos",
  "videos",
] as const;

type TableName = (typeof TABLES)[number];

interface BackupManifest {
  version: 1;
  created_at: string;
  app: "le-ville-pet";
  tables: TableName[];
  counts: Record<string, number>;
}

export default function AdminBackup() {
  const { setTitle } = useContext(AdminTitleContext);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState<string>("");
  const [lastResult, setLastResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitle("Backup & Restauração");
  }, [setTitle]);

  async function handleExport() {
    setExporting(true);
    setLastResult(null);
    try {
      const zip = new JSZip();
      const counts: Record<string, number> = {};

      for (const table of TABLES) {
        setProgress(`Exportando ${table}…`);
        const { data, error } = await supabase.from(table as any).select("*");
        if (error) throw new Error(`${table}: ${error.message}`);
        const rows = data || [];
        counts[table] = rows.length;
        zip.file(`data/${table}.json`, JSON.stringify(rows, null, 2));
      }

      const manifest: BackupManifest = {
        version: 1,
        created_at: new Date().toISOString(),
        app: "le-ville-pet",
        tables: [...TABLES],
        counts,
      };
      zip.file("manifest.json", JSON.stringify(manifest, null, 2));
      zip.file(
        "README.txt",
        `Backup Le Ville Pet\nGerado em: ${manifest.created_at}\n\nNão edite os arquivos manualmente.\nPara restaurar, vá em Admin → Backup & Restauração → Restaurar e selecione este ZIP.\n`
      );

      setProgress("Compactando ZIP…");
      const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });

      const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `levillepet-backup-${stamp}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setLastResult({ ok: true, msg: `Backup gerado com ${Object.values(counts).reduce((a, b) => a + b, 0)} registros.` });
      toast.success("Backup baixado com sucesso!");
    } catch (e: any) {
      setLastResult({ ok: false, msg: e.message || "Falha ao gerar backup" });
      toast.error("Erro ao gerar backup: " + (e.message || ""));
    } finally {
      setExporting(false);
      setProgress("");
    }
  }

  async function handleImport(file: File) {
    if (!file) return;
    if (!confirm("ATENÇÃO: A restauração vai SUBSTITUIR os dados atuais pelos dados do backup.\n\nDeseja continuar?")) return;

    setImporting(true);
    setLastResult(null);
    try {
      setProgress("Lendo arquivo ZIP…");
      const zip = await JSZip.loadAsync(file);
      const manifestFile = zip.file("manifest.json");
      if (!manifestFile) throw new Error("Arquivo inválido: manifest.json não encontrado.");
      const manifest: BackupManifest = JSON.parse(await manifestFile.async("string"));
      if (manifest.app !== "le-ville-pet") throw new Error("Backup de outra aplicação.");

      let totalRestored = 0;

      for (const table of manifest.tables) {
        const f = zip.file(`data/${table}.json`);
        if (!f) continue;
        setProgress(`Restaurando ${table}…`);
        const rows: any[] = JSON.parse(await f.async("string"));

        // Apaga registros atuais. Filtro neq id impossível garante delete-all.
        const { error: delErr } = await supabase.from(table as any).delete().not("id", "is", null);
        if (delErr) throw new Error(`Limpar ${table}: ${delErr.message}`);

        // Insere em lotes de 500.
        for (let i = 0; i < rows.length; i += 500) {
          const chunk = rows.slice(i, i + 500);
          if (chunk.length === 0) continue;
          const { error: insErr } = await supabase.from(table as any).insert(chunk);
          if (insErr) throw new Error(`Inserir ${table}: ${insErr.message}`);
        }
        totalRestored += rows.length;
      }

      setLastResult({ ok: true, msg: `Restauração concluída: ${totalRestored} registros.` });
      toast.success("Backup restaurado! Recarregando…");
      setTimeout(() => window.location.reload(), 1500);
    } catch (e: any) {
      setLastResult({ ok: false, msg: e.message || "Falha ao restaurar" });
      toast.error("Erro ao restaurar: " + (e.message || ""));
    } finally {
      setImporting(false);
      setProgress("");
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const busy = exporting || importing;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-heading text-white">Backup & Restauração</h1>
        <p className="text-sm text-[#A1A1AA] mt-1">
          Gere um arquivo ZIP com todo o conteúdo configurável do site (textos, fotos, vídeos, legendas, seções).
          Use o mesmo ZIP para restaurar tudo no estado em que foi salvo.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-6 bg-[#111113] border-[#27272A] space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-white font-heading">Gerar Backup</h2>
              <p className="text-xs text-[#71717A]">Baixa um ZIP com tudo até agora.</p>
            </div>
          </div>
          <p className="text-sm text-[#A1A1AA]">
            Inclui: configurações, seções da Home, navbar/rodapé, Hotelzinho, Transporte, Conhecer, Guia,
            Hoje no Le Ville, Vagas, Fotos e Vídeos (registros — os arquivos de mídia continuam no Storage).
          </p>
          <Button onClick={handleExport} disabled={busy} className="w-full bg-primary text-black hover:bg-primary/90">
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
              <p className="text-xs text-[#71717A]">Sobrescreve os dados atuais.</p>
            </div>
          </div>
          <div className="flex items-start gap-2 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-md p-3">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>Esta ação apaga os registros atuais e substitui pelos do ZIP. Recomendamos gerar um backup antes.</span>
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

      {(progress || lastResult) && (
        <Card className="p-4 bg-[#111113] border-[#27272A]">
          {progress && (
            <div className="flex items-center gap-2 text-sm text-[#A1A1AA]">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              {progress}
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

      <Card className="p-5 bg-[#111113] border-[#27272A]">
        <div className="flex items-center gap-2 text-white font-heading mb-3">
          <Database className="w-4 h-4 text-primary" /> Tabelas incluídas
        </div>
        <div className="flex flex-wrap gap-2">
          {TABLES.map((t) => (
            <span key={t} className="text-xs px-2 py-1 rounded-md bg-[#1C1C1E] text-[#A1A1AA] border border-[#27272A]">
              {t}
            </span>
          ))}
        </div>
      </Card>
    </div>
  );
}
