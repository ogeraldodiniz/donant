import { useState, useEffect, useMemo } from "react";
import { Bell, Send, Loader2, MapPin, Globe, MessageSquare, Mail, CheckCircle, XCircle, BarChart3, Users, X } from "lucide-react";
import { DuoCard } from "@/components/ui/duo-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { toast } from "sonner";

type Channel = "web_push" | "whatsapp" | "email";
type NotifCategory = "warning" | "promotion";

export default function AdminPush() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("/notificacoes");
  const [category, setCategory] = useState<NotifCategory>("warning");
  const [targetLocale, setTargetLocale] = useState<"all" | "pt" | "es">("all");
  const [selectedState, setSelectedState] = useState<string>("all");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [channels, setChannels] = useState<Channel[]>(["web_push"]);
  const [sending, setSending] = useState(false);
  const [lastResult, setLastResult] = useState<{ sent: number; failed: number; total: number } | null>(null);
  const { permission, subscribing, subscribe, isSupported } = usePushNotifications();

  // User selection for targeted sends
  const [allUsers, setAllUsers] = useState<{ id: string; email: string | null; display_name: string | null }[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [userSearch, setUserSearch] = useState("");

  // Fetch distinct states and cities for segmentation
  const [locations, setLocations] = useState<{ city: string | null; state: string | null }[]>([]);
  useEffect(() => {
    supabase
      .from("profiles")
      .select("city, state")
      .not("city", "is", null)
      .then(({ data }) => {
        if (data) setLocations(data);
      });

    // Fetch all users for the selector
    supabase
      .from("profiles")
      .select("id, email, display_name")
      .is("deleted_at", null)
      .order("display_name")
      .then(({ data }) => {
        if (data) setAllUsers(data);
      });
  }, []);

  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return allUsers;
    const q = userSearch.toLowerCase();
    return allUsers.filter(
      (u) =>
        (u.display_name || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q)
    );
  }, [allUsers, userSearch]);

  const toggleUser = (id: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  const states = useMemo(() => {
    const unique = [...new Set(locations.map((l) => l.state).filter(Boolean))] as string[];
    return unique.sort();
  }, [locations]);

  const cities = useMemo(() => {
    const filtered = selectedState === "all" ? locations : locations.filter((l) => l.state === selectedState);
    const unique = [...new Set(filtered.map((l) => l.city).filter(Boolean))] as string[];
    return unique.sort();
  }, [locations, selectedState]);

  const toggleChannel = (ch: Channel) => {
    setChannels((prev) =>
      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]
    );
  };

  const handleSubscribeThisBrowser = async () => {
    const ok = await subscribe();
    if (ok) {
      toast.success("Navegador inscrito com sucesso para receber push");
      return;
    }
    if (Notification?.permission === "denied") {
      toast.error("Permissão negada. Libere notificações nas configurações do navegador.");
      return;
    }
    toast.error("Não foi possível inscrever este navegador em push.");
  };

  const handleSend = async () => {
    if (!title.trim()) {
      toast.error("Preencha o título da notificação");
      return;
    }
    if (channels.length === 0) {
      toast.error("Selecione pelo menos um canal");
      return;
    }
    setSending(true);
    setLastResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("send-push", {
        body: {
          title: title.trim(),
          body: body.trim(),
          url: url.trim() || "/notificacoes",
          category,
          targetLocale: targetLocale === "all" ? undefined : targetLocale,
          targetState: selectedState === "all" ? undefined : selectedState,
          targetCity: selectedCity === "all" ? undefined : selectedCity,
          targetUserIds: selectedUserIds.length > 0 ? selectedUserIds : undefined,
          channels,
        },
      });
      if (error) throw error;
      setLastResult(data);
      toast.success(`Enviado! ${data.sent} entregues de ${data.total}`);
      setTitle("");
      setBody("");
    } catch (err: any) {
      toast.error(err.message || "Erro ao enviar");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black">Push Notifications</h1>

      {/* Subscribe this browser */}
      <DuoCard className="space-y-4 p-5">
        <div className="flex items-center gap-2 mb-1">
          <Bell className="w-5 h-5 text-primary" />
          <p className="font-bold">Inscrever este navegador</p>
        </div>
        <p className="text-sm text-muted-foreground">
          Status atual: {isSupported ? permission : "unsupported"}
        </p>
        <Button
          onClick={handleSubscribeThisBrowser}
          disabled={!isSupported || subscribing}
          className="w-full gap-2"
        >
          {subscribing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
          {permission === "granted" ? "Sincronizar inscrição deste navegador" : "Inscrever este navegador"}
        </Button>
      </DuoCard>

      {/* Send notification */}
      <DuoCard className="space-y-4 p-5">
        <div className="flex items-center gap-2 mb-2">
          <Send className="w-5 h-5 text-primary" />
          <p className="font-bold">Enviar notificação</p>
        </div>

        {/* Title & Body */}
        <div className="space-y-1.5">
          <Label htmlFor="push-title">Título *</Label>
          <Input id="push-title" placeholder="Ex: Nova loja parceira!" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="push-body">Mensagem</Label>
          <Textarea id="push-body" placeholder="Detalhes da notificação..." value={body} onChange={(e) => setBody(e.target.value)} maxLength={300} rows={3} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="push-url">URL ao clicar</Label>
          <Input id="push-url" placeholder="/notificacoes" value={url} onChange={(e) => setUrl(e.target.value)} />
        </div>

        {/* Categoria */}
        <div className="space-y-2">
          <Label>Categoria da notificação</Label>
          <div className="flex gap-2">
            {([
              { key: "warning" as NotifCategory, label: "Aviso" },
              { key: "promotion" as NotifCategory, label: "Promoção" },
            ]).map(c => (
              <button
                key={c.key}
                type="button"
                onClick={() => setCategory(c.key)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold border-2 transition-colors ${category === c.key ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/30"}`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Channels */}
        <div className="space-y-2">
          <Label>Canais de envio</Label>
          <div className="flex flex-wrap gap-4">
            {([
              { id: "web_push" as Channel, label: "Web Push", Icon: Bell },
              { id: "whatsapp" as Channel, label: "WhatsApp", Icon: MessageSquare },
              { id: "email" as Channel, label: "E-mail", Icon: Mail },
            ]).map((ch) => (
              <label key={ch.id} className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={channels.includes(ch.id)}
                  onCheckedChange={() => toggleChannel(ch.id)}
                />
                <span className="text-sm font-medium flex items-center gap-1.5"><ch.Icon className="w-3.5 h-3.5" /> {ch.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Locale */}
        <div className="space-y-1.5">
          <Label>Idioma dos destinatários</Label>
          <div className="flex gap-2">
            {(["all", "pt", "es"] as const).map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => setTargetLocale(loc)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold border-2 transition-colors ${targetLocale === loc ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/30"}`}
              >
                <span className="flex items-center gap-1.5">{loc === "all" && <Globe className="w-3.5 h-3.5" />}{loc === "all" ? "Todos" : loc === "pt" ? "PT" : "ES"}</span>
              </button>
            ))}
          </div>
        </div>

        {/* City / State segmentation */}
        <div className="space-y-2">
          <Label className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4" /> Segmentar por localização
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <Select value={selectedState} onValueChange={(v) => { setSelectedState(v); setSelectedCity("all"); }}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os estados</SelectItem>
                {states.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger>
                <SelectValue placeholder="Cidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as cidades</SelectItem>
                {cities.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={handleSend} disabled={sending || !title.trim() || channels.length === 0} className="w-full gap-2">
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {sending ? "Enviando..." : "Enviar"}
        </Button>
      </DuoCard>

      {lastResult && (
        <DuoCard className="p-4 text-sm space-y-1">
          <p className="font-bold">Resultado do envio</p>
          <p className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-primary" /> Entregues: {lastResult.sent}</p>
          <p className="flex items-center gap-1.5"><XCircle className="w-4 h-4 text-destructive" /> Falhas: {lastResult.failed}</p>
          <p className="flex items-center gap-1.5"><BarChart3 className="w-4 h-4 text-muted-foreground" /> Total de destinatários: {lastResult.total}</p>
        </DuoCard>
      )}
    </div>
  );
}
