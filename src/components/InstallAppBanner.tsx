import { Download, Share, Smartphone, Plus } from "lucide-react";
import { DuoButton } from "@/components/ui/duo-button";
import { DuoCard } from "@/components/ui/duo-card";
import { useInstallPWA } from "@/hooks/useInstallPWA";
import { motion } from "framer-motion";

export function InstallAppBanner() {
  const { canInstall, isInstalled, isIOS, install } = useInstallPWA();

  if (isInstalled) return null;

  // If not iOS and can't install (e.g. already dismissed or unsupported browser), hide
  if (!isIOS && !canInstall) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <DuoCard className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <Smartphone className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm">Instale o MyCashbacks</p>
            {isIOS ? (
              <p className="text-xs text-muted-foreground flex items-center gap-1 flex-wrap">
                Toque em{" "}
                <Share className="w-3.5 h-3.5 inline text-primary" />{" "}
                <span className="font-medium">Compartilhar</span> e depois{" "}
                <Plus className="w-3.5 h-3.5 inline text-primary" />{" "}
                <span className="font-medium">Tela de Início</span>
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Adicione à tela inicial para acesso rápido
              </p>
            )}
          </div>
          {canInstall && (
            <DuoButton size="sm" onClick={install}>
              <Download className="w-4 h-4" /> Instalar
            </DuoButton>
          )}
        </div>
      </DuoCard>
    </motion.div>
  );
}
