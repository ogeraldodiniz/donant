import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLocale } from "@/hooks/useLocale";

export interface StoreDB {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  website_url: string | null;
  cashback_rate: number;
  category: string | null;
  terms: string | null;
  is_active: boolean;
  is_featured: boolean;
  locale: string;
}

export function useStores() {
  const { locale } = useLocale();
  const [stores, setStores] = useState<StoreDB[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchStores = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("stores")
          .select("id, name, slug, logo_url, website_url, cashback_rate, category, terms, is_active, is_featured, locale")
          .eq("is_active", true)
          .eq("locale", locale)
          .order("name");

        if (!isMounted) return;

        if (error) {
          console.error("Erro ao carregar lojas:", error);
          setStores([]);
          return;
        }

        setStores(data ?? []);
      } catch (error) {
        if (!isMounted) return;
        console.error("Falha de rede ao carregar lojas:", error);
        setStores([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void fetchStores();

    return () => {
      isMounted = false;
    };
  }, [locale]);

  return { stores, loading };
}
