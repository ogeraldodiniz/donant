import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLocale } from "@/hooks/useLocale";

interface ContentMap {
  [key: string]: string;
}

/**
 * Auto-creates missing content keys in site_content when a fallback is used.
 * This ensures the admin CMS always has entries for every text used in code.
 */
async function ensureContentExists(
  locale: string,
  key: string,
  fallback: string,
  section: string,
  existingKeys: Set<string>
) {
  if (existingKeys.has(key) || !fallback || fallback === key) return;
  // Mark as known to avoid duplicate inserts in the same render
  existingKeys.add(key);

  // Determine section from key prefix
  const resolvedSection = inferSection(key, section);

  await supabase.from("site_content").upsert(
    { content_key: key, value: fallback, locale, section: resolvedSection },
    { onConflict: "content_key,locale" }
  ).select();
}

function inferSection(key: string, defaultSection: string): string {
  if (key.startsWith("hero_")) return "hero";
  if (key.startsWith("how_")) return "how_it_works";
  if (key.startsWith("feat")) return "features";
  if (key.startsWith("stat")) return "stats";
  if (key.startsWith("testimonial")) return "testimonials";
  if (key.startsWith("cta_")) return "cta";
  if (key.startsWith("faq")) return "faq";
  if (key.startsWith("home_")) return "home_logged";
  if (key.startsWith("nav_")) return "nav";
  if (key.startsWith("footer_")) return "footer";
  return defaultSection;
}

export function useSiteContent(section?: string) {
  const { locale } = useLocale();

  // Always fetch global keys alongside the requested section
  const { data: content = {}, isLoading } = useQuery<ContentMap>({
    queryKey: ["site_content", locale, section],
    queryFn: async () => {
      let query = supabase
        .from("site_content")
        .select("content_key, value")
        .eq("locale", locale);

      if (section && section !== "global") {
        // Fetch both global and the requested section
        query = query.in("section", ["global", section]);
      } else if (section === "global") {
        query = query.eq("section", "global");
      }
      // If no section specified, fetch all (no filter)

      const { data, error } = await query;
      if (error) throw error;

      const map: ContentMap = {};
      for (const row of data || []) {
        map[row.content_key] = row.value;
      }
      return map;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Track keys we've already seen to avoid duplicate upserts
  const knownKeys = new Set(Object.keys(content));

  const t = (key: string, fallback?: string) => {
    const value = content[key];
    if (value) return value;

    // Auto-create missing key in background
    if (fallback && fallback !== key) {
      ensureContentExists(locale, key, fallback, section || "general", knownKeys);
    }

    return fallback || key;
  };

  return { t, content, isLoading };
}
