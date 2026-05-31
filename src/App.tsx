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
import AdminLogin from "./pages/admin/AdminLogin";
import { useEffect } from "react";
import { supabase } from "./integrations/supabase/client";

function BrandingApplier() {
  useEffect(() => {
    supabase.from("site_config").select("favicon_url,font_heading,font_body,primary_color").limit(1).maybeSingle().then(({ data }) => {
      if (!data) return;
      if (data.favicon_url) {
        let link = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;
        if (!link) { link = document.createElement("link"); link.rel = "icon"; document.head.appendChild(link); }
        link.href = data.favicon_url;
      }
      if (data.font_heading || data.font_body) {
        const fams = [data.font_heading, data.font_body].filter(Boolean).map(f => `family=${encodeURIComponent(f!)}:wght@400;500;600;700&`).join("");
        const id = "dynamic-fonts";
        let s = document.getElementById(id) as HTMLLinkElement | null;
        if (!s) { s = document.createElement("link"); s.id = id; s.rel = "stylesheet"; document.head.appendChild(s); }
        s.href = `https://fonts.googleapis.com/css2?${fams}display=swap`;
      }
    });
  }, []);
  return null;
}

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <SecurityHeaders />
        <BrandingApplier />
        <NavigationProgress />
        <RoutePersistence>
          <MaintenanceGuard>
            <Routes>
              <Route path="/" element={<PageTransition><Index /></PageTransition>} />
              <Route path="/manutencao" element={<Manutencao />} />
              <Route path="/fale-conosco" element={<PageTransition><FaleConosco /></PageTransition>} />
              <Route path="/hotelzinho" element={<PageTransition><Hotelzinho /></PageTransition>} />
              <Route path="/transporte" element={<PageTransition><Transporte /></PageTransition>} />
              <Route path="/venha-nos-conhecer" element={<PageTransition><VenhaNosConhecer /></PageTransition>} />
              <Route path="/localizacao" element={<PageTransition><Localizacao /></PageTransition>} />
              <Route path="/fotos" element={<PageTransition><Fotos /></PageTransition>} />
              <Route path="/videos" element={<PageTransition><Videos /></PageTransition>} />
              <Route path="/siga-nos" element={<PageTransition><SigaNos /></PageTransition>} />
              {/* Admin Routes */}
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
              <Route path="*" element={<NotFound />} />
            </Routes>
          </MaintenanceGuard>
        </RoutePersistence>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
