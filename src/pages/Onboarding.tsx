import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Phone, Heart, ArrowRight, Check, Loader2, MapPin, Share, Plus, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { DuoButton } from "@/components/ui/duo-button";
import { useAuth } from "@/hooks/useAuth";
import { useNgos } from "@/hooks/useNgos";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { useInstallPWA } from "@/hooks/useInstallPWA";
import { CityPicker } from "@/components/CityPicker";

type Step = "phone" | "profile" | "location" | "ngo" | "install";

export default function Onboarding() {
  const { user, refreshProfile, loading: authLoading } = useAuth();
  const { ngos, loading: ngosLoading } = useNgos();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { canInstall, isIOS, install, isInstalled } = useInstallPWA();

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [selectedNgoId, setSelectedNgoId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const showInstallStep = isMobile && !isInstalled;
  const totalSteps = showInstallStep ? 5 : 4;
  const stepIndex = step === "phone" ? 0 : step === "profile" ? 1 : step === "location" ? 2 : step === "ngo" ? 3 : 4;

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [authLoading, user, navigate]);

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length > 7) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    if (digits.length > 2) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length > 0) return `(${digits}`;
    return "";
  };

  const handlePhoneNext = async () => {
    const rawPhone = phone.replace(/\D/g, "");
    if (rawPhone.length < 10) {
      toast.error("Informe um telefone válido");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ phone: rawPhone })
      .eq("id", user!.id);
    setSaving(false);
    if (error) {
      toast.error("Erro ao salvar telefone");
      return;
    }
    setStep("location");
  };

  const handleLocationNext = async () => {
    if (!city.trim() || !state) {
      toast.error("Informe cidade e estado");
      return;
    }
    setSaving(true);
    // City from IBGE API = Brazilian city, so locale is always 'pt'
    const { error } = await supabase
      .from("profiles")
      .update({ city: city.trim(), state, locale: "pt" })
      .eq("id", user!.id);
    setSaving(false);
    if (error) {
      toast.error("Erro ao salvar localização");
      return;
    }
    setStep("ngo");
  };

  const handleNgoFinish = async () => {
    if (!selectedNgoId) {
      toast.error("Selecione uma ONG");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ selected_ngo_id: selectedNgoId })
      .eq("id", user!.id);
    setSaving(false);
    if (error) {
      toast.error("Erro ao salvar ONG");
      return;
    }
    await refreshProfile();
    if (showInstallStep) {
      setStep("install");
    } else {
      toast.success("Tudo pronto!");
      navigate("/");
    }
  };

  const handleInstallFinish = async () => {
    if (canInstall) {
      await install();
    }
    toast.success("Tudo pronto!");
    navigate("/");
  };

  if (authLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative z-10 w-full max-w-md mx-4"
        >
          <div className="bg-card border-2 border-primary/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-primary/10">
            {/* Progress dots */}
            <div className="flex items-center justify-center gap-1.5 mb-6">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  {i > 0 && <div className={`w-6 h-0.5 ${i <= stepIndex ? "bg-primary" : "bg-muted"}`} />}
                  <div className={`w-2.5 h-2.5 rounded-full transition-all ${
                    i === stepIndex ? "bg-primary scale-125" : i < stepIndex ? "bg-primary" : "bg-muted"
                  }`} />
                </div>
              ))}
            </div>

            {/* STEP: Phone */}
            {step === "phone" && (
              <div className="space-y-5">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Phone className="w-7 h-7 text-primary" />
                  </div>
                  <h2 className="text-xl font-black">Seu telefone</h2>
                  <p className="text-sm text-muted-foreground mt-1">Para enviarmos atualizações sobre suas doações</p>
                </div>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    className="pl-10 h-12 rounded-2xl border-2 text-base"
                    autoFocus
                  />
                </div>
                <DuoButton size="lg" className="w-full" onClick={handlePhoneNext} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Continuar <ArrowRight className="w-4 h-4" /></>}
                </DuoButton>
                <button onClick={() => setStep("location")} className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Pular por agora
                </button>
              </div>
            )}

            {/* STEP: Location */}
            {step === "location" && (
              <div className="space-y-5">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <MapPin className="w-7 h-7 text-primary" />
                  </div>
                  <h2 className="text-xl font-black">Onde você mora?</h2>
                  <p className="text-sm text-muted-foreground mt-1">Para conectar você com ONGs da sua região</p>
                </div>

                <CityPicker city={city} state={state} onCityChange={setCity} onStateChange={setState} showDetect />

                <DuoButton size="lg" className="w-full" onClick={handleLocationNext} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Continuar <ArrowRight className="w-4 h-4" /></>}
                </DuoButton>
                <button onClick={() => setStep("ngo")} className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Pular por agora
                </button>
              </div>
            )}

            {/* STEP: NGO */}
            {step === "ngo" && (
              <div className="space-y-5">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Heart className="w-7 h-7 text-primary" />
                  </div>
                  <h2 className="text-xl font-black">Escolha sua ONG</h2>
                  <p className="text-sm text-muted-foreground mt-1">Seus cashbacks serão doados para esta causa</p>
                </div>
                {ngosLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {ngos.map((ngo) => (
                      <button
                        key={ngo.id}
                        onClick={() => setSelectedNgoId(ngo.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-2xl border-2 transition-all text-left ${
                          selectedNgoId === ngo.id
                            ? "border-primary bg-primary/10 ring-1 ring-primary/20"
                            : "border-border hover:border-primary/30 hover:bg-muted/50"
                        }`}
                      >
                        {ngo.logo_url ? (
                          <img src={ngo.logo_url} alt={ngo.name} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            <Heart className="w-5 h-5 text-primary" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm truncate">{ngo.name}</p>
                          {ngo.mission && <p className="text-[11px] text-muted-foreground truncate">{ngo.mission}</p>}
                        </div>
                        {selectedNgoId === ngo.id && <Check className="w-5 h-5 text-primary shrink-0" />}
                      </button>
                    ))}
                  </div>
                )}
                <DuoButton size="lg" className="w-full" onClick={handleNgoFinish} disabled={saving || !selectedNgoId}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <>
                    {showInstallStep ? "Continuar" : "Começar a doar"} {showInstallStep ? <ArrowRight className="w-4 h-4" /> : <Heart className="w-4 h-4" />}
                  </>}
                </DuoButton>
              </div>
            )}

            {/* STEP: Install PWA (mobile only) */}
            {step === "install" && (
              <div className="space-y-5">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Smartphone className="w-7 h-7 text-primary" />
                  </div>
                  <h2 className="text-xl font-black">Adicione à tela inicial</h2>
                  <p className="text-sm text-muted-foreground mt-1">Acesse mais rápido, como um app de verdade!</p>
                </div>

                {isIOS ? (
                  <div className="bg-muted/50 rounded-2xl p-4 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-sm font-black text-primary">1</div>
                      <div>
                        <p className="text-sm font-semibold">Toque no botão de compartilhar</p>
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                          O ícone <Share className="w-3.5 h-3.5 inline" /> na barra do Safari
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-sm font-black text-primary">2</div>
                      <div>
                        <p className="text-sm font-semibold">Selecione "Adicionar à Tela de Início"</p>
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                          O ícone <Plus className="w-3.5 h-3.5 inline" /> no menu
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-sm font-black text-primary">3</div>
                      <div>
                        <p className="text-sm font-semibold">Toque em "Adicionar"</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Pronto! O app aparecerá na sua tela inicial</p>
                      </div>
                    </div>
                  </div>
                ) : canInstall ? (
                  <div className="bg-muted/50 rounded-2xl p-4 text-center space-y-3">
                    <Smartphone className="w-12 h-12 text-primary mx-auto" />
                    <p className="text-sm text-muted-foreground">
                      Instale o app para ter acesso rápido na sua tela inicial
                    </p>
                  </div>
                ) : (
                  <div className="bg-muted/50 rounded-2xl p-4 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-sm font-black text-primary">1</div>
                      <div>
                        <p className="text-sm font-semibold">Abra o menu do navegador</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Toque nos 3 pontos (⋮) no canto superior</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-sm font-black text-primary">2</div>
                      <div>
                        <p className="text-sm font-semibold">Selecione "Adicionar à tela inicial"</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Ou "Instalar aplicativo"</p>
                      </div>
                    </div>
                  </div>
                )}

                <DuoButton size="lg" className="w-full" onClick={handleInstallFinish}>
                  {canInstall ? (
                    <>Instalar app <Smartphone className="w-4 h-4" /></>
                  ) : (
                    <>Entendi, vamos lá! <ArrowRight className="w-4 h-4" /></>
                  )}
                </DuoButton>
                <button
                  onClick={() => { toast.success("Tudo pronto!"); navigate("/"); }}
                  className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Pular
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
