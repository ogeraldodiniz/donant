import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ExternalLink, Clock, Shield } from "lucide-react";
import { DuoButton } from "@/components/ui/duo-button";
import { DuoCard } from "@/components/ui/duo-card";
import { mockStores, categoryEmojis } from "@/lib/mock-data";
import { useAuth } from "@/hooks/useAuth";

export default function StoreDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const store = mockStores.find(s => s.slug === slug);

  if (!store) return <div className="container py-12 text-center"><p className="text-xl font-bold">Loja não encontrada</p></div>;

  const handleRedirect = () => {
    if (!isLoggedIn) { navigate("/auth"); return; }
    navigate(`/redirect/${store.slug}`);
  };

  return (
    <div className="container py-6 space-y-6 max-w-2xl">
      <Link to="/lojas" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>

      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center text-4xl font-bold">
          {store.name.charAt(0)}
        </div>
        <div>
          <h1 className="text-2xl font-black">{store.name}</h1>
          <p className="text-muted-foreground text-sm">{categoryEmojis[store.category]} {store.category}</p>
        </div>
      </div>

      <DuoCard className="text-center bg-primary/5 border-primary/20">
        <p className="text-sm font-bold text-muted-foreground mb-1">Cashback solidário de até</p>
        <p className="text-4xl font-black text-primary">{store.cashback_rate}%</p>
        <p className="text-xs text-muted-foreground mt-1">100% doado para sua ONG</p>
      </DuoCard>

      <DuoButton size="lg" className="w-full" onClick={handleRedirect}>
        <ExternalLink className="w-5 h-5" /> Comprar e gerar cashback
      </DuoButton>

      <DuoCard>
        <h3 className="font-bold mb-2 flex items-center gap-2"><Shield className="w-4 h-4 text-primary" /> Termos e condições</h3>
        <p className="text-sm text-muted-foreground">{store.terms}</p>
      </DuoCard>

      <DuoCard>
        <h3 className="font-bold mb-2 flex items-center gap-2"><Clock className="w-4 h-4 text-secondary" /> Como funciona</h3>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li>1. Clique em "Comprar e gerar cashback"</li>
          <li>2. Você será redirecionado para {store.name}</li>
          <li>3. Faça sua compra normalmente</li>
          <li>4. O cashback será rastreado automaticamente</li>
          <li>5. Após confirmação, o valor é doado para sua ONG</li>
        </ul>
      </DuoCard>
    </div>
  );
}
