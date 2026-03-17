import { Download, Share, Smartphone, Plus, ExternalLink } from "lucide-react";
import { DuoButton } from "@/components/ui/duo-button";
import { DuoCard } from "@/components/ui/duo-card";
import { useInstallPWA } from "@/hooks/useInstallPWA";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const DISMISSED_KEY = "mycashbacks_install_dismissed_at";
const INSTALLED_KEY = "mycashbacks_install_clicked";
const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;

interface InstallAppBannerProps {
  /** Force show even if previously dismissed (for Settings page) */
  forceShow?: boolean;
}

export function InstallAppBanner({ forceShow = false }: InstallAppBannerProps) {
  const { canInstall, isInstalled, isIOS, isInIframe, install } = useInstallPWA();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (forceShow) { setVisible(true); return; }
    // If user clicked install, never show again
    if (localStorage.getItem(INSTALLED_KEY) === "true") { setVisible(false); return; }
    const dismissedAt = localStorage.getItem(DISMISSED_KEY);
    if (!dismissedAt) { setVisible(true); return; }
    // Show again after 5 days
    const elapsed = Date.now() - parseInt(dismissedAt, 10);
    setVisible(elapsed >= FIVE_DAYS_MS);
  }, [forceShow]);

  if (isInstalled) return null;
  if (!visible) return null;
  if (!isIOS && !canInstall && !isInIframe) return null;

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    setVisible(false);
  };

  const handleInstall = async () => {
    const accepted = await install();
    if (accepted) {
      localStorage.setItem(INSTALLED_KEY, "true");
      setVisible(false);
    } else {
      if (isInIframe) {
        window.alert("A instalação não funciona dentro do preview. Abra o app publicado no navegador do celular para instalar.");
      } else {
        window.alert("O navegador não exibiu o prompt de instalação agora. Tente novamente ou use o menu do navegador para adicionar à tela inicial.");
      }
    }
  };

  const showIOSSteps = () => {
    window.alert("No iPhone/iPad: toque em Compartilhar e depois em Adicionar à Tela de Início.");
  };

  const openOutsidePreview = () => {
    window.open(window.location.href, "_blank", "noopener,noreferrer");
  };

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
            <p className="font-bold text-sm">Instale o Donant</p>

            {isIOS ? (
              <p className="text-xs text-muted-foreground flex items-center gap-1 flex-wrap">
                Toque em <Share className="w-3.5 h-3.5 inline text-primary" />
                <span className="font-medium">Compartilhar</span> e depois
                <Plus className="w-3.5 h-3.5 inline text-primary" />
                <span className="font-medium">Tela de Início</span>
              </p>
            ) : isInIframe ? (
              <p className="text-xs text-muted-foreground">
                No preview o navegador pode bloquear instalação. Abra fora do preview para instalar.
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Adicione à tela inicial para acesso rápido
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {canInstall ? (
              <DuoButton size="sm" onClick={handleInstall}>
                <Download className="w-4 h-4" /> Instalar
              </DuoButton>
            ) : isIOS ? (
              <DuoButton variant="outline" size="sm" onClick={showIOSSteps}>
                <Share className="w-4 h-4" /> Como instalar
              </DuoButton>
            ) : isInIframe ? (
              <DuoButton variant="outline" size="sm" onClick={openOutsidePreview}>
                <ExternalLink className="w-4 h-4" /> Abrir fora
              </DuoButton>
            ) : null}
            {!forceShow && (
              <button onClick={handleDismiss} className="text-muted-foreground hover:text-foreground text-xs font-bold p-1">
                ✕
              </button>
            )}
          </div>
        </div>
      </DuoCard>
    </motion.div>
  );
}
