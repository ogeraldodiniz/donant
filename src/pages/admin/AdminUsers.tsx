import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DuoCard } from "@/components/ui/duo-card";
import { DuoButton } from "@/components/ui/duo-button";
import { Input } from "@/components/ui/input";
import { Search, Phone, Mail, BellOff, Globe, MessageCircle, ChevronDown, ChevronUp, UserPlus, Trash2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UserProfile {
  id: string;
  display_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  notify_web: boolean;
  notify_whatsapp: boolean;
  notify_email: boolean;
  selected_ngo_id: string | null;
  created_at: string;
  updated_at: string;
}

interface Clickout {
  id: string;
  user_id: string;
  store_id: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  clicked_at: string;
}

interface NgoMap {
  [id: string]: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [clickouts, setClickouts] = useState<Clickout[]>([]);
  const [ngos, setNgos] = useState<NgoMap>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  // Create user
  const [showCreate, setShowCreate] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  // Delete user
  const [deleteTarget, setDeleteTarget] = useState<UserProfile | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const [profilesRes, clickoutsRes, ngosRes] = await Promise.all([
      supabase.from("profiles").select("*").is("deleted_at", null).order("created_at", { ascending: false }),
      supabase.from("clickouts").select("*").order("clicked_at", { ascending: false }).limit(1000),
      supabase.from("ngos").select("id, name"),
    ]);

    if (profilesRes.data) setUsers(profilesRes.data as UserProfile[]);
    if (clickoutsRes.data) setClickouts(clickoutsRes.data as Clickout[]);
    if (ngosRes.data) {
      const map: NgoMap = {};
      ngosRes.data.forEach((n) => { map[n.id] = n.name; });
      setNgos(map);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async () => {
    if (!newEmail || !newPassword) {
      toast.error("Preencha e-mail e senha");
      return;
    }
    setCreating(true);
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({ action: "create", email: newEmail, password: newPassword, display_name: newName }),
    });
    const json = await res.json();
    setCreating(false);
    if (json.error) {
      toast.error(json.error);
    } else {
      toast.success("Usuário criado");
      setShowCreate(false);
      setNewEmail("");
      setNewPassword("");
      setNewName("");
      fetchData();
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({ action: "delete", user_id: deleteTarget.id }),
    });
    const json = await res.json();
    setDeleting(false);
    if (json.error) {
      toast.error(json.error);
    } else {
      toast.success("Usuário excluído");
      setDeleteTarget(null);
      fetchData();
    }
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      (u.display_name ?? "").toLowerCase().includes(q) ||
      (u.email ?? "").toLowerCase().includes(q) ||
      (u.phone ?? "").includes(q)
    );
  });

  const getUserClickouts = (userId: string) =>
    clickouts.filter((c) => c.user_id === userId);

  const getUniqueUtms = (userId: string) => {
    const ucs = getUserClickouts(userId);
    const sources = new Set<string>();
    ucs.forEach((c) => { if (c.utm_source) sources.add(c.utm_source); });
    return Array.from(sources);
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" });

  return (
    <div className="space-y-4 max-w-5xl">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-black">Usuários</h1>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">{filtered.length} usuários</Badge>
          <DuoButton size="sm" onClick={() => setShowCreate(true)}>
            <UserPlus className="w-4 h-4" /> Adicionar
          </DuoButton>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, e-mail ou telefone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 rounded-xl"
        />
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum usuário encontrado.</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((u) => {
            const isExpanded = expandedUser === u.id;
            const userClickouts = getUserClickouts(u.id);
            const utmSources = getUniqueUtms(u.id);

            return (
              <DuoCard key={u.id} className="p-0 overflow-hidden">
                <button
                  onClick={() => setExpandedUser(isExpanded ? null : u.id)}
                  className="w-full p-3 sm:p-4 flex items-center gap-3 text-left hover:bg-muted/30 transition-colors"
                >
                  {u.avatar_url ? (
                    <img src={u.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                      {(u.display_name ?? "U").charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm truncate">{u.display_name || "Sem nome"}</p>
                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5">
                    {u.notify_web && <Globe className="w-3.5 h-3.5 text-primary" />}
                    {u.notify_whatsapp && <MessageCircle className="w-3.5 h-3.5 text-primary" />}
                    {u.notify_email && <Mail className="w-3.5 h-3.5 text-primary" />}
                    {!u.notify_web && !u.notify_whatsapp && !u.notify_email && <BellOff className="w-3.5 h-3.5 text-muted-foreground" />}
                  </div>
                  {utmSources.length > 0 && (
                    <Badge variant="outline" className="hidden sm:inline-flex text-[10px]">{utmSources[0]}</Badge>
                  )}
                  <span className="text-[10px] text-muted-foreground hidden sm:block">{formatDate(u.created_at)}</span>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </button>

                {isExpanded && (
                  <div className="border-t border-border px-3 sm:px-4 py-3 space-y-3 bg-muted/20">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="text-muted-foreground mb-0.5">Nome</p>
                        <p className="font-medium">{u.display_name || "—"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-0.5">E-mail</p>
                        <p className="font-medium">{u.email || "—"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-0.5">Telefone</p>
                        <p className="font-medium flex items-center gap-1">
                          {u.phone ? <><Phone className="w-3 h-3" /> {u.phone}</> : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-0.5">ONG selecionada</p>
                        <p className="font-medium">{u.selected_ngo_id ? ngos[u.selected_ngo_id] ?? u.selected_ngo_id : "—"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-0.5">Cadastro</p>
                        <p className="font-medium">{formatDate(u.created_at)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-0.5">Última atualização</p>
                        <p className="font-medium">{formatDate(u.updated_at)}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-muted-foreground text-xs mb-1.5">Preferências de notificação</p>
                      <div className="flex gap-2 flex-wrap">
                        <Badge variant={u.notify_web ? "default" : "outline"} className="text-[10px] gap-1">
                          <Globe className="w-3 h-3" /> Push {u.notify_web ? "✓" : "✗"}
                        </Badge>
                        <Badge variant={u.notify_whatsapp ? "default" : "outline"} className="text-[10px] gap-1">
                          <MessageCircle className="w-3 h-3" /> WhatsApp {u.notify_whatsapp ? "✓" : "✗"}
                        </Badge>
                        <Badge variant={u.notify_email ? "default" : "outline"} className="text-[10px] gap-1">
                          <Mail className="w-3 h-3" /> E-mail {u.notify_email ? "✓" : "✗"}
                        </Badge>
                      </div>
                    </div>

                    {userClickouts.length > 0 && (
                      <div>
                        <p className="text-muted-foreground text-xs mb-1.5">UTMs ({userClickouts.length} cliques)</p>
                        <div className="flex gap-1.5 flex-wrap">
                          {Array.from(new Set(userClickouts.map(c => [c.utm_source, c.utm_medium, c.utm_campaign].filter(Boolean).join(" / ")).filter(Boolean))).map((utm, i) => (
                            <Badge key={i} variant="outline" className="text-[10px]">{utm}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-2 border-t border-border">
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteTarget(u); }}
                        className="text-xs text-destructive font-bold hover:underline flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Excluir usuário
                      </button>
                    </div>
                  </div>
                )}
              </DuoCard>
            );
          })}
        </div>
      )}

      {/* Create user dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar usuário</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Nome</label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nome do usuário" className="rounded-xl mt-1" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">E-mail *</label>
              <Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="email@exemplo.com" className="rounded-xl mt-1" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Senha *</label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Mínimo 6 caracteres" className="rounded-xl mt-1" />
            </div>
          </div>
          <DialogFooter>
            <DuoButton variant="outline" onClick={() => setShowCreate(false)}>Cancelar</DuoButton>
            <DuoButton onClick={handleCreate} disabled={creating}>
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              Criar
            </DuoButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir usuário</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir <strong>{deleteTarget?.display_name || deleteTarget?.email}</strong>? O perfil será marcado como excluído e a conta de autenticação será removida. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
