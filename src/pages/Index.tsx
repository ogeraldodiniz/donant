import { Link } from "react-router-dom";
import { Heart, ShoppingBag, ArrowRight, TrendingUp, Store, Users } from "lucide-react";
import { DuoButton } from "@/components/ui/duo-button";
import { DuoCard } from "@/components/ui/duo-card";
import { useAuth } from "@/hooks/useAuth";
import { mockNgos, mockStores, mockTransactions, ngoEmojis } from "@/lib/mock-data";
import { motion } from "framer-motion";

export default function Index() {
  const { isLoggedIn, user } = useAuth();
  return isLoggedIn ? <LoggedInHome /> : <PublicHome />;
}

function PublicHome() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="container py-16 md:py-24 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-bold text-sm mb-6">
            <Heart className="w-4 h-4" fill="currentColor" /> Suas compras fazem a diferença
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-foreground mb-4 leading-tight">
            Compre. Ganhe cashback.<br />
            <span className="text-primary">Doe automaticamente.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Cada compra nas lojas parceiras gera cashback que é doado diretamente para ONGs. Sem custo extra. Sem complicação.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <DuoButton size="lg">
                Começar agora <ArrowRight className="w-5 h-5" />
              </DuoButton>
            </Link>
            <Link to="/transparencia">
              <DuoButton variant="outline" size="lg">
                Ver impacto global
              </DuoButton>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* How it works */}
      <section className="bg-card border-y-2 border-border py-16">
        <div className="container">
          <h2 className="text-2xl md:text-3xl font-black text-center mb-12">Como funciona?</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { icon: Users, emoji: "1️⃣", title: "Cadastre-se", desc: "Crie sua conta e escolha a ONG que quer apoiar." },
              { icon: ShoppingBag, emoji: "2️⃣", title: "Compre normalmente", desc: "Acesse lojas parceiras pelo nosso link e compre o que precisar." },
              { icon: Heart, emoji: "3️⃣", title: "O cashback é doado", desc: "O cashback gerado vai direto para a ONG que você escolheu." },
            ].map((step, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15, duration: 0.4 }}>
                <DuoCard className="text-center">
                  <div className="text-4xl mb-3">{step.emoji}</div>
                  <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm">{step.desc}</p>
                </DuoCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured NGOs */}
      <section className="container py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black">ONGs Parceiras</h2>
          <Link to="/ongs" className="text-primary font-bold text-sm flex items-center gap-1 hover:underline">
            Ver todas <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {mockNgos.slice(0, 6).map((ngo, i) => (
            <Link key={ngo.id} to={`/ongs/${ngo.slug}`}>
              <DuoCard hover className="text-center">
                <div className="text-3xl mb-2">{ngoEmojis[i]}</div>
                <h3 className="font-bold text-sm mb-1">{ngo.name}</h3>
                <p className="text-xs text-primary font-semibold">R$ {ngo.total_received.toLocaleString('pt-BR')}</p>
              </DuoCard>
            </Link>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-primary text-primary-foreground py-12">
        <div className="container grid grid-cols-3 gap-4 text-center">
          {[
            { label: "Doado", value: "R$ 158K+" },
            { label: "ONGs", value: "6" },
            { label: "Lojas", value: "10+" },
          ].map((s, i) => (
            <div key={i}>
              <div className="text-2xl md:text-4xl font-black">{s.value}</div>
              <div className="text-sm opacity-90 font-semibold">{s.label}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function LoggedInHome() {
  const { user } = useAuth();
  const selectedNgo = mockNgos[0];
  const pending = mockTransactions.filter(t => t.status === 'pending' || t.status === 'tracked').reduce((s, t) => s + t.amount, 0);
  const confirmed = mockTransactions.filter(t => t.status === 'confirmed').reduce((s, t) => s + t.amount, 0);
  const donated = mockTransactions.filter(t => t.status === 'donated').reduce((s, t) => s + t.amount, 0);

  return (
    <div className="container py-6 space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-black">Olá, {user?.display_name?.split(' ')[0]}! 👋</h1>
        <p className="text-muted-foreground text-sm">Veja o impacto das suas compras.</p>
      </div>

      {/* Selected NGO */}
      <Link to={`/ongs/${selectedNgo.slug}`}>
        <DuoCard hover className="flex items-center gap-4 bg-primary/5 border-primary/20">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl">🧒</div>
          <div className="flex-1">
            <p className="text-xs text-primary font-bold uppercase">Sua ONG</p>
            <p className="font-bold">{selectedNgo.name}</p>
          </div>
          <ArrowRight className="w-5 h-5 text-primary" />
        </DuoCard>
      </Link>

      {/* Status cards */}
      <div className="grid grid-cols-3 gap-3">
        <DuoCard className="text-center bg-duo-yellow/10 border-duo-yellow/30">
          <p className="text-xs font-bold text-muted-foreground">Pendente</p>
          <p className="text-lg font-black text-duo-yellow">R$ {pending.toFixed(2)}</p>
        </DuoCard>
        <DuoCard className="text-center bg-secondary/10 border-secondary/30">
          <p className="text-xs font-bold text-muted-foreground">Confirmado</p>
          <p className="text-lg font-black text-secondary">R$ {confirmed.toFixed(2)}</p>
        </DuoCard>
        <DuoCard className="text-center bg-primary/10 border-primary/30">
          <p className="text-xs font-bold text-muted-foreground">Doado</p>
          <p className="text-lg font-black text-primary">R$ {donated.toFixed(2)}</p>
        </DuoCard>
      </div>

      {/* Featured stores */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black">Lojas em destaque</h2>
          <Link to="/lojas" className="text-primary font-bold text-sm flex items-center gap-1">
            Ver todas <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {mockStores.slice(0, 4).map(store => (
            <Link key={store.id} to={`/lojas/${store.slug}`}>
              <DuoCard hover>
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-lg font-bold mb-2">
                  {store.name.charAt(0)}
                </div>
                <p className="font-bold text-sm">{store.name}</p>
                <p className="text-xs text-primary font-bold">{store.cashback_rate}% cashback</p>
              </DuoCard>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
