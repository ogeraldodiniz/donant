import { Bell, X, Loader2 } from "lucide-react";
import { DuoButton } from "@/components/ui/duo-button";
import { DuoCard } from "@/components/ui/duo-card";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { toast } from "sonner";

const DISMISSED_KEY = "mycashbacks_push_dismissed";

export function PushPermissionBanner() {
  const { isLoggedIn } = useAuth();
  const { permission, subscribing, subscribe, isSupported } = usePushNotifications();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setDismissed(localStorage.getItem(DISMISSED_KEY) === "true");
  }, []);

  // Don't show if not logged in, not supported, already granted/denied, or dismissed
  if (!isLoggedIn || !isSupported || permission === "granted" || permission === "denied" || dismissed) {
    return null;
  }

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "true");
    setDismissed(true);
  };

  const handleSubscribe = async () => {
    const ok = await subscribe();
    if (ok) {
      toast.success("Notificações ativadas!");
    } else {
      const currentPerm = Notification?.permission;
      if (currentPerm === "denied") {
        toast.error("Permissão negada. Altere nas configurações do navegador.");
      }
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ delay: 1.5 }}
      >
        <DuoCard className="bg-gradient-to-r from-primary/5 to-accent/10 border-primary/20">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm">Ative as notificações</p>
              <p className="text-xs text-muted-foreground">
                Saiba quando suas doações forem confirmadas e acompanhe seu impacto em tempo real.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <DuoButton size="sm" onClick={handleSubscribe} disabled={subscribing}>
                {subscribing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Bell className="w-4 h-4" />
                )}
                Ativar
              </DuoButton>
              <button onClick={handleDismiss} className="text-muted-foreground hover:text-foreground text-xs font-bold p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </DuoCard>
      </motion.div>
    </AnimatePresence>
  );
}
