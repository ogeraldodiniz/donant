import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Loader2, Eye, EyeOff, Newspaper, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminLocale } from "@/hooks/useAdminLocale";
import { DuoCard } from "@/components/ui/duo-card";
import { DuoButton } from "@/components/ui/duo-button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

interface NewsRow {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  content: string;
  cover_url: string | null;
  locale: string;
  is_published: boolean;
  is_featured: boolean;
  published_at: string | null;
  created_at: string;
}

const slugify = (text: string) =>
  text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const emptyForm = { title: "", slug: "", summary: "", content: "", cover_url: "", is_published: false };

export default function AdminNews() {
  const { adminLocale: locale } = useAdminLocale();
  const [rows, setRows] = useState<NewsRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetch = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("news")
      .select("*")
      .eq("locale", locale)
      .order("created_at", { ascending: false });
    if (error) toast.error("Erro ao carregar notícias");
    else setRows((data as any[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, [locale]);

  const openNew = () => {
    setEditId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (row: NewsRow) => {
    setEditId(row.id);
    setForm({
      title: row.title,
      slug: row.slug,
      summary: row.summary || "",
      content: row.content,
      cover_url: row.cover_url || "",
      is_published: row.is_published,
    });
    setDialogOpen(true);
  };

  const handleTitleChange = (title: string) => {
    setForm((f) => ({
      ...f,
      title,
      slug: !editId ? slugify(title) : f.slug,
    }));
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.slug.trim()) {
      toast.error("Título e slug são obrigatórios");
      return;
    }
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      summary: form.summary.trim() || null,
      content: form.content,
      cover_url: form.cover_url.trim() || null,
      is_published: form.is_published,
      published_at: form.is_published ? new Date().toISOString() : null,
      locale,
    };

    if (editId) {
      const { error } = await supabase.from("news").update(payload).eq("id", editId);
      if (error) toast.error("Erro ao salvar");
      else toast.success("Notícia atualizada!");
    } else {
      const { error } = await supabase.from("news").insert(payload);
      if (error) toast.error("Erro ao criar: " + error.message);
      else toast.success("Notícia criada!");
    }
    setSaving(false);
    setDialogOpen(false);
    fetch();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir esta notícia?")) return;
    const { error } = await supabase.from("news").delete().eq("id", id);
    if (error) toast.error("Erro ao excluir");
    else { toast.success("Excluída!"); fetch(); }
  };

  const togglePublish = async (row: NewsRow) => {
    const next = !row.is_published;
    const { error } = await supabase.from("news").update({
      is_published: next,
      published_at: next ? new Date().toISOString() : null,
    }).eq("id", row.id);
    if (error) toast.error("Erro");
    else { toast.success(next ? "Publicada!" : "Despublicada!"); fetch(); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <Newspaper className="w-6 h-6" /> Notícias ({locale.toUpperCase()})
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{rows.length} notícia(s)</p>
        </div>
        <DuoButton size="sm" onClick={openNew}>
          <Plus className="w-4 h-4" /> Nova notícia
        </DuoButton>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : rows.length === 0 ? (
        <DuoCard className="p-8 text-center">
          <p className="text-muted-foreground">Nenhuma notícia cadastrada.</p>
        </DuoCard>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <DuoCard key={row.id} className="p-4">
              <div className="flex items-start gap-4">
                {row.cover_url && (
                  <img src={row.cover_url} alt="" className="w-20 h-14 rounded-lg object-cover flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-sm truncate">{row.title}</h3>
                    {row.is_featured && (
                      <Badge variant="outline" className="text-[10px] border-yellow-500/30 text-yellow-600">⭐ Destaque</Badge>
                    )}
                    <Badge variant={row.is_published ? "default" : "secondary"} className="text-[10px]">
                      {row.is_published ? "Publicada" : "Rascunho"}
                    </Badge>
                  </div>
                  {row.summary && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{row.summary}</p>
                  )}
                  <p className="text-[10px] text-muted-foreground mt-1">
                    /{row.slug} · {new Date(row.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={async () => {
                      const next = !row.is_featured;
                      const { error } = await supabase.from("news").update({ is_featured: next }).eq("id", row.id);
                      if (!error) { setRows((prev) => prev.map((r) => r.id === row.id ? { ...r, is_featured: next } : r)); toast.success(next ? "Destaque ativado" : "Destaque removido"); }
                    }}
                    className={`p-2 rounded-lg hover:bg-muted transition-colors ${row.is_featured ? "text-yellow-500" : "text-muted-foreground"}`}
                    title={row.is_featured ? "Remover destaque" : "Marcar como destaque"}
                  >
                    <Star className="w-4 h-4" fill={row.is_featured ? "currentColor" : "none"} />
                  </button>
                  <button onClick={() => togglePublish(row)} className="p-2 rounded-lg hover:bg-muted transition-colors" title={row.is_published ? "Despublicar" : "Publicar"}>
                    {row.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button onClick={() => openEdit(row)} className="p-2 rounded-lg hover:bg-muted transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(row.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </DuoCard>
          ))}
        </div>
      )}

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? "Editar notícia" : "Nova notícia"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1">
              <Label>Título *</Label>
              <Input value={form.title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="Título da notícia" />
            </div>
            <div className="space-y-1">
              <Label>Slug *</Label>
              <Input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder="titulo-da-noticia" />
            </div>
            <div className="space-y-1">
              <Label>Resumo</Label>
              <Textarea value={form.summary} onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))} rows={2} placeholder="Breve resumo..." />
            </div>
            <div className="space-y-1">
              <Label>Conteúdo</Label>
              <Textarea value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} rows={8} placeholder="Conteúdo completo da notícia..." />
            </div>
            <div className="space-y-1">
              <Label>URL da capa</Label>
              <Input value={form.cover_url} onChange={(e) => setForm((f) => ({ ...f, cover_url: e.target.value }))} placeholder="https://..." />
              {form.cover_url && <img src={form.cover_url} alt="" className="w-full h-32 object-cover rounded-lg mt-1" />}
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.is_published} onCheckedChange={(v) => setForm((f) => ({ ...f, is_published: v }))} />
              <Label>Publicar agora</Label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <DuoButton variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</DuoButton>
              <DuoButton onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {editId ? "Salvar" : "Criar"}
              </DuoButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
