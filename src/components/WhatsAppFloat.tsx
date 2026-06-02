import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { getSiteConfig } from "@/lib/dataCache";

type Config = { whatsapp_number?: string; whatsapp_message?: string; site_name?: string };

export function WhatsAppFloat() {
  const [config, setConfig] = useState<Config | null>(null);

  useEffect(() => {
    let cancelled = false;
    getSiteConfig().then((data) => {
      if (!cancelled) setConfig(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const waNum = config?.whatsapp_number || "5514997145610";
  const waMsg = encodeURIComponent(config?.whatsapp_message || "Olá! Vim pelo site Le Ville Pet 🐾");

  return (
    <a
      href={`https://wa.me/${waNum}?text=${waMsg}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className="group fixed bottom-5 right-4 z-[10000] flex h-[60px] w-[60px] items-center justify-center rounded-full bg-whatsapp text-white whatsapp-fab transition-transform duration-200 hover:-translate-y-1 lg:bottom-6 lg:right-6"
    >
      <MessageCircle className="h-7 w-7" />
      <span className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-2xl border border-white/10 bg-slate-950/90 px-3 py-2 text-sm text-white shadow-xl opacity-0 backdrop-blur-xl transition-opacity group-hover:opacity-100 lg:block">
        Fale conosco
      </span>
    </a>
  );
}
