import { Link } from "react-router-dom";
import { Heart, ArrowRight, ChevronDown, ShoppingCart, Gift, PartyPopper, Search, Target, Rocket, BadgeCheck, TrendingUp, Store, Users, Quote, HelpCircle, UserPlus, ShoppingBag, HandHeart, Coins, Star, MessageCircle, Download } from "lucide-react";
import { DuoButton } from "@/components/ui/duo-button";
import { DuoCard } from "@/components/ui/duo-card";
import { useAuth } from "@/hooks/useAuth";
import { useSiteContent } from "@/hooks/useSiteContent";
import { mockNgos, mockStores, mockTransactions, ngoEmojis } from "@/lib/mock-data";
import { motion } from "framer-motion";
import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { InstallAppBanner } from "@/components/InstallAppBanner";

export default function Index() {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? <LoggedInHome /> : <PublicHome />;
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.12, duration: 0.5 } }),
};

const ngoIcons: LucideIcon[] = [Heart, Target, Users, Star, BadgeCheck, Rocket];

function PublicHome() {
  const { t } = useSiteContent();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="container py-20 md:py-32 flex flex-col md:flex-row items-center gap-10">
          <motion.div className="flex-1 text-center md:text-left" initial="hidden" animate="visible" variants={fadeUp}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-extrabold text-sm mb-6">
              <Heart className="w-4 h-4" fill="currentColor" /> {t("hero_badge", "100% gratuito. 100% solidário.")}
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-foreground leading-[1.08] mb-5">
              {t("hero_title_1", "Compre online.")}<br />
              <span className="text-primary">{t("hero_title_2", "Doe sem gastar nada.")}</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-lg mb-8">
              {t("hero_subtitle", "Cada compra nas lojas parceiras gera cashback que é doado automaticamente para a ONG que você escolher. Simples assim.")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link to="/auth">
                <DuoButton size="lg">
                  {t("hero_cta_primary", "Comece agora — é grátis")} <ArrowRight className="w-5 h-5" />
                </DuoButton>
              </Link>
              <Link to="/transparencia">
                <DuoButton variant="outline" size="lg">
                  {t("hero_cta_secondary", "Ver impacto global")}
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
              <motion.div className="absolute top-0 left-4 md:left-0" animate={{ y: [0, -12, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
                <DuoCard className="bg-card shadow-xl px-5 py-4 w-56">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-bold">Compra na Amazon</p>
                      <p className="text-sm font-black text-primary">+ R$ 12,50 cashback</p>
                    </div>
                  </div>
                </DuoCard>
              </motion.div>
              <motion.div className="absolute top-28 right-0 md:right-[-20px]" animate={{ y: [0, 10, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}>
                <DuoCard className="bg-card shadow-xl px-5 py-4 w-60">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                      <HandHeart className="w-5 h-5 text-destructive" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-bold">Doação automática</p>
                      <p className="text-sm font-black text-destructive">→ Instituto Criança Feliz</p>
                    </div>
                  </div>
                </DuoCard>
              </motion.div>
              <motion.div className="absolute bottom-4 left-8 md:left-4" animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}>
                <DuoCard className="bg-primary text-primary-foreground shadow-xl px-5 py-4 w-52">
                  <div className="flex items-center gap-3">
                    <PartyPopper className="w-6 h-6" />
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

      {/* How it works */}
      <section className="bg-card border-y-2 border-border py-16 md:py-24">
        <div className="container">
          <motion.h2 className="text-3xl md:text-4xl font-black text-center mb-4" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            {t("how_title", "como funciona?")}
          </motion.h2>
          <motion.p className="text-center text-muted-foreground mb-12 max-w-md mx-auto" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}>
            {t("how_subtitle", "Em 3 passos simples, suas compras viram doações.")}
          </motion.p>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {([
              { Icon: UserPlus, titleKey: "how_step1_title", descKey: "how_step1_desc", titleFb: "Cadastre-se grátis", descFb: "Crie sua conta em segundos e escolha a ONG que quer apoiar." },
              { Icon: ShoppingBag, titleKey: "how_step2_title", descKey: "how_step2_desc", titleFb: "Compre normalmente", descFb: "Acesse as lojas parceiras pelo nosso link e compre o que já ia comprar." },
              { Icon: Gift, titleKey: "how_step3_title", descKey: "how_step3_desc", titleFb: "Cashback vira doação", descFb: "O cashback gerado é enviado diretamente para a ONG escolhida. Sem custo pra você!" },
            ] as const).map((step, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                <DuoCard className="text-center relative pt-10">
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-black text-lg duo-shadow">
                    {i + 1}
                  </div>
                  <div className="flex justify-center mb-3">
                    <step.Icon className="w-10 h-10 text-primary" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-black mb-2">{t(step.titleKey, step.titleFb)}</h3>
                  <p className="text-muted-foreground text-sm">{t(step.descKey, step.descFb)}</p>
                </DuoCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature 1 */}
      <FeatureSection
        reverse={false} Icon={Search} color="primary" linkTo="/transparencia"
        label={t("feat1_label", "transparência total")}
        title={t("feat1_title", "Acompanhe cada centavo.")}
        description={t("feat1_desc", "Todas as doações são públicas e rastreáveis.")}
        linkLabel={t("feat1_link", "Ver transparência")}
      />
      {/* Feature 2 */}
      <FeatureSection
        reverse={true} Icon={Target} color="secondary" linkTo="/ongs"
        label={t("feat2_label", "você escolhe")}
        title={t("feat2_title", "Apoie a causa que importa pra você.")}
        description={t("feat2_desc", "Escolha entre nossas ONGs parceiras verificadas.")}
        linkLabel={t("feat2_link", "Conhecer ONGs")}
      />
      {/* Feature 3 */}
      <FeatureSection
        reverse={false} Icon={Rocket} color="accent" linkTo="/lojas"
        label={t("feat3_label", "sem custo extra")}
        title={t("feat3_title", "Não muda nada na sua compra.")}
        description={t("feat3_desc", "Você paga o mesmo preço.")}
        linkLabel={t("feat3_link", "Ver lojas parceiras")}
      />

      {/* Stores */}
      <section className="bg-card border-y-2 border-border py-16">
        <div className="container">
          <motion.div className="text-center mb-10" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-3xl md:text-4xl font-black mb-3">{t("stores_title", "lojas parceiras")}</h2>
            <p className="text-muted-foreground max-w-md mx-auto">{t("stores_subtitle", "Suas marcas favoritas gerando impacto social.")}</p>
          </motion.div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 max-w-4xl mx-auto mb-8">
            {mockStores.slice(0, 10).map((store, i) => (
              <motion.div key={store.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.5}>
                <Link to={`/lojas/${store.slug}`}>
                  <DuoCard hover className="text-center py-4 px-3">
                    <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-2">
                      <Store className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="font-bold text-xs truncate">{store.name}</p>
                    <p className="text-primary font-black text-sm">{store.cashback_rate}%</p>
                  </DuoCard>
                </Link>
              </motion.div>
            ))}
          </div>
          <div className="text-center">
            <Link to="/lojas"><DuoButton variant="outline">{t("stores_cta", "Ver todas as lojas")} <ArrowRight className="w-4 h-4" /></DuoButton></Link>
          </div>
        </div>
      </section>

      {/* NGOs */}
      <section className="container py-16">
        <motion.div className="text-center mb-10" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
          <h2 className="text-3xl md:text-4xl font-black mb-3">{t("ngos_title", "ONGs parceiras")}</h2>
          <p className="text-muted-foreground max-w-md mx-auto">{t("ngos_subtitle", "Organizações verificadas que recebem 100% do cashback doado.")}</p>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-8">
          {mockNgos.slice(0, 6).map((ngo, i) => {
            const NgoIcon = ngoIcons[i % ngoIcons.length];
            return (
              <motion.div key={ngo.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.5}>
                <Link to={`/ongs/${ngo.slug}`}>
                  <DuoCard hover className="text-center">
                    <div className="flex justify-center mb-2">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <NgoIcon className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                    <h3 className="font-bold text-sm mb-1">{ngo.name}</h3>
                    <p className="text-xs text-primary font-black">R$ {ngo.total_received.toLocaleString('pt-BR')}</p>
                  </DuoCard>
                </Link>
              </motion.div>
            );
          })}
        </div>
        <div className="text-center">
          <Link to="/ongs"><DuoButton variant="outline">{t("ngos_cta", "Conhecer todas as ONGs")} <ArrowRight className="w-4 h-4" /></DuoButton></Link>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-primary text-primary-foreground py-14">
        <div className="container">
          <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center" initial="hidden" whileInView="visible" viewport={{ once: true }}>
            {([
              { labelKey: "stat1_label", valueKey: "stat1_value", Icon: Coins, labelFb: "Total doado", valueFb: "R$ 158K+" },
              { labelKey: "stat2_label", valueKey: "stat2_value", Icon: Heart, labelFb: "ONGs apoiadas", valueFb: "6" },
              { labelKey: "stat3_label", valueKey: "stat3_value", Icon: Store, labelFb: "Lojas parceiras", valueFb: "10+" },
              { labelKey: "stat4_label", valueKey: "stat4_value", Icon: Users, labelFb: "Usuários ativos", valueFb: "1.2K+" },
            ] as const).map((s, i) => (
              <motion.div key={i} variants={fadeUp} custom={i}>
                <div className="flex justify-center mb-2">
                  <s.Icon className="w-7 h-7" />
                </div>
                <div className="text-3xl md:text-4xl font-black">{t(s.valueKey, s.valueFb)}</div>
                <div className="text-sm opacity-90 font-bold">{t(s.labelKey, s.labelFb)}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container py-16">
        <motion.div className="text-center mb-10" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
          <h2 className="text-3xl md:text-4xl font-black mb-3">{t("testimonial_title", "o que dizem sobre nós")}</h2>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            { nameKey: "testimonial1_name", textKey: "testimonial1_text", nameFb: "Ana Paula", textFb: "Incrível saber que minhas compras estão ajudando crianças.", avatar: "A" },
            { nameKey: "testimonial2_name", textKey: "testimonial2_text", nameFb: "Carlos Mendes", textFb: "Uso sempre que vou comprar online.", avatar: "C" },
            { nameKey: "testimonial3_name", textKey: "testimonial3_text", nameFb: "Mariana Silva", textFb: "Já doei mais de R$200 sem gastar nada a mais.", avatar: "M" },
          ].map((item, i) => (
            <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
              <DuoCard className="h-full">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-sm">{item.avatar}</div>
                  <p className="font-bold">{t(item.nameKey, item.nameFb)}</p>
                </div>
                <div className="flex gap-2">
                  <MessageCircle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  <p className="text-muted-foreground text-sm leading-relaxed">"{t(item.textKey, item.textFb)}"</p>
                </div>
              </DuoCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-card border-y-2 border-border py-16">
        <div className="container max-w-2xl">
          <motion.h2 className="text-3xl md:text-4xl font-black text-center mb-10" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            {t("faq_title", "perguntas frequentes")}
          </motion.h2>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(n => (
              <FaqItem key={n} question={t(`faq${n}_q`, `FAQ ${n}`)} answer={t(`faq${n}_a`, "")} index={n} />
            ))}
          </div>
        </div>
      </section>

      {/* Install App */}
      <section className="container py-8">
        <InstallAppBanner />
      </section>

      {/* Final CTA */}
      <section className="container py-20 text-center">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
          <h2 className="text-3xl md:text-5xl font-black mb-4">{t("cta_title", "Pronto para fazer a diferença?")}</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">{t("cta_subtitle", "Cadastre-se grátis e transforme suas compras em doações.")}</p>
          <Link to="/auth">
            <DuoButton size="lg">{t("cta_button", "Criar minha conta grátis")} <ArrowRight className="w-5 h-5" /></DuoButton>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t-2 border-border py-8">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Heart className="w-4 h-4 text-primary-foreground" fill="currentColor" />
            </div>
            <span className="font-extrabold text-foreground">MyCashbacks</span>
          </div>
          <div className="flex gap-6 font-semibold">
            <Link to="/transparencia" className="hover:text-foreground transition-colors">{t("nav_transparency", "Transparência")}</Link>
            <Link to="/privacidade" className="hover:text-foreground transition-colors">Privacidade</Link>
            <Link to="/termos" className="hover:text-foreground transition-colors">Termos</Link>
          </div>
          <p className="font-semibold">{t("footer_copyright", "© 2025 MyCashbacks. Feito com 💚")}</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureSection({ reverse, Icon, label, title, description, color, linkTo, linkLabel }: {
  reverse: boolean; Icon: LucideIcon; label: string; title: string; description: string; color: string; linkTo: string; linkLabel: string;
}) {
  return (
    <section className="py-16 md:py-24">
      <div className={`container flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-10 md:gap-16`}>
        <motion.div className="flex-1 flex justify-center" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
          <div className={`w-48 h-48 md:w-64 md:h-64 rounded-3xl bg-${color}/10 flex items-center justify-center`}>
            <Icon className={`w-20 h-20 md:w-28 md:h-28 text-${color}`} strokeWidth={1.2} />
          </div>
        </motion.div>
        <motion.div className="flex-1 text-center md:text-left" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}>
          <span className={`inline-block px-3 py-1 rounded-full bg-${color}/10 text-${color} font-extrabold text-xs uppercase tracking-wider mb-4`}>{label}</span>
          <h2 className="text-2xl md:text-4xl font-black mb-4">{title}</h2>
          <p className="text-muted-foreground text-base md:text-lg mb-6 max-w-md">{description}</p>
          <Link to={linkTo}><DuoButton variant="outline" size="md">{linkLabel} <ArrowRight className="w-4 h-4" /></DuoButton></Link>
        </motion.div>
      </div>
    </section>
  );
}

function FaqItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={index * 0.5}>
      <button onClick={() => setOpen(!open)} className="w-full text-left p-5 rounded-2xl border-2 border-border bg-background hover:border-primary/50 transition-colors">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <HelpCircle className="w-5 h-5 text-primary shrink-0" />
            <span className="font-bold text-base">{question}</span>
          </div>
          <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-200 shrink-0 ${open ? 'rotate-180' : ''}`} />
        </div>
        {open && (
          <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-muted-foreground text-sm mt-3 leading-relaxed pl-8">
            {answer}
          </motion.p>
        )}
      </button>
    </motion.div>
  );
}

function LoggedInHome() {
  const { user } = useAuth();
  const { t } = useSiteContent("home_logged");
  const selectedNgo = mockNgos[0];
  const pending = mockTransactions.filter(tx => tx.status === 'pending' || tx.status === 'tracked').reduce((s, tx) => s + tx.amount, 0);
  const confirmed = mockTransactions.filter(tx => tx.status === 'confirmed').reduce((s, tx) => s + tx.amount, 0);
  const donated = mockTransactions.filter(tx => tx.status === 'donated').reduce((s, tx) => s + tx.amount, 0);

  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-black">{t("home_greeting", "Olá,")} {user?.display_name?.split(' ')[0]}! 👋</h1>
        <p className="text-muted-foreground text-sm">{t("home_subtitle", "Veja o impacto das suas compras.")}</p>
      </div>

      <Link to={`/ongs/${selectedNgo.slug}`}>
        <DuoCard hover className="flex items-center gap-4 bg-primary/5 border-primary/20">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Heart className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-primary font-bold uppercase">{t("home_your_ngo", "Sua ONG")}</p>
            <p className="font-bold">{selectedNgo.name}</p>
          </div>
          <ArrowRight className="w-5 h-5 text-primary" />
        </DuoCard>
      </Link>

      <div className="grid grid-cols-3 gap-3">
        <DuoCard className="text-center bg-duo-yellow/10 border-duo-yellow/30">
          <p className="text-xs font-bold text-muted-foreground">{t("home_pending", "Pendente")}</p>
          <p className="text-lg font-black text-duo-yellow">R$ {pending.toFixed(2)}</p>
        </DuoCard>
        <DuoCard className="text-center bg-secondary/10 border-secondary/30">
          <p className="text-xs font-bold text-muted-foreground">{t("home_confirmed", "Confirmado")}</p>
          <p className="text-lg font-black text-secondary">R$ {confirmed.toFixed(2)}</p>
        </DuoCard>
        <DuoCard className="text-center bg-primary/10 border-primary/30">
          <p className="text-xs font-bold text-muted-foreground">{t("home_donated", "Doado")}</p>
          <p className="text-lg font-black text-primary">R$ {donated.toFixed(2)}</p>
        </DuoCard>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black">{t("home_featured_stores", "Lojas em destaque")}</h2>
          <Link to="/lojas" className="text-primary font-bold text-sm flex items-center gap-1">
            {t("home_see_all", "Ver todas")} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {mockStores.slice(0, 4).map(store => (
            <Link key={store.id} to={`/lojas/${store.slug}`}>
              <DuoCard hover>
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-2">
                  <Store className="w-5 h-5 text-muted-foreground" />
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
