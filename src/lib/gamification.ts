import { Sprout, TreeDeciduous, Trees, Globe, Crown, Star, Heart, Sparkles, Award, Flame } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface DonationLevel {
  rank: number;
  title: string;
  Icon: LucideIcon;
  minAmount: number;
  color: string; // tailwind token class
  bgColor: string;
  borderColor: string;
}

export const DONATION_LEVELS: DonationLevel[] = [
  { rank: 1, title: "Primeira Semente", Icon: Sprout, minAmount: 0, color: "text-muted-foreground", bgColor: "bg-muted/50", borderColor: "border-muted" },
  { rank: 2, title: "Coração Generoso", Icon: Heart, minAmount: 5, color: "text-primary", bgColor: "bg-primary/10", borderColor: "border-primary/30" },
  { rank: 3, title: "Doador Estrela", Icon: Star, minAmount: 25, color: "text-accent-foreground", bgColor: "bg-accent/10", borderColor: "border-accent/30" },
  { rank: 4, title: "Agente do Bem", Icon: Sparkles, minAmount: 75, color: "text-secondary", bgColor: "bg-secondary/10", borderColor: "border-secondary/30" },
  { rank: 5, title: "Guardião Solidário", Icon: TreeDeciduous, minAmount: 200, color: "text-primary", bgColor: "bg-primary/10", borderColor: "border-primary/30" },
  { rank: 6, title: "Herói da Doação", Icon: Award, minAmount: 500, color: "text-secondary", bgColor: "bg-secondary/10", borderColor: "border-secondary/30" },
  { rank: 7, title: "Embaixador do Impacto", Icon: Globe, minAmount: 1000, color: "text-primary", bgColor: "bg-primary/15", borderColor: "border-primary/40" },
  { rank: 8, title: "Lenda Solidária", Icon: Crown, minAmount: 2500, color: "text-accent-foreground", bgColor: "bg-accent/15", borderColor: "border-accent/40" },
  { rank: 9, title: "Chama Imortal", Icon: Flame, minAmount: 5000, color: "text-destructive", bgColor: "bg-destructive/10", borderColor: "border-destructive/30" },
  { rank: 10, title: "Transformador de Vidas", Icon: Trees, minAmount: 10000, color: "text-primary", bgColor: "bg-primary/20", borderColor: "border-primary/50" },
];

export function getLevelForAmount(totalDonated: number): {
  current: DonationLevel;
  next: DonationLevel | null;
  progress: number; // 0-100
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
