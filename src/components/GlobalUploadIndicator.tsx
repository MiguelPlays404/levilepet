import { useUploadStore, UploadProgress } from "@/lib/uploadStore";
import { Loader2, X, CheckCircle2, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

export function GlobalUploadIndicator() {
  const { uploads, clearUpload } = useUploadStore();
  const [minimized, setMinimized] = useState(false);
  
  const activeUploads = Object.values(uploads) as UploadProgress[];
  if (activeUploads.length === 0) return null;

  const totalDone = activeUploads.reduce((acc, u) => acc + (u.status === 'completed' ? 1 : 0), 0);
  const totalCount = activeUploads.length;
  const isProcessing = activeUploads.some(u => u.status === 'uploading');

  return (
    <div className="fixed top-20 right-4 z-[9999] w-80 max-w-[calc(100vw-2rem)] animate-in fade-in slide-in-from-right-4">
      <div className="bg-[#18181B]/95 backdrop-blur-md border border-primary/20 rounded-xl shadow-2xl shadow-black/50 overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 bg-[#111113] border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isProcessing ? (
              <Loader2 className="w-4 h-4 text-primary animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            )}
            <span className="text-[10px] font-heading font-bold text-white uppercase tracking-wider">
              {isProcessing ? "Enviando arquivos..." : "Uploads concluídos"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setMinimized(!minimized)}
              className="p-1 hover:bg-white/5 rounded text-[#A1A1AA] transition-colors"
            >
              {minimized ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
            {!isProcessing && (
              <button 
                onClick={() => activeUploads.forEach(u => clearUpload(u.id))}
                className="p-1 hover:bg-red-500/20 hover:text-red-400 rounded text-[#A1A1AA] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* List */}
        {!minimized && (
          <div className="max-h-60 overflow-y-auto p-3 space-y-3">
            {activeUploads.map((upload) => (
              <div key={upload.id} className="space-y-1.5 group">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-[#A1A1AA] truncate flex-1">
                    {upload.fileName}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-primary">
                      {upload.status === 'uploading' ? `${upload.done}/${upload.total}` : 
                       upload.status === 'completed' ? 'Concluído' : 'Erro'}
                    </span>
                    {upload.status !== 'uploading' && (
                      <button 
                        onClick={() => clearUpload(upload.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3 text-[#71717A] hover:text-white" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="h-1.5 w-full bg-[#27272A] rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      upload.status === 'error' ? 'bg-red-500' : 
                      upload.status === 'completed' ? 'bg-green-500' : 'bg-primary'
                    }`}
                    style={{ width: `${upload.status === 'completed' ? 100 : upload.progress}%` }}
                  />
                </div>
                
                {upload.status === 'error' && (
                  <p className="text-[9px] text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-2.5 h-2.5" />
                    {upload.errorMessage || "Erro desconhecido"}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Summary Footer when minimized */}
        {minimized && (
          <div className="px-4 py-2 bg-primary/5">
             <div className="h-1 w-full bg-[#27272A] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${(totalDone / totalCount) * 100}%` }}
                />
             </div>
             <p className="text-[10px] text-center text-[#A1A1AA] mt-1">
               {totalDone} de {totalCount} concluídos
             </p>
          </div>
        )}
      </div>
    </div>
  );
}
