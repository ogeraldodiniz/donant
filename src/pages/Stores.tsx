import { useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { Search, ShoppingCart, Building2, Dumbbell, Plane, Shirt, Tag, ArrowUpDown, Star, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DuoCard } from "@/components/ui/duo-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

type SortOption = "name_asc" | "name_desc" | "cashback_desc" | "cashback_asc";

const getStoreCategory = (category: string | null) => category?.trim() || "Geral";

export default function Stores() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("name_asc");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [visibleCount, setVisibleCount] = useState(18);
  const { stores, loading } = useStores();
  const { t } = useSiteContent("stores_page");

  const categories = useMemo(() => {
    const cats = new Set(stores.map((s) => getStoreCategory(s.category)));
    return Array.from(cats).sort();
  }, [stores]);

  const filtered = useMemo(() => {
    let result = stores.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));
    if (categoryFilter !== "all") {
      result = result.filter((s) => getStoreCategory(s.category) === categoryFilter);
    }

    switch (sort) {
      case "name_desc":
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "cashback_desc":
        result.sort((a, b) => Number(b.cashback_rate) - Number(a.cashback_rate));
        break;
      case "cashback_asc":
        result.sort((a, b) => Number(a.cashback_rate) - Number(b.cashback_rate));
        break;
      default:
        result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [stores, search, sort, categoryFilter]);

  const featured = useMemo(() => stores.filter((s) => s.is_featured).slice(0, 3), [stores]);

  const renderStoreCard = (store: (typeof stores)[0], isFeatured = false) => (
    <Link key={store.id} to={`/lojas/${store.slug}`}>
      <DuoCard hover className={`flex items-center gap-3 sm:gap-4 p-3.5 sm:p-5 ${isFeatured ? "border-primary/30 bg-primary/5" : ""}`}>
        {store.logo_url ? (
          <img src={store.logo_url} alt={store.name} className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl object-cover bg-muted shrink-0" />
        ) : (
          <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-muted flex items-center justify-center text-xl sm:text-2xl font-bold shrink-0">
            {store.name.charAt(0)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm truncate">{store.name}</p>
          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-muted-foreground">
            {(() => {
              const CatIcon = categoryIcons[store.category || ""] || Tag;
              return <CatIcon className="w-3 h-3" />;
            })()}
            <span>{getStoreCategory(store.category)}</span>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <span className="inline-block px-3 py-1 rounded-lg bg-primary text-primary-foreground text-[10px] sm:text-xs font-bold">
              Comprar agora
            </span>
            <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
              Saiba mais
            </span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-base sm:text-lg font-black text-primary">{Number(store.cashback_rate)}%</p>
          <p className="text-[10px] text-muted-foreground font-bold">{t("cashback_label", "cashback")}</p>
        </div>
      </DuoCard>
    </Link>
  );

  return (
    <div className="container py-5 sm:py-6 space-y-4 sm:space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-black">{t("title", "Lojas Parceiras")}</h1>
        <p className="text-muted-foreground text-xs sm:text-sm">{t("subtitle", "Compre e gere cashback solidário")}</p>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 min-w-[140px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
          <Input
            placeholder={t("search_placeholder", "Buscar lojas...")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 rounded-2xl border-2 font-semibold text-sm"
          />
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="h-11 rounded-2xl text-xs font-semibold w-[148px] sm:w-[180px] shrink-0">
            <Tag className="w-3.5 h-3.5 mr-1.5 text-muted-foreground shrink-0" />
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas categorias</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
          <SelectTrigger className="h-11 rounded-2xl text-xs font-semibold w-[148px] sm:w-[180px] shrink-0">
            <ArrowUpDown className="w-3.5 h-3.5 mr-1.5 text-muted-foreground shrink-0" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name_asc">Nome A–Z</SelectItem>
            <SelectItem value="name_desc">Nome Z–A</SelectItem>
            <SelectItem value="cashback_desc">Maior cashback</SelectItem>
            <SelectItem value="cashback_asc">Menor cashback</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : (
        <>
          {featured.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm sm:text-base font-black flex items-center gap-1.5">
                <Star className="w-4 h-4 text-primary" />
                {t("featured_title", "Destaques")}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">{featured.map((store) => renderStoreCard(store, true))}</div>
            </div>
          )}

          <div className="space-y-2">
            <h2 className="text-sm sm:text-base font-black">{t("all_title", "Todas as Lojas")}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">{filtered.map((store) => renderStoreCard(store))}</div>
          </div>
        </>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Search className="w-12 h-12 mx-auto mb-2 text-muted-foreground opacity-30" />
          <p className="font-semibold text-sm">{t("empty", "Nenhuma loja encontrada")}</p>
        </div>
      )}
    </div>
  );
}
