import { useState, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Check, Heart, Loader2, ArrowUpDown, Star, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DuoCard } from "@/components/ui/duo-card";
import { useAuth } from "@/hooks/useAuth";
import { useNgos } from "@/hooks/useNgos";
import { useSelectNgo } from "@/hooks/useSelectNgo";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSiteContent } from "@/hooks/useSiteContent";
import type { Ngo } from "@/hooks/useNgos";

type SortOption = "name_asc" | "name_desc";

const getNgoCategory = (ngo: Ngo) => {
  const text = `${ngo.name} ${ngo.description ?? ""} ${ngo.mission ?? ""}`.toLowerCase();

  if (text.includes("medic") || text.includes("saúd") || text.includes("hospital")) return "Saúde";
  if (text.includes("mulher") || text.includes("femin")) return "Mulheres";
  if (text.includes("crian") || text.includes("educa") || text.includes("infân")) return "Infância & Educação";
  if (text.includes("emerg") || text.includes("desastre") || text.includes("refugi") || text.includes("humanit")) return "Emergência Humanitária";

  return "Geral";
};

export default function Ngos() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("name_asc");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const { isLoggedIn, user } = useAuth();
  const { ngos, loading } = useNgos();
  const { selectNgo, saving } = useSelectNgo();
  const { t } = useSiteContent("ngos_page");

  const categories = useMemo(() => {
    const cats = new Set(ngos.map((ngo) => getNgoCategory(ngo)));
    return Array.from(cats).sort();
  }, [ngos]);

  const filtered = useMemo(() => {
    let result = ngos.filter((n) => n.name.toLowerCase().includes(search.toLowerCase()));

    if (categoryFilter !== "all") {
      result = result.filter((n) => getNgoCategory(n) === categoryFilter);
    }

    switch (sort) {
      case "name_desc":
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [ngos, search, sort, categoryFilter]);

  const featured = useMemo(() => ngos.filter((n) => n.is_featured).slice(0, 3), [ngos]);

  const handleSelect = (e: React.MouseEvent, ngoId: string, ngoName: string) => {
    e.preventDefault();
    e.stopPropagation();
    selectNgo(ngoId, ngoName);
  };

  const renderFeaturedNgoCard = (ngo: (typeof ngos)[0]) => {
    const isSelected = isLoggedIn && user?.selected_ngo_id === ngo.id;

    return (
      <Link key={ngo.id} to={`/ongs/${ngo.slug}`}>
        <DuoCard hover className={`flex items-center gap-4 p-4 border-primary/30 bg-primary/5 ${isSelected ? "border-primary" : ""}`}>
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            {ngo.logo_url ? (
              <img src={ngo.logo_url} alt={ngo.name} className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover" />
            ) : (
              <Heart className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm sm:text-base truncate">{ngo.name}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1">{ngo.description}</p>
            <div className="flex items-center gap-3 mt-2">
              {isLoggedIn && !isSelected && (
                <button
                  onClick={(e) => handleSelect(e, ngo.id, ngo.name)}
                  disabled={saving !== null}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:brightness-105 transition-all active:translate-y-0.5"
                >
                  {saving === ngo.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Heart className="w-3 h-3" />{t("select_btn", "Selecionar")}</>}
                </button>
              )}
              {isSelected && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-primary/10 border border-primary/30 text-primary text-xs font-bold">
                  <Check className="w-3 h-3" />
                  {t("selected_label", "Sua escolha")}
                </span>
              )}
              <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground">
                Saiba mais
              </span>
            </div>
          </div>
        </DuoCard>
      </Link>
    );
  };

  const renderNgoCard = (ngo: (typeof ngos)[0]) => {
    const isSelected = isLoggedIn && user?.selected_ngo_id === ngo.id;

    return (
      <Link key={ngo.id} to={`/ongs/${ngo.slug}`}>
        <DuoCard hover className={`p-0 h-full overflow-hidden ${isSelected ? "border-primary bg-primary/5" : ""}`}>
          {ngo.logo_url ? (
            <div className="aspect-[4/3] w-full overflow-hidden bg-muted rounded-xl m-2 mb-0" style={{ width: "calc(100% - 1rem)" }}>
              <img src={ngo.logo_url} alt={ngo.name} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="aspect-[4/3] w-full bg-primary/10 flex items-center justify-center rounded-xl m-2 mb-0" style={{ width: "calc(100% - 1rem)" }}>
              <Heart className="w-10 h-10 text-primary" />
            </div>
          )}
          <div className="p-3 sm:p-4 space-y-1.5">
            <p className="font-bold text-sm truncate">{ngo.name}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2">{ngo.description}</p>
            <div className="flex items-center gap-3 mt-2">
              {isLoggedIn && !isSelected && (
                <button
                  onClick={(e) => handleSelect(e, ngo.id, ngo.name)}
                  disabled={saving !== null}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:brightness-105 transition-all active:translate-y-0.5"
                >
                  {saving === ngo.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Heart className="w-3 h-3" />{t("select_btn", "Selecionar")}</>}
                </button>
              )}
              {isSelected && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-primary/10 border border-primary/30 text-primary text-xs font-bold">
                  <Check className="w-3 h-3" />
                  {t("selected_label", "Sua escolha")}
                </span>
              )}
              <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground">
                Saiba mais
              </span>
            </div>
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

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
          <Input
            placeholder={t("search_placeholder", "Buscar ONGs...")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 rounded-2xl border-2 font-semibold text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-11 rounded-2xl text-xs font-semibold flex-1 sm:w-[160px] sm:flex-none shrink-0">
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
            <SelectTrigger className="h-11 rounded-2xl text-xs font-semibold flex-1 sm:w-[160px] sm:flex-none shrink-0">
              <ArrowUpDown className="w-3.5 h-3.5 mr-1.5 text-muted-foreground shrink-0" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name_asc">Nome A–Z</SelectItem>
              <SelectItem value="name_desc">Nome Z–A</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">{featured.map((ngo) => renderFeaturedNgoCard(ngo))}</div>
            </div>
          )}

          <div className="space-y-2">
            <h2 className="text-sm sm:text-base font-black">{t("all_title", "Todas as ONGs")}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">{filtered.map((ngo) => renderNgoCard(ngo))}</div>
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
