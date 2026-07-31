import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { MediaUploader } from "@/components/MediaUploader";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";

const FONTS = ["Poppins", "Inter", "Roboto", "Montserrat", "Playfair Display", "Lato", "Open Sans", "Nunito"];

export default function AdminBranding() {
  const [c, setC] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    supabase.from("site_config").select("logo_url,favicon_url,primary_color,secondary_color,font_heading,font_body,site_name,site_slogan").limit(1).maybeSingle().then(({ data }) => {
      setC(data || {});
      setLoading(false);
    });
  }, []);

  const save = async () => {
    setSaving(true);
    await supabase.from("site_config").update(c).neq("id", "00000000-0000-0000-0000-000000000000");
    setSaving(false);
    toast({ title: "✅ Identidade visual salva!" });
  };

  if (loading) return <AdminLayout title="Branding"><p className="text-[#A1A1AA]">Carregando...</p></AdminLayout>;

  return (
    <AdminLayout title="Marca & Identidade">
      <div className="space-y-6 max-w-3xl">
        <section className="bg-[#18181B] rounded-2xl p-6 border border-white/[0.07] space-y-4">
          <h3 className="font-heading font-semibold mb-3">Identidade</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#A1A1AA] block mb-1">Nome do site</label>
              <input value={c.site_name || ""} onChange={e => setC({ ...c, site_name: e.target.value })} className="w-full bg-[#27272A] border border-[#3F3F46] rounded px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-[#A1A1AA] block mb-1">Slogan</label>
              <input value={c.site_slogan || ""} onChange={e => setC({ ...c, site_slogan: e.target.value })} className="w-full bg-[#27272A] border border-[#3F3F46] rounded px-3 py-2 text-sm" />
            </div>
          </div>
        </section>

        <section className="bg-[#18181B] rounded-2xl p-6 border border-white/[0.07] grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-heading font-semibold mb-3">Logo</h4>
            <MediaUploader accept="image" pathPrefix="branding/logo" currentUrl={c.logo_url} onUploaded={(url) => setC({ ...c, logo_url: url })} />
          </div>
          <div>
            <h4 className="font-heading font-semibold mb-3">Favicon</h4>
            <MediaUploader accept="image" pathPrefix="branding/favicon" currentUrl={c.favicon_url} onUploaded={(url) => setC({ ...c, favicon_url: url })} />
          </div>
        </section>

        <section className="bg-[#18181B] rounded-2xl p-6 border border-white/[0.07]">
          <h3 className="font-heading font-semibold mb-4">Cores</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[#A1A1AA] block mb-1">Cor primária</label>
              <div className="flex gap-2">
                <input type="color" value={c.primary_color || "#F5C000"} onChange={e => setC({ ...c, primary_color: e.target.value })} className="h-10 w-14 rounded border border-[#3F3F46] bg-transparent" />
                <input value={c.primary_color || ""} onChange={e => setC({ ...c, primary_color: e.target.value })} className="flex-1 bg-[#27272A] border border-[#3F3F46] rounded px-3 py-2 text-sm font-mono" />
              </div>
            </div>
            <div>
              <label className="text-xs text-[#A1A1AA] block mb-1">Cor secundária (fundo)</label>
              <div className="flex gap-2">
                <input type="color" value={c.secondary_color || "#09090B"} onChange={e => setC({ ...c, secondary_color: e.target.value })} className="h-10 w-14 rounded border border-[#3F3F46] bg-transparent" />
                <input value={c.secondary_color || ""} onChange={e => setC({ ...c, secondary_color: e.target.value })} className="flex-1 bg-[#27272A] border border-[#3F3F46] rounded px-3 py-2 text-sm font-mono" />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#18181B] rounded-2xl p-6 border border-white/[0.07]">
          <h3 className="font-heading font-semibold mb-4">Tipografia</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[#A1A1AA] block mb-1">Fonte dos títulos</label>
              <select value={c.font_heading || "Poppins"} onChange={e => setC({ ...c, font_heading: e.target.value })} className="w-full bg-[#27272A] border border-[#3F3F46] rounded px-3 py-2 text-sm">
                {FONTS.map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-[#A1A1AA] block mb-1">Fonte do corpo</label>
              <select value={c.font_body || "Inter"} onChange={e => setC({ ...c, font_body: e.target.value })} className="w-full bg-[#27272A] border border-[#3F3F46] rounded px-3 py-2 text-sm">
                {FONTS.map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
          </div>
        </section>

        <button onClick={save} disabled={saving} className="btn-primary flex items-center gap-2"><Save className="w-4 h-4" /> {saving ? "Salvando..." : "Salvar identidade"}</button>
      </div>
    </AdminLayout>
  );
}
