import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { destroyAdminSession, getSessionAge } from "@/lib/adminSession";
import { useNavigate } from "react-router-dom";

export default function AdminSecurity() {
  const [config, setConfig] = useState<any>(null);
  const [currentCode, setCurrentCode] = useState("");
  const [newCode, setNewCode] = useState("");
  const [confirmCode, setConfirmCode] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.from("site_config").select("*").limit(1).single().then(({ data }) => { if (data) setConfig(data); });
  }, []);

  const sessionAge = getSessionAge();
  const sessionMinutes = Math.floor(sessionAge / 60000);
  const sessionText = sessionMinutes < 60 ? `${sessionMinutes} minutos` : `${Math.floor(sessionMinutes / 60)} horas e ${sessionMinutes % 60} minutos`;

  const handleChangeCode = async () => {
    setError("");
    if (!config) return;
    if (currentCode !== config.admin_code) { setError("Código atual incorreto"); return; }
    if (newCode.length < 4) { setError("Novo código deve ter pelo menos 4 caracteres"); return; }
    if (newCode !== confirmCode) { setError("Os códigos não coincidem"); return; }

    setSaving(true);
    const { error: err } = await supabase.from("site_config").update({ admin_code: newCode }).eq("id", config.id);
    if (!err) {
      toast({ title: "✅ Código alterado! Use o novo código na próxima entrada." });
      setCurrentCode(""); setNewCode(""); setConfirmCode("");
      setConfig({ ...config, admin_code: newCode });
    } else {
      toast({ title: "Erro ao alterar código" });
    }
    setSaving(false);
  };

  const handleLogout = () => {
    if (confirm("Deseja encerrar a sessão?")) {
      destroyAdminSession();
      navigate("/");
    }
  };

  return (
    <AdminLayout title="Segurança">
      <div className="max-w-lg space-y-8">
        <div className="bg-[#18181B] rounded-2xl p-5 border border-white/[0.07]">
          <h3 className="font-heading font-semibold text-sm mb-2">Sessão Atual</h3>
          <p className="text-[#A1A1AA] text-sm mb-4">Você está conectado há {sessionText}.</p>
          <button onClick={handleLogout} className="px-4 py-2 text-sm bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors">
            Encerrar Sessão
          </button>
        </div>

        <div className="bg-[#18181B] rounded-2xl p-5 border border-white/[0.07]">
          <h3 className="font-heading font-semibold text-sm mb-4">Alterar Código de Acesso</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-[#A1A1AA] uppercase tracking-wider mb-1 block">Código atual</label>
              <input type="password" value={currentCode} onChange={e => { setCurrentCode(e.target.value); setError(""); }}
                className="w-full bg-[#27272A] border border-[#3F3F46] rounded-lg px-3 py-2 text-sm text-white" />
            </div>
            <div>
              <label className="text-xs text-[#A1A1AA] uppercase tracking-wider mb-1 block">Novo código</label>
              <input type="password" value={newCode} onChange={e => { setNewCode(e.target.value); setError(""); }}
                className="w-full bg-[#27272A] border border-[#3F3F46] rounded-lg px-3 py-2 text-sm text-white" />
            </div>
            <div>
              <label className="text-xs text-[#A1A1AA] uppercase tracking-wider mb-1 block">Confirmar novo código</label>
              <input type="password" value={confirmCode} onChange={e => { setConfirmCode(e.target.value); setError(""); }}
                className="w-full bg-[#27272A] border border-[#3F3F46] rounded-lg px-3 py-2 text-sm text-white" />
            </div>
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <p className="text-[#71717A] text-xs">⚠️ Anote o novo código em lugar seguro</p>
            <button onClick={handleChangeCode} disabled={saving} className="btn-primary text-sm w-full">
              {saving ? "Salvando..." : "Alterar Código"}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
