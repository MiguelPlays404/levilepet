import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NavigationProgress } from "@/components/NavigationProgress";
import { PageTransition } from "@/components/PageTransition";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { MaintenanceGuard } from "@/components/MaintenanceGuard";
import { RoutePersistence } from "@/components/RoutePersistence";
import { SecurityHeaders } from "@/components/SecurityHeaders";
import { ScrollToTop } from "@/components/ScrollToTop";
import Index from "./pages/Index";
import { lazy, Suspense, useEffect } from "react";

/**
 * Lazy com prefetch: além de criar o componente lazy, expõe `.preload()`
 * para que possamos disparar o carregamento do chunk em idle — assim, quando
 * o usuário clica num link, o chunk já está em cache e não há Suspense → sem
 * flash de tela branca, transição instantânea e suave.
 */
function lazyWithPreload<T extends { default: React.ComponentType<any> }>(factory: () => Promise<T>) {
  const Component = lazy(factory) as React.LazyExoticComponent<T["default"]> & { preload: () => Promise<T> };
  Component.preload = factory;
  return Component;
}

// Páginas públicas secundárias — carregadas sob demanda (com prefetch em idle)
const FaleConosco = lazyWithPreload(() => import("./pages/FaleConosco"));
const Hotelzinho = lazyWithPreload(() => import("./pages/Hotelzinho"));
const Transporte = lazyWithPreload(() => import("./pages/Transporte"));
const VenhaNosConhecer = lazyWithPreload(() => import("./pages/VenhaNosConhecer"));
const Localizacao = lazyWithPreload(() => import("./pages/Localizacao"));
const Fotos = lazyWithPreload(() => import("./pages/Fotos"));
const Videos = lazyWithPreload(() => import("./pages/Videos"));
const SigaNos = lazyWithPreload(() => import("./pages/SigaNos"));
const Albuns = lazyWithPreload(() => import("./pages/Albuns"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Manutencao = lazy(() => import("./pages/Manutencao"));
const OAuthConsent = lazy(() => import("./pages/OAuthConsent"));
// Admin — nunca carregado pelo público
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminPhotos = lazy(() => import("./pages/admin/AdminPhotos"));
const AdminVideos = lazy(() => import("./pages/admin/AdminVideos"));
const AdminHotelzinho = lazy(() => import("./pages/admin/AdminHotelzinho"));
const AdminConhecer = lazy(() => import("./pages/admin/AdminConhecer"));
const AdminConfig = lazy(() => import("./pages/admin/AdminConfig"));
const AdminSocial = lazy(() => import("./pages/admin/AdminSocial"));
const AdminSecurity = lazy(() => import("./pages/admin/AdminSecurity"));
const AdminHome = lazy(() => import("./pages/admin/AdminHome"));
const AdminNavbarFooter = lazy(() => import("./pages/admin/AdminNavbarFooter"));
const AdminBranding = lazy(() => import("./pages/admin/AdminBranding"));
const AdminPageTexts = lazy(() => import("./pages/admin/AdminPageTexts"));
const AdminGuia = lazy(() => import("./pages/admin/AdminGuia"));
const AdminDestaques = lazy(() => import("./pages/admin/AdminDestaques"));
const AdminTransporte = lazy(() => import("./pages/admin/AdminTransporte"));
const AdminAgendamento = lazy(() => import("./pages/admin/AdminAgendamento"));
const AdminHojeNoLeVille = lazy(() => import("./pages/admin/AdminHojeNoLeVille"));
const AdminVagas = lazy(() => import("./pages/admin/AdminVagas"));
const AdminBackup = lazy(() => import("./pages/admin/AdminBackup"));
const AdminAlbuns = lazy(() => import("./pages/admin/AdminAlbuns"));
const AdminDownloads = lazy(() => import("./pages/admin/AdminDownloads"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminShell = lazy(() =>
  import("./components/AdminLayout").then((m) => ({ default: m.AdminShell }))
);

/**
 * Prefetch por intenção: qualquer link interno recebe o download do seu chunk
 * assim que o mouse passa por cima (ou o dedo encosta) — a navegação vira
 * instantânea, sem Suspense. Um único listener delegado no documento.
 */
function installHoverPrefetch() {
  const onIntent = (e: Event) => {
    const target = e.target as HTMLElement | null;
    const anchor = target?.closest?.("a[href^='/']") as HTMLAnchorElement | null;
    if (anchor) prefetchRoute(anchor.getAttribute("href") || undefined);
  };
  document.addEventListener("pointerover", onIntent, { passive: true });
  document.addEventListener("touchstart", onIntent, { passive: true });
  document.addEventListener("focusin", onIntent, { passive: true });
}

/**
 * Recovery automático para "Failed to fetch dynamically imported module"
 * (acontece quando o usuário tem uma aba aberta após um redeploy e os
 * hashes dos chunks mudaram). Recarrega a página UMA vez para pegar o
 * novo bundle — sem loop infinito.
 */
function installChunkErrorRecovery() {
  const RELOAD_FLAG = "__lvp_chunk_reload_at";
  const isChunkErr = (msg: string) =>
    /Failed to fetch dynamically imported module/i.test(msg) ||
    /Importing a module script failed/i.test(msg) ||
    /ChunkLoadError/i.test(msg);

  const tryReload = (msg: string) => {
    if (!isChunkErr(msg)) return;
    const last = Number(sessionStorage.getItem(RELOAD_FLAG) || 0);
    // Evita loop: só recarrega se já passaram >10s desde o último auto-reload.
    if (Date.now() - last < 10_000) return;
    sessionStorage.setItem(RELOAD_FLAG, String(Date.now()));
    window.location.reload();
  };

  window.addEventListener("error", (e) => tryReload(String(e?.message || "")));
  window.addEventListener("unhandledrejection", (e) =>
    tryReload(String((e as any)?.reason?.message || (e as any)?.reason || ""))
  );
}

import { getSiteConfig, prewarmCache } from "./lib/dataCache";
import { prefetchAllPublicRoutes, prefetchRoute } from "./lib/routePrefetch";

function BrandingApplier() {
  useEffect(() => {
    // Pré-aquece o cache em background assim que o app monta
    prewarmCache();
    // Pré-carrega chunks públicos em idle → navegação sem Suspense/flash branco
    prefetchAllPublicRoutes();
    installHoverPrefetch();
    // Recovery automático para chunks ausentes após redeploy
    installChunkErrorRecovery();

    getSiteConfig().then((data) => {
        if (!data) return;
        if (data.favicon_url) {
          let link = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;
          if (!link) {
            link = document.createElement("link");
            link.rel = "icon";
            document.head.appendChild(link);
          }
          link.href = data.favicon_url;
        }
        if (data.font_heading || data.font_body) {
          const fams = [data.font_heading, data.font_body]
            .filter(Boolean)
            .map((f) => `family=${encodeURIComponent(f!)}:wght@400;500;600;700&`)
            .join("");
          const id = "dynamic-fonts";
          let s = document.getElementById(id) as HTMLLinkElement | null;
          if (!s) {
            s = document.createElement("link");
            s.id = id;
            s.rel = "stylesheet";
            document.head.appendChild(s);
          }
          s.href = `https://fonts.googleapis.com/css2?${fams}display=swap`;
        }
      });
  }, []);
  return null;
}

/** Fallback global do Suspense — só aparece se um chunk demorar a carregar.
 *  Cobre a viewport com um fundo neutro e um spinner discreto da marca,
 *  evitando o flash de tela branca quando o prefetch ainda não terminou. */
function GlobalSuspenseFallback() {
  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center pointer-events-none"
      style={{
        background: 'rgba(9, 9, 11, 0.35)',
        backdropFilter: 'blur(2px)',
        WebkitBackdropFilter: 'blur(2px)',
        opacity: 0,
        animation: 'fadeInDelayed 0.5s ease 0.25s forwards',
      }}
    >
      <div
        className="w-10 h-10 rounded-full border-2 border-primary/20"
        style={{ borderTopColor: '#F5C000', animation: 'spinSmooth 0.9s linear infinite' }}
      />
    </div>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Evita refetch excessivo em navegações rápidas
      staleTime: 30_000,
      gcTime: 5 * 60_000,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        {/* ScrollToTop: rola para o topo em toda troca de rota */}
        <ScrollToTop />
        <SecurityHeaders />
        <BrandingApplier />
        <NavigationProgress />
        <RoutePersistence>
          <MaintenanceGuard>
            {/*
              PageTransition envolve TODAS as rotas UMA VEZ (não por rota).
              Isso garante que a mesma instância persiste entre navegações,
              eliminando race conditions de mount/unmount.
            */}
            <PageTransition>
              <Suspense fallback={<GlobalSuspenseFallback />}>
                <Routes>
                  {/* Rotas públicas */}
                  <Route path="/" element={<Index />} />
                  <Route path="/manutencao" element={<Manutencao />} />
                  <Route path="/.lovable/oauth/consent" element={<OAuthConsent />} />
                  <Route path="/fale-conosco" element={<FaleConosco />} />
                  <Route path="/hotelzinho" element={<Hotelzinho />} />
                  <Route path="/transporte" element={<Transporte />} />
                  <Route path="/venha-nos-conhecer" element={<VenhaNosConhecer />} />
                  <Route path="/localizacao" element={<Localizacao />} />
                  <Route path="/fotos" element={<Fotos />} />
                  <Route path="/videos" element={<Videos />} />
                  <Route path="/siga-nos" element={<SigaNos />} />
                  <Route path="/albuns" element={<Albuns />} />
                  {/* Rotas admin */}
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route element={<ProtectedRoute><AdminShell /></ProtectedRoute>}>
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/home" element={<AdminHome />} />
                    <Route path="/admin/fotos" element={<AdminPhotos />} />
                    <Route path="/admin/videos" element={<AdminVideos />} />
                    <Route path="/admin/hotelzinho" element={<AdminHotelzinho />} />
                    <Route path="/admin/conhecer" element={<AdminConhecer />} />
                    <Route path="/admin/config" element={<AdminConfig />} />
                    <Route path="/admin/social" element={<AdminSocial />} />
                    <Route path="/admin/seguranca" element={<AdminSecurity />} />
                    <Route path="/admin/navbar-footer" element={<AdminNavbarFooter />} />
                    <Route path="/admin/branding" element={<AdminBranding />} />
                    <Route path="/admin/textos-paginas" element={<AdminPageTexts />} />
                    <Route path="/admin/guia" element={<AdminGuia />} />
                    <Route path="/admin/destaques" element={<AdminDestaques />} />
                    <Route path="/admin/transporte" element={<AdminTransporte />} />
                    <Route path="/admin/agendamento" element={<AdminAgendamento />} />
                    <Route path="/admin/hoje-le-ville" element={<AdminHojeNoLeVille />} />
                    <Route path="/admin/vagas" element={<AdminVagas />} />
                    <Route path="/admin/backup" element={<AdminBackup />} />
                    <Route path="/admin/albuns" element={<AdminAlbuns />} />
                    <Route path="/admin/downloads" element={<AdminDownloads />} />
                  </Route>
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </PageTransition>
          </MaintenanceGuard>
        </RoutePersistence>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
