import { useState, useEffect } from "react";
import { Search, Loader2, RefreshCw, Pencil, X, Check, AlertTriangle, Star } from "lucide-react";
import { useAdminLocale } from "@/hooks/useAdminLocale";
import { DuoCard } from "@/components/ui/duo-card";
import { DuoButton } from "@/components/ui/duo-button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  is_featured: boolean;
  website_url: string | null;
  locale: string;
  terms: string | null;
  mycashbacks_store_id: string | null;
}

const FIELDS_FROM_API = ["name", "slug", "website_url", "category", "mycashbacks_store_id"];
const FIELDS_MANUAL = ["logo_url", "cashback_rate", "terms", "is_active"];

export default function AdminStores() {
  const { adminLocale } = useAdminLocale();
  const [stores, setStores] = useState<StoreRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [editStore, setEditStore] = useState<StoreRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState<Partial<StoreRow>>({});

  const fetchStores = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("stores")
      .select("id, name, slug, logo_url, category, cashback_rate, is_active, is_featured, website_url, locale, terms, mycashbacks_store_id")
      .eq("locale", adminLocale)
      .order("name");
    if (error) {
      toast.error("Erro ao carregar lojas");
    } else {
      setStores(data || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchStores(); }, [adminLocale]);

  const toggleActive = async (id: string, currentValue: boolean) => {
    const { error } = await supabase
      .from("stores")
      .update({ is_active: !currentValue })
      .eq("id", id);
    if (error) {
      toast.error("Erro ao atualizar loja");
    } else {
      setStores((prev) => prev.map((s) => (s.id === id ? { ...s, is_active: !currentValue } : s)));
      toast.success(!currentValue ? "Loja ativada" : "Loja desativada");
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const { error } = await supabase.functions.invoke("sync-stores");
      if (error) throw error;
      toast.success("Sincronização iniciada!");
      setTimeout(fetchStores, 2000);
    } catch {
      toast.error("Erro ao sincronizar.");
    }
    setSyncing(false);
  };

  const openEdit = (store: StoreRow) => {
    setEditStore(store);
    setEditForm({ ...store });
  };

  const handleSave = async () => {
    if (!editStore) return;
    setSaving(true);
    const { error } = await supabase
      .from("stores")
      .update({
        name: editForm.name,
        slug: editForm.slug,
        logo_url: editForm.logo_url || null,
        website_url: editForm.website_url || null,
        category: editForm.category || null,
        cashback_rate: Number(editForm.cashback_rate) || 0,
        terms: editForm.terms || null,
        is_active: editForm.is_active ?? true,
      })
      .eq("id", editStore.id);
    if (error) {
      toast.error("Erro ao salvar");
    } else {
      toast.success("Loja atualizada!");
      setStores((prev) =>
        prev.map((s) => (s.id === editStore.id ? { ...s, ...editForm } as StoreRow : s))
      );
      setEditStore(null);
    }
    setSaving(false);
  };

  const filtered = stores.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.category || "").toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = stores.filter((s) => s.is_active).length;
  const missingDataCount = stores.filter(
    (s) => !s.logo_url || !s.cashback_rate || s.cashback_rate === 0
  ).length;

  const fieldLabel = (field: string) => {
    const map: Record<string, string> = {
      name: "Nome",
      slug: "Slug",
      logo_url: "Logo (URL)",
      website_url: "Website",
      category: "Categoria",
      cashback_rate: "Cashback (%)",
      terms: "Termos / Descrição",
      is_active: "Ativa",
      mycashbacks_store_id: "ID MyCashbacks",
    };
    return map[field] || field;
  };

  const isMissing = (store: StoreRow, field: string) => {
    const val = store[field as keyof StoreRow];
    if (field === "cashback_rate") return !val || val === 0;
    return !val;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black">Lojas ({adminLocale.toUpperCase()})</h1>
          <p className="text-sm text-muted-foreground">
            {activeCount} ativas de {stores.length} total
            {missingDataCount > 0 && (
              <span className="text-amber-500 ml-2">· {missingDataCount} com dados incompletos</span>
            )}
          </p>
        </div>
        <DuoButton size="sm" onClick={handleSync} disabled={syncing}>
          {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
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
          {filtered.map((store) => {
            const hasMissing = !store.logo_url || !store.cashback_rate || store.cashback_rate === 0;
            return (
              <DuoCard key={store.id} className="flex items-center gap-4">
                {store.logo_url ? (
                  <img src={store.logo_url} alt={store.name} className="w-10 h-10 rounded-lg object-cover bg-muted" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center font-bold text-sm">
                    {store.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold truncate">{store.name}</p>
                    {hasMissing && (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-xs text-muted-foreground">
                      {store.category || "Sem categoria"} · {Number(store.cashback_rate)}% cashback
                    </p>
                    {!store.logo_url && <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-amber-500 border-amber-500/30">sem logo</Badge>}
                    {(!store.cashback_rate || store.cashback_rate === 0) && <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-amber-500 border-amber-500/30">sem cashback</Badge>}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={async () => {
                      const next = !store.is_featured;
                      const { error } = await supabase.from("stores").update({ is_featured: next }).eq("id", store.id);
                      if (!error) { setStores((prev) => prev.map((s) => s.id === store.id ? { ...s, is_featured: next } : s)); toast.success(next ? "Destaque ativado" : "Destaque removido"); }
                    }}
                    className={`p-2 rounded-lg hover:bg-muted transition-colors ${store.is_featured ? "text-yellow-500" : "text-muted-foreground"}`}
                    title={store.is_featured ? "Remover destaque" : "Marcar como destaque"}
                  >
                    <Star className="w-4 h-4" fill={store.is_featured ? "currentColor" : "none"} />
                  </button>
                  <button onClick={() => openEdit(store)} className="p-2 rounded-lg hover:bg-muted transition-colors">
                    <Pencil className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <Switch
                    checked={store.is_active}
                    onCheckedChange={() => toggleActive(store.id, store.is_active)}
                  />
                </div>
              </DuoCard>
            );
          })}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editStore} onOpenChange={(open) => !open && setEditStore(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-black">Editar Loja</DialogTitle>
          </DialogHeader>

          {editStore && (
            <div className="space-y-4 pt-2">
              {/* Preview */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                {editForm.logo_url ? (
                  <img src={editForm.logo_url} alt="" className="w-12 h-12 rounded-xl object-cover bg-muted" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-lg font-bold">
                    {(editForm.name || "?").charAt(0)}
                  </div>
                )}
                <div>
                  <p className="font-bold text-sm">{editForm.name}</p>
                  <p className="text-xs text-muted-foreground">{editForm.category || "Sem categoria"} · {Number(editForm.cashback_rate)}%</p>
                </div>
              </div>

              {/* API ID (read-only) */}
              <div>
                <Label className="text-xs text-muted-foreground">ID MyCashbacks</Label>
                <Input value={editStore.mycashbacks_store_id || "—"} disabled className="text-xs opacity-60" />
              </div>

              {/* Editable fields */}
              <div className="grid gap-3">
                <div>
                  <Label className="text-xs font-semibold flex items-center gap-1.5">
                    Nome
                    {!isMissing(editStore, "name") && <Check className="w-3 h-3 text-emerald-500" />}
                  </Label>
                  <Input
                    value={editForm.name || ""}
                    onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold flex items-center gap-1.5">
                    Slug
                    {!isMissing(editStore, "slug") && <Check className="w-3 h-3 text-emerald-500" />}
                  </Label>
                  <Input
                    value={editForm.slug || ""}
                    onChange={(e) => setEditForm((f) => ({ ...f, slug: e.target.value }))}
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold flex items-center gap-1.5">
                    Logo (URL da imagem)
                    {isMissing(editStore, "logo_url") ? (
                      <AlertTriangle className="w-3 h-3 text-amber-500" />
                    ) : (
                      <Check className="w-3 h-3 text-emerald-500" />
                    )}
                  </Label>
                  <Input
                    placeholder="https://..."
                    value={editForm.logo_url || ""}
                    onChange={(e) => setEditForm((f) => ({ ...f, logo_url: e.target.value }))}
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold flex items-center gap-1.5">
                    Website
                    {isMissing(editStore, "website_url") ? (
                      <AlertTriangle className="w-3 h-3 text-amber-500" />
                    ) : (
                      <Check className="w-3 h-3 text-emerald-500" />
                    )}
                  </Label>
                  <Input
                    placeholder="https://..."
                    value={editForm.website_url || ""}
                    onChange={(e) => setEditForm((f) => ({ ...f, website_url: e.target.value }))}
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold flex items-center gap-1.5">
                    Categoria
                    {isMissing(editStore, "category") ? (
                      <AlertTriangle className="w-3 h-3 text-amber-500" />
                    ) : (
                      <Check className="w-3 h-3 text-emerald-500" />
                    )}
                  </Label>
                  <Input
                    placeholder="Ex: Moda, Eletrônicos..."
                    value={editForm.category || ""}
                    onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value }))}
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold flex items-center gap-1.5">
                    Cashback (%)
                    {isMissing(editStore, "cashback_rate") ? (
                      <AlertTriangle className="w-3 h-3 text-amber-500" />
                    ) : (
                      <Check className="w-3 h-3 text-emerald-500" />
                    )}
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="0"
                    value={editForm.cashback_rate ?? ""}
                    onChange={(e) => setEditForm((f) => ({ ...f, cashback_rate: parseFloat(e.target.value) || 0 }))}
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold flex items-center gap-1.5">
                    Termos / Descrição
                    {isMissing(editStore, "terms") ? (
                      <AlertTriangle className="w-3 h-3 text-amber-500" />
                    ) : (
                      <Check className="w-3 h-3 text-emerald-500" />
                    )}
                  </Label>
                  <Textarea
                    placeholder="Condições, restrições ou descrição..."
                    value={editForm.terms || ""}
                    onChange={(e) => setEditForm((f) => ({ ...f, terms: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold">Loja ativa</Label>
                  <Switch
                    checked={editForm.is_active ?? true}
                    onCheckedChange={(v) => setEditForm((f) => ({ ...f, is_active: v }))}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <DuoButton className="flex-1" onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Salvar
                </DuoButton>
                <DuoButton variant="outline" onClick={() => setEditStore(null)}>
                  <X className="w-4 h-4" /> Cancelar
                </DuoButton>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
