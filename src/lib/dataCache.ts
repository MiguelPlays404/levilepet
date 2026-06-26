/**
 * dataCache.ts — Cache global em memória para dados do Supabase
 *
 * Problema: cada página desmonta e remonta Navbar/Footer/WhatsAppFloat,
 * disparando 6-8 chamadas ao Supabase em cada troca de página.
 *
 * Solução: cache em módulo-level (persiste entre renderizações React),
 * retorna dados instantaneamente se já carregados, busca apenas 1 vez.
 * TTL de 2 minutos para dados ficarem frescos.
 */

import { supabase } from "@/integrations/supabase/client";

const TTL_MS = 2 * 60 * 1000; // 2 minutos
const LS_PREFIX = "lvp_cache_v1:";

interface CacheEntry<T> {
  data: T;
  fetchedAt: number;
  promise?: null;
}

interface PendingEntry<T> {
  data?: never;
  fetchedAt?: never;
  promise: Promise<T>;
}

type Entry<T> = CacheEntry<T> | PendingEntry<T>;

const store = new Map<string, Entry<any>>();

function isStale(entry: CacheEntry<any>): boolean {
  return Date.now() - entry.fetchedAt > TTL_MS;
}

// ─── Hidratação SÍNCRONA do localStorage na carga do módulo ─────────────────
// Garante que `getCachedSync` devolva valores reais já no PRIMEIRO render,
// eliminando o "flash" de defaults antigos antes do fetch async resolver.
const KNOWN_KEYS = [
  "site_config", "nav_items", "home_sections",
  "photos_active", "videos_active", "albums_active",
  "hotelzinho_content", "transporte_content", "conhecer_content",
];

(function hydrateFromLS() {
  if (typeof localStorage === "undefined") return;
  for (const key of KNOWN_KEYS) {
    try {
      const raw = localStorage.getItem(LS_PREFIX + key);
      if (!raw) continue;
      const parsed = JSON.parse(raw) as CacheEntry<any>;
      if (parsed && typeof parsed.fetchedAt === "number") {
        store.set(key, { data: parsed.data, fetchedAt: parsed.fetchedAt, promise: null });
      }
    } catch { /* ignore */ }
  }
})();

/** Leitura SÍNCRONA do cache (memória/LS já hidratada). Retorna null se não houver. */
export function getCachedSync<T = any>(key: string): T | null {
  const e = store.get(key) as CacheEntry<T> | undefined;
  if (e && (e as any).data !== undefined) return (e as CacheEntry<T>).data;
  return null;
}


// ─── Persistência em localStorage (sobrevive a refresh / nova aba) ──────────
function loadFromLS<T>(key: string): CacheEntry<T> | null {
  try {
    const raw = localStorage.getItem(LS_PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheEntry<T>;
    if (!parsed || typeof parsed.fetchedAt !== "number") return null;
    return parsed;
  } catch { return null; }
}

function saveToLS<T>(key: string, data: T) {
  try {
    localStorage.setItem(LS_PREFIX + key, JSON.stringify({ data, fetchedAt: Date.now() }));
  } catch { /* quota / SSR */ }
}

/**
 * Busca dados com deduplicação + persistência em localStorage.
 * Stale-while-revalidate: devolve dado salvo IMEDIATAMENTE (mesmo velho)
 * e revalida em background — elimina o "flash" de conteúdo padrão antigo.
 */
async function fetchCached<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const existing = store.get(key);

  if (existing) {
    if ((existing as PendingEntry<T>).promise) {
      return (existing as PendingEntry<T>).promise!;
    }
    if ((existing as CacheEntry<T>).data !== undefined && !isStale(existing as CacheEntry<T>)) {
      return (existing as CacheEntry<T>).data;
    }
  }

  // Hidrata do localStorage se ainda não está em memória
  if (!existing) {
    const ls = loadFromLS<T>(key);
    if (ls && ls.data !== undefined) {
      store.set(key, { data: ls.data, fetchedAt: ls.fetchedAt, promise: null });
      if (!isStale(ls)) return ls.data;
      // Revalida em background, mas já devolve o dado antigo
      fetcher().then((data) => {
        store.set(key, { data, fetchedAt: Date.now(), promise: null });
        saveToLS(key, data);
      }).catch(() => {});
      return ls.data;
    }
  }

  const promise = fetcher().then((data) => {
    store.set(key, { data, fetchedAt: Date.now(), promise: null });
    saveToLS(key, data);
    return data;
  }).catch((err) => {
    store.delete(key);
    throw err;
  });

  store.set(key, { promise } as PendingEntry<T>);
  return promise;
}

// ─── Funções públicas do cache ──────────────────────────────────────────────

export async function getSiteConfig(): Promise<any> {
  return fetchCached("site_config", async () => {
    const { data } = await supabase.from("site_config").select("*").limit(1).maybeSingle();
    return data;
  });
}

export async function getNavItems(): Promise<any[]> {
  return fetchCached("nav_items", async () => {
    const { data } = await supabase.from("nav_items").select("*").eq("is_active", true).order("display_order");
    return data || [];
  });
}

export async function getHotelzinhoContent(): Promise<any> {
  return fetchCached("hotelzinho_content", async () => {
    const { data } = await supabase.from("hotelzinho_content").select("*").limit(1).maybeSingle();
    return data;
  });
}

export async function getTransporteContent(): Promise<any> {
  return fetchCached("transporte_content", async () => {
    const { data } = await supabase.from("transporte_content").select("*").limit(1).maybeSingle();
    return data;
  });
}

export async function getConhecerContent(): Promise<any> {
  return fetchCached("conhecer_content", async () => {
    const { data } = await supabase.from("conhecer_content").select("*").limit(1).maybeSingle();
    return data;
  });
}

export async function getPhotos(): Promise<any[]> {
  return fetchCached("photos_active", async () => {
    const { data } = await supabase.from("photos").select("*").eq("is_active", true).order("display_order");
    return data || [];
  });
}

export async function getVideos(): Promise<any[]> {
  return fetchCached("videos_active", async () => {
    const { data } = await supabase.from("videos").select("*").eq("is_active", true).order("published_at", { ascending: false });
    return data || [];
  });
}

export async function getHomeSections(): Promise<any[]> {
  return fetchCached("home_sections", async () => {
    const { data } = await supabase.from("home_sections").select("*").eq("is_active", true).order("display_order");
    return data || [];
  });
}

/** Álbuns ativos + contagem de itens (1 query extra agrupada). */
export async function getAlbums(): Promise<any[]> {
  return fetchCached("albums_active", async () => {
    const { data: albums } = await supabase
      .from("albums")
      .select("*")
      .eq("is_active", true)
      .order("position", { ascending: true })
      .order("created_at", { ascending: false });
    const list = albums || [];
    if (list.length === 0) return [];
    const ids = list.map((a: any) => a.id);
    const { data: items } = await supabase
      .from("album_items")
      .select("album_id, media_type")
      .in("album_id", ids);
    const counts = new Map<string, { total: number; videos: number }>();
    (items || []).forEach((it: any) => {
      const c = counts.get(it.album_id) || { total: 0, videos: 0 };
      c.total++;
      if (it.media_type === "video") c.videos++;
      counts.set(it.album_id, c);
    });
    return list.map((a: any) => ({
      ...a,
      item_count: counts.get(a.id)?.total ?? 0,
      video_count: counts.get(a.id)?.videos ?? 0,
    }));
  });
}

/** Invalida uma key específica (chamar após salvar no admin) */
export function invalidateCache(key: string) {
  store.delete(key);
  try { localStorage.removeItem(LS_PREFIX + key); } catch {}
}

/** Invalida todo o cache (ex: após login admin) */
export function invalidateAllCache() {
  store.clear();
  try {
    Object.keys(localStorage).forEach((k) => {
      if (k.startsWith(LS_PREFIX)) localStorage.removeItem(k);
    });
  } catch {}
}

/**
 * Pré-aquece o cache ao iniciar o app.
 * Dispara em background — não bloqueia nada.
 * Garante que a 1ª troca de página já tenha os dados prontos.
 */
export function prewarmCache() {
  Promise.allSettled([
    getSiteConfig(),
    getNavItems(),
    getHomeSections(),
    getPhotos(),
    getVideos(),
    getAlbums(),
    getHotelzinhoContent(),
    getTransporteContent(),
    getConhecerContent(),
  ]);
}

// ─── Sync getters por chave ─────────────────────────────────────────────────
export const getSiteConfigSync = () => getCachedSync<any>("site_config");
export const getNavItemsSync = () => getCachedSync<any[]>("nav_items") || [];
export const getHomeSectionsSync = () => getCachedSync<any[]>("home_sections") || [];
export const getPhotosSync = () => getCachedSync<any[]>("photos_active") || [];
export const getVideosSync = () => getCachedSync<any[]>("videos_active") || [];
export const getAlbumsSync = () => getCachedSync<any[]>("albums_active") || [];
export const getHotelzinhoContentSync = () => getCachedSync<any>("hotelzinho_content");
export const getTransporteContentSync = () => getCachedSync<any>("transporte_content");
export const getConhecerContentSync = () => getCachedSync<any>("conhecer_content");
