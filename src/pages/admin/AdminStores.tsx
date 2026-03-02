import { useState, useEffect } from "react";
import { Search, Loader2, RefreshCw } from "lucide-react";
import { useAdminLocale } from "@/hooks/useAdminLocale";
import { DuoCard } from "@/components/ui/duo-card";
import { DuoButton } from "@/components/ui/duo-button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface StoreRow {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  category: string | null;
  cashback_rate: number;
  is_active: boolean;
  website_url: string | null;
  locale: string;
}

export default function AdminStores() {
  const { adminLocale } = useAdminLocale();
  const [stores, setStores] = useState<StoreRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toggling, setToggling] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  const fetchStores = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("stores")
      .select("id, name, slug, logo_url, category, cashback_rate, is_active, website_url, locale")
      .eq("locale", adminLocale)
      .order("name");
    if (error) {
      toast.error("Erro ao carregar lojas");
    } else {
      setStores(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStores();
  }, [adminLocale]);

  const toggleActive = async (id: string, currentValue: boolean) => {
    setToggling(id);
    const { error } = await supabase
      .from("stores")
      .update({ is_active: !currentValue })
      .eq("id", id);
    if (error) {
      toast.error("Erro ao atualizar loja");
    } else {
      setStores((prev) =>
        prev.map((s) => (s.id === id ? { ...s, is_active: !currentValue } : s))
      );
      toast.success(!currentValue ? "Loja ativada" : "Loja desativada");
    }
    setToggling(null);
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const { error } = await supabase.functions.invoke("sync-stores");
      if (error) throw error;
      toast.success("Sincronização iniciada!");
      // Refresh after a short delay
      setTimeout(fetchStores, 2000);
    } catch {
      toast.error("Erro ao sincronizar. Verifique a configuração da API.");
    }
    setSyncing(false);
  };

  const filtered = stores.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.category || "").toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = stores.filter((s) => s.is_active).length;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black">Lojas ({adminLocale.toUpperCase()})</h1>
          <p className="text-sm text-muted-foreground">
            {activeCount} ativas de {stores.length} total
          </p>
        </div>
        <DuoButton size="sm" onClick={handleSync} disabled={syncing}>
          {syncing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          Sincronizar API
        </DuoButton>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou categoria..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          {stores.length === 0
            ? 'Nenhuma loja cadastrada. Clique em "Sincronizar API" para importar.'
            : "Nenhuma loja encontrada."}
        </p>
      ) : (
        <div className="space-y-2">
          {filtered.map((store) => (
            <DuoCard key={store.id} className="flex items-center gap-4">
              {store.logo_url ? (
                <img
                  src={store.logo_url}
                  alt={store.name}
                  className="w-10 h-10 rounded-lg object-cover bg-muted"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center font-bold text-sm">
                  {store.name.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-bold truncate">{store.name}</p>
                <p className="text-xs text-muted-foreground">
                  {store.category || "Sem categoria"} · {Number(store.cashback_rate)}% cashback
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {store.is_active ? "Ativa" : "Inativa"}
                </span>
                <Switch
                  checked={store.is_active}
                  onCheckedChange={() => toggleActive(store.id, store.is_active)}
                  disabled={toggling === store.id}
                />
              </div>
            </DuoCard>
          ))}
        </div>
      )}
    </div>
  );
}
