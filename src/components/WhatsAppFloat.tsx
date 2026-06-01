import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { getSiteConfig } from "@/lib/dataCache";

export function WhatsAppFloat() {
  const [config, setConfig] = useState<{ whatsapp_number?: string; whatsapp_message?: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    getSiteConfig().then((data) => {
      if (!cancelled) setConfig(data);
    });
    return () => { cancelled = true; };
  }, []);

  const waNum = config?.whatsapp_number || "5514997145610";
  const waMsg = encodeURIComponent(config?.whatsapp_message || "Olá! Vim pelo site Le Ville Pet!");

  return (
    <a
      href={`https://wa.me/${waNum}?text=${waMsg}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-4 lg:bottom-6 lg:right-6 z-[9999] w-[60px] h-[60px] rounded-full bg-whatsapp flex items-center justify-center shadow-lg whatsapp-fab group"
      aria-label="Fale Conosco no WhatsApp"
    >
      <MessageCircle className="w-7 h-7 text-text-on-dark" />
      <span className="absolute right-full mr-3 bg-surface-dark text-text-on-dark text-sm font-body px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none hidden lg:block">
        Fale Conosco!
      </span>
    </a>
  );
}
