import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Store, Heart, BarChart3, Bell, Menu, X, LogIn, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useLocale } from "@/hooks/useLocale";
import { useSiteContent } from "@/hooks/useSiteContent";

export function Header() {
  const { isLoggedIn, user, logout } = useAuth();
  const { locale, setLocale } = useLocale();
  const { t } = useSiteContent("nav");
  const [mobileOpen, setMobileOpen] = useState(false);
  const unreadCount = 2; // mock

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
          <NavItem to="/" icon={Home} label="Home" />
          <NavItem to="/lojas" icon={Store} label={t("nav_stores", "Lojas")} />
          <NavItem to="/ongs" icon={Heart} label={t("nav_ngos", "ONGs")} />
          <NavItem to="/transparencia" icon={BarChart3} label={t("nav_transparency", "Transparência")} />
          {isLoggedIn && (
            <>
              <NavItem to="/impacto" icon={BarChart3} label={t("nav_impact", "Impacto")} />
              <Link to="/notificacoes" className="relative p-2 rounded-xl hover:bg-muted transition-colors">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-bold">
                    {unreadCount}
                  </span>
                )}
              </Link>
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
            {locale === "pt" ? "🇧🇷 PT" : "🇪🇸 ES"}
          </button>

          {isLoggedIn ? (
            <Link to="/configuracoes" className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-muted transition-colors">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                {user?.display_name?.charAt(0) || 'U'}
              </div>
              <span className="text-sm font-semibold">{user?.display_name?.split(' ')[0]}</span>
            </Link>
          ) : (
            <Link to="/auth" className="inline-flex items-center gap-2 h-10 px-5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm duo-shadow hover:brightness-105 active:translate-y-1 active:shadow-none transition-all">
              <LogIn className="w-4 h-4" /> {t("nav_login", "Entrar")}
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <div className="flex md:hidden items-center gap-1">
          <button
            onClick={() => setLocale(locale === "pt" ? "es" : "pt")}
            className="p-2 rounded-xl hover:bg-muted text-sm font-bold"
          >
            {locale === "pt" ? "🇧🇷" : "🇪🇸"}
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
              <MobileLink to="/notificacoes" label={t("nav_notifications", "Notificações")} onClick={() => setMobileOpen(false)} />
              <MobileLink to="/configuracoes" label={t("nav_settings", "Configurações")} onClick={() => setMobileOpen(false)} />
            </>
          )}
          {!isLoggedIn && <MobileLink to="/auth" label={t("nav_login", "Entrar / Cadastrar")} onClick={() => setMobileOpen(false)} />}
        </div>
      )}
    </header>
  );
}

function NavItem({ to, icon: Icon, label }: { to: string; icon: any; label: string }) {
  const location = useLocation();
  const active = location.pathname === to;
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors",
        active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
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
