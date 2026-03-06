import { DuoCard } from "@/components/ui/duo-card";
import { mockNgos, mockDonations } from "@/lib/mock-data";
import { useSiteContent } from "@/hooks/useSiteContent";
import { BarChart3 } from "lucide-react";

export default function Transparency() {
  const { t } = useSiteContent("transparency");
  const totalDonated = mockNgos.reduce((s, n) => s + n.total_received, 0);

  return (
    <div className="container py-5 sm:py-6 space-y-4 sm:space-y-5 max-w-3xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-black flex items-center gap-2">{t("title", "Transparência")} <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-primary" /></h1>
        <p className="text-muted-foreground text-xs sm:text-sm">{t("subtitle", "Dados abertos sobre todas as doações")}</p>
      </div>

      <DuoCard className="text-center bg-primary/5 border-primary/20">
        <p className="text-xs sm:text-sm font-bold text-muted-foreground">{t("total_label", "Total doado pela plataforma")}</p>
        <p className="text-2xl sm:text-3xl md:text-4xl font-black text-primary">R$ {totalDonated.toLocaleString('pt-BR')}</p>
        <div className="flex justify-center gap-4 sm:gap-6 mt-2 sm:mt-3 text-xs sm:text-sm">
          <span className="font-bold">{mockNgos.length} {t("ngos_label", "ONGs")}</span>
          <span className="font-bold">{mockDonations.length} {t("donations_label", "doações")}</span>
        </div>
      </DuoCard>

      <DuoCard className="p-3.5 sm:p-5">
        <h3 className="font-bold text-sm sm:text-base mb-3 sm:mb-4">{t("recent_title", "Últimas doações")}</h3>
        <div className="space-y-2">
          {mockDonations.slice(0, 7).map(d => (
            <div key={d.id} className="flex items-center justify-between py-2 border-b last:border-0 border-border">
              <div>
                <p className="font-bold text-xs sm:text-sm">{d.ngo?.name}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">{new Date(d.donated_at).toLocaleDateString('pt-BR')}</p>
              </div>
              <p className="font-bold text-primary text-xs sm:text-sm">R$ {d.amount.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </DuoCard>
    </div>
  );
}
