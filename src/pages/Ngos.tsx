import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DuoCard } from "@/components/ui/duo-card";
import { mockNgos, ngoEmojis } from "@/lib/mock-data";
import { useAuth } from "@/hooks/useAuth";

export default function Ngos() {
  const [search, setSearch] = useState("");
  const { isLoggedIn, user } = useAuth();
  const filtered = mockNgos.filter(n => n.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-black">ONGs Parceiras</h1>
        <p className="text-muted-foreground text-sm">Escolha a ONG que vai receber suas doações</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Buscar ONGs..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10 h-12 rounded-2xl border-2 font-semibold"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((ngo, i) => {
          const isSelected = isLoggedIn && user?.selected_ngo_id === ngo.id;
          return (
            <Link key={ngo.id} to={`/ongs/${ngo.slug}`}>
              <DuoCard hover className={isSelected ? "border-primary bg-primary/5" : ""}>
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-2xl shrink-0">
                    {ngoEmojis[i % ngoEmojis.length]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold truncate">{ngo.name}</p>
                      {isSelected && <Check className="w-4 h-4 text-primary shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{ngo.description}</p>
                    <p className="text-xs text-primary font-bold mt-2">R$ {ngo.total_received.toLocaleString('pt-BR')} recebidos</p>
                  </div>
                </div>
              </DuoCard>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-4xl mb-2">🔍</p>
          <p className="font-semibold">Nenhuma ONG encontrada</p>
        </div>
      )}
    </div>
  );
}
