import JSZip from "jszip";

export const RATIOS = ["16:9", "4:3", "1:1", "3:4", "9:16"] as const;
export type Ratio = (typeof RATIOS)[number];

export function ratioOf(item: any): Ratio {
  const r = item?.aspect_ratio || (item?.orientation === "vertical" ? "9:16" : "16:9");
  return (RATIOS as readonly string[]).includes(r) ? (r as Ratio) : "16:9";
}

function ratioValue(r: Ratio): number {
  const [w, h] = r.split(":").map(Number);
  return w / h;
}

export function extFromUrl(url: string, fallback: string) {
  const clean = url.split("?")[0].split("#")[0];
  const m = clean.match(/\.([a-zA-Z0-9]{2,5})$/);
  return m ? m[1].toLowerCase() : fallback;
}

/** Recorta a imagem exatamente na proporção usada no site (object-cover centralizado). */
async function cropToRatio(blob: Blob, ratio: Ratio): Promise<{ blob: Blob; ext: string }> {
  const target = ratioValue(ratio);
  const bitmap = await createImageBitmap(blob);
  const srcRatio = bitmap.width / bitmap.height;

  let sx = 0, sy = 0, sw = bitmap.width, sh = bitmap.height;
  if (srcRatio > target) {
    sw = Math.round(bitmap.height * target);
    sx = Math.round((bitmap.width - sw) / 2);
  } else if (srcRatio < target) {
    sh = Math.round(bitmap.width / target);
    sy = Math.round((bitmap.height - sh) / 2);
  }

  const canvasAny: any =
    typeof OffscreenCanvas !== "undefined"
      ? new OffscreenCanvas(sw, sh)
      : Object.assign(document.createElement("canvas"), { width: sw, height: sh });

  const ctx = canvasAny.getContext("2d");
  if (!ctx) return { blob, ext: "jpg" };
  ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, sw, sh);
  bitmap.close?.();

  const out: Blob = canvasAny.convertToBlob
    ? await canvasAny.convertToBlob({ type: "image/jpeg", quality: 0.95 })
    : await new Promise((resolve) => canvasAny.toBlob((b: Blob) => resolve(b || blob), "image/jpeg", 0.95));

  return { blob: out, ext: "jpg" };
}

/** Executa tarefas com paralelismo controlado (downloads muito mais rápidos). */
async function runPool<T>(items: T[], limit: number, worker: (item: T, index: number) => Promise<void>) {
  let cursor = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const i = cursor++;
      await worker(items[i], i);
    }
  });
  await Promise.all(runners);
}

export type DownloadKind = "fotos" | "videos";

export type DownloadState = {
  running: DownloadKind | null;
  label: string;
  done: number;
  total: number;
  percent: number;
  failed: number;
  finishedMessage: string | null;
  errorMessage: string | null;
};

const initial: DownloadState = {
  running: null,
  label: "",
  done: 0,
  total: 0,
  percent: 0,
  failed: 0,
  finishedMessage: null,
  errorMessage: null,
};

let state: DownloadState = { ...initial };
const listeners = new Set<() => void>();

function emit(patch: Partial<DownloadState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

export const bulkDownloadStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot() {
    return state;
  },
  clearMessages() {
    emit({ finishedMessage: null, errorMessage: null });
  },
};

function saveZip(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 8000);
}

export type BulkOptions = {
  kind: DownloadKind;
  items: any[];
  urlOf: (item: any) => string;
  fallbackExt: string;
  namePrefix: string;
  groupByRatio: boolean;
  crop: boolean;
  concurrency?: number;
  extraFiles?: { name: string; content: string }[];
};

/**
 * Baixa em segundo plano: a promise vive fora do React, então continua
 * mesmo que o admin navegue para outra página do painel.
 */
export async function startBulkDownload(opts: BulkOptions) {
  if (state.running) return;
  const { items, urlOf, fallbackExt, namePrefix, groupByRatio, crop, kind } = opts;
  const concurrency = opts.concurrency ?? (kind === "fotos" ? 8 : 3);

  emit({
    running: kind,
    label: `Baixando ${kind}…`,
    done: 0,
    total: items.length,
    percent: 0,
    failed: 0,
    finishedMessage: null,
    errorMessage: null,
  });

  try {
    const zip = new JSZip();
    let done = 0;
    let failed = 0;

    await runPool(items, concurrency, async (item, i) => {
      const number = i + 1;
      try {
        const res = await fetch(urlOf(item), { mode: "cors" });
        if (!res.ok) throw new Error(String(res.status));
        let blob = await res.blob();
        let ext = extFromUrl(urlOf(item), fallbackExt);
        const ratio = ratioOf(item);
        if (crop && kind === "fotos") {
          const cropped = await cropToRatio(blob, ratio);
          blob = cropped.blob;
          ext = cropped.ext;
        }
        const folder = groupByRatio ? `${ratio.replace(":", "x")}/` : "";
        zip.file(`${folder}${namePrefix} ${number}.${ext}`, blob);
      } catch {
        failed++;
      } finally {
        done++;
        emit({
          done,
          failed,
          percent: Math.round((done / Math.max(items.length, 1)) * 100),
          label: `Baixando ${done} de ${items.length}…`,
        });
      }
    });

    for (const extra of opts.extraFiles || []) zip.file(extra.name, extra.content);

    emit({ label: "Compactando…" });
    const out = await zip.generateAsync({ type: "blob" }, (meta) => {
      emit({ label: `Compactando… ${Math.round(meta.percent)}%` });
    });

    saveZip(out, `le-ville-pet-${kind}-${new Date().toISOString().slice(0, 10)}.zip`);
    emit({
      running: null,
      percent: 100,
      finishedMessage: `${items.length - failed} ${kind} baixados${failed ? ` (${failed} falharam)` : ""}.`,
    });
  } catch (e: any) {
    emit({ running: null, errorMessage: `Erro ao gerar o ZIP: ${e?.message || e}` });
  }
}
