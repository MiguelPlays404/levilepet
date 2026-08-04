import { useState, useEffect, useMemo } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Search, Pin, Plus, Trash2, X, Edit3, Save } from "lucide-react";
import Fuse from "fuse.js";
import ReactMarkdown from "react-markdown";

interface Article {
  id: string;
  category: string;
  title: string;
  content: string;
  keywords: string;
  icon: string;
  is_pinned: boolean;
  display_order: number;
}

export default function AdminGuia() {
  const [arts, setArts] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("Todas");
  const [open, setOpen] = useState<Article | null>(null);
  const [editing, setEditing] = useState<Article | null>(null);
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    const { data } = await supabase.from("guia_articles").select("*").order("is_pinned", { ascending: false }).order("display_order");
    setArts(data || []);
    setLoading(false);
  };

  const cats = useMemo(() => ["Todas", ...Array.from(new Set(arts.map(a => a.category)))], [arts]);

  const fuse = useMemo(() => new Fuse(arts, {
    keys: ["title", "content", "keywords", "category"],
    threshold: 0.4,
    includeScore: true,
  }), [arts]);

  const filtered = useMemo(() => {
    let list = arts;
    if (cat !== "Todas") list = list.filter(a => a.category === cat);
    if (q.trim()) {
      const results = fuse.search(q.trim());
      const ids = new Set(results.map(r => r.item.id));
      list = list.filter(a => ids.has(a.id));
    }
    return list.sort((a, b) => Number(b.is_pinned) - Number(a.is_pinned) || a.display_order - b.display_order);
  }, [arts, q, cat, fuse]);

  const saveArticle = async (a: Article) => {
    if (creating) {
      const { data } = await supabase.from("guia_articles").insert({
        category: a.category, title: a.title, content: a.content,
        keywords: a.keywords, icon: a.icon, is_pinned: a.is_pinned, display_order: a.display_order,
      }).select().single();
      if (data) setArts([...arts, data as Article]);
      setCreating(false);
    } else {
      await supabase.from("guia_articles").update({
        category: a.category, title: a.title, content: a.content,
        keywords: a.keywords, icon: a.icon, is_pinned: a.is_pinned,
      }).eq("id", a.id);
      setArts(arts.map(x => x.id === a.id ? a : x));
    }
    setEditing(null);
    toast({ title: "✅ Artigo salvo!" });
  };

  const removeArticle = async (id: string) => {
    if (!confirm("Excluir este artigo?")) return;
    await supabase.from("guia_articles").delete().eq("id", id);
    setArts(arts.filter(a => a.id !== id));
    setOpen(null);
  };

  return (
    <AdminLayout title="Guia & Ajuda">
      <div className="flex gap-6">
        {/* Sidebar de categorias */}
        <aside className="w-48 shrink-0">
          <h4 className="text-xs font-heading text-[#71717A] uppercase tracking-wider mb-3">Categorias</h4>
          <div className="flex flex-col gap-1">
            {cats.map(c => (
              <button key={c} onClick={() => setCat(c)}
                className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${cat === c ? "bg-primary/10 text-primary border-l-2 border-primary" : "text-[#A1A1AA] hover:text-white hover:bg-white/5"}`}>
                {c}
              </button>
            ))}
          </div>
        </aside>

        {/* Conteúdo */}
        <div className="flex-1 max-w-4xl">
          <div className="mb-5 flex gap-3 items-center">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]" />
              <input value={q} onChange={e => setQ(e.target.value)}
                placeholder="🔎 Pesquise por qualquer função do admin..."
                className="w-full bg-[#18181B] border border-white/[0.07] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-[#52525B] focus:border-primary outline-none" />
            </div>
            <button onClick={() => { setCreating(true); setEditing({ id: "", category: "Geral", title: "", content: "", keywords: "", icon: "📖", is_pinned: false, display_order: 999 }); }}
              className="btn-primary flex items-center gap-2 text-sm"><Plus className="w-4 h-4" /> Novo</button>
          </div>

          {loading ? <p className="text-[#A1A1AA]">Carregando...</p> : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filtered.length === 0 ? <p className="text-[#71717A] col-span-full">Nenhum artigo encontrado.</p> :
                filtered.map(a => (
                  <button key={a.id} onClick={() => setOpen(a)}
                    className="text-left bg-[#18181B] border border-white/[0.07] hover:border-primary/40 rounded-xl p-4 transition-all group">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{a.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {a.is_pinned && <Pin className="w-3 h-3 text-primary" />}
                          <h4 className="font-heading font-semibold text-sm text-white group-hover:text-primary transition-colors truncate">{a.title}</h4>
                        </div>
                        <p className="text-xs text-[#71717A] mt-1">{a.category}</p>
                      </div>
                    </div>
                  </button>
                ))
              }
            </div>
          )}
        </div>
      </div>

      {/* Modal viewer */}
      {open && !editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setOpen(null)}>
          <div className="bg-[#0F0F11] rounded-2xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto border border-white/10" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{open.icon}</span>
                <div>
                  <h2 className="font-heading font-bold text-xl text-white">{open.title}</h2>
                  <p className="text-xs text-primary">{open.category}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => setEditing(open)} className="p-2 text-[#A1A1AA] hover:text-primary"><Edit3 className="w-4 h-4" /></button>
                <button onClick={() => removeArticle(open.id)} className="p-2 text-[#A1A1AA] hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                <button onClick={() => setOpen(null)} className="p-2 text-[#A1A1AA] hover:text-white"><X className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown>{open.content}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}

      {/* Editor */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => { setEditing(null); setCreating(false); }}>
          <div className="bg-[#0F0F11] rounded-2xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto border border-white/10 space-y-3" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-lg">{creating ? "Novo artigo" : "Editar artigo"}</h3>
              <button onClick={() => { setEditing(null); setCreating(false); }} className="text-[#A1A1AA]"><X className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <input value={editing.icon} onChange={e => setEditing({ ...editing, icon: e.target.value })} placeholder="📖" className="bg-[#27272A] border border-[#3F3F46] rounded px-3 py-2 text-sm text-center" />
              <input value={editing.category} onChange={e => setEditing({ ...editing, category: e.target.value })} placeholder="Categoria" className="col-span-2 bg-[#27272A] border border-[#3F3F46] rounded px-3 py-2 text-sm" />
            </div>
            <input value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} placeholder="Título" className="w-full bg-[#27272A] border border-[#3F3F46] rounded px-3 py-2 text-sm" />
            <input value={editing.keywords} onChange={e => setEditing({ ...editing, keywords: e.target.value })} placeholder="Palavras-chave (separadas por espaço)" className="w-full bg-[#27272A] border border-[#3F3F46] rounded px-3 py-2 text-sm" />
            <textarea value={editing.content} onChange={e => setEditing({ ...editing, content: e.target.value })} placeholder="Conteúdo (Markdown suportado)" rows={10} className="w-full bg-[#27272A] border border-[#3F3F46] rounded px-3 py-2 text-sm font-mono" />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.is_pinned} onChange={e => setEditing({ ...editing, is_pinned: e.target.checked })} /> Fixar no topo</label>
            <button onClick={() => saveArticle(editing)} className="btn-primary flex items-center gap-2"><Save className="w-4 h-4" /> Salvar</button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
