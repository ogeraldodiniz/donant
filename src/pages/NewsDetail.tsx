import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Loader2, ArrowLeft, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { DuoCard } from "@/components/ui/duo-card";

interface NewsRow {
  id: string;
  title: string;
  summary: string | null;
  content: string;
  cover_url: string | null;
  published_at: string | null;
}

export default function NewsDetail() {
  const { slug } = useParams();
  const [news, setNews] = useState<NewsRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    supabase
      .from("news")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle()
      .then(({ data }) => {
        setNews(data as any);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!news) {
    return (
      <div className="container py-12 text-center space-y-4">
        <p className="text-muted-foreground">Notícia não encontrada.</p>
        <Link to="/noticias" className="text-primary font-bold text-sm hover:underline">
          ← Voltar para notícias
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-3xl space-y-6">
      <Link to="/noticias" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>

      {news.cover_url && (
        <img src={news.cover_url} alt="" className="w-full h-56 sm:h-72 object-cover rounded-2xl" />
      )}

      <div className="space-y-3">
        <h1 className="text-2xl sm:text-3xl font-black">{news.title}</h1>
        {news.published_at && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(news.published_at).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        )}
        {news.summary && (
          <p className="text-muted-foreground font-medium">{news.summary}</p>
        )}
      </div>

      <DuoCard className="p-6">
        <div className="prose prose-sm max-w-none whitespace-pre-wrap text-foreground">
          {news.content}
        </div>
      </DuoCard>
    </div>
  );
}
