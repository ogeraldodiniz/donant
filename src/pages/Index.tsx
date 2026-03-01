import { Link } from "react-router-dom";
import { Heart, ShoppingBag, ArrowRight, TrendingUp, Store, Users, Shield, Eye, Zap, CheckCircle2, ChevronDown } from "lucide-react";
import { DuoButton } from "@/components/ui/duo-button";
import { DuoCard } from "@/components/ui/duo-card";
import { useAuth } from "@/hooks/useAuth";
import { mockNgos, mockStores, mockTransactions, ngoEmojis, categoryEmojis } from "@/lib/mock-data";
import { motion } from "framer-motion";
import { useState } from "react";

export default function Index() {
  const { isLoggedIn, user } = useAuth();
  return isLoggedIn ? <LoggedInHome /> : <PublicHome />;
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.12, duration: 0.5 } }),
};

function PublicHome() {
  return (
    <div className="min-h-screen">
      {/* Hero — full-width, bold */}
      <section className="relative overflow-hidden">
        <div className="container py-20 md:py-32 flex flex-col md:flex-row items-center gap-10">
          <motion.div className="flex-1 text-center md:text-left" initial="hidden" animate="visible" variants={fadeUp}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-extrabold text-sm mb-6">
              <Heart className="w-4 h-4" fill="currentColor" /> 100% gratuito. 100% solidário.
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-foreground leading-[1.08] mb-5">
              Compre online.<br />
              <span className="text-primary">Doe sem gastar nada.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-lg mb-8">
              Cada compra nas lojas parceiras gera cashback que é doado automaticamente para a ONG que você escolher. Simples assim.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link to="/auth">
                <DuoButton size="lg">
                  Comece agora — é grátis <ArrowRight className="w-5 h-5" />
                </DuoButton>
              </Link>
              <Link to="/transparencia">
                <DuoButton variant="outline" size="lg">
                  Ver impacto global
                </DuoButton>
              </Link>
            </div>
          </motion.div>

          <motion.div
            className="flex-1 flex justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative w-72 h-72 md:w-96 md:h-96">
              {/* Animated floating cards */}
              <motion.div
                className="absolute top-0 left-4 md:left-0"
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <DuoCard className="bg-card shadow-xl px-5 py-4 w-56">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-lg">🛒</div>
                    <div>
                      <p className="text-xs text-muted-foreground font-bold">Compra na Amazon</p>
                      <p className="text-sm font-black text-primary">+ R$ 12,50 cashback</p>
                    </div>
                  </div>
                </DuoCard>
              </motion.div>

              <motion.div
                className="absolute top-28 right-0 md:right-[-20px]"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              >
                <DuoCard className="bg-card shadow-xl px-5 py-4 w-60">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-duo-red/10 flex items-center justify-center text-lg">❤️</div>
                    <div>
                      <p className="text-xs text-muted-foreground font-bold">Doação automática</p>
                      <p className="text-sm font-black text-destructive">→ Instituto Criança Feliz</p>
                    </div>
                  </div>
                </DuoCard>
              </motion.div>

              <motion.div
                className="absolute bottom-4 left-8 md:left-4"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              >
                <DuoCard className="bg-primary text-primary-foreground shadow-xl px-5 py-4 w-52">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">🎉</div>
                    <div>
                      <p className="text-xs font-bold opacity-80">Total doado</p>
                      <p className="text-lg font-black">R$ 158.730+</p>
                    </div>
                  </div>
                </DuoCard>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it works — Duolingo-style numbered steps */}
      <section className="bg-card border-y-2 border-border py-16 md:py-24">
        <div className="container">
          <motion.h2 className="text-3xl md:text-4xl font-black text-center mb-4" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            como funciona?
          </motion.h2>
          <motion.p className="text-center text-muted-foreground mb-12 max-w-md mx-auto" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}>
            Em 3 passos simples, suas compras viram doações.
          </motion.p>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { emoji: "📝", title: "Cadastre-se grátis", desc: "Crie sua conta em segundos e escolha a ONG que quer apoiar." },
              { emoji: "🛍️", title: "Compre normalmente", desc: "Acesse as lojas parceiras pelo nosso link e compre o que já ia comprar." },
              { emoji: "💚", title: "Cashback vira doação", desc: "O cashback gerado é enviado diretamente para a ONG escolhida. Sem custo pra você!" },
            ].map((step, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                <DuoCard className="text-center relative pt-10">
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-black text-lg duo-shadow">
                    {i + 1}
                  </div>
                  <div className="text-4xl mb-3">{step.emoji}</div>
                  <h3 className="text-lg font-black mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm">{step.desc}</p>
                </DuoCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Section 1 — alternating layout */}
      <FeatureSection
        reverse={false}
        emoji="🔍"
        label="transparência total"
        title="Acompanhe cada centavo."
        description="Todas as doações são públicas e rastreáveis. Você vê exatamente quanto foi gerado, confirmado e doado para cada ONG."
        color="primary"
        linkTo="/transparencia"
        linkLabel="Ver transparência"
      />

      {/* Feature Section 2 */}
      <FeatureSection
        reverse={true}
        emoji="🎯"
        label="você escolhe"
        title="Apoie a causa que importa pra você."
        description="Criança, meio ambiente, saúde, educação… Escolha entre nossas ONGs parceiras verificadas e mude a direção do seu cashback."
        color="secondary"
        linkTo="/ongs"
        linkLabel="Conhecer ONGs"
      />

      {/* Feature Section 3 */}
      <FeatureSection
        reverse={false}
        emoji="🚀"
        label="sem custo extra"
        title="Não muda nada na sua compra."
        description="Você paga o mesmo preço. A diferença é que parte do valor volta como cashback solidário. Quem paga é a loja, não você."
        color="accent"
        linkTo="/lojas"
        linkLabel="Ver lojas parceiras"
      />

      {/* Stores showcase */}
      <section className="bg-card border-y-2 border-border py-16">
        <div className="container">
          <motion.div className="text-center mb-10" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-3xl md:text-4xl font-black mb-3">lojas parceiras</h2>
            <p className="text-muted-foreground max-w-md mx-auto">Suas marcas favoritas gerando impacto social.</p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 max-w-4xl mx-auto mb-8">
            {mockStores.slice(0, 10).map((store, i) => (
              <motion.div key={store.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.5}>
                <Link to={`/lojas/${store.slug}`}>
                  <DuoCard hover className="text-center py-4 px-3">
                    <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-xl font-black mx-auto mb-2">
                      {store.name.charAt(0)}
                    </div>
                    <p className="font-bold text-xs truncate">{store.name}</p>
                    <p className="text-primary font-black text-sm">{store.cashback_rate}%</p>
                  </DuoCard>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <Link to="/lojas">
              <DuoButton variant="outline">
                Ver todas as lojas <ArrowRight className="w-4 h-4" />
              </DuoButton>
            </Link>
          </div>
        </div>
      </section>

      {/* NGOs */}
      <section className="container py-16">
        <motion.div className="text-center mb-10" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
          <h2 className="text-3xl md:text-4xl font-black mb-3">ONGs parceiras</h2>
          <p className="text-muted-foreground max-w-md mx-auto">Organizações verificadas que recebem 100% do cashback doado.</p>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-8">
          {mockNgos.slice(0, 6).map((ngo, i) => (
            <motion.div key={ngo.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.5}>
              <Link to={`/ongs/${ngo.slug}`}>
                <DuoCard hover className="text-center">
                  <div className="text-3xl mb-2">{ngoEmojis[i]}</div>
                  <h3 className="font-bold text-sm mb-1">{ngo.name}</h3>
                  <p className="text-xs text-primary font-black">R$ {ngo.total_received.toLocaleString('pt-BR')}</p>
                </DuoCard>
              </Link>
            </motion.div>
          ))}
        </div>
        <div className="text-center">
          <Link to="/ongs">
            <DuoButton variant="outline">
              Conhecer todas as ONGs <ArrowRight className="w-4 h-4" />
            </DuoButton>
          </Link>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-primary text-primary-foreground py-14">
        <div className="container">
          <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center" initial="hidden" whileInView="visible" viewport={{ once: true }}>
            {[
              { label: "Total doado", value: "R$ 158K+", emoji: "💰" },
              { label: "ONGs apoiadas", value: "6", emoji: "❤️" },
              { label: "Lojas parceiras", value: "10+", emoji: "🏪" },
              { label: "Usuários ativos", value: "1.2K+", emoji: "👥" },
            ].map((s, i) => (
              <motion.div key={i} variants={fadeUp} custom={i}>
                <div className="text-3xl mb-1">{s.emoji}</div>
                <div className="text-3xl md:text-4xl font-black">{s.value}</div>
                <div className="text-sm opacity-90 font-bold">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Social proof / Testimonials */}
      <section className="container py-16">
        <motion.div className="text-center mb-10" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
          <h2 className="text-3xl md:text-4xl font-black mb-3">o que dizem sobre nós</h2>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            { name: "Ana Paula", text: "Incrível saber que minhas compras estão ajudando crianças. Não muda nada no meu bolso!", avatar: "A" },
            { name: "Carlos Mendes", text: "Uso sempre que vou comprar online. A transparência me dá confiança que a doação chega mesmo.", avatar: "C" },
            { name: "Mariana Silva", text: "Já doei mais de R$200 sem gastar nada a mais. Todo mundo deveria conhecer!", avatar: "M" },
          ].map((t, i) => (
            <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
              <DuoCard className="h-full">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-sm">
                    {t.avatar}
                  </div>
                  <p className="font-bold">{t.name}</p>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">"{t.text}"</p>
              </DuoCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-card border-y-2 border-border py-16">
        <div className="container max-w-2xl">
          <motion.h2 className="text-3xl md:text-4xl font-black text-center mb-10" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            perguntas frequentes
          </motion.h2>
          <div className="space-y-3">
            {[
              { q: "É realmente grátis?", a: "Sim! Você não paga nada a mais. O cashback é pago pela loja parceira e redirecionado para a ONG." },
              { q: "Como sei que a doação chegou?", a: "Todas as doações são registradas publicamente na nossa página de transparência. Você pode acompanhar em tempo real." },
              { q: "Posso escolher qual ONG recebe?", a: "Sim! Ao se cadastrar, você escolhe a ONG que deseja apoiar e pode trocar a qualquer momento." },
              { q: "Quais lojas participam?", a: "Temos mais de 10 lojas parceiras como Amazon, Magazine Luiza, Netshoes e muitas outras." },
              { q: "O cashback é instantâneo?", a: "O cashback é rastreado na hora da compra, confirmado pela loja em até 60 dias, e então doado para a ONG." },
            ].map((faq, i) => (
              <FaqItem key={i} question={faq.q} answer={faq.a} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container py-20 text-center">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
          <h2 className="text-3xl md:text-5xl font-black mb-4">
            Pronto para fazer a diferença?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
            Cadastre-se grátis e transforme suas compras em doações.
          </p>
          <Link to="/auth">
            <DuoButton size="lg">
              Criar minha conta grátis <ArrowRight className="w-5 h-5" />
            </DuoButton>
          </Link>
        </motion.div>
      </section>

      {/* Footer-like info */}
      <footer className="border-t-2 border-border py-8">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Heart className="w-4 h-4 text-primary-foreground" fill="currentColor" />
            </div>
            <span className="font-extrabold text-foreground">MyCashbacks</span>
          </div>
          <div className="flex gap-6 font-semibold">
            <Link to="/transparencia" className="hover:text-foreground transition-colors">Transparência</Link>
            <Link to="/privacidade" className="hover:text-foreground transition-colors">Privacidade</Link>
            <Link to="/termos" className="hover:text-foreground transition-colors">Termos</Link>
          </div>
          <p className="font-semibold">© 2025 MyCashbacks. Feito com 💚</p>
        </div>
      </footer>
    </div>
  );
}

/* ========== Feature Section Component ========== */
function FeatureSection({ reverse, emoji, label, title, description, color, linkTo, linkLabel }: {
  reverse: boolean; emoji: string; label: string; title: string; description: string; color: string; linkTo: string; linkLabel: string;
}) {
  return (
    <section className="py-16 md:py-24">
      <div className={`container flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-10 md:gap-16`}>
        <motion.div
          className="flex-1 flex justify-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          <div className={`w-48 h-48 md:w-64 md:h-64 rounded-3xl bg-${color}/10 flex items-center justify-center`}>
            <span className="text-7xl md:text-8xl">{emoji}</span>
          </div>
        </motion.div>
        <motion.div
          className="flex-1 text-center md:text-left"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={1}
        >
          <span className={`inline-block px-3 py-1 rounded-full bg-${color}/10 text-${color} font-extrabold text-xs uppercase tracking-wider mb-4`}>
            {label}
          </span>
          <h2 className="text-2xl md:text-4xl font-black mb-4">{title}</h2>
          <p className="text-muted-foreground text-base md:text-lg mb-6 max-w-md">{description}</p>
          <Link to={linkTo}>
            <DuoButton variant="outline" size="md">
              {linkLabel} <ArrowRight className="w-4 h-4" />
            </DuoButton>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

/* ========== FAQ Item ========== */
function FaqItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={index * 0.5}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left p-5 rounded-2xl border-2 border-border bg-background hover:border-primary/50 transition-colors"
      >
        <div className="flex items-center justify-between">
          <span className="font-bold text-base">{question}</span>
          <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </div>
        {open && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="text-muted-foreground text-sm mt-3 leading-relaxed"
          >
            {answer}
          </motion.p>
        )}
      </button>
    </motion.div>
  );
}

/* ========== Logged-in Home ========== */
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
