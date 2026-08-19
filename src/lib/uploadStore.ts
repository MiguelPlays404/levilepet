import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface UploadProgress {
  id: string;
  fileName: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error' | 'pending' | 'cancelled';
  errorMessage?: string;
  done: number;
  total: number;
  attempts: number;
  fileData?: File; // Não persistido no localStorage, mas usado em memória
  bucket: string;
  pathPrefix: string;
  onUploaded?: (url: string) => void | Promise<void>;
  xhr?: XMLHttpRequest;
  // Trava síncrona para impedir que mais de uma instância do MediaUploader
  // (ou uma remontagem em StrictMode) processe o mesmo upload em paralelo.
  claimed?: boolean;
}

// ---------------------------------------------------------------------------
// REGISTRY DE CALLBACKS (em memória, fora do zustand)
// ---------------------------------------------------------------------------
// Por que isso existe: o zustand-persist salva `uploads` no localStorage a
// cada mudança, e o `partialize` (lá embaixo) sempre remove `onUploaded` antes
// de gravar — porque função não é serializável em JSON. O problema é que a
// REHYDRATION do persist (que acontece ao carregar/recarregar a página, ou em
// qualquer merge de estado entre abas) sobrescreve o estado em memória com a
// versão sem `onUploaded`. Resultado: se o upload de uma foto (galeria,
// hotelzinho, transporte) ainda está em andamento ou na fila quando isso
// acontece, o arquivo sobe certinho pro Storage, mas a callback que insere a
// linha na tabela `photos` nunca é chamada — a foto "some" (na prática nunca
// existiu no banco), mesmo aparecendo como "enviada".
//
// A correção: guardamos as callbacks aqui, num Map em memória indexado por
// uploadId, fora do fluxo do zustand/persist. Elas nunca são serializadas e
// nunca são apagadas por rehydration. O zustand continua controlando o
// progresso/estado (que É seguro persistir), e este registry garante que a
// callback de inserção sempre exista enquanto o upload estiver pendente na
// mesma sessão do navegador.
const callbackRegistry = new Map<string, (url: string) => void | Promise<void>>();

export function registerUploadCallback(id: string, cb: (url: string) => void | Promise<void>) {
  callbackRegistry.set(id, cb);
}

export function getUploadCallback(id: string) {
  return callbackRegistry.get(id);
}

export function clearUploadCallback(id: string) {
  callbackRegistry.delete(id);
}

interface UploadStore {
  uploads: Record<string, UploadProgress>;
  addUpload: (id: string, fileName: string, total: number, bucket: string, pathPrefix: string, fileData?: File, onUploaded?: (url: string) => void | Promise<void>) => void;
  updateProgress: (id: string, progress: number, done: number) => void;
  markCompleted: (id: string) => void;
  markError: (id: string, error: string) => void;
  clearUpload: (id: string) => void;
  cancelUpload: (id: string) => void;
  retryUpload: (id: string) => void;
  setXhr: (id: string, xhr: XMLHttpRequest | undefined) => void;
  /**
   * Tenta "reservar" um upload pendente de forma síncrona (sem await no meio).
   * Retorna true se este chamador ganhou o direito de processá-lo, false se
   * outra instância já reservou. Deve ser chamado ANTES de qualquer await
   * dentro do loop de processamento — é isso que fecha a race condition.
   */
  claimUpload: (id: string) => boolean;
}

export const useUploadStore = create<UploadStore>()(
  persist(
    (set, get) => ({
      uploads: {},
      addUpload: (id, fileName, total, bucket, pathPrefix, fileData, onUploaded) => {
        // Callback vive no registry em memória (não no zustand/persist) —
        // veja o comentário no topo do arquivo sobre por que isso é necessário.
        if (onUploaded) registerUploadCallback(id, onUploaded);
        set((state) => ({
          uploads: {
            ...state.uploads,
            [id]: { 
              id, 
              fileName, 
              progress: 0, 
              status: 'uploading', 
              done: 0, 
              total, 
              attempts: 1,
              bucket,
              pathPrefix,
              fileData,
              onUploaded
            }
          }
        }));
      },
      updateProgress: (id, progress, done) =>
        set((state) => ({
          uploads: {
            ...state.uploads,
            [id]: state.uploads[id] ? { ...state.uploads[id], progress, done } : state.uploads[id]
          }
        })),
      markCompleted: (id) =>
        set((state) => ({
          uploads: {
            ...state.uploads,
            [id]: state.uploads[id] ? { ...state.uploads[id], status: 'completed', progress: 100 } : state.uploads[id]
          }
        })),
      markError: (id, error) =>
        set((state) => ({
          uploads: {
            ...state.uploads,
            // Libera a trava no erro: se o usuário tentar de novo, precisa poder reservar de novo
            [id]: state.uploads[id] ? { ...state.uploads[id], status: 'error', errorMessage: error, claimed: false } : state.uploads[id]
          }
        })),
      claimUpload: (id) => {
        const upload = get().uploads[id];
        if (!upload || upload.status !== 'uploading' || upload.claimed) return false;
        set((state) => ({
          uploads: {
            ...state.uploads,
            [id]: state.uploads[id] ? { ...state.uploads[id], claimed: true } : state.uploads[id]
          }
        }));
        return true;
      },
      clearUpload: (id) => {
        clearUploadCallback(id);
        set((state) => {
          const newUploads = { ...state.uploads };
          delete newUploads[id];
          return { uploads: newUploads };
        });
      },
      cancelUpload: (id) => {
        const upload = get().uploads[id];
        if (upload?.xhr) {
          upload.xhr.abort();
        }
        set((state) => ({
          uploads: {
            ...state.uploads,
            [id]: state.uploads[id] ? { ...state.uploads[id], status: 'cancelled', xhr: undefined, claimed: false } : state.uploads[id]
          }
        }));
      },
      retryUpload: (id) => {
        set((state) => ({
          uploads: {
            ...state.uploads,
            [id]: state.uploads[id] ? { 
              ...state.uploads[id], 
              status: 'uploading', 
              progress: 0, 
              errorMessage: undefined,
              attempts: state.uploads[id].attempts + 1,
              claimed: false
            } : state.uploads[id]
          }
        }));
      },
      setXhr: (id, xhr) => 
        set((state) => ({
          uploads: {
            ...state.uploads,
            [id]: state.uploads[id] ? { ...state.uploads[id], xhr } : state.uploads[id]
          }
        })),
    }),
    {
      name: 'lvp-uploads-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Não persistimos o arquivo físico (blob) nem o objeto XHR nem a callback no localStorage
        uploads: Object.fromEntries(
          Object.entries(state.uploads).map(([id, u]) => [
            id,
            { ...u, fileData: undefined, xhr: undefined, onUploaded: undefined }
          ])
        )
      })
    }
  )
);
