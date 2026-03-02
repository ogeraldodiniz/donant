import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Store, Heart, Bell, MoreHorizontal, BarChart3, Eye, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export function BottomNav() {
  const location = useLocation();
  const { session } = useAuth();
  const [showMore, setShowMore] = useState(false);
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

  const mainItems = [
    { to: "/lojas", icon: Store, label: "Lojas" },
    { to: "/ongs", icon: Heart, label: "ONGs" },
    { to: "/notificacoes", icon: Bell, label: "Alertas", badge: unreadCount },
  ];

  const moreItems = [
    { to: "/transparencia", icon: Eye, label: "Transparência" },
    { to: "/impacto", icon: BarChart3, label: "Impacto" },
    { to: "/reclamar-cashback", icon: AlertTriangle, label: "Reclamar Cashback" },
  ];

  const isMoreActive = moreItems.some(item =>
    location.pathname === item.to || location.pathname.startsWith(item.to)
  );

  return (
    <>
      {/* More menu overlay */}
      {showMore && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/40" onClick={() => setShowMore(false)}>
          <div
            className="absolute bottom-14 left-0 right-0 bg-card border-t-2 border-border rounded-t-2xl p-3 space-y-1 safe-area-pb"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-2 mb-1">
              <span className="text-xs font-bold text-muted-foreground uppercase">Mais</span>
              <button onClick={() => setShowMore(false)} className="p-1 rounded-lg hover:bg-muted">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            {moreItems.map(({ to, icon: Icon, label }) => {
              const active = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setShowMore(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors",
                    active ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className={cn("w-5 h-5", active && "stroke-[2.5]")} />
                  <span className="text-sm font-semibold">{label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t-2 border-border">
        <div className="flex items-center justify-around h-14 safe-area-pb">
          {mainItems.map(({ to, icon: Icon, label, badge }) => {
            const active = location.pathname === to || (to !== "/" && location.pathname.startsWith(to));
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-colors min-w-[48px] relative",
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

          {/* More button */}
          <button
            onClick={() => setShowMore(!showMore)}
            className={cn(
              "flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-colors min-w-[48px]",
              isMoreActive || showMore ? "text-primary" : "text-muted-foreground"
            )}
          >
            <MoreHorizontal className={cn("w-5 h-5", (isMoreActive || showMore) && "stroke-[2.5]")} />
            <span className="text-[10px] font-bold leading-tight">Mais</span>
          </button>
        </div>
      </nav>
    </>
  );
}
