import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Store, Heart, BarChart3, Bell, Menu, X, LogIn, Globe, Shield, Sun, Moon, Monitor, Eye, AlertTriangle, MoreHorizontal } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useLocale } from "@/hooks/useLocale";
import { supabase } from "@/integrations/supabase/client";
import { useSiteContent } from "@/hooks/useSiteContent";

export function Header() {
  const { isLoggedIn, user, logout, session } = useAuth();
  const { locale, setLocale } = useLocale();
  const { t } = useSiteContent("nav");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { theme, setTheme } = useTheme();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!session?.user?.id) { setUnreadCount(0); return; }
    const fetchUnread = () => {
      supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", session.user.id)
        .eq("is_read", false)
        .then(({ count }) => setUnreadCount(count ?? 0));
    };
    fetchUnread();
    const channel = supabase
      .channel("unread-notifications")
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${session.user.id}` }, fetchUnread)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [session?.user?.id]);

  const cycleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  const ThemeIcon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;

  useEffect(() => {
    if (!session?.user?.id) { setIsAdmin(false); return; }
    supabase.from("user_roles").select("role").eq("user_id", session.user.id).eq("role", "admin").then(({ data }) => {
      setIsAdmin(!!(data && data.length > 0));
    });
  }, [session?.user?.id]);

  return (
    <header className="sticky top-0 z-50 bg-card border-b-2 border-border">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <Heart className="w-5 h-5 text-primary-foreground" fill="currentColor" />
          </div>
          <span className="font-extrabold text-xl text-foreground hidden sm:inline">MyCashbacks</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {isLoggedIn && (
            <>
              <NavItem to="/lojas" icon={Store} label={t("nav_stores", "Lojas")} />
              <NavItem to="/ongs" icon={Heart} label={t("nav_ngos", "ONGs")} />
              <NavItem to="/notificacoes" icon={Bell} label={t("nav_notifications", "Notificações")} badge={unreadCount} />
              {/* Mais dropdown */}
              <div className="relative group">
                <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                  <MoreHorizontal className="w-4 h-4" />
                  {t("nav_more", "Mais")}
                </button>
                <div className="absolute top-full left-0 pt-1 hidden group-hover:block">
                  <div className="bg-popover border border-border rounded-xl shadow-lg p-1 min-w-[200px]">
                    <Link to="/transparencia" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-muted transition-colors">
                      <Eye className="w-4 h-4" /> {t("nav_transparency", "Transparência")}
                    </Link>
                    <Link to="/impacto" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-muted transition-colors">
                      <BarChart3 className="w-4 h-4" /> {t("nav_impact", "Impacto")}
                    </Link>
                    <Link to="/reclamar-cashback" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-muted transition-colors">
                      <AlertTriangle className="w-4 h-4" /> {t("nav_claim", "Problemas com Cashback")}
                    </Link>
                  </div>
                </div>
              </div>
              {isAdmin && <NavItem to="/admin" icon={Shield} label="Admin" />}
            </>
          )}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {/* Locale selector */}
          <button
            onClick={() => setLocale(locale === "pt" ? "es" : "pt")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-muted transition-colors text-sm font-bold text-muted-foreground"
            title={locale === "pt" ? "Cambiar a español" : "Mudar para português"}
          >
            <Globe className="w-4 h-4" />
            {locale === "pt" ? "PT" : "ES"}
          </button>

          {/* Theme toggle */}
          <button
            onClick={cycleTheme}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-muted transition-colors text-sm font-bold text-muted-foreground"
            title={theme === "dark" ? "Modo escuro" : theme === "light" ? "Modo claro" : "Automático"}
          >
            <ThemeIcon className="w-4 h-4" />
          </button>

          {isLoggedIn ? (
            <Link to="/perfil" className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-muted transition-colors">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                  {user?.display_name?.charAt(0) || 'U'}
                </div>
              )}
              <span className="text-sm font-semibold">{user?.display_name?.split(' ')[0]}</span>
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/auth" className="inline-flex items-center gap-2 h-10 px-5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm duo-shadow hover:brightness-105 active:translate-y-1 active:shadow-none transition-all">
                <LogIn className="w-4 h-4" /> {t("nav_login", "Entrar")}
              </Link>
              <Link to="/auth?tab=signup" className="inline-flex items-center h-10 px-5 rounded-2xl border-2 border-border font-bold text-sm hover:bg-muted transition-colors">
                {t("nav_signup", "Criar conta")}
              </Link>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <div className="flex md:hidden items-center gap-1">
          <button
            onClick={cycleTheme}
            className="p-2 rounded-xl hover:bg-muted"
            title={theme === "dark" ? "Modo escuro" : theme === "light" ? "Modo claro" : "Automático"}
          >
            <ThemeIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => setLocale(locale === "pt" ? "es" : "pt")}
            className="p-2 rounded-xl hover:bg-muted text-sm font-bold"
          >
            {locale === "pt" ? "PT" : "ES"}
          </button>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-xl hover:bg-muted">
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card p-4 space-y-2">
          <MobileLink to="/" label="Home" onClick={() => setMobileOpen(false)} />
          <MobileLink to="/lojas" label={t("nav_stores", "Lojas")} onClick={() => setMobileOpen(false)} />
          <MobileLink to="/ongs" label={t("nav_ngos", "ONGs")} onClick={() => setMobileOpen(false)} />
          <MobileLink to="/transparencia" label={t("nav_transparency", "Transparência")} onClick={() => setMobileOpen(false)} />
          {isLoggedIn && (
            <>
              <MobileLink to="/impacto" label={t("nav_impact", "Meu Impacto")} onClick={() => setMobileOpen(false)} />
              <MobileLink to="/reclamar-cashback" label={t("nav_claim", "Reclamar Cashback")} onClick={() => setMobileOpen(false)} />
              <MobileLink to="/notificacoes" label={t("nav_notifications", "Notificações")} onClick={() => setMobileOpen(false)} />
              <MobileLink to="/perfil" label={t("nav_settings", "Configurações")} onClick={() => setMobileOpen(false)} />
              {isAdmin && <MobileLink to="/admin" label="Painel Admin" onClick={() => setMobileOpen(false)} />}
            </>
          )}
          {!isLoggedIn && <MobileLink to="/auth" label={t("nav_login", "Entrar / Cadastrar")} onClick={() => setMobileOpen(false)} />}
        </div>
      )}
    </header>
  );
}

function NavItem({ to, icon: Icon, label, badge }: { to: string; icon: any; label: string; badge?: number }) {
  const location = useLocation();
  const active = location.pathname === to;
  return (
    <Link
      to={to}
      className={cn(
        "relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors",
        active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
      {badge != null && badge > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-bold">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </Link>
  );
}

function MobileLink({ to, label, onClick }: { to: string; label: string; onClick: () => void }) {
  return (
    <Link to={to} onClick={onClick} className="block px-4 py-3 rounded-xl font-semibold hover:bg-muted transition-colors">
      {label}
    </Link>
  );
}
