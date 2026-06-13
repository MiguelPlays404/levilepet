import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { invalidateCache } from "@/lib/dataCache";

/**
 * Mantém listas públicas (fotos/vídeos) sincronizadas com publicações agendadas.
 *
 * - Consulta o próximo `publish_at` em `photos` e `videos`
 * - Agenda um setTimeout exato para esse instante (com fallback de 60s)
 * - Refaz fetch ao voltar foco / tab visível
 * - Invalida o cache em memória + localStorage antes do refetch para nunca
 *   exibir lista antiga após o cron-publisher do servidor disparar.
 */
export function useScheduledMediaRefresh(onRefresh: () => void | Promise<void>) {
  const cbRef = useRef(onRefresh);
  cbRef.current = onRefresh;

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const refresh = async () => {
      invalidateCache("photos_active");
      invalidateCache("videos_active");
      await cbRef.current();
    };

    const scheduleNext = async () => {
      if (cancelled) return;
      const nowIso = new Date().toISOString();
      const [{ data: p }, { data: v }] = await Promise.all([
        supabase.from("photos").select("publish_at").eq("is_active", false).gt("publish_at", nowIso).order("publish_at").limit(1).maybeSingle(),
        supabase.from("videos").select("publish_at").eq("is_active", false).gt("publish_at", nowIso).order("publish_at").limit(1).maybeSingle(),
      ]);
      const candidates = [p?.publish_at, v?.publish_at].filter(Boolean) as string[];
      let delay = 60_000;
      if (candidates.length) {
        const next = Math.min(...candidates.map((t) => new Date(t).getTime()));
        delay = Math.max(2_000, Math.min(next - Date.now() + 1_500, 5 * 60_000));
      }
      if (timer) clearTimeout(timer);
      timer = setTimeout(async () => {
        await refresh();
        scheduleNext();
      }, delay);
    };

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        refresh();
        scheduleNext();
      }
    };

    scheduleNext();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, []);
}
