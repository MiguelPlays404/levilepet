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
import FaleConosco from "./pages/FaleConosco";
import Hotelzinho from "./pages/Hotelzinho";
import Transporte from "./pages/Transporte";
import VenhaNosConhecer from "./pages/VenhaNosConhecer";
import Localizacao from "./pages/Localizacao";
import Fotos from "./pages/Fotos";
import Videos from "./pages/Videos";
import SigaNos from "./pages/SigaNos";
import NotFound from "./pages/NotFound";
import Manutencao from "./pages/Manutencao";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPhotos from "./pages/admin/AdminPhotos";
import AdminVideos from "./pages/admin/AdminVideos";
import AdminHotelzinho from "./pages/admin/AdminHotelzinho";
import AdminConhecer from "./pages/admin/AdminConhecer";
import AdminConfig from "./pages/admin/AdminConfig";
import AdminSocial from "./pages/admin/AdminSocial";
import AdminSecurity from "./pages/admin/AdminSecurity";
import AdminHome from "./pages/admin/AdminHome";
import AdminNavbarFooter from "./pages/admin/AdminNavbarFooter";
import AdminBranding from "./pages/admin/AdminBranding";
import AdminPageTexts from "./pages/admin/AdminPageTexts";
import AdminGuia from "./pages/admin/AdminGuia";
import AdminDestaques from "./pages/admin/AdminDestaques";
import AdminTransporte from "./pages/admin/AdminTransporte";
import AdminAgendamento from "./pages/admin/AdminAgendamento";
import AdminHojeNoLeVille from "./pages/admin/AdminHojeNoLeVille";
import AdminLogin from "./pages/admin/AdminLogin";
import { useEffect } from "react";
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
                <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/home" element={<ProtectedRoute><AdminHome /></ProtectedRoute>} />
                <Route path="/admin/fotos" element={<ProtectedRoute><AdminPhotos /></ProtectedRoute>} />
                <Route path="/admin/videos" element={<ProtectedRoute><AdminVideos /></ProtectedRoute>} />
                <Route path="/admin/hotelzinho" element={<ProtectedRoute><AdminHotelzinho /></ProtectedRoute>} />
                <Route path="/admin/conhecer" element={<ProtectedRoute><AdminConhecer /></ProtectedRoute>} />
                <Route path="/admin/config" element={<ProtectedRoute><AdminConfig /></ProtectedRoute>} />
                <Route path="/admin/social" element={<ProtectedRoute><AdminSocial /></ProtectedRoute>} />
                <Route path="/admin/seguranca" element={<ProtectedRoute><AdminSecurity /></ProtectedRoute>} />
                <Route path="/admin/navbar-footer" element={<ProtectedRoute><AdminNavbarFooter /></ProtectedRoute>} />
                <Route path="/admin/branding" element={<ProtectedRoute><AdminBranding /></ProtectedRoute>} />
                <Route path="/admin/textos-paginas" element={<ProtectedRoute><AdminPageTexts /></ProtectedRoute>} />
                <Route path="/admin/guia" element={<ProtectedRoute><AdminGuia /></ProtectedRoute>} />
                <Route path="/admin/destaques" element={<ProtectedRoute><AdminDestaques /></ProtectedRoute>} />
                <Route path="/admin/transporte" element={<ProtectedRoute><AdminTransporte /></ProtectedRoute>} />
                <Route path="/admin/agendamento" element={<ProtectedRoute><AdminAgendamento /></ProtectedRoute>} />
                <Route path="/admin/hoje-le-ville" element={<ProtectedRoute><AdminHojeNoLeVille /></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </PageTransition>
          </MaintenanceGuard>
        </RoutePersistence>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
