import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLocale } from "@/hooks/useLocale";

export interface Ngo {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  mission: string | null;
  logo_url: string | null;
  website_url: string | null;
  total_received: number;
  is_active: boolean;
  is_featured: boolean;
}

export function useNgos() {
  const { locale } = useLocale();
  const [ngos, setNgos] = useState<Ngo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchNgos = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("ngos")
          .select("*")
          .eq("is_active", true)
          .eq("locale", locale)
          .order("name");

        if (!isMounted) return;

        if (error) {
          console.error("Erro ao carregar ONGs:", error);
          setNgos([]);
          return;
        }

        setNgos(data ?? []);
      } catch (error) {
        if (!isMounted) return;
        console.error("Falha de rede ao carregar ONGs:", error);
        setNgos([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void fetchNgos();

    return () => {
      isMounted = false;
    };
  }, [locale]);

  return { ngos, loading };
}
