import { useState, useEffect } from "react";
import { Bell, Check, Loader2, RefreshCw, Heart, Megaphone } from "lucide-react";
import { DuoCard } from "@/components/ui/duo-card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSiteContent } from "@/hooks/useSiteContent";
import type { LucideIcon } from "lucide-react";

interface NotificationRow {
  id: string;
  title: string;
  body: string | null;
  type: string;
  is_read: boolean;
  created_at: string;
}

export default function Notifications() {
  const { session } = useAuth();
  const { t } = useSiteContent("notifications_page");
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.id) { setLoading(false); return; }
    supabase
      .from("notifications")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setNotifications(data || []);
        setLoading(false);
      });
  }, [session?.user?.id]);

  const markRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
  };

  const typeIcon: Record<string, LucideIcon> = {
    status_change: RefreshCw,
    donation_confirmed: Heart,
    general: Megaphone,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-5 sm:py-6 space-y-4 sm:space-y-5 max-w-lg">
      <div>
        <h1 className="text-xl sm:text-2xl font-black">{t("title", "Notificações")}</h1>
        <p className="text-muted-foreground text-xs sm:text-sm">{notifications.filter(n => !n.is_read).length} {t("unread", "não lidas")}</p>
      </div>

      <div className="space-y-2 sm:space-y-3">
        {notifications.map(n => (
          <DuoCard
            key={n.id}
            className={`cursor-pointer transition-all p-3.5 sm:p-5 ${!n.is_read ? 'border-primary/30 bg-primary/5' : ''}`}
            onClick={() => markRead(n.id)}
          >
            <div className="flex items-start gap-2.5 sm:gap-3">
              {(() => { const NIcon = typeIcon[n.type] || Megaphone; return <NIcon className="w-5 h-5 mt-0.5 text-primary shrink-0" />; })()}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-xs sm:text-sm">{n.title}</p>
                  {!n.is_read && <div className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">{n.body}</p>
                <p className="text-[10px] text-muted-foreground mt-1.5 sm:mt-2">{new Date(n.created_at).toLocaleDateString('pt-BR')}</p>
              </div>
              {!n.is_read && (
                <button className="p-1 rounded-lg hover:bg-muted shrink-0" onClick={(e) => { e.stopPropagation(); markRead(n.id); }}>
                  <Check className="w-4 h-4 text-primary" />
                </button>
              )}
            </div>
          </DuoCard>
        ))}
      </div>

      {notifications.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-semibold text-sm">{t("empty", "Sem notificações")}</p>
        </div>
      )}
    </div>
  );
}
