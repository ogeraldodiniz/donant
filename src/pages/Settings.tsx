import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Heart, LogOut, Trash2, Check, Sun, Moon, Monitor, Bell, Phone } from "lucide-react";
import { useTheme } from "next-themes";
import { LevelBadge } from "@/components/LevelBadge";
import { mockTransactions } from "@/lib/mock-data";
import { DuoButton } from "@/components/ui/duo-button";
import { DuoCard } from "@/components/ui/duo-card";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { InstallAppBanner } from "@/components/InstallAppBanner";
import { useNgos } from "@/hooks/useNgos";
import { useSelectNgo } from "@/hooks/useSelectNgo";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

export default function Settings() {
  const { user, logout, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [showDelete, setShowDelete] = useState(false);
  const { ngos, loading: ngosLoading } = useNgos();
  const { selectNgo, saving } = useSelectNgo();
  const { theme, setTheme } = useTheme();

  const [phone, setPhone] = useState("");
  const [notifyWeb, setNotifyWeb] = useState(true);
  const [notifyWhatsapp, setNotifyWhatsapp] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [savingPrefs, setSavingPrefs] = useState(false);

  useEffect(() => {
    if (user) {
      setPhone(user.phone ?? "");
      setNotifyWeb(user.notify_web);
      setNotifyWhatsapp(user.notify_whatsapp);
      setNotifyEmail(user.notify_email);
    }
  }, [user]);

  const savePrefs = async (updates: Record<string, unknown>) => {
    if (!user) return;
    setSavingPrefs(true);
    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id);
    setSavingPrefs(false);
    if (error) {
      toast.error("Erro ao salvar preferências");
    } else {
      toast.success("Preferências salvas");
      await refreshProfile();
    }
  };

  const handlePhoneBlur = () => {
    if (phone !== (user?.phone ?? "")) {
      savePrefs({ phone: phone || null });
    }
  };

  const toggleNotification = (key: "notify_web" | "notify_whatsapp" | "notify_email", value: boolean) => {
    if (key === "notify_web") setNotifyWeb(value);
    if (key === "notify_whatsapp") setNotifyWhatsapp(value);
    if (key === "notify_email") setNotifyEmail(value);
    savePrefs({ [key]: value });
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.info("Você saiu da sua conta");
      navigate("/");
    } catch (e) {
      navigate("/");
      window.location.reload();
    }
  };

  const handleDelete = async () => {
    await logout();
    toast.success("Conta excluída. Seus dados serão anonimizados conforme LGPD.");
    navigate("/");
  };

  return (
    <div className="container py-5 sm:py-6 max-w-5xl">
      <div className="mb-4 sm:mb-5">
        <h1 className="text-xl sm:text-2xl font-black">Meu Perfil</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">

      {/* Left column */}
      <div className="space-y-4 sm:space-y-5">
        {/* Profile */}
        <DuoCard className="p-3.5 sm:p-5">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-lg sm:text-xl font-bold">
              {user?.display_name?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm sm:text-base truncate">{user?.display_name}</p>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">{user?.email}</p>
              <LevelBadge totalDonated={mockTransactions.filter(tx => tx.status === 'donated').reduce((s, tx) => s + tx.amount, 0)} compact />
            </div>
          </div>
        </DuoCard>

        {/* Level */}
        <LevelBadge totalDonated={mockTransactions.filter(tx => tx.status === 'donated').reduce((s, tx) => s + tx.amount, 0)} />

        {/* Phone */}
        <DuoCard className="p-3.5 sm:p-5">
          <h3 className="font-bold text-sm sm:text-base mb-3 flex items-center gap-2"><Phone className="w-4 h-4 text-primary" /> Telefone</h3>
          <Input
            type="tel"
            placeholder="(11) 99999-9999"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onBlur={handlePhoneBlur}
            className="rounded-xl"
          />
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-1.5">Usado para notificações via WhatsApp</p>
        </DuoCard>

        {/* Notifications */}
        <DuoCard className="p-3.5 sm:p-5">
          <h3 className="font-bold text-sm sm:text-base mb-3 flex items-center gap-2"><Bell className="w-4 h-4 text-primary" /> Notificações</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-semibold">Push (navegador)</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Receba alertas no navegador</p>
              </div>
              <Switch checked={notifyWeb} onCheckedChange={(v) => toggleNotification("notify_web", v)} disabled={savingPrefs} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-semibold">WhatsApp</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Receba atualizações no WhatsApp</p>
              </div>
              <Switch checked={notifyWhatsapp} onCheckedChange={(v) => toggleNotification("notify_whatsapp", v)} disabled={savingPrefs || !phone} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-semibold">E-mail</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Receba novidades por e-mail</p>
              </div>
              <Switch checked={notifyEmail} onCheckedChange={(v) => toggleNotification("notify_email", v)} disabled={savingPrefs} />
            </div>
          </div>
        </DuoCard>
      </div>

      {/* Right column */}
      <div className="space-y-4 sm:space-y-5">
        {/* Selected NGO */}
        <DuoCard className="p-3.5 sm:p-5">
          <h3 className="font-bold text-sm sm:text-base mb-3 flex items-center gap-2"><Heart className="w-4 h-4 text-primary" /> Sua ONG</h3>
          {(() => {
            const selectedNgo = ngos.find(n => n.id === user?.selected_ngo_id);
            if (ngosLoading) return <p className="text-xs text-muted-foreground">Carregando...</p>;
            if (!selectedNgo) return (
              <div className="text-center py-2">
                <p className="text-xs sm:text-sm text-muted-foreground mb-2">Nenhuma ONG selecionada</p>
                <Link to="/ongs" className="text-xs sm:text-sm font-bold text-primary hover:underline inline-flex items-center gap-1">
                  Escolher ONG
                </Link>
              </div>
            );
            return (
              <div className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl bg-primary/10 border-2 border-primary ring-1 ring-primary/20">
                {selectedNgo.logo_url ? (
                  <img src={selectedNgo.logo_url} alt={selectedNgo.name} className="w-8 h-8 rounded-xl object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Heart className="w-4 h-4 text-primary" />
                  </div>
                )}
                <span className="font-semibold text-xs sm:text-sm flex-1 truncate">{selectedNgo.name}</span>
                <Check className="w-4 h-4 text-primary" />
              </div>
            );
          })()}
          <Link to="/ongs" className="mt-2 block text-center text-xs sm:text-sm font-bold text-primary hover:underline">
            Trocar ONG
          </Link>
        </DuoCard>

        {/* Theme */}
        <DuoCard className="p-3.5 sm:p-5">
          <h3 className="font-bold text-sm sm:text-base mb-3 flex items-center gap-2"><Sun className="w-4 h-4 text-primary" /> Aparência</h3>
          <div className="grid grid-cols-3 gap-2">
            {([
              { value: "light", label: "Claro", Icon: Sun },
              { value: "dark", label: "Escuro", Icon: Moon },
              { value: "system", label: "Auto", Icon: Monitor },
            ] as const).map(({ value, label, Icon }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  theme === value
                    ? 'bg-primary/10 border-2 border-primary text-primary'
                    : 'border-2 border-transparent hover:bg-muted text-muted-foreground'
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </button>
            ))}
          </div>
        </DuoCard>

        {/* Install App */}
        <InstallAppBanner forceShow />

        {/* Actions */}
        <DuoButton variant="outline" className="w-full" onClick={handleLogout}>
          <LogOut className="w-4 h-4" /> Sair da conta
        </DuoButton>

        {!showDelete ? (
          <button onClick={() => setShowDelete(true)} className="w-full text-center text-xs sm:text-sm text-destructive font-bold hover:underline">
            Excluir minha conta
          </button>
        ) : (
          <DuoCard className="border-destructive/30 bg-destructive/5 p-3.5 sm:p-5">
            <h3 className="font-bold text-destructive text-sm mb-2 flex items-center gap-2"><Trash2 className="w-4 h-4" /> Excluir conta</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
              Seus dados pessoais serão anonimizados conforme a LGPD. Registros de doações serão mantidos sem identificação pessoal. Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-2 sm:gap-3">
              <DuoButton variant="outline" size="sm" onClick={() => setShowDelete(false)} className="flex-1">Cancelar</DuoButton>
              <DuoButton variant="danger" size="sm" onClick={handleDelete} className="flex-1">Confirmar exclusão</DuoButton>
            </div>
          </DuoCard>
        )}
      </div>
      </div>

      <div className="flex gap-4 justify-center text-[10px] sm:text-xs text-muted-foreground mt-5">
        <Link to="/privacidade" className="hover:text-primary font-semibold">Privacidade</Link>
        <Link to="/termos" className="hover:text-primary font-semibold">Termos de Uso</Link>
      </div>
    </div>
  );
}
