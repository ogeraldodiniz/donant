import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DuoCard } from "@/components/ui/duo-card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, AlertTriangle, CheckCircle, Clock, XCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

interface Claim {
  id: string;
  user_id: string;
  store_id: string;
  ngo_id: string;
  purchase_date: string;
  order_number: string;
  details: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

interface StoreMap { [id: string]: string }
interface NgoMap { [id: string]: string }
interface ProfileMap { [id: string]: string }

const statusConfig: Record<string, { label: string; icon: React.ElementType; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pendente", icon: Clock, variant: "secondary" },
  reviewing: { label: "Em análise", icon: AlertTriangle, variant: "outline" },
  approved: { label: "Aprovado", icon: CheckCircle, variant: "default" },
  rejected: { label: "Rejeitado", icon: XCircle, variant: "destructive" },
};

export default function AdminClaims() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [stores, setStores] = useState<StoreMap>({});
  const [ngos, setNgos] = useState<NgoMap>({});
  const [profiles, setProfiles] = useState<ProfileMap>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    const [claimsRes, storesRes, ngosRes, profilesRes] = await Promise.all([
      supabase.from("cashback_claims").select("*").order("created_at", { ascending: false }),
      supabase.from("stores").select("id, name"),
      supabase.from("ngos").select("id, name"),
      supabase.from("profiles").select("id, display_name, email"),
    ]);

    if (claimsRes.data) setClaims(claimsRes.data);
    if (storesRes.data) setStores(Object.fromEntries(storesRes.data.map(s => [s.id, s.name])));
    if (ngosRes.data) setNgos(Object.fromEntries(ngosRes.data.map(n => [n.id, n.name])));
    if (profilesRes.data) setProfiles(Object.fromEntries(profilesRes.data.map(p => [p.id, p.display_name || p.email || p.id.slice(0, 8)])));
    setLoading(false);
  };

  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from("cashback_claims")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      toast.error("Erro ao atualizar status");
    } else {
      toast.success("Status atualizado");
      setClaims(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
    }
  };

  const filtered = filter === "all" ? claims : claims.filter(c => c.status === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-black flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-destructive" />
          Reclamações de Cashback
        </h1>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos ({claims.length})</SelectItem>
            {Object.entries(statusConfig).map(([key, cfg]) => (
              <SelectItem key={key} value={key}>
                {cfg.label} ({claims.filter(c => c.status === key).length})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <DuoCard className="p-8 text-center text-muted-foreground">
          Nenhuma reclamação encontrada.
        </DuoCard>
      ) : (
        <div className="space-y-3">
          {filtered.map((claim) => {
            const cfg = statusConfig[claim.status] || statusConfig.pending;
            const StatusIcon = cfg.icon;
            return (
              <DuoCard key={claim.id} className="p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm">{stores[claim.store_id] || "Loja desconhecida"}</span>
                      <Badge variant={cfg.variant} className="gap-1 text-xs">
                        <StatusIcon className="w-3 h-3" />
                        {cfg.label}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-0.5">
                      <p>Usuário: <span className="font-medium text-foreground">{profiles[claim.user_id] || claim.user_id.slice(0, 8)}</span></p>
                      <p>ONG: <span className="font-medium text-foreground">{ngos[claim.ngo_id] || "—"}</span></p>
                      <p>Pedido: <span className="font-medium text-foreground">{claim.order_number}</span></p>
                      <p>Data compra: <span className="font-medium text-foreground">{format(new Date(claim.purchase_date), "dd/MM/yyyy")}</span></p>
                      <p>Enviado em: <span className="font-medium text-foreground">{format(new Date(claim.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}</span></p>
                    </div>
                    {claim.details && (
                      <p className="text-xs mt-2 p-2 bg-muted rounded-lg">{claim.details}</p>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    <Select value={claim.status} onValueChange={(v) => updateStatus(claim.id, v)}>
                      <SelectTrigger className="w-[140px] text-xs h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusConfig).map(([key, cfg]) => (
                          <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </DuoCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
