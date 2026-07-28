import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, ImageIcon, RotateCcw, Check, Loader2 } from "lucide-react";
import { MediaUploader } from "@/components/MediaUploader";
import { aspectClass, ASPECT_OPTIONS } from "@/components/AspectRatioPicker";
import { defaultVideoCover, resolveAspect } from "@/lib/videoThumb";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Props {
  video: any;
  onClose: () => void;
  /** Chamado após salvar, com o novo thumbnail_url ("" = capa padrão) */
  onSaved: (video: any, thumbnailUrl: string) => void;
}

export function VideoThumbnailEditor({ video, onClose, onSaved }: Props) {
  const { toast } = useToast();
  const [thumb, setThumb] = useState<string>(video.thumbnail_url || "");
  const [aspect, setAspect] = useState<string>(resolveAspect(video));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [onClose]);

  const previewSrc = thumb || defaultVideoCover(aspect);
  const isDefault = !thumb;

  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("videos")
      .update({ thumbnail_url: thumb || "", aspect_ratio: aspect } as any)
      .eq("id", video.id);
    setSaving(false);
    if (error) {
      toast({ title: "Erro ao salvar capa", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: isDefault ? "✅ Capa padrão aplicada" : "✅ Capa atualizada" });
    onSaved({ ...video, thumbnail_url: thumb || "", aspect_ratio: aspect }, thumb || "");
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4" onClick={onClose}>
      <div
        className="bg-[#18181B] rounded-2xl border border-white/[0.08] w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-[#27272A]">
          <h3 className="font-heading font-semibold text-white text-sm flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-primary" /> Capa do vídeo
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-[#A1A1AA]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Prévia */}
          <div>
            <p className="text-xs text-[#A1A1AA] mb-2 font-heading">Prévia ({aspect})</p>
            <div className={`${aspectClass(aspect)} w-full rounded-xl overflow-hidden bg-black border border-[#27272A]`}>
              <img src={previewSrc} alt="Prévia da capa" className="w-full h-full object-cover" />
            </div>
            <p className="text-[11px] mt-2 text-[#71717A]">
              {isDefault ? "🎨 Usando a capa padrão do Le Ville Pet nesta proporção." : "🖼️ Capa personalizada."}
            </p>
          </div>

          {/* Controles */}
          <div className="space-y-4">
            <div>
              <p className="text-xs text-[#A1A1AA] mb-2 font-heading">Proporção</p>
              <div className="grid grid-cols-5 gap-1.5">
                {ASPECT_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    onClick={() => setAspect(o.value)}
                    className={`py-2 rounded-lg text-[11px] font-heading font-semibold border-2 transition-colors ${
                      aspect === o.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-[#3F3F46] text-[#A1A1AA] hover:border-[#52525B]"
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-[#A1A1AA] mb-2 font-heading">Enviar nova capa</p>
              <MediaUploader
                accept="image"
                pathPrefix="videos/thumbs"
                currentUrl={thumb}
                onUploaded={(url) => setThumb(url)}
                label=""
              />
            </div>

            <button
              onClick={() => setThumb("")}
              disabled={isDefault}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-heading bg-[#27272A] text-[#A1A1AA] hover:text-white disabled:opacity-40"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Remover capa e usar a padrão
            </button>

            <div className="flex gap-2 pt-1">
              <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-lg text-sm text-[#A1A1AA] hover:text-white bg-[#27272A]">
                Cancelar
              </button>
              <button onClick={save} disabled={saving} className="flex-1 btn-primary text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Salvar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
