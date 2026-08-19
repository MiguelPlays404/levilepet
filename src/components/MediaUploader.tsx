import { useRef, useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { logAudit } from "@/lib/audit";
import { useUploadStore, UploadProgress, getUploadCallback, clearUploadCallback } from "@/lib/uploadStore";
import { storeFileForResume, getStoredFile, removeStoredFile } from "@/lib/uploadPersistence";
import { Upload, X, Image as ImageIcon, Video as VideoIcon, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface Props {
  accept?: "image" | "video" | "both";
  bucket?: string;
  pathPrefix?: string;
  currentUrl?: string;
  onUploaded: (url: string) => void | Promise<void>;
  label?: string;
  compact?: boolean;
  multiple?: boolean;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const getUploadErrorMessage = (responseText: string) => {
  try {
    const parsed = JSON.parse(responseText);
    return parsed.message || parsed.error || responseText;
  } catch {
    return responseText || "Falha no upload";
  }
};

const getFriendlyError = (error: unknown) => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  try {
    return JSON.stringify(error);
  } catch {
    return "Erro desconhecido";
  }
};

export function MediaUploader({
  accept = "image",
  bucket = "levillepet-media",
  pathPrefix = "uploads",
  currentUrl,
  onUploaded,
  label = "Enviar arquivo",
  compact = false,
  multiple = false,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const [dragOver, setDragOver] = useState(false);
  const [batchInfo, setBatchInfo] = useState<{ done: number; total: number } | null>(null);
  const { toast } = useToast();
  const { uploads, addUpload, updateProgress, markCompleted, markError, setXhr, claimUpload } = useUploadStore();

  const acceptAttr = accept === "image" ? "image/*" : accept === "video" ? "video/*" : "image/*,video/*";

  const uploadOne = useCallback(async (file: File, uploadId: string, index: number, total: number): Promise<string | null> => {
    const ext = file.name.split(".").pop() || "bin";
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const path = `${pathPrefix}/${safeName}`;
    const url = `${SUPABASE_URL}/storage/v1/object/${bucket}/${path}`;
    
    try {
      // Persistir arquivo no IndexedDB para retomada se necessário
      await storeFileForResume(uploadId, file);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("Sessão expirada. Entre novamente.");
      }

      const publicUrl = await new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        setXhr(uploadId, xhr);
        
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Authorization", `Bearer ${session.access_token}`);
        xhr.setRequestHeader("apikey", SUPABASE_KEY);
        xhr.setRequestHeader("x-upsert", "true");
        xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
        
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const p = Math.round((e.loaded / e.total) * 100);
            setProgress(p);
            updateProgress(uploadId, p, index);
          }
        };
        
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const { data } = supabase.storage.from(bucket).getPublicUrl(path);
            resolve(data.publicUrl);
          } else {
            reject(new Error(getUploadErrorMessage(xhr.responseText)));
          }
        };
        
        xhr.onerror = () => reject(new Error("Falha de rede"));
        xhr.onabort = () => reject(new Error("Upload cancelado pelo usuário"));
        xhr.send(file);
      });

      // Sucesso: limpar cache e notificar
      await removeStoredFile(uploadId);
      setXhr(uploadId, undefined);
      
      void logAudit({
        action: "upload",
        entity: bucket,
        entity_id: path,
        details: { file: file.name, size: file.size, type: file.type, url: publicUrl },
      });
      
      return publicUrl;
    } catch (e: any) {
      setXhr(uploadId, undefined);
      if (e.message !== "Upload cancelado pelo usuário") {
        markError(uploadId, e.message);
        toast({ title: `Erro ao enviar ${file.name}`, description: e.message, variant: "destructive" });
      }
      return null;
    }
  }, [bucket, pathPrefix, toast, updateProgress, markError, setXhr]);

  // Hook para detectar retomada automática e retentativas manuais do store
  useEffect(() => {
    const processUploads = async () => {
      const pending = Object.values(uploads).filter(u => u.status === 'uploading' && !u.xhr && !u.claimed);
      
      for (const upload of pending) {
        // Reserva síncrona: se outra instância do MediaUploader (ou uma remontagem)
        // já pegou esse item entre o cálculo de `pending` e agora, `claimUpload`
        // retorna false e pulamos — é isso que evita subir o mesmo arquivo 2x.
        if (!claimUpload(upload.id)) continue;

        let file = (upload as any).fileData;
        
        if (!file) {
          file = await getStoredFile(upload.id);
        }
        
        if (file) {
          try {
            const url = await uploadOne(file, upload.id, upload.done, upload.total);
            if (url) {
              markCompleted(upload.id);
              // Buscamos a callback no registry em memória primeiro — é a fonte
              // confiável, pois nunca é apagada por rehydration do persist.
              // `upload.onUploaded` fica como fallback para o mesmo tick em que
              // o upload acabou de ser criado (ainda não passou por nenhum
              // ciclo de persist/rehydrate).
              const cb = getUploadCallback(upload.id) || upload.onUploaded;
              if (cb) {
                await cb(url);
                clearUploadCallback(upload.id);
              } else if (!multiple && upload.id.startsWith('single-')) {
                // Para uploads individuais via UI local
                await onUploaded(url);
                setPreview(url);
              } else {
                // Não deveria acontecer mais, mas se acontecer, avisa em vez
                // de silenciosamente perder a foto enviada.
                console.error(`Upload ${upload.id} concluído mas sem callback registrada — item pode não ter sido salvo.`);
                toast({ title: "⚠️ Arquivo enviado, mas não foi salvo", description: "Recarregue a página e tente reenviar esta foto.", variant: "destructive" });
              }
            }
          } catch (err) {
            console.error("Retomada falhou:", err);
          }
        } else {
          // Arquivo não encontrado no cache nem em memória
          markError(upload.id, "Arquivo não encontrado para retomada");
        }
      }
    };

    processUploads();
  }, [uploads, uploadOne, markCompleted, markError, multiple, onUploaded, claimUpload]);

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const arr = Array.from(files);
    if (arr.length === 0) return;
    
    setUploading(true);
    setProgress(0);
    
    if (multiple) {
      setBatchInfo({ done: 0, total: arr.length });
      
      for (let i = 0; i < arr.length; i++) {
        const file = arr[i];
        // Date.now() sozinho pode repetir entre chamadas próximas (dois lotes
        // enviados rapidamente, ou dois MediaUploader na mesma tela) — e como
        // o ID é a CHAVE do objeto na fila, uma colisão faz uma foto
        // sobrescrever silenciosamente a entrada da outra antes mesmo do
        // upload começar. Math.random() garante unicidade real.
        const uploadId = `batch-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 9)}`;
        
        // Adiciona ao store global. O useEffect acima cuidará da execução real do uploadOne
        // Mas para fluidez imediata, podemos disparar aqui se quisermos seqüencial
        addUpload(
          uploadId, 
          file.name, 
          arr.length, 
          bucket, 
          pathPrefix, 
          file, 
          (url) => onUploaded(url)
        );
      }
      
      toast({ title: `📦 ${arr.length} envios agendados em segundo plano` });
      setBatchInfo(null);
    } else {
      const file = arr[0];
      const uploadId = `single-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      addUpload(uploadId, file.name, 1, bucket, pathPrefix, file);
      // O useEffect detectará status='uploading' e iniciará o uploadOne
    }
    
    setUploading(false);
  }, [multiple, onUploaded, toast, addUpload, bucket, pathPrefix]);

  const isVideo = preview && /\.(mp4|webm|mov|avi|mkv)(\?|$)/i.test(preview);

  return (
    <div className="w-full">
      {label && !compact && <label className="block text-xs text-[#A1A1AA] mb-2">{label}</label>}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-all ${
          dragOver ? "border-primary bg-primary/10" : "border-[#3F3F46] hover:border-primary/50"
        } ${compact ? "p-3" : "p-6"} bg-[#18181B]`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={acceptAttr}
          multiple={multiple}
          className="hidden"
          onChange={(e) => { if (e.target.files?.length) handleFiles(e.target.files); e.target.value = ""; }}
        />

        {preview && !uploading && !multiple ? (
          <div className="relative">
            {isVideo ? (
              <video src={preview} className="max-h-48 mx-auto rounded-lg" controls />
            ) : (
              <img src={preview} alt="preview" className="max-h-48 mx-auto rounded-lg object-contain" />
            )}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setPreview(null); onUploaded(""); }}
              className="absolute top-1 right-1 bg-black/70 text-white p-1 rounded-full hover:bg-red-500"
            >
              <X className="w-4 h-4" />
            </button>
            <p className="text-xs text-[#71717A] text-center mt-2">Clique ou arraste para trocar</p>
          </div>
        ) : uploading ? (
          <div className="text-center py-4">
            <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary mb-3" />
            <p className="text-xs text-[#A1A1AA] mt-2">
              Processando envios...
            </p>
          </div>
        ) : (
          <div className="text-center text-[#A1A1AA] py-4">
            {accept === "video" ? <VideoIcon className="w-8 h-8 mx-auto mb-2 text-primary" /> :
             accept === "both" ? <Upload className="w-8 h-8 mx-auto mb-2 text-primary" /> :
             <ImageIcon className="w-8 h-8 mx-auto mb-2 text-primary" />}
            <p className="text-sm font-medium">
              Clique ou arraste {multiple ? (accept === "video" ? "vários vídeos" : accept === "both" ? "vários arquivos" : "várias imagens") : (accept === "video" ? "um vídeo" : accept === "both" ? "uma imagem ou vídeo" : "uma imagem")}
            </p>
            <p className="text-xs mt-1">{multiple ? "Selecione ou arraste vários de uma vez · " : ""}Retomada automática ativa</p>
          </div>
        )}
      </div>
    </div>
  );
}
