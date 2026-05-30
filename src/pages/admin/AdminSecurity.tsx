import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export default function AdminSecurity() {
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) setEmail(user.email);
    });
  }, []);

  const handleChangePassword = async () => {
    setError("");
    if (!email) return;
    if (newPassword.length < 6) { setError("A nova senha deve ter pelo menos 6 caracteres"); return; }
    if (newPassword !== confirmPassword) { setError("As senhas não coincidem"); return; }

    setSaving(true);
    // Re-authenticate to ensure user knows current password
    const { error: signErr } = await supabase.auth.signInWithPassword({ email, password: currentPassword });
    if (signErr) {
      setError("Senha atual incorreta");
      setSaving(false);
      return;
    }
    const { error: updErr } = await supabase.auth.updateUser({ password: newPassword });
    if (updErr) {
      setError(updErr.message);
    } else {
      toast({ title: "✅ Senha alterada com sucesso" });
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    if (confirm("Deseja encerrar a sessão?")) {
      await supabase.auth.signOut();
      navigate("/");
    }
  };

  return (
    <AdminLayout title="Segurança">
      <div className="max-w-lg space-y-8">
        <div className="bg-[#18181B] rounded-2xl p-5 border border-white/[0.07]">
          <h3 className="font-heading font-semibold text-sm mb-2">Sessão Atual</h3>
          <p className="text-[#A1A1AA] text-sm mb-4">Conectado como <span className="text-white">{email || "..."}</span></p>
          <button onClick={handleLogout} className="px-4 py-2 text-sm bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors">
            Encerrar Sessão
          </button>
        </div>

        <div className="bg-[#18181B] rounded-2xl p-5 border border-white/[0.07]">
          <h3 className="font-heading font-semibold text-sm mb-4">Alterar Senha</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-[#A1A1AA] uppercase tracking-wider mb-1 block">Senha atual</label>
              <input type="password" value={currentPassword} onChange={e => { setCurrentPassword(e.target.value); setError(""); }}
                className="w-full bg-[#27272A] border border-[#3F3F46] rounded-lg px-3 py-2 text-sm text-white" />
            </div>
            <div>
              <label className="text-xs text-[#A1A1AA] uppercase tracking-wider mb-1 block">Nova senha</label>
              <input type="password" value={newPassword} onChange={e => { setNewPassword(e.target.value); setError(""); }}
                className="w-full bg-[#27272A] border border-[#3F3F46] rounded-lg px-3 py-2 text-sm text-white" />
            </div>
            <div>
              <label className="text-xs text-[#A1A1AA] uppercase tracking-wider mb-1 block">Confirmar nova senha</label>
              <input type="password" value={confirmPassword} onChange={e => { setConfirmPassword(e.target.value); setError(""); }}
                className="w-full bg-[#27272A] border border-[#3F3F46] rounded-lg px-3 py-2 text-sm text-white" />
            </div>
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <p className="text-[#71717A] text-xs">🔒 Autenticação real via Supabase Auth com proteção contra senhas vazadas (HIBP).</p>
            <button onClick={handleChangePassword} disabled={saving} className="btn-primary text-sm w-full">
              {saving ? "Salvando..." : "Alterar Senha"}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
