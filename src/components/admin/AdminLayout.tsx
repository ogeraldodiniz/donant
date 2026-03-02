import { useEffect, useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminLocaleProvider, useAdminLocale } from "@/hooks/useAdminLocale";
import {
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export function AdminLayout() {
  const { session, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (authLoading) return;

    let isMounted = true;

    const checkAdminAccess = async () => {
      if (!session?.user?.id) {
        if (isMounted) setIsAdmin(false);
        navigate("/auth");
        return;
      }

      const timeoutId = window.setTimeout(() => {
        if (!isMounted) return;
        console.error("Timeout ao validar acesso admin");
        setIsAdmin(false);
        navigate("/");
      }, 10000);

      try {
        const { data, error } = await supabase.rpc("has_role", {
          _user_id: session.user.id,
          _role: "admin",
        });

        if (!isMounted) return;

        if (error) {
          throw error;
        }

        if (data) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
          navigate("/");
        }
      } catch (error) {
        if (!isMounted) return;
        console.error("Erro ao validar acesso admin:", error);
        setIsAdmin(false);
        navigate("/");
      } finally {
        window.clearTimeout(timeoutId);
      }
    };

    void checkAdminAccess();

    return () => {
      isMounted = false;
    };
  }, [session?.user?.id, authLoading, navigate]);

  if (authLoading || isAdmin === null) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-[calc(100vh-4rem)] flex w-full">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-12 flex items-center border-b border-border px-2">
            <SidebarTrigger className="ml-1" />
            <span className="ml-3 font-bold text-sm text-muted-foreground">Painel Admin</span>
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
