import { useState, useEffect } from "react";
import { Bell, Check, Loader2, RefreshCw, Heart, Megaphone, Trash2 } from "lucide-react";
import { DuoCard } from "@/components/ui/duo-card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSiteContent } from "@/hooks/useSiteContent";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";

interface NotificationRow {
  id: string;
  title: string;
  body: string | null;
  type: string;
  is_read: boolean;
  created_at: string;
}

type Filter = "all" | "transaction" | "communication";

const TRANSACTION_TYPES = ["status_change", "donation_confirmed"];

export default function Notifications() {
  const { session } = useAuth();
  const { t } = useSiteContent("notifications_page");
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [deleting, setDeleting] = useState<string | null>(null);

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

  const handleDelete = async (id: string) => {
    setDeleting(id);
    const { error } = await supabase.from("notifications").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao apagar notificação");
    } else {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }
    setDeleting(null);
  };

  const typeIcon: Record<string, LucideIcon> = {
    status_change: RefreshCw,
    donation_confirmed: Heart,
    general: Megaphone,
  };

  const filtered = notifications.filter(n => {
    if (filter === "all") return true;
    if (filter === "transaction") return TRANSACTION_TYPES.includes(n.type);
    return !TRANSACTION_TYPES.includes(n.type);
  });

  const unreadCount = filtered.filter(n => !n.is_read).length;

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
        <p className="text-muted-foreground text-xs sm:text-sm">{unreadCount} {t("unread", "não lidas")}</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {([
          { key: "all" as Filter, label: t("filter_all", "Todas") },
          { key: "transaction" as Filter, label: t("filter_transactions", "Transações") },
          { key: "communication" as Filter, label: t("filter_communication", "Comunicação") },
        ]).map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold border-2 transition-colors ${
              filter === f.key
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-primary/30"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-2 sm:space-y-3">
        {filtered.map(n => {
          const NIcon = typeIcon[n.type] || Megaphone;
          return (
            <DuoCard
              key={n.id}
              className={`transition-all p-3.5 sm:p-5 ${!n.is_read ? 'border-primary/30 bg-primary/5' : ''}`}
            >
              <div className="flex items-start gap-2.5 sm:gap-3">
                <NIcon className="w-5 h-5 mt-0.5 text-primary shrink-0" />
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => markRead(n.id)} role="button" tabIndex={0}>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-xs sm:text-sm">{n.title}</p>
                    {!n.is_read && <div className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">{n.body}</p>
                  <p className="text-[10px] text-muted-foreground mt-1.5 sm:mt-2">{new Date(n.created_at).toLocaleDateString('pt-BR')}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {!n.is_read && (
                    <button className="p-1 rounded-lg hover:bg-muted" onClick={() => markRead(n.id)} title="Marcar como lida">
                      <Check className="w-4 h-4 text-primary" />
                    </button>
                  )}
                  <button
                    className="p-1 rounded-lg hover:bg-destructive/10"
                    onClick={() => handleDelete(n.id)}
                    disabled={deleting === n.id}
                    title="Apagar"
                  >
                    {deleting === n.id
                      ? <Loader2 className="w-4 h-4 animate-spin text-destructive" />
                      : <Trash2 className="w-4 h-4 text-destructive" />}
                  </button>
                </div>
              </div>
            </DuoCard>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-semibold text-sm">{t("empty", "Sem notificações")}</p>
        </div>
      )}
    </div>
  );
}
