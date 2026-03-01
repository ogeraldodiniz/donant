import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, CheckCircle2, ExternalLink } from "lucide-react";
import { mockStores } from "@/lib/mock-data";
import { motion } from "framer-motion";

export default function Redirect() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const store = mockStores.find(s => s.slug === slug);
  const [step, setStep] = useState(0);

  const steps = [
    "Registrando seu clique...",
    "Gerando link rastreado...",
    "Redirecionando para a loja...",
  ];

  useEffect(() => {
    if (!store) { navigate("/lojas"); return; }
    const timers = [
      setTimeout(() => setStep(1), 1000),
      setTimeout(() => setStep(2), 2000),
      setTimeout(() => {
        // In real app, would redirect to store URL
        // window.location.href = store.website_url;
        setStep(3);
      }, 3000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [store, navigate]);

  if (!store) return null;

  return (
    <div className="container py-16 max-w-md text-center">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center text-4xl font-bold mx-auto mb-6">
          {store.name.charAt(0)}
        </div>
        <h1 className="text-xl font-black mb-2">{store.name}</h1>
        <p className="text-sm text-muted-foreground mb-8">Cashback de {store.cashback_rate}% será doado para sua ONG</p>

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
              <span className={`text-sm font-semibold ${step >= i ? 'text-foreground' : 'text-muted-foreground'}`}>{s}</span>
            </div>
          ))}
        </div>

        {step >= 3 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
            <div className="p-4 rounded-2xl bg-primary/10 border-2 border-primary/20 mb-4">
              <p className="text-sm font-bold text-primary">✅ Clique registrado com sucesso!</p>
              <p className="text-xs text-muted-foreground mt-1">Em produção, você seria redirecionado para {store.name}</p>
            </div>
            <a href={store.website_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline">
              <ExternalLink className="w-4 h-4" /> Ir para {store.name}
            </a>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
