import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { MediaUploader } from "@/components/MediaUploader";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { invalidateCache } from "@/lib/dataCache";
import { ExternalLink, Power } from "lucide-react";
import { Switch } from "@/components/ui/switch";

type FieldProps = { label: string; field: string; type?: string; config: any; setConfig: (v: any) => void };
const Field = ({ label, field, type, config, setConfig }: FieldProps) => (
  <div>
    <label className="text-xs text-[#A1A1AA] uppercase tracking-wider font-heading mb-1 block">{label}</label>
    {type === "textarea" ? (
      <textarea value={config[field] || ""} onChange={e => setConfig({...config, [field]: e.target.value})} rows={2} className="w-full bg-[#27272A] border border-[#3F3F46] rounded-lg px-3 py-2 text-sm text-white resize-y" />
    ) : (
      <input value={config[field] || ""} onChange={e => setConfig({...config, [field]: e.target.value})} className="w-full bg-[#27272A] border border-[#3F3F46] rounded-lg px-3 py-2 text-sm text-white" />
    )}
  </div>
);

export default function AdminConfig() {
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
    invalidateCache("site_config");
    toast({ title: error ? "Erro ao salvar" : "✅ Configurações salvas!" });
    setSaving(false);
  };

  if (!config) return <AdminLayout title="Configurações Gerais"><div className="text-[#71717A]">Carregando...</div></AdminLayout>;


  return (
    <AdminLayout title="Configurações Gerais">
      <div className="max-w-2xl space-y-6">
        {/* Maintenance Mode */}
        <div className="bg-[#18181B] rounded-2xl p-6 border border-white/[0.07]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${config.maintenance_mode ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                <Power className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-white text-sm">Modo de Manutenção</h3>
                <p className="text-xs text-[#71717A]">Quando ativo, visitantes verão uma página de espera.</p>
              </div>
            </div>
            <Switch 
              checked={config.maintenance_mode || false} 
              onCheckedChange={(checked) => setConfig({ ...config, maintenance_mode: checked })}
            />
          </div>
          {config.maintenance_mode && (
            <div className="mt-4 p-3 bg-red-500/5 border border-red-500/10 rounded-xl">
              <p className="text-[10px] text-red-400 font-heading uppercase tracking-wider">Aviso importante</p>
              <p className="text-xs text-red-200/70 mt-1">O site está inacessível para o público. Apenas quem souber o código secreto poderá entrar.</p>
            </div>
          )}
        </div>

        {/* Identity */}
        <div className="bg-[#18181B] rounded-2xl p-6 border border-white/[0.07]">
          <h3 className="font-heading font-semibold text-white text-sm mb-4">Identidade</h3>
          <div className="space-y-4">
            <Field config={config} setConfig={setConfig} label="Nome do Petshop" field="site_name" />
            <Field config={config} setConfig={setConfig} label="Slogan" field="site_slogan" />
          </div>
        </div>

        {/* Logo */}
        <div className="bg-[#18181B] rounded-2xl p-6 border border-white/[0.07]">
          <h3 className="font-heading font-semibold text-white text-sm mb-4">Logo</h3>
          <div className="flex items-center gap-4">
            {config.logo_url ? (
              <img src={config.logo_url} alt="Logo" className="h-16 w-16 rounded-lg object-contain bg-[#27272A]" />
            ) : (
              <div className="h-16 w-16 rounded-lg bg-[#27272A] flex items-center justify-center text-[#71717A] text-xs">Sem logo</div>
            )}
            <div className="flex-1">
              <MediaUploader accept="image" compact pathPrefix="branding/logo" currentUrl={config.logo_url} onUploaded={(url) => setConfig({ ...config, logo_url: url })} label="" />
            </div>
          </div>
          {config.logo_url && (
            <button onClick={() => setConfig({...config, logo_url: ''})} className="text-xs text-red-400 mt-2 hover:underline">Remover logo</button>
          )}
        </div>

        {/* WhatsApp & Telefone */}
        <div className="bg-[#18181B] rounded-2xl p-6 border border-white/[0.07]">
          <h3 className="font-heading font-semibold text-white text-sm mb-4">Telefones & WhatsApp</h3>
          <div className="space-y-4">
            <Field config={config} setConfig={setConfig} label="📞 Telefone Fixo (ex: (14) 3204-7040)" field="fixed_phone" />
            <Field config={config} setConfig={setConfig} label="WhatsApp — Número (apenas dígitos, ex: 5514997145610)" field="whatsapp_number" />
            <Field config={config} setConfig={setConfig} label="Mensagem padrão WhatsApp" field="whatsapp_message" type="textarea" />
          </div>
        </div>

        {/* Address */}
        <div className="bg-[#18181B] rounded-2xl p-6 border border-white/[0.07]">
          <h3 className="font-heading font-semibold text-white text-sm mb-4">Localização</h3>
          <div className="space-y-4">
            <Field config={config} setConfig={setConfig} label="Endereço Linha 1 (nome do local)" field="address_line1" />
            <Field config={config} setConfig={setConfig} label="Endereço Linha 2 (rua e número)" field="address_line2" />
            <Field config={config} setConfig={setConfig} label="Endereço Linha 3 (bairro, cidade, CEP)" field="address_line3" />
            <Field config={config} setConfig={setConfig} label="Link Google Maps" field="google_maps_url" />
            <Field config={config} setConfig={setConfig} label="Google Maps Embed URL (para iframe)" field="google_maps_embed" />
            {config.google_maps_url && (
              <a href={config.google_maps_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs text-primary hover:underline">
                <ExternalLink className="w-3.5 h-3.5" /> Testar link do Maps
              </a>
            )}
          </div>
        </div>

        {/* Instagram */}
        <div className="bg-[#18181B] rounded-2xl p-6 border border-white/[0.07]">
          <h3 className="font-heading font-semibold text-white text-sm mb-4">Instagram</h3>
          <Field config={config} setConfig={setConfig} label="URL do Instagram" field="instagram_url" />
        </div>

        {/* Footer */}
        <div className="bg-[#18181B] rounded-2xl p-6 border border-white/[0.07]">
          <h3 className="font-heading font-semibold text-white text-sm mb-4">Footer</h3>
          <div className="space-y-4">
            <Field config={config} setConfig={setConfig} label="Descrição curta no footer" field="footer_description" type="textarea" />
            <Field config={config} setConfig={setConfig} label="Texto de copyright" field="copyright_text" />
          </div>
        </div>

        {/* Fale Conosco page */}
        <div className="bg-[#18181B] rounded-2xl p-6 border border-white/[0.07]">
          <h3 className="font-heading font-semibold text-white text-sm mb-4">Página Fale Conosco</h3>
          <div className="space-y-4">
            <Field config={config} setConfig={setConfig} label="Título da página" field="faleconosco_title" />
            <Field config={config} setConfig={setConfig} label="Subtítulo" field="faleconosco_subtitle" />
            <Field config={config} setConfig={setConfig} label="Título do card WhatsApp" field="faleconosco_card_title" />
            <Field config={config} setConfig={setConfig} label="Texto do card" field="faleconosco_card_text" type="textarea" />
            <Field config={config} setConfig={setConfig} label="Texto do botão" field="faleconosco_btn_text" />
            <div>
              <label className="text-xs text-[#A1A1AA] uppercase tracking-wider font-heading mb-2 block">Imagem ou vídeo lateral</label>
              <MediaUploader accept="both" pathPrefix="fale-conosco/media" currentUrl={config.faleconosco_image_url} onUploaded={(url) => setConfig({ ...config, faleconosco_image_url: url })} label="" />
            </div>
          </div>
        </div>

        {/* Localização page */}
        <div className="bg-[#18181B] rounded-2xl p-6 border border-white/[0.07]">
          <h3 className="font-heading font-semibold text-white text-sm mb-4">Página Localização</h3>
          <div className="space-y-4">
            <Field config={config} setConfig={setConfig} label="Título" field="localizacao_title" />
            <Field config={config} setConfig={setConfig} label="Subtítulo" field="localizacao_subtitle" />
            <Field config={config} setConfig={setConfig} label="Texto botão Maps" field="localizacao_maps_btn_text" />
            <Field config={config} setConfig={setConfig} label="Texto botão Rota" field="localizacao_route_btn_text" />
            <Field config={config} setConfig={setConfig} label="Texto 'Como Chegar'" field="localizacao_howto_text" type="textarea" />
          </div>
        </div>

        {/* Hero images for sub-pages */}
        <div className="bg-[#18181B] rounded-2xl p-6 border border-white/[0.07]">
          <h3 className="font-heading font-semibold text-white text-sm mb-4">🖼️ Imagens do Hero (topo das páginas)</h3>
          <p className="text-xs text-[#71717A] mb-4">Imagem ou vídeo de fundo do topo de cada página. Deixe em branco para fundo preto padrão.</p>
          <div className="space-y-5">
            {[
              { f: "fotos_hero_image_url", l: "Página Fotos" },
              { f: "videos_hero_image_url", l: "Página Vídeos" },
              { f: "localizacao_hero_image_url", l: "Página Localização" },
              { f: "faleconosco_hero_image_url", l: "Página Fale Conosco" },
              { f: "hotel_hero_image_url", l: "Página Hotelzinho" },
              { f: "conhecer_hero_image_url", l: "Página Venha Nos Conhecer" },
              { f: "hero_bg_image_url", l: "Hero da Home (Inicial)" },
            ].map(({ f, l }) => (
              <div key={f}>
                <label className="text-xs text-[#A1A1AA] uppercase tracking-wider font-heading mb-2 block">{l}</label>
                <MediaUploader accept="both" pathPrefix={`hero/${f}`} currentUrl={config[f]} onUploaded={(url) => setConfig({ ...config, [f]: url })} label="" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-4">
          <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">{saving ? "Salvando..." : "💾 Salvar Tudo"}</button>
        </div>
      </div>
    </AdminLayout>
  );
}
