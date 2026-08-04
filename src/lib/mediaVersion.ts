/**
 * Cache-busting automático de mídias.
 * Anexa um parâmetro ?v= derivado do updated_at do registro (ou de um bump manual),
 * garantindo que uma nova capa apareça instantaneamente mesmo com cache do navegador/CDN.
 */

const BUMP_KEY = "lvp_media_bump";

/** Versão global (incrementada quando o admin troca uma capa). */
export function globalBump(): string {
  try {
    return localStorage.getItem(BUMP_KEY) || "0";
  } catch {
    return "0";
  }
}

/** Incrementa a versão global — chame após salvar/remover uma capa. */
export function bumpMediaVersion(): string {
  const v = String(Date.now());
  try {
    localStorage.setItem(BUMP_KEY, v);
  } catch {
    /* noop */
  }
  return v;
}

function hash(input: string): string {
  let h = 5381;
  for (let i = 0; i < input.length; i++) h = ((h << 5) + h + input.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

/**
 * Anexa a versão à URL. Assets locais (bundle do Vite, data:, blob:) já têm hash
 * próprio e são deixados intactos.
 */
export function withVersion(url: string, stamp?: string | number | null): string {
  if (!url) return url;
  if (url.startsWith("data:") || url.startsWith("blob:")) return url;
  if (/\/assets\/.*-[A-Za-z0-9_]{8}\./.test(url)) return url; // asset com hash do build

  const token = hash(`${stamp ?? ""}|${globalBump()}`);
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}v=${token}`;
}
