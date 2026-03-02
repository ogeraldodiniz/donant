import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Store, ShoppingCart, Building2, Dumbbell, Plane, Shirt, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DuoCard } from "@/components/ui/duo-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useStores } from "@/hooks/useStores";
import { useSiteContent } from "@/hooks/useSiteContent";
import type { LucideIcon } from "lucide-react";

const categoryIcons: Record<string, LucideIcon> = {
  Marketplace: ShoppingCart,
  Varejo: Building2,
  Esportes: Dumbbell,
  Viagens: Plane,
  Moda: Shirt,
};

export default function Stores() {
  const [search, setSearch] = useState("");
  const { stores, loading } = useStores();
  const { t } = useSiteContent("stores_page");
  const filtered = stores.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="container py-5 sm:py-6 space-y-4 sm:space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-black">{t("title", "Lojas Parceiras")}</h1>
        <p className="text-muted-foreground text-xs sm:text-sm">{t("subtitle", "Compre e gere cashback solidário")}</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
        <Input
          placeholder={t("search_placeholder", "Buscar lojas...")}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10 h-11 sm:h-12 rounded-2xl border-2 font-semibold text-sm"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filtered.map(store => (
            <Link key={store.id} to={`/lojas/${store.slug}`}>
              <DuoCard hover className="flex items-center gap-3 sm:gap-4 p-3.5 sm:p-5">
                {store.logo_url ? (
                  <img src={store.logo_url} alt={store.name} className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl object-cover bg-muted shrink-0" />
                ) : (
                  <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-muted flex items-center justify-center text-xl sm:text-2xl font-bold shrink-0">
                    {store.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{store.name}</p>
                  <div className="flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground">
                    <span>{categoryEmojis[store.category || ''] || '🏷️'} {store.category || 'Geral'}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-base sm:text-lg font-black text-primary">{Number(store.cashback_rate)}%</p>
                  <p className="text-[10px] text-muted-foreground font-bold">{t("cashback_label", "cashback")}</p>
                </div>
              </DuoCard>
            </Link>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-4xl mb-2">🔍</p>
          <p className="font-semibold text-sm">{t("empty", "Nenhuma loja encontrada")}</p>
        </div>
      )}
    </div>
  );
}
