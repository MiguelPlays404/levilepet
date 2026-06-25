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
// Páginas públicas secundárias — carregadas sob demanda
const FaleConosco = lazy(() => import("./pages/FaleConosco"));
const Hotelzinho = lazy(() => import("./pages/Hotelzinho"));
const Transporte = lazy(() => import("./pages/Transporte"));
const VenhaNosConhecer = lazy(() => import("./pages/VenhaNosConhecer"));
const Localizacao = lazy(() => import("./pages/Localizacao"));
const Fotos = lazy(() => import("./pages/Fotos"));
const Videos = lazy(() => import("./pages/Videos"));
const SigaNos = lazy(() => import("./pages/SigaNos"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Manutencao = lazy(() => import("./pages/Manutencao"));
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
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminShell = lazy(() =>
  import("./components/AdminLayout").then((m) => ({ default: m.AdminShell }))
);
import { getSiteConfig, prewarmCache } from "./lib/dataCache";

function BrandingApplier() {
  useEffect(() => {
    // Pré-aquece o cache em background assim que o app monta
    prewarmCache();

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
              <Suspense fallback={null}>
                <Routes>
                  {/* Rotas públicas */}
                  <Route path="/" element={<Index />} />
                  <Route path="/manutencao" element={<Manutencao />} />
                  <Route path="/fale-conosco" element={<FaleConosco />} />
                  <Route path="/hotelzinho" element={<Hotelzinho />} />
                  <Route path="/transporte" element={<Transporte />} />
                  <Route path="/venha-nos-conhecer" element={<VenhaNosConhecer />} />
                  <Route path="/localizacao" element={<Localizacao />} />
                  <Route path="/fotos" element={<Fotos />} />
                  <Route path="/videos" element={<Videos />} />
                  <Route path="/siga-nos" element={<SigaNos />} />
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
