/**
 * Prefetch por rota — carrega o chunk da página assim que o usuário
 * demonstra intenção (hover no link, toque, ou idle após o boot).
 * Cada factory é memoizada: nunca baixa o mesmo chunk duas vezes.
 */
type Loader = () => Promise<unknown>;

export const routeLoaders: Record<string, Loader> = {
  "/fale-conosco": () => import("@/pages/FaleConosco"),
  "/hotelzinho": () => import("@/pages/Hotelzinho"),
  "/transporte": () => import("@/pages/Transporte"),
  "/venha-nos-conhecer": () => import("@/pages/VenhaNosConhecer"),
  "/localizacao": () => import("@/pages/Localizacao"),
  "/fotos": () => import("@/pages/Fotos"),
  "/videos": () => import("@/pages/Videos"),
  "/siga-nos": () => import("@/pages/SigaNos"),
  "/albuns": () => import("@/pages/Albuns"),
};

const done = new Set<string>();

/** Dispara o download do chunk de uma rota (idempotente). */
export function prefetchRoute(path?: string) {
  if (!path) return;
  const clean = path.split("?")[0].replace(/\/+$/, "") || "/";
  if (done.has(clean)) return;
  const loader = routeLoaders[clean];
  if (!loader) return;
  done.add(clean);
  loader().catch(() => done.delete(clean));
}

/** Prefetch de todas as rotas públicas quando o navegador estiver ocioso. */
export function prefetchAllPublicRoutes() {
  const run = () => Object.keys(routeLoaders).forEach(prefetchRoute);
  const ric = (window as any).requestIdleCallback;
  if (typeof ric === "function") ric(run, { timeout: 3000 });
  else setTimeout(run, 1500);
}
