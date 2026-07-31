import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const networks = [
  { key: "instagram", activeKey: "instagram_active", label: "Instagram", urlKey: "instagram_url", handleKey: "instagram_handle", btnKey: "instagram_btn_text" },
  { key: "whatsapp", activeKey: "whatsapp_active", label: "WhatsApp", urlKey: "whatsapp_number", handleKey: null, btnKey: "whatsapp_btn_text" },
  { key: "facebook", activeKey: "facebook_active", label: "Facebook", urlKey: "facebook_url", handleKey: "facebook_handle", btnKey: "facebook_btn_text" },
  { key: "tiktok", activeKey: "tiktok_active", label: "TikTok", urlKey: "tiktok_url", handleKey: "tiktok_handle", btnKey: "tiktok_btn_text" },
  { key: "youtube", activeKey: "youtube_active", label: "YouTube", urlKey: "youtube_url", handleKey: "youtube_handle", btnKey: "youtube_btn_text" },
];

export default function AdminSocial() {
  const [config, setConfig] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    supabase.from("site_config").select("*").limit(1).single().then(({ data }) => { if (data) setConfig(data); });
  }, []);

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    const { error } = await supabase.from("site_config").update(config).eq("id", config.id);
    toast({ title: error ? "Erro ao salvar" : "✅ Redes sociais salvas!" });
    setSaving(false);
  };

  if (!config) return <AdminLayout title="Redes Sociais"><div className="text-[#71717A]">Carregando...</div></AdminLayout>;

  return (
    <AdminLayout title="Redes Sociais">
      <div className="max-w-2xl space-y-6">
        {networks.map(n => (
          <div key={n.key} className="bg-[#18181B] rounded-2xl p-5 border border-white/[0.07]">
            <div className="flex items-center justify-between mb-4">
              <span className="font-heading font-semibold text-white">{n.label}</span>
              <button onClick={() => setConfig({...config, [n.activeKey]: !config[n.activeKey]})}
                className={`w-10 h-6 rounded-full transition-colors ${config[n.activeKey] ? "bg-primary" : "bg-[#3F3F46]"}`}>
                <div className={`w-4 h-4 bg-white rounded-full transition-transform mx-1 ${config[n.activeKey] ? "translate-x-4" : ""}`} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-[#A1A1AA] mb-1 block">{n.key === "whatsapp" ? "Número" : "URL"}</label>
                <input value={config[n.urlKey] || ""} onChange={e => setConfig({...config, [n.urlKey]: e.target.value})}
                  placeholder={n.key === "whatsapp" ? "5514997145610" : `https://${n.key}.com/...`}
                  className="w-full bg-[#27272A] border border-[#3F3F46] rounded-lg px-3 py-2 text-sm text-white" />
              </div>
              {n.handleKey && (
                <div>
                  <label className="text-xs text-[#A1A1AA] mb-1 block">Handle / @</label>
                  <input value={config[n.handleKey] || ""} onChange={e => setConfig({...config, [n.handleKey]: e.target.value})}
                    placeholder={`@seu${n.key}`}
                    className="w-full bg-[#27272A] border border-[#3F3F46] rounded-lg px-3 py-2 text-sm text-white" />
                </div>
              )}
              <div>
                <label className="text-xs text-[#A1A1AA] mb-1 block">Texto do Botão</label>
                <input value={config[n.btnKey] || ""} onChange={e => setConfig({...config, [n.btnKey]: e.target.value})}
                  placeholder={`Seguir no ${n.label}`}
                  className="w-full bg-[#27272A] border border-[#3F3F46] rounded-lg px-3 py-2 text-sm text-white" />
              </div>
            </div>
          </div>
        ))}
        <div className="flex justify-end pt-4">
          <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">{saving ? "Salvando..." : "💾 Salvar"}</button>
        </div>
      </div>
    </AdminLayout>
  );
}
