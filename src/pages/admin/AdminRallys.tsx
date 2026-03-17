import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DuoButton } from "@/components/ui/duo-button";
import { DuoCard } from "@/components/ui/duo-card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Plus, Trophy, Calendar, Target, Gift, Trash2, Power, PowerOff } from "lucide-react";

interface Rally {
  id: string;
  ngo_id: string;
  title: string;
  goal: number;
  reward: string | null;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  ngo_name?: string;
}

interface Ngo {
  id: string;
  name: string;
}

export default function AdminRallys() {
  const [rallys, setRallys] = useState<Rally[]>([]);
  const [ngos, setNgos] = useState<Ngo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [ngoId, setNgoId] = useState("");
  const [goal, setGoal] = useState("");
  const [reward, setReward] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchData = async () => {
    setLoading(true);
    const [rallysRes, ngosRes] = await Promise.all([
      supabase.from("rallys").select("*").order("created_at", { ascending: false }),
      supabase.from("ngos").select("id, name").eq("is_active", true).order("name"),
    ]);

    const ngosData = (ngosRes.data as Ngo[]) || [];
    const rallysData = ((rallysRes.data as any[]) || []).map((r: any) => ({
      ...r,
      ngo_name: ngosData.find((n) => n.id === r.ngo_id)?.name || "—",
    }));

    setNgos(ngosData);
    setRallys(rallysData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setTitle("");
    setNgoId("");
    setGoal("");
    setReward("");
    setStartDate("");
    setEndDate("");
    setShowForm(false);
  };

  const handleCreate = async () => {
    if (!title.trim() || !ngoId || !goal || !startDate || !endDate) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    if (new Date(endDate) <= new Date(startDate)) {
      toast.error("A data de término deve ser após a de início");
      return;
    }

    setSaving(true);
    const { error } = await supabase.from("rallys").insert({
      title: title.trim(),
      ngo_id: ngoId,
      goal: Number(goal),
      reward: reward.trim() || null,
      start_date: startDate,
      end_date: endDate,
    } as any);
    setSaving(false);

    if (error) {
      toast.error("Erro ao criar rally: " + error.message);
      return;
    }

    toast.success("Rally criado com sucesso!");
    resetForm();
    fetchData();
  };

  const toggleActive = async (id: string, currentActive: boolean) => {
    const { error } = await supabase
      .from("rallys")
      .update({ is_active: !currentActive } as any)
      .eq("id", id);
    if (error) {
      toast.error("Erro ao atualizar");
    } else {
      toast.success(currentActive ? "Rally desativado" : "Rally ativado");
      fetchData();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este rally?")) return;
    const { error } = await supabase.from("rallys").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao excluir");
    } else {
      toast.success("Rally excluído");
      fetchData();
    }
  };

  const getStatus = (rally: Rally) => {
    const now = new Date();
    const start = new Date(rally.start_date);
    const end = new Date(rally.end_date);
    if (!rally.is_active) return { label: "Inativo", color: "bg-muted text-muted-foreground" };
    if (now < start) return { label: "Agendado", color: "bg-accent/20 text-accent-foreground" };
    if (now > end) return { label: "Encerrado", color: "bg-destructive/20 text-destructive" };
    return { label: "Ativo", color: "bg-primary/20 text-primary" };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <Trophy className="w-6 h-6 text-primary" /> Rallys
          </h1>
          <p className="text-sm text-muted-foreground">Gerencie campanhas e desafios para as ONGs</p>
        </div>
        <DuoButton onClick={() => setShowForm(!showForm)} className="gap-1.5">
          <Plus className="w-4 h-4" /> Novo Rally
        </DuoButton>
      </div>

      {showForm && (
        <DuoCard className="space-y-4 border-primary/30">
          <h2 className="font-bold text-base">Criar novo rally</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-muted-foreground mb-1 block">Título *</label>
              <Input
                placeholder="Ex: Rally da Solidariedade"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-11 rounded-2xl border-2"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1 block">ONG *</label>
              <Select value={ngoId} onValueChange={setNgoId}>
                <SelectTrigger className="h-11 rounded-2xl">
                  <SelectValue placeholder="Selecione a ONG" />
                </SelectTrigger>
                <SelectContent>
                  {ngos.map((ngo) => (
                    <SelectItem key={ngo.id} value={ngo.id}>
                      {ngo.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1 block">Meta (R$) *</label>
              <Input
                type="number"
                placeholder="1000"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="h-11 rounded-2xl border-2"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1 block">Data de início *</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-11 rounded-2xl border-2"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1 block">Data de término *</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-11 rounded-2xl border-2"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-muted-foreground mb-1 block">Recompensa</label>
              <Textarea
                placeholder="Ex: Badge especial + destaque no app"
                value={reward}
                onChange={(e) => setReward(e.target.value)}
                className="rounded-2xl border-2 min-h-[80px]"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <DuoButton variant="outline" onClick={resetForm}>Cancelar</DuoButton>
            <DuoButton onClick={handleCreate} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Criar Rally"}
            </DuoButton>
          </div>
        </DuoCard>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : rallys.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Trophy className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p className="font-semibold">Nenhum rally criado ainda</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rallys.map((rally) => {
            const status = getStatus(rally);
            return (
              <DuoCard key={rally.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-sm truncate">{rally.title}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Target className="w-3 h-3" /> ONG: <span className="font-semibold text-foreground">{rally.ngo_name}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="w-3 h-3" /> Meta: <span className="font-semibold text-foreground">R$ {Number(rally.goal).toFixed(2)}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {rally.start_date} → {rally.end_date}
                      </span>
                      {rally.reward && (
                        <span className="flex items-center gap-1">
                          <Gift className="w-3 h-3" /> {rally.reward}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => toggleActive(rally.id, rally.is_active)}
                      className="p-2 rounded-xl hover:bg-muted transition-colors"
                      title={rally.is_active ? "Desativar" : "Ativar"}
                    >
                      {rally.is_active ? <PowerOff className="w-4 h-4 text-muted-foreground" /> : <Power className="w-4 h-4 text-primary" />}
                    </button>
                    <button
                      onClick={() => handleDelete(rally.id)}
                      className="p-2 rounded-xl hover:bg-destructive/10 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
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
