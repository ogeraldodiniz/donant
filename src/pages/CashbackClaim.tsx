import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DuoCard } from "@/components/ui/duo-card";
import { DuoButton } from "@/components/ui/duo-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Send, Loader2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useStores } from "@/hooks/useStores";
import { useNgos } from "@/hooks/useNgos";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useLocale } from "@/hooks/useLocale";
import { toast } from "sonner";

export default function CashbackClaim() {
  const { user } = useAuth();
  const { stores } = useStores();
  const { ngos } = useNgos();
  const { t } = useSiteContent("claim");
  const { locale } = useLocale();
  const navigate = useNavigate();

  const [storeId, setStoreId] = useState("");
  const [ngoId, setNgoId] = useState(user?.selected_ngo_id ?? "");
  const [purchaseDate, setPurchaseDate] = useState<Date>();
  const [orderNumber, setOrderNumber] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = storeId && ngoId && purchaseDate && orderNumber.trim();

  const handleSubmit = async () => {
    if (!canSubmit || !user) return;
    setSubmitting(true);

    const { error } = await supabase.from("cashback_claims" as any).insert({
      user_id: user.id,
      store_id: storeId,
      ngo_id: ngoId,
      purchase_date: format(purchaseDate!, "yyyy-MM-dd"),
      order_number: orderNumber.trim(),
      details: details.trim() || null,
    } as any);

    setSubmitting(false);
    if (error) {
      toast.error(t("claim_error", locale === "es" ? "Error al enviar reclamación" : "Erro ao enviar reclamação"));
    } else {
      toast.success(t("claim_success", locale === "es" ? "¡Reclamación enviada con éxito!" : "Reclamação enviada com sucesso!"));
      navigate("/");
    }
  };

  return (
    <div className="container py-5 sm:py-6 max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-black flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-destructive" />
          {t("claim_title", locale === "es" ? "Reclamar Cashback" : "Reclamar Cashback")}
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm">
          {t("claim_subtitle", locale === "es" ? "¿Realizaste una compra que no aparece? Cuéntanos." : "Fez uma compra que não apareceu? Nos conte.")}
        </p>
      </div>

      <DuoCard className="p-4 sm:p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Store */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">
              {t("claim_store", locale === "es" ? "Tienda" : "Loja")} *
            </label>
            <Select value={storeId} onValueChange={setStoreId}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder={t("claim_store_placeholder", locale === "es" ? "Selecciona la tienda" : "Selecione a loja")} />
              </SelectTrigger>
              <SelectContent>
                {stores.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* NGO */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">
              {t("claim_ngo", locale === "es" ? "ONG para donar" : "ONG para doar")} *
            </label>
            <Select value={ngoId} onValueChange={setNgoId}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder={t("claim_ngo_placeholder", locale === "es" ? "Selecciona la ONG" : "Selecione a ONG")} />
              </SelectTrigger>
              <SelectContent>
                {ngos.map(n => (
                  <SelectItem key={n.id} value={n.id}>{n.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">
              {t("claim_date", locale === "es" ? "Fecha de compra" : "Data da compra")} *
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal rounded-xl", !purchaseDate && "text-muted-foreground")}
                >
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {purchaseDate ? format(purchaseDate, "PPP", { locale: ptBR }) : (locale === "es" ? "Selecciona una fecha" : "Selecione uma data")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={purchaseDate}
                  onSelect={setPurchaseDate}
                  disabled={(date) => date > new Date()}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Order number */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">
              {t("claim_order", locale === "es" ? "Número del pedido" : "Número do pedido")} *
            </label>
            <Input
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder={t("claim_order_placeholder", locale === "es" ? "Ej: #123456" : "Ex: #123456")}
              className="rounded-xl"
              maxLength={100}
            />
          </div>
        </div>

        {/* Details - full width */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1 block">
            {t("claim_details", locale === "es" ? "Detalles (opcional)" : "Detalhes (opcional)")}
          </label>
          <Textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder={t("claim_details_placeholder", locale === "es" ? "Describe tu compra..." : "Descreva sua compra...")}
            className="rounded-xl min-h-[100px]"
            maxLength={1000}
          />
        </div>

        <DuoButton
          className="w-full"
          onClick={handleSubmit}
          disabled={!canSubmit || submitting}
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {t("claim_submit", locale === "es" ? "Enviar reclamación" : "Enviar reclamação")}
        </DuoButton>
      </DuoCard>
    </div>
  );
}
