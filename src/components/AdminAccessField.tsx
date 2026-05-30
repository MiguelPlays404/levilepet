import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { createAdminSession } from "@/lib/adminSession";

export function AdminAccessField() {
  const [value, setValue] = useState("");
  const navigate = useNavigate();

  const handleCheck = async () => {
    if (!value.trim()) return;
    
    const { data } = await supabase.from("site_config").select("admin_code").limit(1).single();
    const code = data?.admin_code || "190103";
    
    if (value.trim() === code) {
      setValue("✓");
      createAdminSession();
      setTimeout(() => navigate("/admin"), 400);
    } else {
      setValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleCheck();
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] text-text-muted uppercase tracking-wider font-body">
        Personalize sua visita
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Seu nome..."
          className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-md px-3 py-2 text-[13px] text-text-on-dark-muted font-body w-36 focus:outline-none focus:border-primary/50 transition-colors"
        />
        <button
          onClick={handleCheck}
          className="w-9 h-9 flex items-center justify-center bg-[#1A1A1A] border border-[#2A2A2A] rounded-md text-text-muted hover:text-primary hover:border-primary/30 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
