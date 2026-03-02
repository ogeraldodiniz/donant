import { useState, useEffect, useMemo } from "react";
import { Save, Loader2, Languages, Globe, Layout } from "lucide-react";
import { useAdminLocale } from "@/hooks/useAdminLocale";
import { DuoCard } from "@/components/ui/duo-card";
import { DuoButton } from "@/components/ui/duo-button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ContentRow {
  id: string;
  section: string;
  content_key: string;
  value: string;
  locale: string;
}

/** Sections ordered to match the site's visual layout */
const PAGES: Record<string, { label: string; sections: string[] }> = {
  home_public: {
    label: "Home (sem login)",
    sections: ["hero", "how_it_works", "features", "stores", "ngos", "stats", "testimonials", "faq", "cta"],
  },
  home_logged: {
    label: "Home (logado)",
    sections: ["home_logged"],
  },
  ngos_page: {
    label: "ONGs",
    sections: ["ngos_page"],
  },
  stores_page: {
    label: "Lojas",
    sections: ["stores_page"],
  },
  impact_page: {
    label: "Impacto",
    sections: ["impact"],
  },
  transparency_page: {
    label: "Transparência",
    sections: ["transparency"],
  },
  auth_page: {
    label: "Login / Cadastro",
    sections: ["auth"],
  },
  settings_page: {
    label: "Perfil / Configurações",
    sections: ["settings"],
  },
  onboarding_page: {
    label: "Onboarding",
    sections: ["onboarding"],
  },
  notifications_page: {
    label: "Notificações",
    sections: ["notifications_page"],
  },
  privacy_page: {
    label: "Privacidade",
    sections: ["privacy"],
  },
  terms_page: {
    label: "Termos de Uso",
    sections: ["terms"],
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
  ngos: "ONGs (home)",
  stores: "Lojas (home)",
  ngos_page: "Página de ONGs",
  stores_page: "Página de Lojas",
  impact: "Impacto",
  transparency: "Transparência",
  auth: "Login / Cadastro",
  settings: "Perfil",
  onboarding: "Onboarding",
  notifications_page: "Notificações",
  privacy: "Privacidade",
  terms: "Termos de Uso",
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
  const [activePage, setActivePage] = useState<string>("home_public");

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

  const currentGroups = viewMode === "pages" ? PAGES : GLOBAL;
  const activeGroup = currentGroups[activePage];

  /** Rows filtered and sorted by the section order defined in the group */
  const sortedRows = useMemo(() => {
    if (!activeGroup) return [];
    const sectionOrder = activeGroup.sections;
    return rows
      .filter((r) => sectionOrder.includes(r.section))
      .sort((a, b) => {
        const idxA = sectionOrder.indexOf(a.section);
        const idxB = sectionOrder.indexOf(b.section);
        if (idxA !== idxB) return idxA - idxB;
        return a.content_key.localeCompare(b.content_key);
      });
  }, [rows, activeGroup]);

  /** Group sorted rows by section, preserving order */
  const groupedSections = useMemo(() => {
    if (!activeGroup) return [];
    const map = new Map<string, ContentRow[]>();
    // Initialize in order
    for (const sec of activeGroup.sections) {
      map.set(sec, []);
    }
    for (const row of sortedRows) {
      map.get(row.section)?.push(row);
    }
    // Return only non-empty
    return Array.from(map.entries()).filter(([, items]) => items.length > 0);
  }, [sortedRows, activeGroup]);

  const editedCount = Object.keys(editedValues).length;

  // When switching view mode, select first item
  const handleViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    const groups = mode === "pages" ? PAGES : GLOBAL;
    setActivePage(Object.keys(groups)[0]);
  };

  return (
    <div className="space-y-6">
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

      {/* View mode toggle + page selector */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-2">
          <button
            onClick={() => handleViewMode("pages")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
              viewMode === "pages"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layout className="w-4 h-4" /> Páginas
          </button>
          <button
            onClick={() => handleViewMode("global")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
              viewMode === "global"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            <Globe className="w-4 h-4" /> Conteúdos Globais
          </button>
        </div>

        <Select value={activePage} onValueChange={setActivePage}>
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="Selecione..." />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(currentGroups).map(([key, group]) => (
              <SelectItem key={key} value={key}>{group.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Content editor */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : groupedSections.length === 0 ? (
        <DuoCard className="p-8 text-center">
          <p className="text-muted-foreground">Nenhum conteúdo nesta página para <strong>{locale.toUpperCase()}</strong>.</p>
          <p className="text-xs text-muted-foreground mt-1">Os conteúdos são criados automaticamente quando usados no site.</p>
        </DuoCard>
      ) : (
        groupedSections.map(([section, items]) => (
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
      )}
    </div>
  );
}
