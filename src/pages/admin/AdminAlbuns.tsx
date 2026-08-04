import { useEffect, useState, useCallback } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MediaUploader } from "@/components/MediaUploader";
import { AspectRatioPicker } from "@/components/AspectRatioPicker";
import { invalidateCache } from "@/lib/dataCache";
import { detectPlatform, getLinkThumbnail } from "@/lib/albumLinks";
import {
  Plus, Trash2, Pencil, Save, X, Calendar as CalendarIcon, Eye, EyeOff,
  Link as LinkIcon, Image as ImageIcon, Video as VideoIcon, ChevronUp, ChevronDown,
  Images, ExternalLink, Sparkles
} from "lucide-react";

const ALL_LOCATIONS: { value: string; label: string }[] = [
  { value: "home", label: "Home" },
  { value: "destaques_home", label: "Destaques da Semana (Home)" },
  { value: "hotelzinho", label: "Hotelzinho" },
  { value: "destaques_hotel", label: "Destaques da Semana (Hotelzinho)" },
  { value: "transporte", label: "Transporte" },
  { value: "conhecer", label: "Venha Nos Conhecer" },
  { value: "fotos", label: "Página de Fotos" },
  { value: "videos", label: "Página de Vídeos" },
];

interface Album {
  id: string;
  title: string;
  description: string;
  cover_url: string | null;
  cover_type: string | null;
  aspect_ratio: string | null;
  locations: string[];
  is_active: boolean;
  show_in_hoje: boolean;
  publish_at: string | null;
  expire_at: string | null;
  position: number;
}

interface Item {
  id: string;
  album_id: string;
  media_type: "photo" | "video";
  source_type: string;
  media_url: string;
  thumb_url: string | null;
  aspect_ratio: string | null;
  caption: string;
  position: number;
}

const toLocalInput = (iso: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 16);
};
const fromLocalInput = (s: string) => (s ? new Date(s).toISOString() : null);

export default function AdminAlbuns() {
  const { toast } = useToast();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("albums")
      .select("*")
      .order("position", { ascending: true })
      .order("created_at", { ascending: false });
    setAlbums((data as Album[]) || []);
    setLoading(false);
    invalidateCache("albums_active");
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const create = async () => {
    const { data, error } = await supabase
      .from("albums")
      .insert({ title: "Novo álbum", locations: ["home"], aspect_ratio: "4:3" })
      .select()
      .single();
    if (error) return toast({ title: "Erro", description: error.message, variant: "destructive" });
    setEditingId(data.id);
    await reload();
    toast({ title: "✅ Álbum criado" });
  };

  const remove = async (id: string) => {
    if (!confirm("Excluir este álbum e todas as suas mídias? Esta ação não pode ser desfeita.")) return;
    const { error } = await supabase.from("albums").delete().eq("id", id);
    if (error) return toast({ title: "Erro", description: error.message, variant: "destructive" });
    await reload();
    toast({ title: "🗑️ Álbum excluído" });
  };

  return (
    <AdminLayout title="Álbuns">
      <div className="max-w-6xl">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-[#A1A1AA] text-sm max-w-2xl">
              Crie álbuns para agrupar várias fotos e vídeos em um único card. As mídias individuais continuam aparecendo
              normalmente nas seções marcadas; o álbum aparece <strong>adicionalmente</strong> como uma coleção clicável.
            </p>
          </div>
          <button
            onClick={create}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-black font-heading font-semibold rounded-xl hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> Novo álbum
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-28 bg-[#1a1a1a] rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : albums.length === 0 ? (
          <div className="text-center py-20 bg-[#111] border border-[#27272A] rounded-2xl">
            <Images className="w-14 h-14 text-primary/50 mx-auto mb-4" />
            <h3 className="font-heading font-semibold text-lg mb-1">Nenhum álbum ainda</h3>
            <p className="text-[#A1A1AA] text-sm mb-5">Crie o primeiro para começar a agrupar suas mídias.</p>
            <button onClick={create} className="px-5 py-2.5 bg-primary text-black font-heading font-semibold rounded-xl">
              Criar primeiro álbum
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {albums.map((a) => (
              <AlbumRow
                key={a.id}
                album={a}
                expanded={editingId === a.id}
                onToggle={() => setEditingId((cur) => (cur === a.id ? null : a.id))}
                onChanged={reload}
                onRemove={() => remove(a.id)}
              />
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

// ─── Row ───────────────────────────────────────────────────────────────────
function AlbumRow({
  album, expanded, onToggle, onChanged, onRemove,
}: { album: Album; expanded: boolean; onToggle: () => void; onChanged: () => void; onRemove: () => void; }) {
  const { toast } = useToast();
  const [local, setLocal] = useState<Album>(album);
  const [items, setItems] = useState<Item[]>([]);
  const [itemsLoaded, setItemsLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setLocal(album); }, [album]);

  useEffect(() => {
    if (!expanded || itemsLoaded) return;
    loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded]);

  const loadItems = async () => {
    const { data } = await supabase
      .from("album_items")
      .select("*")
      .eq("album_id", album.id)
      .order("position", { ascending: true });
    setItems((data as Item[]) || []);
    setItemsLoaded(true);
  };

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("albums").update({
      title: local.title,
      description: local.description,
      cover_url: local.cover_url,
      cover_type: local.cover_type,
      aspect_ratio: local.aspect_ratio,
      locations: local.locations,
      is_active: local.is_active,
      show_in_hoje: local.show_in_hoje,
      publish_at: local.publish_at,
      expire_at: local.expire_at,
      position: local.position,
    }).eq("id", album.id);
    setSaving(false);
    if (error) return toast({ title: "Erro", description: error.message, variant: "destructive" });
    toast({ title: "✅ Álbum salvo" });
    onChanged();
  };

  const toggleLoc = (loc: string) => {
    setLocal((p) => ({
      ...p,
      locations: p.locations.includes(loc) ? p.locations.filter((x) => x !== loc) : [...p.locations, loc],
    }));
  };

  // Items ----------------------------------------------------------------
  const addUploadedItem = async (url: string, mediaType: "photo" | "video") => {
    if (!url) return;
    const isVideo = mediaType === "video";
    const { error } = await supabase.from("album_items").insert({
      album_id: album.id,
      media_type: mediaType,
      source_type: "upload",
      media_url: url,
      aspect_ratio: local.aspect_ratio || "4:3",
      position: items.length,
      thumb_url: isVideo ? null : url,
    });
    if (error) return toast({ title: "Erro", description: error.message, variant: "destructive" });
    await loadItems();
    onChanged();
  };

  const addLinkItem = async (rawUrl: string) => {
    const url = rawUrl.trim();
    if (!url) return;
    const platform = detectPlatform(url);
    if (platform === "unknown") {
      toast({ title: "Link não reconhecido", description: "Use YouTube, Instagram, TikTok ou link direto .mp4", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("album_items").insert({
      album_id: album.id,
      media_type: "video",
      source_type: platform,
      media_url: url,
      thumb_url: getLinkThumbnail(url, platform),
      aspect_ratio: platform === "tiktok" || platform === "instagram" ? "9:16" : "16:9",
      position: items.length,
    });
    if (error) return toast({ title: "Erro", description: error.message, variant: "destructive" });
    await loadItems();
    onChanged();
    toast({ title: "✅ Vídeo adicionado" });
  };

  const removeItem = async (id: string) => {
    if (!confirm("Remover esta mídia do álbum?")) return;
    await supabase.from("album_items").delete().eq("id", id);
    await loadItems();
    onChanged();
  };

  const moveItem = async (id: string, dir: -1 | 1) => {
    const idx = items.findIndex((i) => i.id === id);
    const swap = idx + dir;
    if (idx < 0 || swap < 0 || swap >= items.length) return;
    const a = items[idx], b = items[swap];
    await Promise.all([
      supabase.from("album_items").update({ position: b.position }).eq("id", a.id),
      supabase.from("album_items").update({ position: a.position }).eq("id", b.id),
    ]);
    await loadItems();
  };

  const updateItemField = async (id: string, patch: Partial<Item>) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
    await supabase.from("album_items").update(patch).eq("id", id);
  };

  return (
    <div className={`bg-[#111] border rounded-2xl overflow-hidden transition-colors ${expanded ? "border-primary/40" : "border-[#27272A]"}`}>
      {/* Header row */}
      <div className="flex items-center gap-4 p-4">
        <div className="w-16 h-16 rounded-lg bg-[#222] overflow-hidden shrink-0">
          {album.cover_url ? (
            <img src={album.cover_url} className="w-full h-full object-cover" onError={(e) => ((e.target as HTMLImageElement).src = "/placeholder.svg")} />
          ) : (
            <div className="w-full h-full flex items-center justify-center"><Images className="w-6 h-6 text-primary/40" /></div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-heading font-semibold text-white truncate">{album.title || "Sem título"}</h3>
            {!album.is_active && <span className="text-[10px] uppercase font-heading bg-red-500/15 text-red-400 px-2 py-0.5 rounded-full">Oculto</span>}
            {album.show_in_hoje && <span className="text-[10px] uppercase font-heading bg-primary/15 text-primary px-2 py-0.5 rounded-full">Hoje no Le Ville</span>}
          </div>
          <p className="text-xs text-[#A1A1AA] truncate mt-0.5">
            {album.locations.length === 0 ? "Sem localização" : album.locations.map((l) => ALL_LOCATIONS.find((x) => x.value === l)?.label || l).join(" · ")}
          </p>
        </div>
        <button onClick={onToggle} className="px-3 py-2 text-xs font-heading font-semibold text-primary hover:bg-primary/10 rounded-lg transition-colors flex items-center gap-1">
          <Pencil className="w-3.5 h-3.5" /> {expanded ? "Fechar" : "Editar"}
        </button>
        <button onClick={onRemove} className="w-9 h-9 flex items-center justify-center text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {expanded && (
        <div className="border-t border-[#27272A] p-5 space-y-6">
          {/* Settings grid */}
          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-[#A1A1AA] mb-2 font-heading">Título</label>
                <input
                  type="text"
                  value={local.title}
                  onChange={(e) => setLocal({ ...local, title: e.target.value })}
                  className="w-full px-3 py-2.5 bg-[#1a1a1a] border border-[#3F3F46] rounded-lg text-white focus:border-primary outline-none"
                  placeholder="Nome do álbum"
                />
              </div>
              <div>
                <label className="block text-xs text-[#A1A1AA] mb-2 font-heading">Descrição (opcional)</label>
                <textarea
                  value={local.description || ""}
                  onChange={(e) => setLocal({ ...local, description: e.target.value })}
                  className="w-full px-3 py-2.5 bg-[#1a1a1a] border border-[#3F3F46] rounded-lg text-white focus:border-primary outline-none resize-none"
                  rows={2}
                />
              </div>

              <AspectRatioPicker
                value={local.aspect_ratio || "4:3"}
                onChange={(v) => setLocal({ ...local, aspect_ratio: v })}
                label="Proporção da capa do álbum"
              />

              <div>
                <label className="block text-xs text-[#A1A1AA] mb-2 font-heading">Capa do álbum</label>
                <MediaUploader
                  accept="both"
                  currentUrl={local.cover_url || undefined}
                  onUploaded={(url) => setLocal({ ...local, cover_url: url || null, cover_type: /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url) ? "video" : "image" })}
                  label=""
                />
                <p className="text-[11px] text-[#71717A] mt-1.5">A capa é o que aparece no card antes de abrir o álbum.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-[#A1A1AA] mb-2 font-heading">Onde este álbum aparece</label>
                <div className="grid grid-cols-1 gap-1.5">
                  {ALL_LOCATIONS.map((loc) => {
                    const on = local.locations.includes(loc.value);
                    return (
                      <button
                        key={loc.value}
                        type="button"
                        onClick={() => toggleLoc(loc.value)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                          on ? "bg-primary/15 text-primary border border-primary/40" : "bg-[#1a1a1a] border border-[#3F3F46] text-[#A1A1AA] hover:border-[#52525B]"
                        }`}
                      >
                        <span className={`w-4 h-4 rounded border-2 flex items-center justify-center ${on ? "bg-primary border-primary" : "border-[#52525B]"}`}>
                          {on && <span className="w-2 h-2 bg-black rounded-sm" />}
                        </span>
                        {loc.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <label className="flex items-center justify-between bg-[#1a1a1a] border border-[#3F3F46] rounded-lg px-3 py-2.5">
                <span className="text-sm text-white flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> Mostrar em "Hoje no Le Ville"</span>
                <input
                  type="checkbox"
                  checked={local.show_in_hoje}
                  onChange={(e) => setLocal({ ...local, show_in_hoje: e.target.checked })}
                  className="w-5 h-5 accent-primary"
                />
              </label>

              <label className="flex items-center justify-between bg-[#1a1a1a] border border-[#3F3F46] rounded-lg px-3 py-2.5">
                <span className="text-sm text-white flex items-center gap-2">
                  {local.is_active ? <Eye className="w-4 h-4 text-primary" /> : <EyeOff className="w-4 h-4 text-[#A1A1AA]" />}
                  Álbum ativo (visível no site)
                </span>
                <input
                  type="checkbox"
                  checked={local.is_active}
                  onChange={(e) => setLocal({ ...local, is_active: e.target.checked })}
                  className="w-5 h-5 accent-primary"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#A1A1AA] mb-2 font-heading flex items-center gap-1"><CalendarIcon className="w-3 h-3" /> Publicar em</label>
                  <input
                    type="datetime-local"
                    value={toLocalInput(local.publish_at)}
                    onChange={(e) => setLocal({ ...local, publish_at: fromLocalInput(e.target.value) })}
                    className="w-full px-2 py-2 bg-[#1a1a1a] border border-[#3F3F46] rounded-lg text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#A1A1AA] mb-2 font-heading flex items-center gap-1"><CalendarIcon className="w-3 h-3" /> Expirar em</label>
                  <input
                    type="datetime-local"
                    value={toLocalInput(local.expire_at)}
                    onChange={(e) => setLocal({ ...local, expire_at: fromLocalInput(e.target.value) })}
                    className="w-full px-2 py-2 bg-[#1a1a1a] border border-[#3F3F46] rounded-lg text-white text-xs"
                  />
                </div>
              </div>
              <p className="text-[11px] text-[#71717A]">
                Se "Publicar em" estiver no futuro, o álbum só fica visível quando chegar a hora.
                Se "Expirar em" estiver definido, ele some automaticamente depois.
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={save}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-black font-heading font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-60 transition-colors"
            >
              <Save className="w-4 h-4" /> {saving ? "Salvando..." : "Salvar álbum"}
            </button>
          </div>

          {/* Items */}
          <div className="pt-5 border-t border-[#27272A]">
            <h4 className="font-heading font-semibold text-white mb-3 flex items-center gap-2">
              <Images className="w-4 h-4 text-primary" /> Mídias do álbum ({items.length})
            </h4>

            <div className="grid md:grid-cols-2 gap-3 mb-4">
              <div className="bg-[#1a1a1a] border border-[#3F3F46] rounded-xl p-3">
                <p className="text-[11px] text-[#A1A1AA] font-heading uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <ImageIcon className="w-3 h-3" /> Adicionar fotos ou vídeos (upload)
                </p>
                <MediaUploader
                  accept="both"
                  multiple
                  pathPrefix={`albums/${album.id}`}
                  onUploaded={(url) => {
                    if (!url) return;
                    const isVid = /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url);
                    addUploadedItem(url, isVid ? "video" : "photo");
                  }}
                  label=""
                />
              </div>
              <div className="bg-[#1a1a1a] border border-[#3F3F46] rounded-xl p-3">
                <p className="text-[11px] text-[#A1A1AA] font-heading uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <LinkIcon className="w-3 h-3" /> Adicionar vídeo por link (YouTube, Instagram, TikTok, .mp4)
                </p>
                <LinkAdder onAdd={addLinkItem} />
              </div>
            </div>

            {items.length === 0 ? (
              <p className="text-sm text-[#71717A] text-center py-8 border border-dashed border-[#3F3F46] rounded-xl">
                Nenhuma mídia ainda. Adicione acima.
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {items.map((it, i) => (
                  <ItemCard
                    key={it.id}
                    item={it}
                    isFirst={i === 0}
                    isLast={i === items.length - 1}
                    onUp={() => moveItem(it.id, -1)}
                    onDown={() => moveItem(it.id, 1)}
                    onRemove={() => removeItem(it.id)}
                    onChange={(patch) => updateItemField(it.id, patch)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function LinkAdder({ onAdd }: { onAdd: (url: string) => void }) {
  const [val, setVal] = useState("");
  return (
    <div className="flex gap-2">
      <input
        type="url"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder="https://youtube.com/... ou .mp4"
        className="flex-1 px-3 py-2.5 bg-[#0f0f0f] border border-[#3F3F46] rounded-lg text-white text-sm focus:border-primary outline-none"
      />
      <button
        onClick={() => { onAdd(val); setVal(""); }}
        className="px-4 py-2.5 bg-primary text-black font-heading font-semibold text-sm rounded-lg hover:bg-primary/90"
      >
        Adicionar
      </button>
    </div>
  );
}

function ItemCard({
  item, isFirst, isLast, onUp, onDown, onRemove, onChange,
}: {
  item: Item;
  isFirst: boolean;
  isLast: boolean;
  onUp: () => void;
  onDown: () => void;
  onRemove: () => void;
  onChange: (patch: Partial<Item>) => void;
}) {
  const isUploadVideo = item.media_type === "video" && (item.source_type === "upload" || item.source_type === "url");
  const thumb = item.thumb_url || (item.media_type === "photo" ? item.media_url : null);

  return (
    <div className="bg-[#1a1a1a] border border-[#3F3F46] rounded-xl overflow-hidden">
      <div className="relative aspect-square bg-black">
        {item.media_type === "photo" ? (
          <img src={item.media_url} className="w-full h-full object-cover" onError={(e) => ((e.target as HTMLImageElement).src = "/placeholder.svg")} />
        ) : isUploadVideo ? (
          <video src={item.media_url} className="w-full h-full object-cover" muted />
        ) : (
          thumb ? (
            <img src={thumb} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-primary">
              <VideoIcon className="w-8 h-8 mb-1" />
              <span className="text-[10px] uppercase font-heading">{item.source_type}</span>
            </div>
          )
        )}
        <span className="absolute top-1.5 left-1.5 text-[9px] font-heading uppercase bg-black/70 text-primary px-1.5 py-0.5 rounded">
          {item.media_type === "video" ? `▶ ${item.source_type}` : "Foto"}
        </span>
        <a
          href={item.media_url}
          target="_blank"
          rel="noreferrer"
          className="absolute top-1.5 right-1.5 w-6 h-6 flex items-center justify-center bg-black/60 hover:bg-black text-white rounded"
        >
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
      <div className="p-2 space-y-2">
        <input
          type="text"
          value={item.caption || ""}
          onChange={(e) => onChange({ caption: e.target.value })}
          placeholder="Legenda (opcional)"
          className="w-full px-2 py-1.5 bg-[#0f0f0f] border border-[#3F3F46] rounded text-white text-xs focus:border-primary outline-none"
        />
        <select
          value={item.aspect_ratio || "16:9"}
          onChange={(e) => onChange({ aspect_ratio: e.target.value })}
          className="w-full px-2 py-1.5 bg-[#0f0f0f] border border-[#3F3F46] rounded text-white text-xs"
        >
          <option value="16:9">16:9</option>
          <option value="4:3">4:3</option>
          <option value="1:1">1:1</option>
          <option value="3:4">3:4</option>
          <option value="9:16">9:16</option>
        </select>
        <div className="flex gap-1">
          <button onClick={onUp} disabled={isFirst} className="flex-1 py-1 bg-[#0f0f0f] hover:bg-[#222] text-white rounded text-xs flex items-center justify-center disabled:opacity-30">
            <ChevronUp className="w-3 h-3" />
          </button>
          <button onClick={onDown} disabled={isLast} className="flex-1 py-1 bg-[#0f0f0f] hover:bg-[#222] text-white rounded text-xs flex items-center justify-center disabled:opacity-30">
            <ChevronDown className="w-3 h-3" />
          </button>
          <button onClick={onRemove} className="flex-1 py-1 bg-red-500/15 hover:bg-red-500/30 text-red-400 rounded text-xs flex items-center justify-center">
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
