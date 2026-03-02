import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, CheckCircle2, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { DuoButton } from "@/components/ui/duo-button";

interface StoreInfo {
  id: string;
  name: string;
  slug: string;
  website_url: string | null;
  cashback_rate: number;
  logo_url: string | null;
}

export default function Redirect() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  const [store, setStore] = useState<StoreInfo | null>(null);
  const [step, setStep] = useState(0);
  const [countdown, setCountdown] = useState(5);
  const [clickoutDone, setClickoutDone] = useState(false);
  const openedRef = useRef(false);

  // Fetch store from DB
  useEffect(() => {
    if (!slug) { navigate("/lojas"); return; }

    const fetchStore = async () => {
      const { data, error } = await supabase
        .from("stores")
        .select("id, name, slug, website_url, cashback_rate, logo_url")
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();

      if (error || !data) {
        navigate("/lojas");
        return;
      }
      setStore(data);
    };

    fetchStore();
  }, [slug, navigate]);

  // Steps animation + clickout recording
  useEffect(() => {
    if (!store || !session?.user?.id) return;

    const timers = [
      setTimeout(() => setStep(1), 800),
      setTimeout(async () => {
        // Record clickout
        try {
          await supabase.from("clickouts").insert({
            store_id: store.id,
            user_id: session.user.id,
            redirect_url: store.website_url,
          });
        } catch (e) {
          console.error("Erro ao registrar clickout:", e);
        }
        setClickoutDone(true);
        setStep(2);
      }, 1600),
      setTimeout(() => setStep(3), 2400),
    ];

    return () => timers.forEach(clearTimeout);
  }, [store, session?.user?.id]);

  // Countdown after step 3
  useEffect(() => {
    if (step < 3) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [step]);

  // Open store in new tab when countdown reaches 0
  useEffect(() => {
    if (countdown === 0 && store?.website_url && !openedRef.current) {
      openedRef.current = true;
      window.open(store.website_url, "_blank", "noopener,noreferrer");
    }
  }, [countdown, store?.website_url]);

  const handleOpenNow = () => {
    if (!store?.website_url) return;
    openedRef.current = true;
    window.open(store.website_url, "_blank", "noopener,noreferrer");
    setCountdown(0);
  };

  if (!store) {
    return (
      <div className="container py-16 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
      </div>
    );
  }

  const steps = [
    "Registrando seu clique...",
    "Gerando link rastreado...",
    "Preparando redirecionamento...",
  ];

  return (
    <div className="container py-16 max-w-md text-center">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center text-4xl font-bold mx-auto mb-6">
          {store.name.charAt(0)}
        </div>
        <h1 className="text-xl font-black mb-2">{store.name}</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Cashback de {store.cashback_rate}% será doado para sua ONG
        </p>

        <div className="space-y-4 text-left">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-3">
              {step > i ? (
                <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
              ) : step === i ? (
                <Loader2 className="w-6 h-6 text-secondary animate-spin shrink-0" />
              ) : (
                <div className="w-6 h-6 rounded-full border-2 border-border shrink-0" />
              )}
              <span className={`text-sm font-semibold ${step >= i ? "text-foreground" : "text-muted-foreground"}`}>
                {s}
              </span>
            </div>
          ))}
        </div>

        {step >= 3 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 space-y-4">
            <div className="p-4 rounded-2xl bg-primary/10 border-2 border-primary/20">
              <p className="text-sm font-bold text-primary flex items-center gap-1.5"><CheckCircle className="w-4 h-4" /> Clique registrado com sucesso!</p>
              {countdown > 0 ? (
                <p className="text-xs text-muted-foreground mt-1">
                  Abrindo {store.name} em <span className="font-black text-foreground">{countdown}s</span>...
                </p>
              ) : (
                <p className="text-xs text-muted-foreground mt-1">
                  {store.name} foi aberto em uma nova aba
                </p>
              )}
            </div>

            <DuoButton className="w-full gap-2" onClick={handleOpenNow}>
              <ExternalLink className="w-4 h-4" />
              {countdown > 0 ? `Ir agora para ${store.name}` : `Abrir ${store.name} novamente`}
            </DuoButton>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
