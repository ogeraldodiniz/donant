import { mockTransactions } from "@/lib/mock-data";
import { DuoCard } from "@/components/ui/duo-card";
import { CashbackStatus } from "@/types";
import { LevelBadge } from "@/components/LevelBadge";

const statusLabels: Record<CashbackStatus, string> = {
  tracked: 'Rastreado',
  pending: 'Pendente',
  confirmed: 'Confirmado',
  donated: 'Doado',
  reverted: 'Revertido',
};
const statusColors: Record<CashbackStatus, string> = {
  tracked: 'bg-muted text-muted-foreground',
  pending: 'bg-destructive/20 text-destructive',
  confirmed: 'bg-accent/20 text-accent',
  donated: 'bg-primary/20 text-primary',
  reverted: 'bg-muted text-muted-foreground',
};

export default function Impact() {
  const txns = mockTransactions;
  const totals = (statuses: CashbackStatus[]) =>
    txns.filter(t => statuses.includes(t.status)).reduce((s, t) => s + t.amount, 0);

  return (
    <div className="container py-5 sm:py-6 space-y-4 sm:space-y-5 max-w-3xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-black">Seu Impacto 💜</h1>
        <p className="text-muted-foreground text-xs sm:text-sm">Acompanhe suas doações</p>
      </div>

      <LevelBadge totalDonated={totals(['donated'])} showAllLevels />

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <DuoCard className="text-center p-3 sm:p-5 bg-accent/10 border-accent/30">
          <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase">Pendente</p>
          <p className="text-sm sm:text-lg font-black text-accent-foreground">R$ {totals(['tracked', 'pending']).toFixed(2)}</p>
        </DuoCard>
        <DuoCard className="text-center p-3 sm:p-5 bg-secondary/10 border-secondary/30">
          <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase">Confirmado</p>
          <p className="text-sm sm:text-lg font-black text-secondary">R$ {totals(['confirmed']).toFixed(2)}</p>
        </DuoCard>
        <DuoCard className="text-center p-3 sm:p-5 bg-primary/10 border-primary/30">
          <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase">Doado</p>
          <p className="text-sm sm:text-lg font-black text-primary">R$ {totals(['donated']).toFixed(2)}</p>
        </DuoCard>
      </div>

      <DuoCard className="p-3.5 sm:p-5">
        <h3 className="font-bold text-sm sm:text-base mb-3 sm:mb-4">Transações</h3>
        <div className="space-y-2 sm:space-y-3">
          {txns.map(t => (
            <div key={t.id} className="flex items-center gap-2.5 sm:gap-3 py-2 border-b last:border-0 border-border">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-muted flex items-center justify-center text-sm sm:text-lg font-bold shrink-0">
                {t.store?.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-xs sm:text-sm truncate">{t.store?.name}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">{new Date(t.tracked_at).toLocaleDateString('pt-BR')}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-xs sm:text-sm">R$ {t.amount.toFixed(2)}</p>
                <span className={`inline-block text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full ${statusColors[t.status]}`}>
                  {statusLabels[t.status]}
                </span>
              </div>
            </div>
          ))}
        </div>
      </DuoCard>
    </div>
  );
}
