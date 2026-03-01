import { mockTransactions } from "@/lib/mock-data";
import { DuoCard } from "@/components/ui/duo-card";
import { CashbackStatus } from "@/types";

const statusLabels: Record<CashbackStatus, string> = {
  tracked: 'Rastreado',
  pending: 'Pendente',
  confirmed: 'Confirmado',
  donated: 'Doado',
  reverted: 'Revertido',
};
const statusColors: Record<CashbackStatus, string> = {
  tracked: 'bg-muted text-muted-foreground',
  pending: 'bg-duo-yellow/20 text-duo-yellow',
  confirmed: 'bg-secondary/20 text-secondary',
  donated: 'bg-primary/20 text-primary',
  reverted: 'bg-destructive/20 text-destructive',
};

export default function Impact() {
  const txns = mockTransactions;
  const totals = (statuses: CashbackStatus[]) =>
    txns.filter(t => statuses.includes(t.status)).reduce((s, t) => s + t.amount, 0);

  return (
    <div className="container py-6 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-black">Seu Impacto 💚</h1>
        <p className="text-muted-foreground text-sm">Acompanhe suas doações</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <DuoCard className="text-center bg-duo-yellow/10 border-duo-yellow/30">
          <p className="text-[10px] font-bold text-muted-foreground uppercase">Pendente</p>
          <p className="text-lg font-black" style={{ color: 'hsl(var(--duo-yellow))' }}>R$ {totals(['tracked', 'pending']).toFixed(2)}</p>
        </DuoCard>
        <DuoCard className="text-center bg-secondary/10 border-secondary/30">
          <p className="text-[10px] font-bold text-muted-foreground uppercase">Confirmado</p>
          <p className="text-lg font-black text-secondary">R$ {totals(['confirmed']).toFixed(2)}</p>
        </DuoCard>
        <DuoCard className="text-center bg-primary/10 border-primary/30">
          <p className="text-[10px] font-bold text-muted-foreground uppercase">Doado</p>
          <p className="text-lg font-black text-primary">R$ {totals(['donated']).toFixed(2)}</p>
        </DuoCard>
      </div>

      <DuoCard>
        <h3 className="font-bold mb-4">Transações</h3>
        <div className="space-y-3">
          {txns.map(t => (
            <div key={t.id} className="flex items-center gap-3 py-2 border-b last:border-0 border-border">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-lg font-bold shrink-0">
                {t.store?.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">{t.store?.name}</p>
                <p className="text-xs text-muted-foreground">{new Date(t.tracked_at).toLocaleDateString('pt-BR')}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-sm">R$ {t.amount.toFixed(2)}</p>
                <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColors[t.status]}`}>
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
