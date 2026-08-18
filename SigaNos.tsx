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
      addUpload: (id, fileName, total, bucket, pathPrefix, fileData, onUploaded) => 
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
        })),
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
      clearUpload: (id) =>
        set((state) => {
          const newUploads = { ...state.uploads };
          delete newUploads[id];
          return { uploads: newUploads };
        }),
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
