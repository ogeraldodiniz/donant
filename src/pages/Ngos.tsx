import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Check, Heart, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DuoCard } from "@/components/ui/duo-card";
import { useAuth } from "@/hooks/useAuth";
import { useNgos } from "@/hooks/useNgos";
import { useSelectNgo } from "@/hooks/useSelectNgo";
import { Skeleton } from "@/components/ui/skeleton";

export default function Ngos() {
  const [search, setSearch] = useState("");
  const { isLoggedIn, user } = useAuth();
  const { ngos, loading } = useNgos();
  const { selectNgo, saving } = useSelectNgo();

  const filtered = ngos.filter(n => n.name.toLowerCase().includes(search.toLowerCase()));

  const handleSelect = (e: React.MouseEvent, ngoId: string, ngoName: string) => {
    e.preventDefault();
    e.stopPropagation();
    selectNgo(ngoId, ngoName);
  };

  return (
    <div className="container py-5 sm:py-6 space-y-4 sm:space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-black">ONGs Parceiras</h1>
        <p className="text-muted-foreground text-xs sm:text-sm">Escolha a ONG que vai receber suas doações</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
        <Input
          placeholder="Buscar ONGs..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10 h-11 sm:h-12 rounded-2xl border-2 font-semibold text-sm"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {filtered.map((ngo) => {
            const isSelected = isLoggedIn && user?.selected_ngo_id === ngo.id;
            return (
              <Link key={ngo.id} to={`/ongs/${ngo.slug}`}>
                <DuoCard hover className={`p-0 h-full overflow-hidden ${isSelected ? "border-primary bg-primary/5" : ""}`}>
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
                    <p className="text-[10px] sm:text-xs text-primary font-bold">R$ {ngo.total_received.toLocaleString('pt-BR')} recebidos</p>
                    {isLoggedIn && !isSelected && (
                      <button
                        onClick={(e) => handleSelect(e, ngo.id, ngo.name)}
                        disabled={saving !== null}
                        className="w-full mt-2 h-8 sm:h-9 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center gap-1.5 hover:brightness-105 transition-all active:translate-y-0.5"
                      >
                        {saving === ngo.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <>
                            <Heart className="w-3 h-3" />
                            Selecionar
                          </>
                        )}
                      </button>
                    )}
                    {isSelected && (
                      <div className="w-full mt-2 h-8 sm:h-9 rounded-xl bg-primary/10 border border-primary/30 text-primary text-xs font-bold flex items-center justify-center gap-1.5">
                        <Check className="w-3 h-3" /> Sua escolha
                      </div>
                    )}
                  </div>
                </DuoCard>
              </Link>
            );
          })}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-4xl mb-2">🔍</p>
          <p className="font-semibold text-sm">Nenhuma ONG encontrada</p>
        </div>
      )}
    </div>
  );
}
