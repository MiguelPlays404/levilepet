import { useRef, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Image as ImageIcon, Video as VideoIcon, Loader2 } from "lucide-react";

interface Props {
  accept?: "image" | "video" | "both";
  bucket?: string;
  pathPrefix?: string;
  currentUrl?: string;
  onUploaded: (url: string) => void;
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

  const acceptAttr = accept === "image" ? "image/*" : accept === "video" ? "video/*" : "image/*,video/*";

  const uploadOne = useCallback(async (file: File): Promise<string | null> => {
    const ext = file.name.split(".").pop() || "bin";
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const path = `${pathPrefix}/${safeName}`;
    const url = `${SUPABASE_URL}/storage/v1/object/${bucket}/${path}`;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("Sessão de admin expirada. Entre novamente para enviar arquivos.");
      }

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Authorization", `Bearer ${session.access_token}`);
        xhr.setRequestHeader("apikey", SUPABASE_KEY);
        xhr.setRequestHeader("x-upsert", "true");
        xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(getUploadErrorMessage(xhr.responseText))));
        xhr.onerror = () => reject(new Error("Falha de rede"));
        xhr.send(file);
      });
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      return data.publicUrl;
    } catch (e: any) {
      toast({ title: `Erro ao enviar ${file.name}`, description: e.message, variant: "destructive" });
      return null;
    }
  }, [bucket, pathPrefix, toast]);

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const arr = Array.from(files);
    if (arr.length === 0) return;
    setUploading(true);
    setProgress(0);

    if (multiple) {
      setBatchInfo({ done: 0, total: arr.length });
      let success = 0;
      for (let i = 0; i < arr.length; i++) {
        setProgress(0);
        const u = await uploadOne(arr[i]);
        if (u) {
          onUploaded(u);
          success++;
        }
        setBatchInfo({ done: i + 1, total: arr.length });
      }
      toast({ title: `✅ ${success} de ${arr.length} enviados` });
      setBatchInfo(null);
    } else {
      const u = await uploadOne(arr[0]);
      if (u) {
        setPreview(u);
        onUploaded(u);
        toast({ title: "✅ Upload concluído!" });
      }
    }
    setUploading(false);
    setTimeout(() => setProgress(0), 500);
  }, [multiple, onUploaded, toast, uploadOne]);

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
            <div className="w-full bg-[#27272A] rounded-full h-2 overflow-hidden">
              <div className="h-full bg-primary transition-all duration-150" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-[#A1A1AA] mt-2">
              {batchInfo ? `Enviando ${batchInfo.done + 1} de ${batchInfo.total}... ${progress}%` : `Enviando... ${progress}%`}
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
            <p className="text-xs mt-1">{multiple ? "Selecione ou arraste vários de uma vez · " : ""}Sem limite de tamanho</p>
          </div>
        )}
      </div>
    </div>
  );
}
