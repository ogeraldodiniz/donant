import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

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
}

export function useNgos() {
  const [ngos, setNgos] = useState<Ngo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchNgos = async () => {
      setLoading(true);
      try {
        console.log("[useNgos] Starting query...");
        const { data, error } = await supabase
          .from("ngos")
          .select("*")
          .eq("is_active", true)
          .order("name");

        console.log("[useNgos] Query result:", { data: data?.length, error });

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
  }, []);

  return { ngos, loading };
}
