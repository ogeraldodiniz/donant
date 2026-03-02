import { Sprout, TreeDeciduous, Trees, Globe, Crown, Star, Heart, Sparkles, Award, Flame } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface DonationLevel {
  rank: number;
  titleKey: string;
  titlePt: string;
  titleEs: string;
  Icon: LucideIcon;
  minAmount: number;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const DONATION_LEVELS: DonationLevel[] = [
  { rank: 1, titleKey: "level_1", titlePt: "Primeira Semente", titleEs: "Primera Semilla", Icon: Sprout, minAmount: 0, color: "text-muted-foreground", bgColor: "bg-muted/50", borderColor: "border-muted" },
  { rank: 2, titleKey: "level_2", titlePt: "Coração Generoso", titleEs: "Corazón Generoso", Icon: Heart, minAmount: 5, color: "text-primary", bgColor: "bg-primary/10", borderColor: "border-primary/30" },
  { rank: 3, titleKey: "level_3", titlePt: "Doador Estrela", titleEs: "Donante Estrella", Icon: Star, minAmount: 25, color: "text-accent-foreground", bgColor: "bg-accent/10", borderColor: "border-accent/30" },
  { rank: 4, titleKey: "level_4", titlePt: "Agente do Bem", titleEs: "Agente del Bien", Icon: Sparkles, minAmount: 75, color: "text-secondary", bgColor: "bg-secondary/10", borderColor: "border-secondary/30" },
  { rank: 5, titleKey: "level_5", titlePt: "Guardião Solidário", titleEs: "Guardián Solidario", Icon: TreeDeciduous, minAmount: 200, color: "text-primary", bgColor: "bg-primary/10", borderColor: "border-primary/30" },
  { rank: 6, titleKey: "level_6", titlePt: "Herói da Doação", titleEs: "Héroe de la Donación", Icon: Award, minAmount: 500, color: "text-secondary", bgColor: "bg-secondary/10", borderColor: "border-secondary/30" },
  { rank: 7, titleKey: "level_7", titlePt: "Embaixador do Impacto", titleEs: "Embajador del Impacto", Icon: Globe, minAmount: 1000, color: "text-primary", bgColor: "bg-primary/15", borderColor: "border-primary/40" },
  { rank: 8, titleKey: "level_8", titlePt: "Lenda Solidária", titleEs: "Leyenda Solidaria", Icon: Crown, minAmount: 2500, color: "text-accent-foreground", bgColor: "bg-accent/15", borderColor: "border-accent/40" },
  { rank: 9, titleKey: "level_9", titlePt: "Chama Imortal", titleEs: "Llama Inmortal", Icon: Flame, minAmount: 5000, color: "text-destructive", bgColor: "bg-destructive/10", borderColor: "border-destructive/30" },
  { rank: 10, titleKey: "level_10", titlePt: "Transformador de Vidas", titleEs: "Transformador de Vidas", Icon: Trees, minAmount: 10000, color: "text-primary", bgColor: "bg-primary/20", borderColor: "border-primary/50" },
];

export function getLevelForAmount(totalDonated: number): {
  current: DonationLevel;
  next: DonationLevel | null;
  progress: number;
} {
  let currentLevel = DONATION_LEVELS[0];

  for (let i = DONATION_LEVELS.length - 1; i >= 0; i--) {
    if (totalDonated >= DONATION_LEVELS[i].minAmount) {
      currentLevel = DONATION_LEVELS[i];
      break;
    }
  }

  const nextLevel = DONATION_LEVELS.find(l => l.rank === currentLevel.rank + 1) || null;

  let progress = 100;
  if (nextLevel) {
    const range = nextLevel.minAmount - currentLevel.minAmount;
    const current = totalDonated - currentLevel.minAmount;
    progress = Math.min(100, Math.max(0, (current / range) * 100));
  }

  return { current: currentLevel, next: nextLevel, progress };
}

export function formatCurrency(amount: number, locale: string): string {
  if (locale === "es") {
    return `€ ${amount.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `R$ ${amount.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function currencySymbol(locale: string): string {
  return locale === "es" ? "€" : "R$";
}
