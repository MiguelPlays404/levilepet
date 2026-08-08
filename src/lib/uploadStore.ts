import { create } from 'zustand';

export interface UploadProgress {
  id: string;
  fileName: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  errorMessage?: string;
  done: number;
  total: number;
}

interface UploadStore {
  uploads: Record<string, UploadProgress>;
  addUpload: (id: string, fileName: string, total: number) => void;
  updateProgress: (id: string, progress: number, done: number) => void;
  markCompleted: (id: string) => void;
  markError: (id: string, error: string) => void;
  clearUpload: (id: string) => void;
}

export const useUploadStore = create<UploadStore>((set) => ({
  uploads: {},
  addUpload: (id, fileName, total) => 
    set((state) => ({
      uploads: {
        ...state.uploads,
        [id]: { id, fileName, progress: 0, status: 'uploading', done: 0, total }
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
        [id]: state.uploads[id] ? { ...state.uploads[id], status: 'error', errorMessage: error } : state.uploads[id]
      }
    })),
  clearUpload: (id) =>
    set((state) => {
      const newUploads = { ...state.uploads };
      delete newUploads[id];
      return { uploads: newUploads };
    }),
}));
