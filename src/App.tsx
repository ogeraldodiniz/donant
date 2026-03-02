import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { I18nProvider } from "@/hooks/useLocale";
import { AppLayout } from "@/components/layout/AppLayout";
import { AdminLayout } from "@/components/admin/AdminLayout";
import Index from "./pages/Index";
import Stores from "./pages/Stores";
import StoreDetail from "./pages/StoreDetail";
import Ngos from "./pages/Ngos";
import NgoDetail from "./pages/NgoDetail";
import Impact from "./pages/Impact";
import Redirect from "./pages/Redirect";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import Transparency from "./pages/Transparency";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import ResetPassword from "./pages/ResetPassword";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminNgos from "./pages/admin/AdminNgos";
import AdminStores from "./pages/admin/AdminStores";
import AdminBlog from "./pages/admin/AdminBlog";
import AdminPush from "./pages/admin/AdminPush";
import AdminUsers from "./pages/admin/AdminUsers";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <I18nProvider>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/lojas" element={<Stores />} />
              <Route path="/lojas/:slug" element={<StoreDetail />} />
              <Route path="/ongs" element={<Ngos />} />
              <Route path="/ongs/:slug" element={<NgoDetail />} />
              <Route path="/impacto" element={<Impact />} />
              <Route path="/redirect/:slug" element={<Redirect />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/perfil" element={<Settings />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/notificacoes" element={<Notifications />} />
              <Route path="/transparencia" element={<Transparency />} />
              <Route path="/privacidade" element={<Privacy />} />
              <Route path="/termos" element={<Terms />} />
              <Route path="/redefinir-senha" element={<ResetPassword />} />
            </Route>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/ongs" element={<AdminNgos />} />
              <Route path="/admin/lojas" element={<AdminStores />} />
              <Route path="/admin/blog" element={<AdminBlog />} />
              <Route path="/admin/push" element={<AdminPush />} />
              <Route path="/admin/usuarios" element={<AdminUsers />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
    </I18nProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
