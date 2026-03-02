import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Heart, LogOut, Trash2, Check, Sun, Moon, Monitor, Bell, Phone, Camera, Loader2, Save } from "lucide-react";
import { useTheme } from "next-themes";
import { LevelBadge } from "@/components/LevelBadge";
import { mockTransactions } from "@/lib/mock-data";
import { DuoButton } from "@/components/ui/duo-button";
import { DuoCard } from "@/components/ui/duo-card";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { InstallAppBanner } from "@/components/InstallAppBanner";
import { useNgos } from "@/hooks/useNgos";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

export default function Settings() {
  const { user, logout, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [showDelete, setShowDelete] = useState(false);
  const { ngos, loading: ngosLoading } = useNgos();
  const { theme, setTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>();
  const [notifyWeb, setNotifyWeb] = useState(true);
  const [notifyWhatsapp, setNotifyWhatsapp] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.display_name ?? "");
      setPhone(user.phone ?? "");
      setAvatarUrl(user.avatar_url);
      setNotifyWeb(user.notify_web);
      setNotifyWhatsapp(user.notify_whatsapp);
      setNotifyEmail(user.notify_email);
    }
  }, [user]);

  const hasProfileChanges = user && (
    displayName !== (user.display_name ?? "") ||
    phone !== (user.phone ?? "")
  );

  const handleSaveProfile = async () => {
    if (!user || !hasProfileChanges) return;
    setSavingProfile(true);
    const rawPhone = phone.replace(/\D/g, "");
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName, phone: rawPhone || null })
      .eq("id", user.id);
    setSavingProfile(false);
    if (error) {
      toast.error("Erro ao salvar perfil");
    } else {
      toast.success("Perfil salvo");
      await refreshProfile();
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Selecione uma imagem");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Imagem deve ter no máximo 2MB");
      return;
    }

    setUploadingAvatar(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      toast.error("Erro ao enviar foto");
      setUploadingAvatar(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
    const newUrl = `${urlData.publicUrl}?t=${Date.now()}`;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: newUrl })
      .eq("id", user.id);

    setUploadingAvatar(false);
    if (updateError) {
      toast.error("Erro ao atualizar foto");
    } else {
      setAvatarUrl(newUrl);
      toast.success("Foto atualizada");
      await refreshProfile();
    }
  };

  const saveNotifPref = async (updates: Record<string, unknown>) => {
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
      await refreshProfile();
    }
  };

  const toggleNotification = (key: "notify_web" | "notify_whatsapp" | "notify_email", value: boolean) => {
    if (key === "notify_web") setNotifyWeb(value);
    if (key === "notify_whatsapp") setNotifyWhatsapp(value);
    if (key === "notify_email") setNotifyEmail(value);
    saveNotifPref({ [key]: value });
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
          <div className="flex items-start gap-3 sm:gap-4">
            {/* Avatar */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full shrink-0 group"
              disabled={uploadingAvatar}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
              ) : (
                <div className="w-full h-full rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xl font-bold">
                  {displayName?.charAt(0) || 'U'}
                </div>
              )}
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {uploadingAvatar ? (
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                ) : (
                  <Camera className="w-5 h-5 text-white" />
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </button>

            <div className="min-w-0 flex-1 space-y-2">
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Seu nome"
                className="rounded-xl h-9 text-sm font-semibold"
              />
              <p className="text-xs sm:text-sm text-muted-foreground truncate px-1">{user?.email}</p>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                <Input
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={phone}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "").slice(0, 11);
                    let formatted = digits;
                    if (digits.length > 2) formatted = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
                    else if (digits.length > 0) formatted = `(${digits}`;
                    if (digits.length > 7) formatted = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
                    setPhone(formatted);
                  }}
                  className="rounded-xl h-9 text-xs sm:text-sm"
                />
              </div>
            </div>
          </div>

          {hasProfileChanges && (
            <DuoButton
              className="w-full mt-3"
              size="sm"
              onClick={handleSaveProfile}
              disabled={savingProfile}
            >
              {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Salvar
            </DuoButton>
          )}
        </DuoCard>

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
        {/* Level */}
        <LevelBadge totalDonated={mockTransactions.filter(tx => tx.status === 'donated').reduce((s, tx) => s + tx.amount, 0)} />

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
