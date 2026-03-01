import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, Heart } from "lucide-react";
import { DuoButton } from "@/components/ui/duo-button";
import { DuoCard } from "@/components/ui/duo-card";
import { mockNgos, mockDonations, ngoEmojis } from "@/lib/mock-data";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function NgoDetail() {
  const { slug } = useParams();
  const { isLoggedIn, user } = useAuth();
  const ngoIndex = mockNgos.findIndex(n => n.slug === slug);
  const ngo = mockNgos[ngoIndex];

  if (!ngo) return <div className="container py-12 text-center"><p className="text-lg sm:text-xl font-bold">ONG não encontrada</p></div>;

  const isSelected = isLoggedIn && user?.selected_ngo_id === ngo.id;
  const donations = mockDonations.filter(d => d.ngo_id === ngo.id);

  const handleSelect = () => {
    if (!isLoggedIn) { toast.error("Faça login para selecionar uma ONG"); return; }
    toast.success(`Agora suas doações vão para ${ngo.name}!`);
  };

  return (
    <div className="container py-5 sm:py-6 space-y-4 sm:space-y-5 max-w-2xl">
      <Link to="/ongs" className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>

      <div className="text-center">
        <div className="text-4xl sm:text-5xl mb-3">{ngoEmojis[ngoIndex % ngoEmojis.length]}</div>
        <h1 className="text-xl sm:text-2xl font-black">{ngo.name}</h1>
        {isSelected && (
          <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold text-primary bg-primary/10 px-2.5 sm:px-3 py-1 rounded-full mt-2">
            <Heart className="w-3 h-3" fill="currentColor" /> Sua ONG selecionada
          </span>
        )}
      </div>

      <DuoCard className="text-center bg-primary/5 border-primary/20">
        <p className="text-xs sm:text-sm font-bold text-muted-foreground mb-1">Total recebido</p>
        <p className="text-2xl sm:text-3xl font-black text-primary">R$ {ngo.total_received.toLocaleString('pt-BR')}</p>
      </DuoCard>

      <DuoCard>
        <h3 className="font-bold text-sm sm:text-base mb-2">🎯 Missão</h3>
        <p className="text-xs sm:text-sm text-muted-foreground">{ngo.mission}</p>
      </DuoCard>

      <DuoCard>
        <h3 className="font-bold text-sm sm:text-base mb-2">📖 Sobre</h3>
        <p className="text-xs sm:text-sm text-muted-foreground">{ngo.description}</p>
      </DuoCard>

      {donations.length > 0 && (
        <DuoCard>
          <h3 className="font-bold text-sm sm:text-base mb-3">💜 Últimas doações</h3>
          <div className="space-y-2">
            {donations.map(d => (
              <div key={d.id} className="flex justify-between items-center py-2 border-b last:border-0 border-border">
                <span className="text-xs sm:text-sm text-muted-foreground">{new Date(d.donated_at).toLocaleDateString('pt-BR')}</span>
                <span className="text-xs sm:text-sm font-bold text-primary">R$ {d.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </DuoCard>
      )}

      {!isSelected && (
        <DuoButton size="lg" className="w-full" onClick={handleSelect}>
          <Heart className="w-5 h-5" /> Quero doar para esta ONG
        </DuoButton>
      )}

      <a href={ngo.website_url} target="_blank" rel="noopener noreferrer" className="block">
        <DuoButton variant="outline" size="md" className="w-full">
          <ExternalLink className="w-4 h-4" /> Visitar site da ONG
        </DuoButton>
      </a>
    </div>
  );
}
