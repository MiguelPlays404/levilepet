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

/**
 * Busca dados com deduplicação de requisições.
 * Se já há uma promise em voo para a mesma key, reutiliza ela (evita duplicatas em StrictMode).
 */
async function fetchCached<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const existing = store.get(key);

  if (existing) {
    // Tem promise em voo → aguarda ela
    if ((existing as PendingEntry<T>).promise) {
      return (existing as PendingEntry<T>).promise!;
    }
    // Tem dado cacheado e não expirou → retorna imediatamente
    if ((existing as CacheEntry<T>).data !== undefined && !isStale(existing as CacheEntry<T>)) {
      return (existing as CacheEntry<T>).data;
    }
  }

  // Nenhum cache válido → busca e registra a promise para deduplicar
  const promise = fetcher().then((data) => {
    store.set(key, { data, fetchedAt: Date.now(), promise: null });
    return data;
  }).catch((err) => {
    store.delete(key); // Remove entrada inválida se falhar
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
}

/** Invalida todo o cache (ex: após login admin) */
export function invalidateAllCache() {
  store.clear();
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
