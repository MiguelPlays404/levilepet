import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, Save, ArrowUp, ArrowDown } from "lucide-react";

export default function AdminNavbarFooter() {
  const [items, setItems] = useState<any[]>([]);
  const [config, setConfig] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    const [n, c] = await Promise.all([
      supabase.from("nav_items").select("*").order("display_order"),
      supabase.from("site_config").select("nav_whatsapp_btn_text,footer_nav_title,footer_contact_title,footer_show_instagram,footer_show_whatsapp").limit(1).maybeSingle(),
    ]);
    setItems(n.data || []);
    setConfig(c.data || {});
    setLoading(false);
  };

  const updateItem = (id: string, field: string, value: any) => {
    setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const move = (id: string, dir: -1 | 1) => {
    const idx = items.findIndex(i => i.id === id);
    const j = idx + dir;
    if (j < 0 || j >= items.length) return;
    const arr = [...items];
    [arr[idx], arr[j]] = [arr[j], arr[idx]];
    setItems(arr.map((it, k) => ({ ...it, display_order: k + 1 })));
  };

  const addItem = async () => {
    const { data } = await supabase.from("nav_items").insert({ label: "Novo Link", path: "/", display_order: items.length + 1 }).select().single();
    if (data) setItems([...items, data]);
  };

  const removeItem = async (id: string) => {
    if (!confirm("Excluir este link?")) return;
    await supabase.from("nav_items").delete().eq("id", id);
    setItems(items.filter(i => i.id !== id));
  };

  const saveAll = async () => {
    setSaving(true);
    await Promise.all([
      ...items.map(i => supabase.from("nav_items").update({
        label: i.label, path: i.path, display_order: i.display_order,
        is_active: i.is_active, show_in_navbar: i.show_in_navbar, show_in_footer: i.show_in_footer,
      }).eq("id", i.id)),
      supabase.from("site_config").update(config).neq("id", "00000000-0000-0000-0000-000000000000"),
    ]);
    setSaving(false);
    toast({ title: "✅ Salvo!" });
  };

  if (loading) return <AdminLayout title="Navbar & Rodapé"><p className="text-[#A1A1AA]">Carregando...</p></AdminLayout>;

  return (
    <AdminLayout title="Navbar & Rodapé">
      <div className="space-y-6 max-w-4xl">
        <section className="bg-[#18181B] rounded-2xl p-6 border border-white/[0.07]">
          <h3 className="font-heading font-semibold mb-4">Links do Menu</h3>
          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={item.id} className="grid grid-cols-12 gap-2 items-center bg-[#0F0F11] p-3 rounded-lg">
                <div className="col-span-1 flex flex-col">
                  <button onClick={() => move(item.id, -1)} disabled={i === 0} className="text-[#71717A] hover:text-primary disabled:opacity-30"><ArrowUp className="w-4 h-4" /></button>
                  <button onClick={() => move(item.id, 1)} disabled={i === items.length - 1} className="text-[#71717A] hover:text-primary disabled:opacity-30"><ArrowDown className="w-4 h-4" /></button>
                </div>
                <input value={item.label} onChange={e => updateItem(item.id, "label", e.target.value)} placeholder="Rótulo" className="col-span-3 bg-[#27272A] border border-[#3F3F46] rounded px-2 py-2 text-sm" />
                <input value={item.path} onChange={e => updateItem(item.id, "path", e.target.value)} placeholder="/caminho" className="col-span-3 bg-[#27272A] border border-[#3F3F46] rounded px-2 py-2 text-sm font-mono" />
                <label className="col-span-2 flex items-center gap-1 text-xs text-[#A1A1AA]">
                  <input type="checkbox" checked={item.show_in_navbar} onChange={e => updateItem(item.id, "show_in_navbar", e.target.checked)} /> Navbar
                </label>
                <label className="col-span-2 flex items-center gap-1 text-xs text-[#A1A1AA]">
                  <input type="checkbox" checked={item.show_in_footer} onChange={e => updateItem(item.id, "show_in_footer", e.target.checked)} /> Rodapé
                </label>
                <button onClick={() => removeItem(item.id)} className="col-span-1 text-red-400 hover:text-red-500 justify-self-end"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
          <button onClick={addItem} className="mt-3 flex items-center gap-2 text-sm text-primary hover:text-primary/80"><Plus className="w-4 h-4" /> Adicionar link</button>
        </section>

        <section className="bg-[#18181B] rounded-2xl p-6 border border-white/[0.07] space-y-4">
          <h3 className="font-heading font-semibold">Botão WhatsApp & Rodapé</h3>
          <div>
            <label className="text-xs text-[#A1A1AA] block mb-1">Texto do botão WhatsApp (navbar)</label>
            <input value={config.nav_whatsapp_btn_text || ""} onChange={e => setConfig({ ...config, nav_whatsapp_btn_text: e.target.value })} className="w-full bg-[#27272A] border border-[#3F3F46] rounded px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#A1A1AA] block mb-1">Título coluna Navegação</label>
              <input value={config.footer_nav_title || ""} onChange={e => setConfig({ ...config, footer_nav_title: e.target.value })} className="w-full bg-[#27272A] border border-[#3F3F46] rounded px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-[#A1A1AA] block mb-1">Título coluna Contato</label>
              <input value={config.footer_contact_title || ""} onChange={e => setConfig({ ...config, footer_contact_title: e.target.value })} className="w-full bg-[#27272A] border border-[#3F3F46] rounded px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!config.footer_show_instagram} onChange={e => setConfig({ ...config, footer_show_instagram: e.target.checked })} /> Mostrar Instagram no rodapé</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!config.footer_show_whatsapp} onChange={e => setConfig({ ...config, footer_show_whatsapp: e.target.checked })} /> Mostrar WhatsApp no rodapé</label>
          </div>
        </section>

        <button onClick={saveAll} disabled={saving} className="btn-primary flex items-center gap-2"><Save className="w-4 h-4" /> {saving ? "Salvando..." : "Salvar tudo"}</button>
      </div>
    </AdminLayout>
  );
}
