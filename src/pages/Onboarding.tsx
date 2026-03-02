import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Phone, Heart, ArrowRight, Check, Loader2, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { DuoButton } from "@/components/ui/duo-button";
import { useAuth } from "@/hooks/useAuth";
import { useNgos } from "@/hooks/useNgos";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Step = "phone" | "ngo";

export default function Onboarding() {
  const { user, refreshProfile, loading: authLoading } = useAuth();
  const { ngos, loading: ngosLoading } = useNgos();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [selectedNgoId, setSelectedNgoId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // If user already completed onboarding, redirect
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
    toast.success("Tudo pronto! 🎉");
    navigate("/");
  };

  const handleSkipPhone = () => {
    setStep("ngo");
  };

  if (authLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Spotlight card */}
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
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className={`w-2.5 h-2.5 rounded-full transition-colors ${step === "phone" ? "bg-primary scale-125" : "bg-primary"}`} />
              <div className={`w-8 h-0.5 ${step === "ngo" ? "bg-primary" : "bg-muted"}`} />
              <div className={`w-2.5 h-2.5 rounded-full transition-colors ${step === "ngo" ? "bg-primary scale-125" : "bg-muted"}`} />
            </div>

            {step === "phone" && (
              <div className="space-y-5">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Phone className="w-7 h-7 text-primary" />
                  </div>
                  <h2 className="text-xl font-black">Seu telefone</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Para enviarmos atualizações sobre suas doações
                  </p>
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

                <DuoButton
                  size="lg"
                  className="w-full"
                  onClick={handlePhoneNext}
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Continuar <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </DuoButton>

                <button
                  onClick={handleSkipPhone}
                  className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Pular por agora
                </button>
              </div>
            )}

            {step === "ngo" && (
              <div className="space-y-5">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Heart className="w-7 h-7 text-primary" />
                  </div>
                  <h2 className="text-xl font-black">Escolha sua ONG</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Seus cashbacks serão doados para esta causa
                  </p>
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
                          <img
                            src={ngo.logo_url}
                            alt={ngo.name}
                            className="w-10 h-10 rounded-xl object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            <Heart className="w-5 h-5 text-primary" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm truncate">{ngo.name}</p>
                          {ngo.mission && (
                            <p className="text-[11px] text-muted-foreground truncate">{ngo.mission}</p>
                          )}
                        </div>
                        {selectedNgoId === ngo.id && (
                          <Check className="w-5 h-5 text-primary shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                )}

                <DuoButton
                  size="lg"
                  className="w-full"
                  onClick={handleNgoFinish}
                  disabled={saving || !selectedNgoId}
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Começar a doar <Heart className="w-4 h-4" />
                    </>
                  )}
                </DuoButton>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
