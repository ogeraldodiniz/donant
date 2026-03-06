import { useState } from "react";
import { DuoCard } from "@/components/ui/duo-card";
import { getLevelForAmount, DONATION_LEVELS, formatCurrency } from "@/lib/gamification";
import { motion } from "framer-motion";
import { ChevronRight, Trophy, Check, ChevronDown, ChevronUp } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useLocale } from "@/hooks/useLocale";

interface LevelBadgeProps {
  totalDonated: number;
  compact?: boolean;
  showAllLevels?: boolean;
}

export function LevelBadge({ totalDonated, compact = false, showAllLevels = false }: LevelBadgeProps) {
  const [expanded, setExpanded] = useState(false);
  const { current, next, progress } = getLevelForAmount(totalDonated);
  const { t } = useSiteContent("gamification");
  const { locale } = useLocale();
  const CurrentIcon = current.Icon;

  const levelTitle = (level: typeof current) =>
    t(level.titleKey, locale === "es" ? level.titleEs : level.titlePt);

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold ${current.bgColor} ${current.color} ${current.borderColor} border`}>
        <CurrentIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        {levelTitle(current)}
      </div>
    );
  }

  // Determine which levels to show: previous, current, next
  const prevLevel = DONATION_LEVELS.find(l => l.rank === current.rank - 1) || null;
  const visibleLevels = expanded
    ? DONATION_LEVELS
    : [prevLevel, current, next].filter(Boolean) as typeof DONATION_LEVELS;

  return (
    <div className="space-y-3 sm:space-y-4">
      <DuoCard className={`${current.bgColor} ${current.borderColor} border-2`}>
        <div className="flex items-center gap-3 sm:gap-4">
          <motion.div
            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${current.bgColor} flex items-center justify-center`}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <CurrentIcon className={`w-6 h-6 sm:w-7 sm:h-7 ${current.color}`} />
          </motion.div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase">
              {t("level_label", locale === "es" ? "Nivel" : "Nível")} {current.rank}
            </p>
            <p className={`font-black text-sm sm:text-base ${current.color}`}>{levelTitle(current)}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              {formatCurrency(totalDonated, locale)} {t("donated_label", locale === "es" ? "donados" : "doados")}
            </p>
          </div>
        </div>

        {next && (
          <div className="mt-3 sm:mt-4">
            <div className="flex items-center justify-between text-[10px] sm:text-xs mb-1.5">
              <span className="font-bold text-muted-foreground">
                {t("next_label", locale === "es" ? "Siguiente" : "Próximo")}: {levelTitle(next)}
              </span>
              <span className="font-bold text-muted-foreground">{formatCurrency(next.minAmount, locale)}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 sm:h-2.5 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              {t("remaining_prefix", locale === "es" ? "Faltan" : "Faltam")} {formatCurrency(next.minAmount - totalDonated, locale)} {t("remaining_suffix", locale === "es" ? "para el siguiente nivel" : "para o próximo nível")}
            </p>
          </div>
        )}

        {!next && (
          <p className="mt-3 text-xs sm:text-sm font-bold text-primary flex items-center gap-1.5">
            <Trophy className="w-4 h-4" /> {t("max_level", locale === "es" ? "¡Nivel máximo alcanzado! ¡Eres increíble!" : "Nível máximo alcançado! Você é incrível!")}
          </p>
        )}
      </DuoCard>

      {showAllLevels && (
        <DuoCard>
          <h3 className="font-bold text-sm sm:text-base mb-3 sm:mb-4">
            {t("all_levels", locale === "es" ? "Todos los niveles" : "Todos os níveis")}
          </h3>
          <div className="space-y-2">
            {visibleLevels.map((level) => {
              const LevelIcon = level.Icon;
              const isUnlocked = totalDonated >= level.minAmount;
              const isCurrent = level.rank === current.rank;

              return (
                <div
                  key={level.rank}
                  className={`flex items-center gap-2.5 sm:gap-3 p-2 sm:p-2.5 rounded-xl transition-all ${
                    isCurrent
                      ? `${level.bgColor} ${level.borderColor} border-2`
                      : isUnlocked
                      ? "opacity-70"
                      : "opacity-35"
                  }`}
                >
                  <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center ${isUnlocked ? level.bgColor : "bg-muted"}`}>
                    <LevelIcon className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${isUnlocked ? level.color : "text-muted-foreground"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-xs sm:text-sm ${isCurrent ? level.color : ""}`}>
                      {levelTitle(level)}
                      {isCurrent && <span className="ml-1.5 text-[10px]">← {locale === "es" ? "Tú" : "Você"}</span>}
                    </p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      {t("from_label", locale === "es" ? "A partir de" : "A partir de")} {formatCurrency(level.minAmount, locale)}
                    </p>
                  </div>
                  {isUnlocked && (
                    <Check className="w-3.5 h-3.5 text-primary" />
                  )}
                </div>
              );
            })}
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full mt-3 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl border-2 border-border bg-card text-xs font-bold hover:bg-muted transition-colors active:translate-y-0.5"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                {locale === "es" ? "Ver menos" : "Ver menos"}
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                {locale === "es" ? "Ver todos" : "Ver todos"}
              </>
            )}
          </button>
        </DuoCard>
      )}
    </div>
  );
}
