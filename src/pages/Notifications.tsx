import { useState } from "react";
import { Bell, Check } from "lucide-react";
import { DuoCard } from "@/components/ui/duo-card";
import { mockNotifications } from "@/lib/mock-data";
import { Notification } from "@/types";

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const markRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const typeEmoji: Record<string, string> = {
    status_change: '🔄',
    donation_confirmed: '💚',
    general: '📢',
  };

  return (
    <div className="container py-5 sm:py-6 space-y-4 sm:space-y-6 max-w-lg">
      <div>
        <h1 className="text-xl sm:text-2xl font-black">Notificações</h1>
        <p className="text-muted-foreground text-xs sm:text-sm">{notifications.filter(n => !n.is_read).length} não lidas</p>
      </div>

      <div className="space-y-2 sm:space-y-3">
        {notifications.map(n => (
          <DuoCard
            key={n.id}
            className={`cursor-pointer transition-all p-3.5 sm:p-5 ${!n.is_read ? 'border-primary/30 bg-primary/5' : ''}`}
            onClick={() => markRead(n.id)}
          >
            <div className="flex items-start gap-2.5 sm:gap-3">
              <span className="text-lg sm:text-xl mt-0.5">{typeEmoji[n.type]}</span>
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
          <p className="font-semibold text-sm">Sem notificações</p>
        </div>
      )}
    </div>
  );
}
