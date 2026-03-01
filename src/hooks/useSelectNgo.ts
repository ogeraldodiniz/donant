import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useState } from "react";

export function useSelectNgo() {
  const { session, refreshProfile } = useAuth();
  const [saving, setSaving] = useState<string | null>(null);

  const selectNgo = async (ngoId: string, ngoName?: string) => {
    if (!session?.user?.id) {
      toast.error("Faça login para selecionar uma ONG");
      return false;
    }

    setSaving(ngoId);
    const { error } = await supabase
      .from("profiles")
      .update({ selected_ngo_id: ngoId })
      .eq("id", session.user.id);
    setSaving(null);

    if (error) {
      toast.error("Erro ao salvar ONG");
      return false;
    }

    await refreshProfile();
    toast.success(`ONG alterada para ${ngoName ?? "nova seleção"}!`);
    return true;
  };

  return { selectNgo, saving };
}
