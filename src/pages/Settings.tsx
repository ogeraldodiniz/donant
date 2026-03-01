import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Heart, LogOut, Trash2, ArrowLeft } from "lucide-react";
import { DuoButton } from "@/components/ui/duo-button";
import { DuoCard } from "@/components/ui/duo-card";
import { useAuth } from "@/hooks/useAuth";
import { mockNgos, ngoEmojis } from "@/lib/mock-data";
import { toast } from "sonner";

export default function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDelete, setShowDelete] = useState(false);

  const handleLogout = () => {
    logout();
    toast.info("Você saiu da sua conta");
    navigate("/");
  };

  const handleDelete = () => {
    logout();
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
          {mockNgos.map((ngo, i) => (
            <button
              key={ngo.id}
              onClick={() => toast.success(`ONG alterada para ${ngo.name}`)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${
                user?.selected_ngo_id === ngo.id ? 'bg-primary/10 border-2 border-primary' : 'border-2 border-transparent hover:bg-muted'
              }`}
            >
              <span className="text-xl">{ngoEmojis[i]}</span>
              <span className="font-semibold text-sm">{ngo.name}</span>
            </button>
          ))}
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
