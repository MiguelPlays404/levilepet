import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { Cloud, CloudCheck, CloudOff, AlertTriangle, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Hook para implementar salvamento automático com rascunho em localStorage
 * e indicadores visuais.
 */
export function useAutoSave<T>(
  data: T,
  onSave: (data: T) => Promise<any>,
  options: {
    storageKey: string;
    debounceMs?: number;
    enabled?: boolean;
    onRestore?: (draft: T) => void;
  }
) {
  const { storageKey, debounceMs = 5000, enabled = true, onRestore } = options;
  const [status, setStatus] = useState<"idle" | "changing" | "saving" | "saved" | "error">("idle");
  const [hasDraft, setHasDraft] = useState(false);
  const lastSavedData = useRef<string>(JSON.stringify(data));
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const location = useLocation();

  // Verificar se existe rascunho ao carregar
  useEffect(() => {
    const draft = localStorage.getItem(storageKey);
    if (draft && draft !== JSON.stringify(data)) {
      setHasDraft(true);
    }
  }, [storageKey]);

  // Função para limpar rascunho
  const clearDraft = useCallback(() => {
    localStorage.removeItem(storageKey);
    setHasDraft(false);
  }, [storageKey]);

  // Função de salvamento real
  const performSave = useCallback(async (currentData: T) => {
    if (status === "saving") return;
    
    setStatus("saving");
    try {
      await onSave(currentData);
      lastSavedData.current = JSON.stringify(currentData);
      clearDraft();
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (error) {
      console.error("Auto-save error:", error);
      setStatus("error");
    }
  }, [onSave, status, clearDraft]);

  // Monitorar mudanças nos dados
  useEffect(() => {
    if (!enabled || !data) return;

    const currentDataStr = JSON.stringify(data);
    
    // Se os dados são iguais aos últimos salvos, não faz nada
    if (currentDataStr === lastSavedData.current) {
      return;
    }

    setStatus("changing");
    
    // Salvar rascunho local imediatamente
    localStorage.setItem(storageKey, currentDataStr);
    setHasDraft(true);

    // Debounce para salvamento no backend
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      performSave(data);
    }, debounceMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [data, enabled, storageKey, debounceMs, performSave]);

  // Salvar ao fechar/navegar (BeforeUnload)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const currentDataStr = JSON.stringify(data);
      if (currentDataStr !== lastSavedData.current) {
        // Tentar salvar no localStorage (síncrono)
        localStorage.setItem(storageKey, currentDataStr);
        // Mostrar aviso padrão do navegador
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [data]);

  const restoreDraft = useCallback(() => {
    const draft = localStorage.getItem(storageKey);
    if (draft && onRestore) {
      onRestore(JSON.parse(draft));
      setHasDraft(false);
    }
  }, [storageKey, onRestore]);

  return {
    status,
    hasDraft,
    restoreDraft,
    clearDraft,
    performSave: () => performSave(data)
  };
}

export function AutoSaveIndicator({ status, hasDraft, onRestore, onClear }: { 
  status: "idle" | "changing" | "saving" | "saved" | "error",
  hasDraft?: boolean,
  onRestore?: () => void,
  onClear?: () => void
}) {
  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-3 pointer-events-none">
      <AnimatePresence>
        {hasDraft && status === "idle" && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-[#18181B] border border-primary/20 rounded-xl p-4 shadow-2xl pointer-events-auto max-w-xs"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <RefreshCw className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-heading font-semibold text-white">Rascunho encontrado</p>
                <p className="text-xs text-[#A1A1AA] mt-1">Você tem alterações não salvas desta seção.</p>
                <div className="flex gap-2 mt-3">
                  <button 
                    onClick={onRestore}
                    className="text-[10px] font-bold uppercase tracking-wider bg-primary text-black px-3 py-1.5 rounded-md hover:bg-primary-vibrant transition-colors"
                  >
                    Restaurar
                  </button>
                  <button 
                    onClick={onClear}
                    className="text-[10px] font-bold uppercase tracking-wider bg-white/5 text-[#A1A1AA] px-3 py-1.5 rounded-md hover:bg-white/10 transition-colors"
                  >
                    Descartar
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {status !== "idle" && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border shadow-lg pointer-events-auto ${
              status === "error" ? "bg-red-500/10 border-red-500/20 text-red-400" :
              status === "saved" ? "bg-green-500/10 border-green-500/20 text-green-400" :
              "bg-[#18181B] border-white/10 text-[#A1A1AA]"
            }`}
          >
            {status === "changing" && (
              <>
                <Cloud className="w-4 h-4" />
                <span className="text-xs font-medium">Alterações pendentes...</span>
              </>
            )}
            {status === "saving" && (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span className="text-xs font-medium">Salvando rascunho...</span>
              </>
            )}
            {status === "saved" && (
              <>
                <CloudCheck className="w-4 h-4" />
                <span className="text-xs font-medium">Alterações salvas!</span>
              </>
            )}
            {status === "error" && (
              <>
                <CloudOff className="w-4 h-4" />
                <span className="text-xs font-medium">Erro ao salvar rascunho</span>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
