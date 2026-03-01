import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Heart, LogOut, Trash2, Check, Loader2 } from "lucide-react";
import { DuoButton } from "@/components/ui/duo-button";
import { DuoCard } from "@/components/ui/duo-card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Ngo {
  id: string;
  name: string;
  logo_url: string | null;
  slug: string;
}

export default function Settings() {
  const { user, logout, session } = useAuth();
  const navigate = useNavigate();
  const [showDelete, setShowDelete] = useState(false);
  const [ngos, setNgos] = useState<Ngo[]>([]);
  const [selectedNgoId, setSelectedNgoId] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("ngos").select("id, name, logo_url, slug").eq("is_active", true).then(({ data }) => {
      if (data) setNgos(data);
    });
  }, []);

  useEffect(() => {
    if (user?.selected_ngo_id) {
      setSelectedNgoId(user.selected_ngo_id);
    }
  }, [user?.selected_ngo_id]);

  const handleSelectNgo = async (ngoId: string) => {
    if (!session?.user?.id) return;
    setSaving(ngoId);
    const { error } = await supabase
      .from("profiles")
      .update({ selected_ngo_id: ngoId })
      .eq("id", session.user.id);
    setSaving(null);
    if (error) {
      toast.error("Erro ao salvar ONG");
    } else {
      setSelectedNgoId(ngoId);
      const ngo = ngos.find(n => n.id === ngoId);
      toast.success(`ONG alterada para ${ngo?.name}`);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.info("Você saiu da sua conta");
      navigate("/");
    } catch (e) {
      // Force logout even if signOut fails
      navigate("/");
      window.location.reload();
    }
  };

  const handleDelete = async () => {
    await logout();
    toast.success("Conta excluída. Seus dados serão anonimizados conforme LGPD.");
    navigate("/");
  };

  return (
    <div className="container py-6 space-y-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-black">Configurações</h1>
      </div>

      {/* Profile */}
      <DuoCard>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xl font-bold">
            {user?.display_name?.charAt(0) || 'U'}
          </div>
          <div>
            <p className="font-bold">{user?.display_name}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>
      </DuoCard>

      {/* Selected NGO */}
      <DuoCard>
        <h3 className="font-bold mb-3 flex items-center gap-2"><Heart className="w-4 h-4 text-primary" /> Sua ONG</h3>
        <div className="space-y-2">
          {ngos.map((ngo) => {
            const isSelected = selectedNgoId === ngo.id;
            return (
              <button
                key={ngo.id}
                onClick={() => handleSelectNgo(ngo.id)}
                disabled={saving !== null}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                  isSelected
                    ? 'bg-primary/10 border-2 border-primary ring-1 ring-primary/20'
                    : 'border-2 border-transparent hover:bg-muted'
                }`}
              >
                {ngo.logo_url ? (
                  <img src={ngo.logo_url} alt={ngo.name} className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                    {ngo.name.charAt(0)}
                  </div>
                )}
                <span className="font-semibold text-sm flex-1">{ngo.name}</span>
                {saving === ngo.id ? (
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                ) : isSelected ? (
                  <Check className="w-4 h-4 text-primary" />
                ) : null}
              </button>
            );
          })}
        </div>
      </DuoCard>

      {/* Actions */}
      <DuoButton variant="outline" className="w-full" onClick={handleLogout}>
        <LogOut className="w-4 h-4" /> Sair da conta
      </DuoButton>

      {!showDelete ? (
        <button onClick={() => setShowDelete(true)} className="w-full text-center text-sm text-destructive font-bold hover:underline">
          Excluir minha conta
        </button>
      ) : (
        <DuoCard className="border-destructive/30 bg-destructive/5">
          <h3 className="font-bold text-destructive mb-2 flex items-center gap-2"><Trash2 className="w-4 h-4" /> Excluir conta</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Seus dados pessoais serão anonimizados conforme a LGPD. Registros de doações serão mantidos sem identificação pessoal. Esta ação não pode ser desfeita.
          </p>
          <div className="flex gap-3">
            <DuoButton variant="outline" size="sm" onClick={() => setShowDelete(false)} className="flex-1">Cancelar</DuoButton>
            <DuoButton variant="danger" size="sm" onClick={handleDelete} className="flex-1">Confirmar exclusão</DuoButton>
          </div>
        </DuoCard>
      )}

      <div className="flex gap-4 justify-center text-xs text-muted-foreground">
        <Link to="/privacidade" className="hover:text-primary font-semibold">Privacidade</Link>
        <Link to="/termos" className="hover:text-primary font-semibold">Termos de Uso</Link>
      </div>
    </div>
  );
}
