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
  // Busca em paralelo todos os dados que as páginas usam
  Promise.allSettled([
    getSiteConfig(),
    getNavItems(),
    getHomeSections(),
    getPhotos(),
    getVideos(),
    getHotelzinhoContent(),
    getTransporteContent(),
    getConhecerContent(),
  ]);
}
