import { useState, useEffect } from "react";
import { Save, Loader2, Languages, Plus, Trash2 } from "lucide-react";
import { useAdminLocale } from "@/hooks/useAdminLocale";
import { DuoCard } from "@/components/ui/duo-card";
import { DuoButton } from "@/components/ui/duo-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ContentRow {
  id: string;
  section: string;
  content_key: string;
  value: string;
  locale: string;
}

export default function AdminBlog() {
  const { adminLocale: locale } = useAdminLocale();
  const [rows, setRows] = useState<ContentRow[]>([]);
  const [rows, setRows] = useState<ContentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [newKey, setNewKey] = useState("");
  const [newSection, setNewSection] = useState("general");
  const [newValue, setNewValue] = useState("");

  const fetchContent = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("site_content")
      .select("*")
      .eq("locale", locale)
      .order("section")
      .order("content_key");
    if (error) toast.error("Erro ao carregar conteúdos");
    else setRows(data || []);
    setEditedValues({});
    setLoading(false);
  };

  useEffect(() => {
    fetchContent();
  }, [locale]);

  const handleChange = (id: string, value: string) => {
    setEditedValues((prev) => ({ ...prev, [id]: value }));
  };

  const handleSaveAll = async () => {
    const entries = Object.entries(editedValues);
    if (entries.length === 0) {
      toast.info("Nenhuma alteração para salvar");
      return;
    }
    setSaving(true);
    let errorCount = 0;
    for (const [id, value] of entries) {
      const { error } = await supabase
        .from("site_content")
        .update({ value })
        .eq("id", id);
      if (error) errorCount++;
    }
    setSaving(false);
    if (errorCount > 0) toast.error(`${errorCount} erro(s) ao salvar`);
    else toast.success(`${entries.length} conteúdo(s) salvo(s)!`);
    fetchContent();
  };

  const handleAdd = async () => {
    if (!newKey.trim()) {
      toast.error("Informe a chave do conteúdo");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("site_content").insert({
      content_key: newKey.trim(),
      section: newSection.trim() || "general",
      value: newValue,
      locale,
    });
    setSaving(false);
    if (error) {
      toast.error(error.message.includes("duplicate") ? "Essa chave já existe para este idioma" : "Erro ao criar conteúdo");
    } else {
      toast.success("Conteúdo adicionado!");
      setNewKey("");
      setNewValue("");
      fetchContent();
    }
  };

  const handleDelete = async (id: string, key: string) => {
    if (!confirm(`Excluir "${key}" (${locale.toUpperCase()})?`)) return;
    const { error } = await supabase.from("site_content").delete().eq("id", id);
    if (error) toast.error("Erro ao excluir");
    else {
      toast.success("Excluído");
      fetchContent();
    }
  };

  // Group by section
  const sections = rows.reduce<Record<string, ContentRow[]>>((acc, row) => {
    (acc[row.section] = acc[row.section] || []).push(row);
    return acc;
  }, {});

  const editedCount = Object.keys(editedValues).length;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <Languages className="w-6 h-6" /> Conteúdos ({locale.toUpperCase()})
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Edite textos do site — use o seletor de idioma no topo para alternar
          </p>
        </div>
        <div className="flex items-center gap-2">
          {editedCount > 0 && (
            <DuoButton size="sm" onClick={handleSaveAll} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Salvar ({editedCount})
            </DuoButton>
          )}
        </div>
      </div>

      {/* Add new content */}
      <DuoCard className="space-y-3 p-4">
        <p className="font-bold text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> Novo conteúdo ({locale.toUpperCase()})
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div>
            <Label className="text-xs">Seção</Label>
            <Input value={newSection} onChange={(e) => setNewSection(e.target.value)} placeholder="general" className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Chave</Label>
            <Input value={newKey} onChange={(e) => setNewKey(e.target.value)} placeholder="hero_title" className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Valor</Label>
            <Input value={newValue} onChange={(e) => setNewValue(e.target.value)} placeholder="Texto..." className="mt-1" />
          </div>
        </div>
        <DuoButton size="sm" onClick={handleAdd} disabled={saving || !newKey.trim()}>
          <Plus className="w-4 h-4" /> Adicionar
        </DuoButton>
      </DuoCard>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : Object.keys(sections).length === 0 ? (
        <DuoCard className="p-8 text-center">
          <p className="text-muted-foreground">
            Nenhum conteúdo cadastrado para <strong>{locale.toUpperCase()}</strong>.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Adicione conteúdos acima ou mude o idioma.
          </p>
        </DuoCard>
      ) : (
        Object.entries(sections).map(([section, items]) => (
          <DuoCard key={section} className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs font-mono">{section}</Badge>
              <span className="text-xs text-muted-foreground">{items.length} itens</span>
            </div>
            <div className="space-y-2">
              {items.map((row) => (
                <div key={row.id} className="flex items-start gap-2">
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs font-mono text-muted-foreground">{row.content_key}</Label>
                    <Textarea
                      value={editedValues[row.id] ?? row.value}
                      onChange={(e) => handleChange(row.id, e.target.value)}
                      rows={1}
                      className={`resize-none text-sm ${editedValues[row.id] !== undefined && editedValues[row.id] !== row.value ? "border-primary" : ""}`}
                    />
                  </div>
                  <button
                    onClick={() => handleDelete(row.id, row.content_key)}
                    className="mt-6 p-1.5 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </DuoCard>
        ))
      )}
    </div>
  );
}
