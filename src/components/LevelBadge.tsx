import { DuoCard } from "@/components/ui/duo-card";
import { getLevelForAmount, DONATION_LEVELS } from "@/lib/gamification";
import { motion } from "framer-motion";
import { ChevronRight, Trophy, Check } from "lucide-react";

interface LevelBadgeProps {
  totalDonated: number;
  compact?: boolean;
  showAllLevels?: boolean;
}

export function LevelBadge({ totalDonated, compact = false, showAllLevels = false }: LevelBadgeProps) {
  const { current, next, progress } = getLevelForAmount(totalDonated);
  const CurrentIcon = current.Icon;

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold ${current.bgColor} ${current.color} ${current.borderColor} border`}>
        <CurrentIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        {current.title}
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Current level card */}
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
            <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase">Nível {current.rank}</p>
            <p className={`font-black text-sm sm:text-base ${current.color}`}>{current.title}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              R$ {totalDonated.toFixed(2)} doados
            </p>
          </div>
        </div>

        {/* Progress bar */}
        {next && (
          <div className="mt-3 sm:mt-4">
            <div className="flex items-center justify-between text-[10px] sm:text-xs mb-1.5">
              <span className="font-bold text-muted-foreground">Próximo: {next.title}</span>
              <span className="font-bold text-muted-foreground">R$ {next.minAmount.toLocaleString("pt-BR")}</span>
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
              Faltam R$ {(next.minAmount - totalDonated).toFixed(2)} para o próximo nível
            </p>
          </div>
        )}

        {!next && (
          <p className="mt-3 text-xs sm:text-sm font-bold text-primary flex items-center gap-1.5">
            <Trophy className="w-4 h-4" /> Nível máximo alcançado! Você é incrível!
          </p>
        )}
      </DuoCard>

      {/* All levels */}
      {showAllLevels && (
        <DuoCard>
          <h3 className="font-bold text-sm sm:text-base mb-3 sm:mb-4">Todos os níveis</h3>
          <div className="space-y-2">
            {DONATION_LEVELS.map((level) => {
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
                      {level.title}
                      {isCurrent && <span className="ml-1.5 text-[10px]">← Você</span>}
                    </p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      A partir de R$ {level.minAmount.toLocaleString("pt-BR")}
                    </p>
                  </div>
                  {isUnlocked && (
                    <span className="text-[10px] sm:text-xs font-bold text-primary">✓</span>
                  )}
                </div>
              );
            })}
          </div>
        </DuoCard>
      )}
    </div>
  );
}
