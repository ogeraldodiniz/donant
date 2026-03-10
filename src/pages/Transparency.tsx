import { useState, useEffect } from "react";
import { DuoCard } from "@/components/ui/duo-card";
import { useSiteContent } from "@/hooks/useSiteContent";
import { BarChart3, Loader2, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DonationRow {
  id: string;
  amount: number;
  donated_at: string;
  ngo_id: string;
}

interface NgoRow {
  id: string;
  name: string;
  logo_url: string | null;
}

interface NgoTotal {
  name: string;
  logo_url: string | null;
  total: number;
  count: number;
}

export default function Transparency() {
  const { t } = useSiteContent("transparency");
  const [donations, setDonations] = useState<DonationRow[]>([]);
  const [ngos, setNgos] = useState<NgoRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    Promise.all([
      supabase
        .from("donation_ledger")
        .select("id, amount, donated_at, ngo_id")
        .gte("donated_at", twelveMonthsAgo.toISOString())
        .order("donated_at", { ascending: false }),
      supabase.from("ngos").select("id, name, logo_url").eq("is_active", true),
    ]).then(([donRes, ngoRes]) => {
      setDonations(donRes.data || []);
      setNgos(ngoRes.data || []);
      setLoading(false);
    });
  }, []);

  const ngoMap = new Map(ngos.map(n => [n.id, n]));

  const totalDonated = donations.reduce((s, d) => s + Number(d.amount), 0);

  // Total by NGO
  const ngoTotals: NgoTotal[] = [];
  const totalsMap = new Map<string, { total: number; count: number }>();
  for (const d of donations) {
    const existing = totalsMap.get(d.ngo_id) || { total: 0, count: 0 };
    existing.total += Number(d.amount);
    existing.count += 1;
    totalsMap.set(d.ngo_id, existing);
  }
  for (const [ngoId, data] of totalsMap) {
    const ngo = ngoMap.get(ngoId);
    ngoTotals.push({
      name: ngo?.name || "ONG desconhecida",
      logo_url: ngo?.logo_url || null,
      total: data.total,
      count: data.count,
    });
  }
  ngoTotals.sort((a, b) => b.total - a.total);

  const maxTotal = ngoTotals[0]?.total || 1;

  // Unique NGOs that received donations
  const uniqueNgos = new Set(donations.map(d => d.ngo_id)).size;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-5 sm:py-6 space-y-4 sm:space-y-5 max-w-3xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-black flex items-center gap-2">
          {t("title", "Transparência")} <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm">{t("subtitle", "Doações dos últimos 12 meses")}</p>
      </div>

      {/* Summary card */}
      <DuoCard className="text-center bg-primary/5 border-primary/20">
        <p className="text-xs sm:text-sm font-bold text-muted-foreground">{t("total_label", "Total doado nos últimos 12 meses")}</p>
        <p className="text-2xl sm:text-3xl md:text-4xl font-black text-primary">
          R$ {totalDonated.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </p>
        <div className="flex justify-center gap-4 sm:gap-6 mt-2 sm:mt-3 text-xs sm:text-sm">
          <span className="font-bold">{uniqueNgos} {t("ngos_label", "ONGs beneficiadas")}</span>
          <span className="font-bold">{donations.length} {t("donations_label", "doações")}</span>
        </div>
      </DuoCard>

      {/* Total by NGO */}
      <DuoCard className="p-3.5 sm:p-5">
        <h3 className="font-bold text-sm sm:text-base mb-3 sm:mb-4">{t("by_ngo_title", "Total por ONG")}</h3>
        {ngoTotals.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Nenhuma doação registrada nos últimos 12 meses</p>
        ) : (
          <div className="space-y-3">
            {ngoTotals.map((ngo, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    {ngo.logo_url ? (
                      <img src={ngo.logo_url} alt={ngo.name} className="w-7 h-7 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Heart className="w-3.5 h-3.5 text-primary" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-bold text-xs sm:text-sm truncate">{ngo.name}</p>
                      <p className="text-[10px] text-muted-foreground">{ngo.count} doação{ngo.count !== 1 ? "ões" : ""}</p>
                    </div>
                  </div>
                  <p className="font-bold text-primary text-xs sm:text-sm whitespace-nowrap ml-2">
                    R$ {ngo.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                {/* Progress bar */}
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${(ngo.total / maxTotal) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </DuoCard>

      {/* Recent donations */}
      <DuoCard className="p-3.5 sm:p-5">
        <h3 className="font-bold text-sm sm:text-base mb-3 sm:mb-4">{t("recent_title", "Últimas doações")}</h3>
        {donations.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Nenhuma doação registrada</p>
        ) : (
          <div className="space-y-2">
            {donations.slice(0, 10).map(d => {
              const ngo = ngoMap.get(d.ngo_id);
              return (
                <div key={d.id} className="flex items-center justify-between py-2 border-b last:border-0 border-border">
                  <div>
                    <p className="font-bold text-xs sm:text-sm">{ngo?.name || "ONG"}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      {new Date(d.donated_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <p className="font-bold text-primary text-xs sm:text-sm">
                    R$ {Number(d.amount).toFixed(2)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </DuoCard>
    </div>
  );
}
