import { DuoCard } from "@/components/ui/duo-card";
import { mockNgos, mockDonations } from "@/lib/mock-data";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useSiteContent } from "@/hooks/useSiteContent";
import { Heart, Target, Users, Star, BadgeCheck, Rocket } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ngoIcons: LucideIcon[] = [Heart, Target, Users, Star, BadgeCheck, Rocket];

const chartColors = ['hsl(262,80%,58%)', 'hsl(348,80%,65%)', 'hsl(145,65%,48%)', 'hsl(25,95%,55%)', 'hsl(45,100%,49%)', 'hsl(262,60%,75%)'];

export default function Transparency() {
  const { t } = useSiteContent("transparency");
  const totalDonated = mockNgos.reduce((s, n) => s + n.total_received, 0);
  const chartData = mockNgos.map(n => ({ name: n.name.split(' ').slice(0, 2).join(' '), value: n.total_received }));

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
        <h3 className="font-bold text-sm sm:text-base mb-3 sm:mb-4">{t("chart_title", "Distribuição por ONG")}</h3>
        <div className="h-52 sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 10 }}>
              <XAxis type="number" tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v: number) => `R$ ${v.toLocaleString('pt-BR')}`} />
              <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                {chartData.map((_, i) => <Cell key={i} fill={chartColors[i % chartColors.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </DuoCard>

      <DuoCard className="p-3.5 sm:p-5">
        <h3 className="font-bold text-sm sm:text-base mb-3 sm:mb-4">{t("breakdown_title", "Detalhamento por ONG")}</h3>
        <div className="space-y-3">
          {mockNgos.map((ngo, i) => (
            <div key={ngo.id} className="flex items-center gap-2.5 sm:gap-3">
              {(() => { const NgoIcon = ngoIcons[i % ngoIcons.length]; return <NgoIcon className="w-5 h-5 text-primary shrink-0" />; })()}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-xs sm:text-sm truncate">{ngo.name}</p>
                <div className="w-full bg-muted rounded-full h-1.5 sm:h-2 mt-1">
                  <div className="h-1.5 sm:h-2 rounded-full" style={{ width: `${(ngo.total_received / totalDonated) * 100}%`, backgroundColor: chartColors[i] }} />
                </div>
              </div>
              <p className="text-xs sm:text-sm font-bold shrink-0">R$ {ngo.total_received.toLocaleString('pt-BR')}</p>
            </div>
          ))}
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
