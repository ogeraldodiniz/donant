import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DuoCard } from "@/components/ui/duo-card";
import { mockStores, categoryEmojis } from "@/lib/mock-data";

export default function Stores() {
  const [search, setSearch] = useState("");
  const filtered = mockStores.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="container py-5 sm:py-6 space-y-4 sm:space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-black">Lojas Parceiras</h1>
        <p className="text-muted-foreground text-xs sm:text-sm">Compre e gere cashback solidário</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
        <Input
          placeholder="Buscar lojas..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10 h-11 sm:h-12 rounded-2xl border-2 font-semibold text-sm"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {filtered.map(store => (
          <Link key={store.id} to={`/lojas/${store.slug}`}>
            <DuoCard hover className="flex items-center gap-3 sm:gap-4 p-3.5 sm:p-5">
              <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-muted flex items-center justify-center text-xl sm:text-2xl font-bold shrink-0">
                {store.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">{store.name}</p>
                <div className="flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground">
                  <span>{categoryEmojis[store.category] || '🏷️'} {store.category}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-base sm:text-lg font-black text-primary">{store.cashback_rate}%</p>
                <p className="text-[10px] text-muted-foreground font-bold">cashback</p>
              </div>
            </DuoCard>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-4xl mb-2">🔍</p>
          <p className="font-semibold text-sm">Nenhuma loja encontrada</p>
        </div>
      )}
    </div>
  );
}
