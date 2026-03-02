import { useState } from "react";
import { Bell, Send, Loader2 } from "lucide-react";
import { DuoCard } from "@/components/ui/duo-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function AdminPush() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("/notificacoes");
  const [sending, setSending] = useState(false);
  const [lastResult, setLastResult] = useState<{ sent: number; failed: number; total: number } | null>(null);

  const handleSend = async () => {
    if (!title.trim()) {
      toast.error("Preencha o título da notificação");
      return;
    }
    setSending(true);
    setLastResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("send-push", {
        body: { title: title.trim(), body: body.trim(), url: url.trim() || "/notificacoes" },
      });
      if (error) throw error;
      setLastResult(data);
      toast.success(`Push enviado! ${data.sent} entregues de ${data.total}`);
      setTitle("");
      setBody("");
    } catch (err: any) {
      toast.error(err.message || "Erro ao enviar push");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="text-2xl font-black">Push Notifications</h1>

      <DuoCard className="space-y-4 p-5">
        <div className="flex items-center gap-2 mb-2">
          <Bell className="w-5 h-5 text-primary" />
          <p className="font-bold">Enviar notificação para todos</p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="push-title">Título *</Label>
          <Input
            id="push-title"
            placeholder="Ex: Nova loja parceira!"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="push-body">Mensagem</Label>
          <Textarea
            id="push-body"
            placeholder="Detalhes da notificação..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={300}
            rows={3}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="push-url">URL ao clicar</Label>
          <Input
            id="push-url"
            placeholder="/notificacoes"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>

        <Button onClick={handleSend} disabled={sending || !title.trim()} className="w-full gap-2">
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {sending ? "Enviando..." : "Enviar Push"}
        </Button>
      </DuoCard>

      {lastResult && (
        <DuoCard className="p-4 text-sm space-y-1">
          <p className="font-bold">Resultado do envio</p>
          <p>✅ Entregues: {lastResult.sent}</p>
          <p>❌ Falhas: {lastResult.failed}</p>
          <p>📊 Total de inscritos: {lastResult.total}</p>
        </DuoCard>
      )}
    </div>
  );
}
