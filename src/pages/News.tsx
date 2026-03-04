import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Loader2, Newspaper, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLocale } from "@/hooks/useLocale";
import { DuoCard } from "@/components/ui/duo-card";
import { useSiteContent } from "@/hooks/useSiteContent";

interface NewsRow {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  cover_url: string | null;
  published_at: string | null;
}

export default function News() {
  const { locale } = useLocale();
  const { t } = useSiteContent("news_page");
  const [rows, setRows] = useState<NewsRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("news")
      .select("id, title, slug, summary, cover_url, published_at")
      .eq("locale", locale)
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error) setRows((data as any[]) || []);
        setLoading(false);
      });
  }, [locale]);

  return (
    <div className="container py-8 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black flex items-center justify-center gap-2">
          <Newspaper className="w-7 h-7 text-primary" />
          {t("title", "Notícias")}
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          {t("subtitle", "Fique por dentro das novidades e atualizações.")}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : rows.length === 0 ? (
        <DuoCard className="p-8 text-center">
          <p className="text-muted-foreground">Nenhuma notícia publicada ainda.</p>
        </DuoCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rows.map((row) => (
            <Link key={row.id} to={`/noticias/${row.slug}`}>
              <DuoCard className="overflow-hidden hover:border-primary/30 transition-colors cursor-pointer h-full">
                {row.cover_url && (
                  <img src={row.cover_url} alt="" className="w-full h-40 object-cover" />
                )}
                <div className="p-4 space-y-2">
                  <h2 className="font-bold text-sm line-clamp-2">{row.title}</h2>
                  {row.summary && (
                    <p className="text-xs text-muted-foreground line-clamp-3">{row.summary}</p>
                  )}
                  {row.published_at && (
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(row.published_at).toLocaleDateString("pt-BR")}
                    </p>
                  )}
                </div>
              </DuoCard>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
