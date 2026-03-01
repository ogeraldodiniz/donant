import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, Heart, Loader2 } from "lucide-react";
import { DuoButton } from "@/components/ui/duo-button";
import { DuoCard } from "@/components/ui/duo-card";
import { useAuth } from "@/hooks/useAuth";
import { useNgos } from "@/hooks/useNgos";
import { useSelectNgo } from "@/hooks/useSelectNgo";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface Donation {
  id: string;
  amount: number;
  donated_at: string;
}

export default function NgoDetail() {
  const { slug } = useParams();
  const { isLoggedIn, user } = useAuth();
  const { ngos, loading: ngosLoading } = useNgos();
  const { selectNgo, saving } = useSelectNgo();
  const [donations, setDonations] = useState<Donation[]>([]);

  const ngo = ngos.find(n => n.slug === slug);
  const isSelected = isLoggedIn && user?.selected_ngo_id === ngo?.id;

  useEffect(() => {
    if (!ngo) return;
    supabase
      .from("donation_ledger")
      .select("id, amount, donated_at")
      .eq("ngo_id", ngo.id)
      .order("donated_at", { ascending: false })
      .limit(10)
      .then(({ data }) => {
        if (data) setDonations(data);
      });
  }, [ngo?.id]);

  if (ngosLoading) {
    return (
      <div className="container py-5 sm:py-6 space-y-4 sm:space-y-5 max-w-2xl">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
      </div>
    );
  }

  if (!ngo) {
    return (
      <div className="container py-12 text-center">
        <p className="text-lg sm:text-xl font-bold">ONG não encontrada</p>
        <Link to="/ongs" className="text-primary font-bold text-sm mt-2 inline-block">Ver todas as ONGs</Link>
      </div>
    );
  }

  return (
    <div className="container py-5 sm:py-6 space-y-4 sm:space-y-5 max-w-2xl">
      <Link to="/ongs" className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>

      <div className="text-center">
        {ngo.logo_url ? (
          <img src={ngo.logo_url} alt={ngo.name} className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover mx-auto mb-3" />
        ) : (
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <Heart className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
          </div>
        )}
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

      {ngo.mission && (
        <DuoCard>
          <h3 className="font-bold text-sm sm:text-base mb-2">🎯 Missão</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">{ngo.mission}</p>
        </DuoCard>
      )}

      {ngo.description && (
        <DuoCard>
          <h3 className="font-bold text-sm sm:text-base mb-2">📖 Sobre</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">{ngo.description}</p>
        </DuoCard>
      )}

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
        <DuoButton size="lg" className="w-full" onClick={() => selectNgo(ngo.id, ngo.name)} disabled={saving !== null}>
          {saving === ngo.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Heart className="w-5 h-5" />}
          Quero doar para esta ONG
        </DuoButton>
      )}

      {ngo.website_url && (
        <a href={ngo.website_url} target="_blank" rel="noopener noreferrer" className="block">
          <DuoButton variant="outline" size="md" className="w-full">
            <ExternalLink className="w-4 h-4" /> Visitar site da ONG
          </DuoButton>
        </a>
      )}
    </div>
  );
}
