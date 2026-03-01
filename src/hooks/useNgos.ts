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
    supabase
      .from("ngos")
      .select("*")
      .eq("is_active", true)
      .order("name")
      .then(({ data }) => {
        if (data) setNgos(data);
        setLoading(false);
      });
  }, []);

  return { ngos, loading };
}
