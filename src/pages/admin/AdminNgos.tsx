import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Save, X, Loader2 } from "lucide-react";
import { DuoButton } from "@/components/ui/duo-button";
import { DuoCard } from "@/components/ui/duo-card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Ngo {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  mission: string | null;
  logo_url: string | null;
  website_url: string | null;
  is_active: boolean;
  total_received: number;
}

const emptyNgo = {
  name: "",
  slug: "",
  description: "",
  mission: "",
  logo_url: "",
  website_url: "",
  is_active: true,
};

export default function AdminNgos() {
  const [ngos, setNgos] = useState<Ngo[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyNgo);
  const [saving, setSaving] = useState(false);

  const fetchNgos = async () => {
    setLoading(true);
    const { data } = await supabase.from("ngos").select("*").order("name");
    if (data) setNgos(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchNgos();
  }, []);

  const generateSlug = (name: string) =>
    name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const handleEdit = (ngo: Ngo) => {
    setEditing(ngo.id);
    setCreating(false);
    setForm({
      name: ngo.name,
      slug: ngo.slug,
      description: ngo.description || "",
      mission: ngo.mission || "",
      logo_url: ngo.logo_url || "",
      website_url: ngo.website_url || "",
      is_active: ngo.is_active,
    });
  };

  const handleCreate = () => {
    setCreating(true);
    setEditing(null);
    setForm(emptyNgo);
  };

  const handleCancel = () => {
    setEditing(null);
    setCreating(false);
    setForm(emptyNgo);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }
    setSaving(true);
    const slug = form.slug || generateSlug(form.name);
    const payload = {
      name: form.name.trim(),
      slug,
      description: form.description || null,
      mission: form.mission || null,
      logo_url: form.logo_url || null,
      website_url: form.website_url || null,
      is_active: form.is_active,
    };

    if (creating) {
      const { error } = await supabase.from("ngos").insert(payload);
      if (error) toast.error("Erro ao criar ONG");
      else toast.success("ONG criada!");
    } else if (editing) {
      const { error } = await supabase.from("ngos").update(payload).eq("id", editing);
      if (error) toast.error("Erro ao atualizar ONG");
      else toast.success("ONG atualizada!");
    }
    setSaving(false);
    handleCancel();
    fetchNgos();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Excluir "${name}"? Esta ação não pode ser desfeita.`)) return;
    const { error } = await supabase.from("ngos").delete().eq("id", id);
    if (error) toast.error("Erro ao excluir ONG");
    else {
      toast.success("ONG excluída");
      fetchNgos();
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black">Gerenciar ONGs</h1>
        <DuoButton size="sm" onClick={handleCreate} disabled={creating}>
          <Plus className="w-4 h-4" /> Nova ONG
        </DuoButton>
      </div>

      {(creating || editing) && (
        <DuoCard className="space-y-4">
          <h3 className="font-bold">{creating ? "Nova ONG" : "Editar ONG"}</h3>
          <div className="space-y-3">
            <div>
              <Label>Nome *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: generating(form.slug, e.target.value) })} />
            </div>
            <div>
              <Label>Slug</Label>
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="gerado automaticamente" />
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
            </div>
            <div>
              <Label>Missão</Label>
              <Textarea value={form.mission} onChange={(e) => setForm({ ...form, mission: e.target.value })} rows={2} />
            </div>
            <div>
              <Label>URL do Logo</Label>
              <Input value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} placeholder="https://..." />
            </div>
            <div>
              <Label>Website</Label>
              <Input value={form.website_url} onChange={(e) => setForm({ ...form, website_url: e.target.value })} placeholder="https://..." />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
              <Label>Ativa</Label>
            </div>
          </div>
          <div className="flex gap-3">
            <DuoButton variant="outline" size="sm" onClick={handleCancel}><X className="w-4 h-4" /> Cancelar</DuoButton>
            <DuoButton size="sm" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Salvar
            </DuoButton>
          </div>
        </DuoCard>
      )}

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-3">
          {ngos.map((ngo) => (
            <DuoCard key={ngo.id} className="flex items-center gap-4">
              {ngo.logo_url ? (
                <img src={ngo.logo_url} alt={ngo.name} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-sm">
                  {ngo.name.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-bold truncate">{ngo.name}</p>
                <p className="text-xs text-muted-foreground">/{ngo.slug} · {ngo.is_active ? "Ativa" : "Inativa"} · R$ {Number(ngo.total_received).toFixed(2)}</p>
              </div>
              <div className="flex gap-1">
                <DuoButton variant="outline" size="sm" onClick={() => handleEdit(ngo)}><Pencil className="w-4 h-4" /></DuoButton>
                <DuoButton variant="outline" size="sm" onClick={() => handleDelete(ngo.id, ngo.name)}><Trash2 className="w-4 h-4 text-destructive" /></DuoButton>
              </div>
            </DuoCard>
          ))}
          {ngos.length === 0 && <p className="text-center text-muted-foreground py-4">Nenhuma ONG cadastrada.</p>}
        </div>
      )}
    </div>
  );
}

function generating(currentSlug: string, newName: string) {
  // Only auto-generate slug if it hasn't been manually edited
  if (!currentSlug || currentSlug === newName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")) {
    return newName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }
  return currentSlug;
}
