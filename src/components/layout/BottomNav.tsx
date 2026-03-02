import { Link, useLocation } from "react-router-dom";
import { Home, Store, Heart, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export function BottomNav() {
  const location = useLocation();
  const { session } = useAuth();
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
      .channel("unread-bottom-nav")
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${session.user.id}` }, fetchUnread)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [session?.user?.id]);

  const items = [
    { to: "/", icon: Home, label: "Início" },
    { to: "/lojas", icon: Store, label: "Lojas" },
    { to: "/ongs", icon: Heart, label: "ONGs" },
    { to: "/notificacoes", icon: Bell, label: "Notificações", badge: unreadCount },
    { to: "/perfil", icon: User, label: "Perfil" },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t-2 border-border pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-14">
        {items.map(({ to, icon: Icon, label, badge }) => {
          const active = to === "/" ? location.pathname === "/" : location.pathname === to || location.pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex flex-col items-center gap-0.5 px-1 py-1 rounded-xl transition-colors min-w-[44px] relative",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className={cn("w-5 h-5", active && "stroke-[2.5]")} />
              {badge != null && badge > 0 && (
                <span className="absolute -top-0.5 right-0 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[9px] flex items-center justify-center font-bold">
                  {badge > 9 ? "9+" : badge}
                </span>
              )}
              <span className="text-[10px] font-bold leading-tight">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
