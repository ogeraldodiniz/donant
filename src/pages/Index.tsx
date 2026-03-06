import { Link } from "react-router-dom";
import { Heart, ArrowRight, ChevronDown, ShoppingCart, Gift, PartyPopper, Search, Target, Rocket, BadgeCheck, TrendingUp, Store, Users, Quote, HelpCircle, UserPlus, ShoppingBag, HandHeart, Coins, Star, MessageCircle, Download, Pencil, Newspaper, Calendar } from "lucide-react";
import { DuoButton } from "@/components/ui/duo-button";
import { DuoCard } from "@/components/ui/duo-card";
import { useAuth } from "@/hooks/useAuth";
import { useSiteContent } from "@/hooks/useSiteContent";
import { mockTransactions } from "@/lib/mock-data";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import type { LucideIcon } from "lucide-react";
import { InstallAppBanner } from "@/components/InstallAppBanner";
import { PushPermissionBanner } from "@/components/PushPermissionBanner";
import { LevelBadge } from "@/components/LevelBadge";
import { useNgos } from "@/hooks/useNgos";
import { useStores } from "@/hooks/useStores";
import { supabase } from "@/integrations/supabase/client";
import { useLocale } from "@/hooks/useLocale";

export default function Index() {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? <LoggedInHome /> : <PublicHome />;
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.12, duration: 0.5 } }),
};

const ngoIcons: LucideIcon[] = [Heart, Target, Users, Star, BadgeCheck, Rocket];

// Used by PublicHome for NGO display from DB
function usePublicNgos() {
  const { ngos } = useNgos();
  return ngos;
}

function PublicHome() {
  const { t } = useSiteContent();
  const { stores: dbStores } = useStores();
  const publicNgos = usePublicNgos();
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="container py-12 sm:py-20 md:py-32 flex flex-col md:flex-row items-center gap-8 md:gap-10">
          <motion.div className="flex-1 text-center md:text-left" initial="hidden" animate="visible" variants={fadeUp}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary font-extrabold text-xs sm:text-sm mb-4 sm:mb-6">
              <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" /> {t("hero_badge", "100% gratuito. 100% solidário.")}
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black text-foreground leading-[1.08] mb-4 sm:mb-5">
              {t("hero_title_1", "Compre online.")}<br />
              <span className="text-primary">{t("hero_title_2", "Doe sem gastar nada.")}</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-lg mx-auto md:mx-0 mb-6 sm:mb-8">
              {t("hero_subtitle", "Cada compra nas lojas parceiras gera cashback que é doado automaticamente para a ONG que você escolher. Simples assim.")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center md:justify-start">
              <Link to="/auth" className="w-full sm:w-auto">
                <DuoButton size="lg" className="w-full sm:w-auto">
                  {t("hero_cta_primary", "Comece em 60 segundos")} <ArrowRight className="w-5 h-5" />
                </DuoButton>
              </Link>
              <Link to="/auth" className="w-full sm:w-auto">
                <DuoButton variant="outline" size="lg" className="w-full sm:w-auto">
                  {t("hero_cta_secondary", "Entrar")}
                </DuoButton>
              </Link>
            </div>
          </motion.div>

          <motion.div
            className="flex-1 flex justify-center w-full"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 md:w-96 md:h-96">
              <motion.div className="absolute top-0 left-0 sm:left-4 md:left-0" animate={{ y: [0, -12, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
                <DuoCard className="bg-card shadow-xl px-4 py-3 sm:px-5 sm:py-4 w-48 sm:w-56">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs text-muted-foreground font-bold">Compra no Aliexpress</p>
                      <p className="text-xs sm:text-sm font-black text-primary">+ R$ 12,50 cashback</p>
                    </div>
                  </div>
                </DuoCard>
              </motion.div>
              <motion.div className="absolute top-24 sm:top-28 right-0" animate={{ y: [0, 10, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}>
                <DuoCard className="bg-card shadow-xl px-4 py-3 sm:px-5 sm:py-4 w-52 sm:w-60">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                      <HandHeart className="w-4 h-4 sm:w-5 sm:h-5 text-destructive" />
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs text-muted-foreground font-bold">Doação automática</p>
                      <p className="text-xs sm:text-sm font-black text-destructive">→ Cruz Vermelha</p>
                    </div>
                  </div>
                </DuoCard>
              </motion.div>
              <motion.div className="absolute bottom-0 sm:bottom-4 left-4" animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}>
                <DuoCard className="bg-primary text-primary-foreground shadow-xl px-4 py-3 sm:px-5 sm:py-4 w-44 sm:w-52">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <PartyPopper className="w-5 h-5 sm:w-6 sm:h-6" />
                    <div>
                      <p className="text-[10px] sm:text-xs font-bold opacity-80">Total doado</p>
                      <p className="text-base sm:text-lg font-black">R$ 158.730+</p>
                    </div>
                  </div>
                </DuoCard>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-card border-y-2 border-border py-12 sm:py-16 md:py-24">
        <div className="container max-w-5xl">
          <motion.h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-center mb-3 sm:mb-4" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            {t("how_title", "como funciona?")}
          </motion.h2>
          <motion.p className="text-center text-muted-foreground text-sm sm:text-base mb-10 sm:mb-14 max-w-md mx-auto" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}>
            {t("how_subtitle", "Em 3 passos simples, suas compras viram doações.")}
          </motion.p>

          <div className="relative">
            {/* Connecting lines between circles (desktop only) */}
            <div className="hidden md:block absolute top-12 left-[calc(16.67%+48px)] right-[calc(50%+48px)] h-0.5 bg-border z-0" />
            <div className="hidden md:block absolute top-12 left-[calc(50%+48px)] right-[calc(16.67%+48px)] h-0.5 bg-border z-0" />

            <div className="grid md:grid-cols-3 gap-10 sm:gap-12 relative z-10">
              {([
                { Icon: UserPlus, titleKey: "how_step1_title", descKey: "how_step1_desc", titleFb: "Cadastre-se grátis", descFb: "Crie sua conta em segundos e escolha a ONG que quer apoiar." },
                { Icon: ShoppingBag, titleKey: "how_step2_title", descKey: "how_step2_desc", titleFb: "Compre normalmente", descFb: "Acesse as lojas parceiras pelo nosso link e compre o que já ia comprar." },
                { Icon: Gift, titleKey: "how_step3_title", descKey: "how_step3_desc", titleFb: "Cashback vira doação", descFb: "O cashback gerado é enviado diretamente para a ONG escolhida. Sem custo pra você!" },
              ] as const).map((step, i) => (
                <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i} className="flex flex-col items-center text-center">
                  {/* Step circle with icon */}
                  <div className="relative mb-5">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-primary/10 flex items-center justify-center">
                      <step.Icon className="w-8 h-8 sm:w-10 sm:h-10 text-primary" strokeWidth={1.5} />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-black text-xs sm:text-sm shadow-md">
                      {i + 1}
                    </div>
                  </div>

                  <h3 className="text-base sm:text-lg font-black mb-2">{t(step.titleKey, step.titleFb)}</h3>
                  <p className="text-muted-foreground text-xs sm:text-sm max-w-[260px]">{t(step.descKey, step.descFb)}</p>

                  {/* Arrow between steps (mobile) */}
                  {i < 2 && (
                    <div className="md:hidden mt-4 text-muted-foreground/50">
                      <ChevronDown className="w-6 h-6" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Feature 1 */}
      <FeatureSection
        reverse={false} Icon={Search} colorClass="primary" linkTo="/auth"
        label={t("feat1_label", "transparência total")}
        title={t("feat1_title", "Acompanhe cada centavo.")}
        description={t("feat1_desc", "Todas as doações são públicas e rastreáveis.")}
        linkLabel={t("feat1_link", "Ver transparência")}
      />
      {/* Feature 2 */}
      <FeatureSection
        reverse={true} Icon={Target} colorClass="secondary" linkTo="/auth"
        label={t("feat2_label", "você escolhe")}
        title={t("feat2_title", "Apoie a causa que importa pra você.")}
        description={t("feat2_desc", "Escolha entre nossas ONGs parceiras verificadas.")}
        linkLabel={t("feat2_link", "Conhecer ONGs")}
      />
      {/* Feature 3 */}
      <FeatureSection
        reverse={false} Icon={Rocket} colorClass="accent" linkTo="/auth"
        label={t("feat3_label", "sem custo extra")}
        title={t("feat3_title", "Não muda nada na sua compra.")}
        description={t("feat3_desc", "Você paga o mesmo preço.")}
        linkLabel={t("feat3_link", "Ver lojas parceiras")}
      />

      {/* Stores */}
      <section className="bg-card border-y-2 border-border py-12 sm:py-16">
        <div className="container">
          <motion.div className="flex items-center justify-between mb-6 sm:mb-8" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-xl sm:text-2xl font-black">{t("stores_title", "Lojas em destaque")}</h2>
            <Link to="/auth" className="text-primary font-bold text-sm flex items-center gap-1 hover:underline">
              {t("stores_cta", "Ver todas")} <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {dbStores.slice(0, 6).map((store, i) => (
              <motion.div key={store.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.3}>
                <Link to="/auth">
                  <DuoCard hover className="flex items-center gap-4 p-4">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                      {store.logo_url ? (
                        <img src={store.logo_url} alt={store.name} className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover" />
                      ) : (
                        <Store className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm sm:text-base truncate">{store.name}</p>
                      <p className="text-muted-foreground text-xs sm:text-sm">Até {Number(store.cashback_rate)}% cashback</p>
                      <span className="inline-block mt-2 px-3 py-1 rounded-lg bg-primary text-primary-foreground text-xs font-bold">
                        Comprar agora
                      </span>
                    </div>
                  </DuoCard>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* NGOs */}
      <section className="py-12 sm:py-16">
        <div className="container">
          <motion.div className="flex items-center justify-between mb-6 sm:mb-8" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-xl sm:text-2xl font-black">{t("ngos_title", "ONGs em destaque")}</h2>
            <Link to="/auth" className="text-primary font-bold text-sm flex items-center gap-1 hover:underline">
              {t("ngos_cta", "Ver todas")} <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {publicNgos.slice(0, 6).map((ngo, i) => {
              const NgoIcon = ngoIcons[i % ngoIcons.length];
              return (
                <motion.div key={ngo.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.3}>
                  <Link to="/auth">
                    <DuoCard hover className="flex items-center gap-4 p-4">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                        {ngo.logo_url ? (
                          <img src={ngo.logo_url} alt={ngo.name} className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover" />
                        ) : (
                          <NgoIcon className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm sm:text-base truncate">{ngo.name}</p>
                        <p className="text-muted-foreground text-xs sm:text-sm">R$ {ngo.total_received.toLocaleString('pt-BR')} recebidos</p>
                        <span className="inline-block mt-2 px-3 py-1 rounded-lg bg-primary text-primary-foreground text-xs font-bold">
                          Apoiar
                        </span>
                      </div>
                    </DuoCard>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>


      {/* Testimonials */}
      <section className="container py-12 sm:py-16">
        <motion.div className="text-center mb-8 sm:mb-10" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-2 sm:mb-3">{t("testimonial_title", "o que dizem sobre nós")}</h2>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
          {[
            { nameKey: "testimonial1_name", textKey: "testimonial1_text", nameFb: "Ana Paula", textFb: "Incrível saber que minhas compras estão ajudando crianças.", avatar: "A" },
            { nameKey: "testimonial2_name", textKey: "testimonial2_text", nameFb: "Carlos Mendes", textFb: "Uso sempre que vou comprar online.", avatar: "C" },
            { nameKey: "testimonial3_name", textKey: "testimonial3_text", nameFb: "Mariana Silva", textFb: "Já doei mais de R$200 sem gastar nada a mais.", avatar: "M" },
          ].map((item, i) => (
            <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
              <DuoCard className="h-full">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-xs sm:text-sm">{item.avatar}</div>
                  <p className="font-bold text-sm">{t(item.nameKey, item.nameFb)}</p>
                </div>
                <div className="flex gap-2">
                  <MessageCircle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">"{t(item.textKey, item.textFb)}"</p>
                </div>
              </DuoCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-card border-y-2 border-border py-12 sm:py-16">
        <div className="container max-w-2xl">
          <motion.h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-center mb-8 sm:mb-10" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            {t("faq_title", "perguntas frequentes")}
          </motion.h2>
          <div className="space-y-3">
            {[
              { q: "É gratuito?", a: "Sim! Você não paga nada a mais. O cashback é gerado pela loja parceira." },
              { q: "Como funciona o cashback?", a: "Ao comprar em uma loja parceira, parte do valor é devolvido como cashback e doado para a ONG que você escolheu." },
              { q: "Posso escolher a ONG?", a: "Sim! Você escolhe a ONG que vai receber suas doações." },
              { q: "Quanto tempo leva para confirmar?", a: "O cashback é confirmado pela loja em até 90 dias após a compra." },
              { q: "Posso resgatar o cashback em dinheiro?", a: "Não. O cashback é 100% doado para a ONG escolhida. Essa é a essência da plataforma." },
            ].map((item, n) => (
              <FaqItem key={n} question={t(`faq_q${n+1}`, item.q)} answer={t(`faq_a${n+1}`, item.a)} index={n+1} />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container py-12 sm:py-20 text-center">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-black mb-3 sm:mb-4">{t("cta_title", "Pronto para fazer a diferença?")}</h2>
          <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-md mx-auto">{t("cta_subtitle", "Cadastre-se grátis e transforme suas compras em doações.")}</p>
          <Link to="/auth" className="w-full sm:w-auto inline-block">
            <DuoButton size="lg" className="w-full sm:w-auto">{t("cta_button", "Criar minha conta grátis")} <ArrowRight className="w-5 h-5" /></DuoButton>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t-2 border-border py-6 sm:py-8">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Heart className="w-4 h-4 text-primary-foreground" fill="currentColor" />
            </div>
            <span className="font-extrabold text-foreground">DonActivo</span>
          </div>
          <div className="flex gap-4 sm:gap-6 font-semibold">
            <Link to="/transparencia" className="hover:text-foreground transition-colors">{t("nav_transparency", "Transparência")}</Link>
            <Link to="/privacidade" className="hover:text-foreground transition-colors">Privacidade</Link>
            <Link to="/termos" className="hover:text-foreground transition-colors">Termos</Link>
          </div>
          <p className="font-semibold flex items-center gap-1">{t("footer_copyright", "© 2025 DonActivo. Feito com")} <Heart className="w-3.5 h-3.5 text-primary" fill="currentColor" /></p>
        </div>
      </footer>
    </div>
  );
}

const featureColorMap: Record<string, { bg: string; text: string; labelBg: string; labelText: string }> = {
  primary: { bg: "bg-primary/10", text: "text-primary", labelBg: "bg-primary/10", labelText: "text-primary" },
  secondary: { bg: "bg-secondary/10", text: "text-secondary", labelBg: "bg-secondary/10", labelText: "text-secondary" },
  accent: { bg: "bg-accent/10", text: "text-accent-foreground", labelBg: "bg-accent/10", labelText: "text-accent-foreground" },
};

function FeatureSection({ reverse, Icon, label, title, description, colorClass, linkTo, linkLabel }: {
  reverse: boolean; Icon: LucideIcon; label: string; title: string; description: string; colorClass: string; linkTo: string; linkLabel: string;
}) {
  const colors = featureColorMap[colorClass] || featureColorMap.primary;
  return (
    <section className="py-12 sm:py-16 md:py-24">
      <div className={`container flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-8 sm:gap-10 md:gap-16`}>
        <motion.div className="flex-1 flex justify-center" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
          <div className={`w-36 h-36 sm:w-48 sm:h-48 md:w-64 md:h-64 rounded-3xl ${colors.bg} flex items-center justify-center`}>
            <Icon className={`w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 ${colors.text}`} strokeWidth={1.2} />
          </div>
        </motion.div>
        <motion.div className="flex-1 text-center md:text-left" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}>
          <span className={`inline-block px-3 py-1 rounded-full ${colors.labelBg} ${colors.labelText} font-extrabold text-[10px] sm:text-xs uppercase tracking-wider mb-3 sm:mb-4`}>{label}</span>
          <h2 className="text-xl sm:text-2xl md:text-4xl font-black mb-3 sm:mb-4">{title}</h2>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg mb-4 sm:mb-6 max-w-md mx-auto md:mx-0">{description}</p>
          <Link to={linkTo} className="w-full sm:w-auto inline-block">
            <DuoButton variant="outline" size="md" className="w-full sm:w-auto">{linkLabel} <ArrowRight className="w-4 h-4" /></DuoButton>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function FaqItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={index * 0.5}>
      <button onClick={() => setOpen(!open)} className="w-full text-left p-4 sm:p-5 rounded-2xl border-2 border-border bg-background hover:border-primary/50 transition-colors">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
            <span className="font-bold text-sm sm:text-base">{question}</span>
          </div>
          <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground transition-transform duration-200 shrink-0 ${open ? 'rotate-180' : ''}`} />
        </div>
        {open && (
          <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-muted-foreground text-xs sm:text-sm mt-3 leading-relaxed pl-6 sm:pl-8">
            {answer}
          </motion.p>
        )}
      </button>
    </motion.div>
  );
}

function FeaturedNewsCard({ news }: { news: { id: string; title: string; slug: string; summary: string | null; cover_url: string | null; published_at: string | null } }) {
  return (
    <Link to={`/noticias/${news.slug}`}>
      <DuoCard hover className="p-0 overflow-hidden h-full">
        <div className="flex flex-row h-full">
          {news.cover_url ? (
            <img src={news.cover_url} alt="" className="w-24 sm:w-28 aspect-square object-cover rounded-2xl m-2 shrink-0" />
          ) : (
            <div className="w-24 sm:w-28 aspect-square bg-primary/10 flex items-center justify-center rounded-2xl m-2 shrink-0">
              <Newspaper className="w-7 h-7 text-primary" />
            </div>
          )}
          <div className="p-3 flex-1 min-w-0 flex flex-col justify-center">
            <h3 className="font-bold text-xs sm:text-sm line-clamp-2">{news.title}</h3>
            {news.summary && (
              <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2 mt-1">{news.summary}</p>
            )}
            <div className="mt-2">
              <DuoButton size="sm" className="text-[10px] sm:text-xs px-3 py-1 h-auto">
                Ler mais
              </DuoButton>
            </div>
          </div>
        </div>
      </DuoCard>
    </Link>
  );
}

function FeaturedStoreCard({ store }: { store: { id: string; name: string; slug: string; logo_url: string | null; cashback_rate: number } }) {
  return (
    <Link to={`/lojas/${store.slug}`}>
      <DuoCard hover className="p-0 overflow-hidden h-full">
        <div className="flex flex-row h-full">
          {store.logo_url ? (
            <img src={store.logo_url} alt={store.name} className="w-24 sm:w-28 aspect-square object-cover rounded-2xl m-2 shrink-0 bg-muted" />
          ) : (
            <div className="w-24 sm:w-28 aspect-square bg-muted flex items-center justify-center rounded-2xl m-2 shrink-0">
              <Store className="w-7 h-7 text-muted-foreground" />
            </div>
          )}
          <div className="p-3 flex-1 min-w-0 flex flex-col justify-center">
            <p className="font-bold text-xs sm:text-sm truncate">{store.name}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">Até {Number(store.cashback_rate)}% cashback</p>
            <div className="mt-2">
              <DuoButton size="sm" className="text-[10px] sm:text-xs px-3 py-1 h-auto">
                Comprar agora
              </DuoButton>
            </div>
          </div>
        </div>
      </DuoCard>
    </Link>
  );
}

function LoggedInHome() {
  const { user } = useAuth();
  const { t } = useSiteContent("home_logged");
  const { ngos } = useNgos();
  const { stores: dbStores } = useStores();
  const { locale } = useLocale();
  const selectedNgo = ngos.find(n => n.id === user?.selected_ngo_id) || ngos[0];
  const pending = mockTransactions.filter(tx => tx.status === 'pending' || tx.status === 'tracked').reduce((s, tx) => s + tx.amount, 0);
  const confirmed = mockTransactions.filter(tx => tx.status === 'confirmed').reduce((s, tx) => s + tx.amount, 0);
  const donated = mockTransactions.filter(tx => tx.status === 'donated').reduce((s, tx) => s + tx.amount, 0);

  // Featured news
  const [featuredNews, setFeaturedNews] = useState<{ id: string; title: string; slug: string; summary: string | null; cover_url: string | null; published_at: string | null }[]>([]);
  useEffect(() => {
    supabase
      .from("news")
      .select("id, title, slug, summary, cover_url, published_at")
      .eq("locale", locale)
      .eq("is_published", true)
      .eq("is_featured", true)
      .order("published_at", { ascending: false })
      .limit(3)
      .then(({ data }) => setFeaturedNews((data as any[]) || []));
  }, [locale]);

  // Featured stores (prefer featured, fallback to first active)
  const featuredStores = dbStores.filter((s: any) => s.is_featured);
  const displayStores = featuredStores.length > 0 ? featuredStores.slice(0, 3) : dbStores.slice(0, 3);

  return (
    <div className="container py-5 sm:py-6 space-y-4 sm:space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-black">Olá, {user?.display_name?.split(' ')[0] || 'você'}!</h1>
        <p className="text-muted-foreground text-xs sm:text-sm">{t("home_subtitle", "Veja o impacto das suas compras.")}</p>
      </div>

      <InstallAppBanner />
      <PushPermissionBanner />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 items-start">
        <LevelBadge totalDonated={donated} />

        <DuoCard className="bg-primary/5 border-primary/20 h-full p-0 overflow-hidden">
          {selectedNgo ? (
            <div className="flex flex-row h-full">
              {selectedNgo.logo_url ? (
                <div className="w-28 sm:w-36 shrink-0 overflow-hidden rounded-2xl bg-muted self-stretch m-2">
                  <img src={selectedNgo.logo_url} alt={selectedNgo.name} className="w-full h-full object-cover rounded-2xl" />
                </div>
              ) : (
                <div className="w-28 sm:w-36 shrink-0 bg-primary/10 flex items-center justify-center self-stretch">
                  <Heart className="w-10 h-10 text-primary" />
                </div>
              )}
              <div className="p-3.5 sm:p-4 flex-1 min-w-0 flex flex-col justify-center">
                <p className="text-[10px] sm:text-xs text-primary font-bold uppercase mb-1">{t("home_your_ngo", "Sua ONG")}</p>
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm sm:text-base truncate">{selectedNgo.name}</p>
                    {selectedNgo.mission && (
                      <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2 mt-0.5">{selectedNgo.mission}</p>
                    )}
                  </div>
                  <Link to="/ongs" className="shrink-0">
                    <DuoButton variant="outline" size="sm" className="text-xs gap-1">
                      <Pencil className="w-3 h-3" /> Alterar
                    </DuoButton>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3.5 sm:p-5">
              <p className="text-[10px] sm:text-xs text-primary font-bold uppercase mb-2">{t("home_your_ngo", "Sua ONG")}</p>
              <p className="text-muted-foreground text-xs sm:text-sm mb-2">Nenhuma ONG selecionada</p>
              <Link to="/ongs">
                <DuoButton size="sm" className="text-xs">Escolher ONG <ArrowRight className="w-3 h-3" /></DuoButton>
              </Link>
            </div>
          )}
        </DuoCard>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <DuoCard className="text-center p-3 sm:p-5 bg-destructive/10 border-destructive/30">
          <p className="text-[10px] sm:text-xs font-bold text-muted-foreground">{t("home_pending", "Pendente")}</p>
          <p className="text-sm sm:text-lg font-black text-destructive">R$ {pending.toFixed(2)}</p>
        </DuoCard>
        <DuoCard className="text-center p-3 sm:p-5 bg-accent/10 border-accent/30">
          <p className="text-[10px] sm:text-xs font-bold text-muted-foreground">{t("home_confirmed", "Confirmado")}</p>
          <p className="text-sm sm:text-lg font-black text-accent">R$ {confirmed.toFixed(2)}</p>
        </DuoCard>
        <DuoCard className="text-center p-3 sm:p-5 bg-primary/10 border-primary/30">
          <p className="text-[10px] sm:text-xs font-bold text-muted-foreground">{t("home_donated", "Doado")}</p>
          <p className="text-sm sm:text-lg font-black text-primary">R$ {donated.toFixed(2)}</p>
        </DuoCard>
      </div>

      {/* Featured News */}
      {featuredNews.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg font-black">
              {t("home_featured_news", "Notícias em destaque")}
            </h2>
            <Link to="/noticias" className="text-primary font-bold text-xs sm:text-sm flex items-center gap-1">
              {t("home_see_all_news", "Ver todas")} <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Link>
          </div>
          {/* Desktop: 3 columns */}
          <div className="hidden md:grid md:grid-cols-3 gap-3">
            {featuredNews.slice(0, 3).map(news => (
              <FeaturedNewsCard key={news.id} news={news} />
            ))}
          </div>
          {/* Mobile: horizontal carousel */}
          <div className="md:hidden flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
            {featuredNews.slice(0, 3).map(news => (
              <div key={news.id} className="min-w-[75vw] snap-start">
                <FeaturedNewsCard news={news} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Featured Stores */}
      <div>
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="text-base sm:text-lg font-black">{t("home_featured_stores", "Lojas em destaque")}</h2>
          <Link to="/lojas" className="text-primary font-bold text-xs sm:text-sm flex items-center gap-1">
            {t("home_see_all", "Ver todas")} <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Link>
        </div>
        {/* Desktop: 3 columns */}
        <div className="hidden md:grid md:grid-cols-3 gap-3">
          {displayStores.slice(0, 3).map(store => (
            <FeaturedStoreCard key={store.id} store={store} />
          ))}
        </div>
        {/* Mobile: horizontal carousel */}
        <div className="md:hidden flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
          {displayStores.slice(0, 3).map(store => (
            <div key={store.id} className="min-w-[75vw] snap-start">
              <FeaturedStoreCard store={store} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
