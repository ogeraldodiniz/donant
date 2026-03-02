import { useState, useEffect, useMemo } from "react";
import { Save, Loader2, Languages, Globe, Layout } from "lucide-react";
import { useAdminLocale } from "@/hooks/useAdminLocale";
import { DuoCard } from "@/components/ui/duo-card";
import { DuoButton } from "@/components/ui/duo-button";
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

const PAGES: Record<string, { label: string; sections: string[] }> = {
  home_public: {
    label: "Home (sem login)",
    sections: ["hero", "how_it_works", "features", "stats", "testimonials", "cta", "faq"],
  },
  home_logged: {
    label: "Home (logado)",
    sections: ["home_logged"],
  },
  ngos_page: {
    label: "ONGs",
    sections: ["ngos"],
  },
  stores_page: {
    label: "Lojas",
    sections: ["stores"],
  },
};

const GLOBAL: Record<string, { label: string; sections: string[] }> = {
  nav: { label: "Navegação", sections: ["nav"] },
  footer: { label: "Rodapé", sections: ["footer"] },
};

const SECTION_LABELS: Record<string, string> = {
  hero: "Hero / Banner",
  how_it_works: "Como funciona",
  features: "Funcionalidades",
  stats: "Estatísticas",
  testimonials: "Depoimentos",
  cta: "Chamada para ação (CTA)",
  faq: "Perguntas frequentes (FAQ)",
  home_logged: "Home logado",
  ngos: "ONGs",
  stores: "Lojas",
  nav: "Menu de navegação",
  footer: "Rodapé",
};

type ViewMode = "pages" | "global";

export default function AdminBlog() {
  const { adminLocale: locale } = useAdminLocale();
  const [rows, setRows] = useState<ContentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [viewMode, setViewMode] = useState<ViewMode>("pages");
  const [activePage, setActivePage] = useState<string | null>(null);

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
    if (entries.length === 0) { toast.info("Nenhuma alteração para salvar"); return; }
    setSaving(true);
    let errorCount = 0;
    for (const [id, value] of entries) {
      const { error } = await supabase.from("site_content").update({ value }).eq("id", id);
      if (error) errorCount++;
    }
    setSaving(false);
    if (errorCount > 0) toast.error(`${errorCount} erro(s) ao salvar`);
    else toast.success(`${entries.length} conteúdo(s) salvo(s)!`);
    fetchContent();
  };

  const sectionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    rows.forEach((r) => { counts[r.section] = (counts[r.section] || 0) + 1; });
    return counts;
  }, [rows]);

  const groupCount = (group: { sections: string[] }) =>
    group.sections.reduce((sum, sec) => sum + (sectionCounts[sec] || 0), 0);

  const currentGroups = viewMode === "pages" ? PAGES : GLOBAL;
  const activeGroup = activePage ? currentGroups[activePage] : null;

  const activeRows = useMemo(() => {
    if (!activeGroup) return [];
    return rows.filter((r) => activeGroup.sections.includes(r.section));
  }, [rows, activeGroup]);

  const orphanSections = useMemo(() => {
    const mapped = new Set([
      ...Object.values(PAGES).flatMap((p) => p.sections),
      ...Object.values(GLOBAL).flatMap((g) => g.sections),
    ]);
    return [...new Set(rows.map((r) => r.section))].filter((s) => !mapped.has(s));
  }, [rows]);

  const editedCount = Object.keys(editedValues).length;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <Languages className="w-6 h-6" /> Conteúdos ({locale.toUpperCase()})
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Edite textos do site — novos textos são criados automaticamente ao usar no código
          </p>
        </div>
        {editedCount > 0 && (
          <DuoButton size="sm" onClick={handleSaveAll} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Salvar ({editedCount})
          </DuoButton>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => { setViewMode("pages"); setActivePage(null); }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
            viewMode === "pages"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          <Layout className="w-4 h-4" /> Páginas
        </button>
        <button
          onClick={() => { setViewMode("global"); setActivePage(null); }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
            viewMode === "global"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          <Globe className="w-4 h-4" /> Conteúdos Globais
        </button>
      </div>

      {!activePage ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.entries(currentGroups).map(([key, group]) => {
            const count = groupCount(group);
            return (
              <button key={key} onClick={() => setActivePage(key)} className="text-left">
                <DuoCard className="hover:border-primary/30 transition-colors cursor-pointer p-4">
                  <p className="font-bold">{group.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {group.sections.map((s) => SECTION_LABELS[s] || s).join(", ")}
                  </p>
                  <Badge variant="secondary" className="mt-2 text-xs">
                    {count} {count === 1 ? "conteúdo" : "conteúdos"}
                  </Badge>
                </DuoCard>
              </button>
            );
          })}

          {viewMode === "pages" && orphanSections.length > 0 && (
            <button onClick={() => setActivePage("__orphan")} className="text-left">
              <DuoCard className="hover:border-primary/30 transition-colors cursor-pointer p-4 border-dashed">
                <p className="font-bold text-muted-foreground">Outros</p>
                <p className="text-xs text-muted-foreground mt-0.5">{orphanSections.join(", ")}</p>
                <Badge variant="outline" className="mt-2 text-xs">
                  {orphanSections.reduce((sum, s) => sum + (sectionCounts[s] || 0), 0)} conteúdos
                </Badge>
              </DuoCard>
            </button>
          )}
        </div>
      ) : (
        <>
          <button onClick={() => setActivePage(null)} className="text-sm text-primary font-semibold hover:underline">
            ← Voltar
          </button>

          <h2 className="text-lg font-bold">
            {activePage === "__orphan" ? "Outros conteúdos" : currentGroups[activePage]?.label}
          </h2>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (() => {
            const displayRows = activePage === "__orphan"
              ? rows.filter((r) => orphanSections.includes(r.section))
              : activeRows;
            const grouped = displayRows.reduce<Record<string, ContentRow[]>>((acc, row) => {
              (acc[row.section] = acc[row.section] || []).push(row);
              return acc;
            }, {});

            return Object.keys(grouped).length === 0 ? (
              <DuoCard className="p-8 text-center">
                <p className="text-muted-foreground">Nenhum conteúdo nesta página para <strong>{locale.toUpperCase()}</strong>.</p>
                <p className="text-xs text-muted-foreground mt-1">Os conteúdos são criados automaticamente quando usados no site.</p>
              </DuoCard>
            ) : (
              Object.entries(grouped).map(([section, items]) => (
                <DuoCard key={section} className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {SECTION_LABELS[section] || section}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{items.length} itens</span>
                  </div>
                  <div className="space-y-2">
                    {items.map((row) => (
                      <div key={row.id} className="space-y-1">
                        <Label className="text-xs font-mono text-muted-foreground">{row.content_key}</Label>
                        <Textarea
                          value={editedValues[row.id] ?? row.value}
                          onChange={(e) => handleChange(row.id, e.target.value)}
                          rows={1}
                          className={`resize-none text-sm ${editedValues[row.id] !== undefined && editedValues[row.id] !== row.value ? "border-primary" : ""}`}
                        />
                      </div>
                    ))}
                  </div>
                </DuoCard>
              ))
            );
          })()}
        </>
      )}
    </div>
  );
}
