import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, MessageCircle } from "lucide-react";
import { getSiteConfig, getNavItems, getSiteConfigSync, getNavItemsSync } from "@/lib/dataCache";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<any>(() => getSiteConfigSync());
  const [navItems, setNavItems] = useState<any[]>(() => getNavItemsSync().filter((n: any) => n.show_in_navbar));
  const location = useLocation();
  const isOpenRef = useRef(false);
  const [atTop, setAtTop] = useState(true);

  // Barra preta sólida no topo da página; vidro fosco ao rolar
  useEffect(() => {
    const onScroll = () => setAtTop(window.scrollY < 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Fechar menu ao trocar de rota
  useEffect(() => {
    if (isOpen) setIsOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Controlar overflow do body — com garantia de restauração
  useEffect(() => {
    isOpenRef.current = isOpen;
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Carregar do cache (instantâneo na 2ª+ visita)
  useEffect(() => {
    let cancelled = false;
    Promise.all([getSiteConfig(), getNavItems()]).then(([cfg, nav]) => {
      if (cancelled) return;
      setConfig(cfg);
      setNavItems((nav || []).filter((n: any) => n.show_in_navbar));
    });
    return () => { cancelled = true; };
  }, []);

  const waNum = config?.whatsapp_number || '5514997145610';
  const waMsg = encodeURIComponent(
    config?.whatsapp_message || 'Olá! Vim pelo site Le Ville Pet!'
  );
  const waText = config?.nav_whatsapp_btn_text || '💬 WhatsApp';

  const closeMenu = () => setIsOpen(false);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[9999] border-b border-[rgba(245,192,0,0.15)] shadow-lg transition-colors duration-300 ${
        atTop ? "" : "glass-dark"
      }`}
      style={{
        position: 'fixed',
        transform: 'translateZ(0)',
        isolation: 'isolate',
        ...(atTop ? { background: '#000000' } : null),
      }}
    >
      <div className="container mx-auto flex items-center justify-between h-16 lg:h-[72px] px-4">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 interactive rounded-lg"
          aria-label={config?.site_name || 'Le Ville Pet'}
        >
          <img
            src={config?.logo_url || "/images/logo-levillepet.png"}
            alt={config?.site_name || 'Le Ville Pet'}
            className="h-10 lg:h-[46px] rounded-lg"
            width={46}
            height={46}
            decoding="async"
          />
        </Link>

        {/* Links desktop */}
        <div className="hidden lg:flex items-center gap-1">
          {navItems.map((link) => {
            const active = location.pathname === link.path;
            return (
              <Link
                key={link.id}
                to={link.path}
                className={`relative px-3 py-2 rounded-lg text-[15px] transition-colors duration-200 ${
                  active ? "text-primary" : "text-white hover:text-primary"
                }`}
                style={{ fontFamily: 'Inter', fontWeight: 500 }}
              >
                {link.label}
                {active && (
                  <span
                    className="absolute bottom-0 left-3 right-3 h-0.5 bg-primary rounded-full"
                    style={{ animation: 'lineGrow 0.3s ease forwards' }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Botão WhatsApp desktop */}
        <div className="hidden lg:block">
          <a
            href={`https://wa.me/${waNum}?text=${waMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-sm py-2.5 px-5"
          >
            {waText}
          </a>
        </div>

        {/* Botão hamburguer mobile */}
        <button
          onClick={() => setIsOpen(true)}
          className="lg:hidden text-white p-2 -mr-2 min-h-11 min-w-11 flex items-center justify-center rounded-lg press"
          aria-label="Abrir menu"
          aria-expanded={isOpen}
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Overlay escuro mobile — fade próprio em vez de mount seco */}
      <div
        className={`fixed inset-0 bg-black/70 z-[9998] lg:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      {/* Drawer mobile */}
      <div
        className={`fixed top-0 right-0 h-dvh w-[280px] z-[10000] lg:hidden shadow-2xl overflow-y-auto ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{
          // Painel sólido: um drawer de navegação precisa de legibilidade
          // total, e blur em tela cheia é justamente o que derruba FPS no
          // celular. O glass fica reservado para a navbar.
          backgroundColor: '#0E0E10',
          borderLeft: '1px solid rgba(245,192,0,0.12)',
          transform: isOpen ? 'translate3d(0,0,0)' : 'translate3d(100%,0,0)',
          transition: 'transform var(--dur-base) var(--ease-out)',
        }}
        aria-hidden={!isOpen}
      >
        <div
          className="flex items-center justify-between p-4 border-b"
          style={{ borderColor: 'rgba(245,192,0,0.15)' }}
        >
          <span className="font-heading font-bold text-primary text-lg">
            {config?.site_name || 'Le Ville Pet'}
          </span>
          <button
            onClick={closeMenu}
            className="text-white p-2 min-h-11 min-w-11 flex items-center justify-center rounded-lg press"
            aria-label="Fechar menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-col py-4">
          {navItems.map((link, i) => (
            <Link
              key={link.id}
              to={link.path}
              className={`px-6 py-4 font-heading font-semibold text-xl press ${
                location.pathname === link.path
                  ? "text-primary bg-primary/10 border-l-[3px] border-primary"
                  : "text-white hover:text-primary hover:bg-primary/5"
              }`}
              style={{
                // Stagger só quando o drawer abre (o drawer fica montado para
                // permitir a transição de saída, então não podemos usar
                // animação de mount).
                opacity: isOpen ? 1 : 0,
                transform: isOpen ? 'translate3d(0,0,0)' : 'translate3d(16px,0,0)',
                transition: `opacity var(--dur-base) var(--ease-out) ${isOpen ? i * 40 : 0}ms, transform var(--dur-base) var(--ease-out) ${isOpen ? i * 40 : 0}ms, color var(--dur-fast) var(--ease-out), background-color var(--dur-fast) var(--ease-out)`,
              }}
              tabIndex={isOpen ? 0 : -1}
            >
              {link.label}
            </Link>
          ))}

          <div className="px-6 pt-4">
            <a
              href={`https://wa.me/${waNum}?text=${waMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-[#25D366] text-white font-heading font-bold text-base w-full py-3.5 rounded-xl hover:bg-[#128C7E] interactive"
              tabIndex={isOpen ? 0 : -1}
            >
              <MessageCircle className="w-5 h-5" /> Fale no WhatsApp
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
