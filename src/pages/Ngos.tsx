import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, Check, Heart, Loader2, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DuoCard } from "@/components/ui/duo-card";
import { useAuth } from "@/hooks/useAuth";
import { useNgos } from "@/hooks/useNgos";
import { useSelectNgo } from "@/hooks/useSelectNgo";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSiteContent } from "@/hooks/useSiteContent";

type SortOption = "name_asc" | "name_desc" | "received_desc";

export default function Ngos() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("name_asc");
  const { isLoggedIn, user } = useAuth();
  const { ngos, loading } = useNgos();
  const { selectNgo, saving } = useSelectNgo();
  const { t } = useSiteContent("ngos_page");

  const filtered = useMemo(() => {
    let result = ngos.filter(n => n.name.toLowerCase().includes(search.toLowerCase()));
    switch (sort) {
      case "name_desc": result.sort((a, b) => b.name.localeCompare(a.name)); break;
      case "received_desc": result.sort((a, b) => Number(b.total_received) - Number(a.total_received)); break;
      default: result.sort((a, b) => a.name.localeCompare(b.name));
    }
    return result;
  }, [ngos, search, sort]);

  const featured = useMemo(() => ngos.filter(n => n.is_featured).slice(0, 3), [ngos]);

  const handleSelect = (e: React.MouseEvent, ngoId: string, ngoName: string) => {
    e.preventDefault();
    e.stopPropagation();
    selectNgo(ngoId, ngoName);
  };

  const renderNgoCard = (ngo: typeof ngos[0], isFeatured = false) => {
    const isSelected = isLoggedIn && user?.selected_ngo_id === ngo.id;
    return (
      <Link key={ngo.id} to={`/ongs/${ngo.slug}`}>
        <DuoCard hover className={`p-0 h-full overflow-hidden ${isFeatured ? "border-primary/30 bg-primary/5" : ""} ${isSelected ? "border-primary" : ""}`}>
          {ngo.logo_url ? (
            <div className="aspect-[4/3] w-full overflow-hidden bg-muted rounded-xl m-2 mb-0" style={{ width: 'calc(100% - 1rem)' }}>
              <img src={ngo.logo_url} alt={ngo.name} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="aspect-[4/3] w-full bg-primary/10 flex items-center justify-center rounded-xl m-2 mb-0" style={{ width: 'calc(100% - 1rem)' }}>
              <Heart className="w-10 h-10 text-primary" />
            </div>
          )}
          <div className="p-3 sm:p-4 space-y-1.5">
            <p className="font-bold text-sm truncate">{ngo.name}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2">{ngo.description}</p>
            {isLoggedIn && !isSelected && (
              <button
                onClick={(e) => handleSelect(e, ngo.id, ngo.name)}
                disabled={saving !== null}
                className="w-full mt-2 h-8 sm:h-9 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center gap-1.5 hover:brightness-105 transition-all active:translate-y-0.5"
              >
                {saving === ngo.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Heart className="w-3 h-3" />{t("select_btn", "Selecionar")}</>}
              </button>
            )}
            {isSelected && (
              <div className="w-full mt-2 h-8 sm:h-9 rounded-xl bg-primary/10 border border-primary/30 text-primary text-xs font-bold flex items-center justify-center gap-1.5">
                <Check className="w-3 h-3" /> {t("selected_label", "Sua escolha")}
              </div>
            )}
          </div>
        </DuoCard>
      </Link>
    );
  };

  return (
    <div className="container py-5 sm:py-6 space-y-4 sm:space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-black">{t("title", "ONGs Parceiras")}</h1>
        <p className="text-muted-foreground text-xs sm:text-sm">{t("subtitle", "Escolha a ONG que vai receber suas doações")}</p>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
          <Input
            placeholder={t("search_placeholder", "Buscar ONGs...")}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 h-11 sm:h-12 rounded-2xl border-2 font-semibold text-sm"
          />
        </div>
        <div className="flex gap-2">
          <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
            <SelectTrigger className="h-9 rounded-xl text-xs font-semibold flex-1 max-w-[200px]">
              <ArrowUpDown className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name_asc">Nome A–Z</SelectItem>
              <SelectItem value="name_desc">Nome Z–A</SelectItem>
              <SelectItem value="received_desc">Mais doações recebidas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : (
        <>
          {featured.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm sm:text-base font-black">{t("featured_title", "⭐ Destaques")}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {featured.map(ngo => renderNgoCard(ngo, true))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <h2 className="text-sm sm:text-base font-black">{t("all_title", "Todas as ONGs")}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {filtered.map(ngo => renderNgoCard(ngo))}
            </div>
          </div>
        </>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Search className="w-12 h-12 mx-auto mb-2 text-muted-foreground opacity-30" />
          <p className="font-semibold text-sm">{t("empty", "Nenhuma ONG encontrada")}</p>
        </div>
      )}
    </div>
  );
}
