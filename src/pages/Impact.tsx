import { useState, useEffect } from "react";
import { mockTransactions } from "@/lib/mock-data";
import { DuoCard } from "@/components/ui/duo-card";
import { CashbackStatus } from "@/types";
import { LevelBadge } from "@/components/LevelBadge";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useLocale } from "@/hooks/useLocale";
import { Heart, ChevronDown, ChevronUp, Trophy, Check, Lock, Flag, ShoppingBag, Zap } from "lucide-react";
import { formatCurrency, getLevelForAmount, DONATION_LEVELS } from "@/lib/gamification";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { DuoButton } from "@/components/ui/duo-button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const statusColors: Record<CashbackStatus, string> = {
  tracked: 'bg-muted text-muted-foreground',
  pending: 'bg-destructive/20 text-destructive',
  confirmed: 'bg-accent/20 text-accent',
  donated: 'bg-primary/20 text-primary',
  reverted: 'bg-muted text-muted-foreground',
};

export default function Impact() {
  const { t } = useSiteContent("impact");
  const { locale } = useLocale();
  const { user } = useAuth();
  const txns = mockTransactions;
  const totals = (statuses: CashbackStatus[]) =>
    txns.filter(t => statuses.includes(t.status)).reduce((s, t) => s + t.amount, 0);

  const donated = totals(['donated']);
  const confirmedCount = txns.filter(t => t.status === 'confirmed' || t.status === 'donated').length;
  const { current } = getLevelForAmount(donated);

  const [showAllConquistas, setShowAllConquistas] = useState(false);
  const [showAllTxns, setShowAllTxns] = useState(false);
  const [rallyCount, setRallyCount] = useState(0);

  // Fetch rally participation count
  useEffect(() => {
    // For now rally count is 0 since participation tracking isn't built yet
    // This will be updated when rally participation is implemented
    setRallyCount(0);
  }, [user?.id]);

  const statusLabels: Record<CashbackStatus, string> = {
    tracked: t("status_tracked", "Rastreado"),
    pending: t("status_pending", "Pendente"),
    confirmed: t("status_confirmed", "Confirmado"),
    donated: t("status_donated", "Doado"),
    reverted: t("status_reverted", "Revertido"),
  };

  const levelTitle = (level: typeof DONATION_LEVELS[0]) =>
    t(level.titleKey, locale === "es" ? level.titleEs : level.titlePt);

  // Level conquistas
  const unlockedLevels = DONATION_LEVELS.filter(l => donated >= l.minAmount);
  const lockedLevels = DONATION_LEVELS.filter(l => donated < l.minAmount);
  const levelConquistas = [...unlockedLevels, ...lockedLevels];

  // Special badges
  type SpecialBadge = {
    id: string;
    icon: typeof Trophy;
    label: string;
    count?: number;
    isUnlocked: boolean;
    color: string;
    bgColor: string;
    borderColor: string;
  };

  const specialBadges: SpecialBadge[] = [
    {
      id: "donations",
      icon: ShoppingBag,
      label: locale === "es" ? "Donaciones" : "Doações",
      count: confirmedCount,
      isUnlocked: confirmedCount > 0,
      color: "text-primary",
      bgColor: "bg-primary/10",
      borderColor: "border-primary/30",
    },
    {
      id: "rally_participant",
      icon: Flag,
      label: locale === "es" ? "Rallys" : "Rallys",
      count: rallyCount,
      isUnlocked: rallyCount > 0,
      color: "text-accent-foreground",
      bgColor: "bg-accent/10",
      borderColor: "border-accent/30",
    },
  ];

  const allConquistas = [
    ...specialBadges.map(b => ({ type: "special" as const, data: b, isUnlocked: b.isUnlocked })),
    ...levelConquistas.map(l => ({ type: "level" as const, data: l, isUnlocked: donated >= l.minAmount })),
  ];

  // Sort: unlocked first
  allConquistas.sort((a, b) => (a.isUnlocked === b.isUnlocked ? 0 : a.isUnlocked ? -1 : 1));

  const totalUnlocked = allConquistas.filter(c => c.isUnlocked).length;
  const visibleConquistas = showAllConquistas ? allConquistas : allConquistas.slice(0, 4);

  const visibleTxns = showAllTxns ? txns : txns.slice(0, 3);

  return (
    <div className="container py-5 sm:py-6 space-y-4 sm:space-y-5 max-w-3xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-black flex items-center gap-2">
          {t("title", "Gamificação")} <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm">{t("subtitle", "Acompanhe seu progresso e conquistas")}</p>
      </div>

      {/* Level badge with current + next */}
      <LevelBadge totalDonated={donated} showAllLevels />

      {/* Conquistas */}
      <DuoCard className="p-3.5 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-sm sm:text-base flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-primary" />
            {t("conquistas_title", "Conquistas")}
          </h3>
          <span className="text-[10px] sm:text-xs font-bold text-muted-foreground">
            {totalUnlocked}/{allConquistas.length}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {visibleConquistas.map((item, idx) => {
            if (item.type === "special") {
              const badge = item.data;
              const BadgeIcon = badge.icon;
              return (
                <div
                  key={badge.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${
                    badge.isUnlocked
                      ? `${badge.bgColor} ${badge.borderColor} border`
                      : "bg-muted/30 border-border opacity-40"
                  }`}
                >
                  <BadgeIcon className={`w-4 h-4 ${badge.isUnlocked ? badge.color : "text-muted-foreground"}`} />
                  <span className={`text-xs font-bold ${badge.isUnlocked ? badge.color : "text-muted-foreground"}`}>
                    {badge.label}
                  </span>
                  {badge.isUnlocked ? (
                    <span className={`text-[10px] font-black ${badge.color} bg-background/50 px-1.5 py-0.5 rounded-full`}>
                      {badge.count}
                    </span>
                  ) : (
                    <Lock className="w-3 h-3 text-muted-foreground" />
                  )}
                </div>
              );
            }

            const level = item.data;
            const LevelIcon = level.Icon;
            const isUnlocked = item.isUnlocked;
            const isCurrent = level.rank === current.rank;

            return (
              <div
                key={level.rank}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${
                  isCurrent
                    ? `${level.bgColor} ${level.borderColor} border-2`
                    : isUnlocked
                    ? `${level.bgColor} ${level.borderColor} border opacity-80`
                    : "bg-muted/30 border-border opacity-40"
                }`}
              >
                <LevelIcon className={`w-4 h-4 ${isUnlocked ? level.color : "text-muted-foreground"}`} />
                <span className={`text-xs font-bold ${isUnlocked ? level.color : "text-muted-foreground"}`}>
                  {levelTitle(level)}
                </span>
                {isUnlocked ? (
                  <Check className="w-3 h-3 text-primary" />
                ) : (
                  <Lock className="w-3 h-3 text-muted-foreground" />
                )}
              </div>
            );
          })}
        </div>

        {allConquistas.length > 4 && (
          <button
            onClick={() => setShowAllConquistas(!showAllConquistas)}
            className="w-full mt-3 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl border-2 border-border bg-card text-xs font-bold hover:bg-muted transition-colors active:translate-y-0.5"
          >
            {showAllConquistas ? (
              <><ChevronUp className="w-3.5 h-3.5" /> Ver menos</>
            ) : (
              <><ChevronDown className="w-3.5 h-3.5" /> Ver todos ({allConquistas.length - 4} restantes)</>
            )}
          </button>
        )}
      </DuoCard>

      {/* Share on WhatsApp */}
      <DuoButton
        variant="outline"
        className="w-full gap-2"
        onClick={() => {
          const donatedStr = formatCurrency(donated, locale);
          const text = `🌟 Já doei ${donatedStr} só fazendo compras online pelo Donant! Meu cashback vira doação para ONGs. Vem fazer parte também! 💚`;
          const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
          window.open(url, "_blank");
        }}
      >
        <WhatsAppIcon className="w-5 h-5" />
        {t("share_whatsapp", "Compartilhar no WhatsApp")}
      </DuoButton>

      {/* Totals + Transactions */}
      <DuoCard className="p-3.5 sm:p-5 space-y-4">
        <h3 className="font-bold text-sm sm:text-base flex items-center gap-1.5">
          <Heart className="w-4 h-4 text-primary" />
          {t("transactions_title", "Transações")}
        </h3>

        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="text-center p-2.5 sm:p-3 rounded-xl bg-destructive/10 border border-destructive/30">
            <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase">{t("label_pending", "Pendente")}</p>
            <p className="text-sm sm:text-lg font-black text-destructive">{formatCurrency(totals(['tracked', 'pending']), locale)}</p>
          </div>
          <div className="text-center p-2.5 sm:p-3 rounded-xl bg-accent/10 border border-accent/30">
            <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase">{t("label_confirmed", "Confirmado")}</p>
            <p className="text-sm sm:text-lg font-black text-accent">{formatCurrency(totals(['confirmed']), locale)}</p>
          </div>
          <div className="text-center p-2.5 sm:p-3 rounded-xl bg-primary/10 border border-primary/30">
            <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase">{t("label_donated", "Doado")}</p>
            <p className="text-sm sm:text-lg font-black text-primary">{formatCurrency(donated, locale)}</p>
          </div>
        </div>

        <div className="space-y-2 sm:space-y-3">
          {visibleTxns.map(t => (
            <div key={t.id} className="flex items-center gap-2.5 sm:gap-3 py-2 border-b last:border-0 border-border">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-muted flex items-center justify-center text-sm sm:text-lg font-bold shrink-0">
                {t.store?.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-xs sm:text-sm truncate">{t.store?.name}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">{new Date(t.tracked_at).toLocaleDateString(locale === "es" ? "es-ES" : "pt-BR")}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-xs sm:text-sm">{formatCurrency(t.amount, locale)}</p>
                <span className={`inline-block text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full ${statusColors[t.status]}`}>
                  {statusLabels[t.status]}
                </span>
              </div>
            </div>
          ))}
        </div>

        {txns.length > 3 && (
          <button
            onClick={() => setShowAllTxns(!showAllTxns)}
            className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-xl border-2 border-border bg-card text-xs font-bold hover:bg-muted transition-colors active:translate-y-0.5"
          >
            {showAllTxns ? (
              <><ChevronUp className="w-3.5 h-3.5" /> Ver menos</>
            ) : (
              <><ChevronDown className="w-3.5 h-3.5" /> Ver todos ({txns.length - 3} restantes)</>
            )}
          </button>
        )}
      </DuoCard>
    </div>
  );
}
