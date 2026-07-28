/**
 * Métricas sociais exibidas ao público.
 *
 * O painel administrativo continua mostrando SEMPRE os números reais do banco.
 * Estas funções servem apenas para a vitrine pública, gerando valores
 * determinísticos (o mesmo item sempre mostra o mesmo número) a partir do id.
 */

const MIN_VIEWS = 1_700_000;
const MIN_LIKES = 4_800_000;

function seed(id: string, salt: string): number {
  const s = `${salt}:${id}`;
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h / 4294967295;
}

/** Visualizações públicas: sempre acima de 1,7 milhão. */
export function publicViews(item: any): number {
  const id = String(item?.id ?? "");
  return Math.round(MIN_VIEWS + seed(id, "views") * 3_400_000 + 12_345);
}

/** Curtidas públicas: sempre acima de 4,8 milhões (+ curtidas reais do item). */
export function publicLikes(item: any): number {
  const id = String(item?.id ?? "");
  const real = Number(item?.likes_count || 0);
  return Math.round(MIN_LIKES + seed(id, "likes") * 2_600_000 + 7_777) + real;
}

/** Formata em pt-BR compacto: 5,1 mi / 842 mil / 980 */
export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(".", ",")} mi`;
  if (n >= 1_000) return `${Math.floor(n / 1000)} mil`;
  return String(n);
}

export const publicViewsLabel = (item: any) => formatCount(publicViews(item));
export const publicLikesLabel = (item: any) => formatCount(publicLikes(item));
