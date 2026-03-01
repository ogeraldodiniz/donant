import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLocale } from "@/hooks/useLocale";

interface ContentMap {
  [key: string]: string;
}

export function useSiteContent(section?: string) {
  const { locale } = useLocale();

  const { data: content = {}, isLoading } = useQuery<ContentMap>({
    queryKey: ["site_content", locale, section],
    queryFn: async () => {
      let query = supabase
        .from("site_content")
        .select("content_key, value")
        .eq("locale", locale);

      if (section) {
        query = query.eq("section", section);
      }

      const { data, error } = await query;
      if (error) throw error;

      const map: ContentMap = {};
      for (const row of data || []) {
        map[row.content_key] = row.value;
      }
      return map;
    },
    staleTime: 5 * 60 * 1000, // cache 5 min
  });

  const t = (key: string, fallback?: string) => content[key] || fallback || key;

  return { t, content, isLoading };
}
