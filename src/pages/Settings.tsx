import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Heart, LogOut, Trash2, Check, Sun, Moon, Monitor, Bell, Phone, Loader2, Save, Pencil, MapPin, X } from "lucide-react";
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
import { useSiteContent } from "@/hooks/useSiteContent";
import { CityPicker } from "@/components/CityPicker";

export default function Settings() {
  const { user, logout, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [showDelete, setShowDelete] = useState(false);
  const { ngos, loading: ngosLoading } = useNgos();
  const { theme, setTheme } = useTheme();
  
  const { t } = useSiteContent("settings");

  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [city, setCity] = useState("");
  const [userState, setUserState] = useState("");
  
  const [notifyWeb, setNotifyWeb] = useState(true);
  const [notifyWhatsapp, setNotifyWhatsapp] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.display_name ?? "");
      setPhone(user.phone ?? "");
      setGender((user as any).gender ?? "");
      setBirthDate((user as any).birth_date ?? "");
      setCity(user.city ?? "");
      setUserState(user.state ?? "");
      
      setNotifyWeb(user.notify_web);
      setNotifyWhatsapp(user.notify_whatsapp);
      setNotifyEmail(user.notify_email);
    }
  }, [user]);

  const hasProfileChanges = user && (
    displayName !== (user.display_name ?? "") ||
    phone !== (user.phone ?? "") ||
    gender !== ((user as any).gender ?? "") ||
    birthDate !== ((user as any).birth_date ?? "") ||
    city !== (user.city ?? "") ||
    userState !== (user.state ?? "")
  );

  const handleSaveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    const rawPhone = phone.replace(/\D/g, "");
    const { error } = await supabase
      .from("profiles")
      .update({ 
        display_name: displayName, 
        phone: rawPhone || null, 
        gender: gender || null,
        birth_date: birthDate || null,
        city: city || null, 
        state: userState || null 
      } as any)
      .eq("id", user.id);
    setSavingProfile(false);
    if (error) {
      toast.error(t("save_error", "Erro ao salvar perfil"));
    } else {
      toast.success(t("save_success", "Perfil salvo"));
      setEditing(false);
      await refreshProfile();
    }
  };

  const handleCancelEdit = () => {
    if (user) {
      setDisplayName(user.display_name ?? "");
      setPhone(user.phone ?? "");
      setGender((user as any).gender ?? "");
      setBirthDate((user as any).birth_date ?? "");
      setCity(user.city ?? "");
      setUserState(user.state ?? "");
    }
    setEditing(false);
  };


  const saveNotifPref = async (updates: Record<string, unknown>) => {
    if (!user) return;
    setSavingPrefs(true);
    const { error } = await supabase.from("profiles").update(updates).eq("id", user.id);
    setSavingPrefs(false);
    if (error) toast.error(t("pref_error", "Erro ao salvar preferências"));
    else await refreshProfile();
  };

  const toggleNotification = (key: "notify_web" | "notify_whatsapp" | "notify_email", value: boolean) => {
    if (key === "notify_web") setNotifyWeb(value);
    if (key === "notify_whatsapp") setNotifyWhatsapp(value);
    if (key === "notify_email") setNotifyEmail(value);
    saveNotifPref({ [key]: value });
  };

  const handleLogout = async () => {
    try { await logout(); toast.info(t("logout_msg", "Você saiu da sua conta")); navigate("/"); }
    catch { navigate("/"); window.location.reload(); }
  };

  const handleDelete = async () => {
    await logout();
    toast.success(t("delete_msg", "Conta excluída. Seus dados serão anonimizados conforme LGPD."));
    navigate("/");
  };

  return (
    <div className="container py-5 sm:py-6 max-w-5xl">
      <div className="mb-4 sm:mb-5">
        <h1 className="text-xl sm:text-2xl font-black">{t("title", "Meu Perfil")}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">

      {/* Left column */}
      <div className="space-y-4 sm:space-y-5">
        <DuoCard className="p-3.5 sm:p-5">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="min-w-0 flex-1 space-y-2">
              {editing ? (
                <>
                  <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder={t("name_placeholder", "Seu nome")} className="rounded-xl h-9 text-sm font-semibold" />
                  <p className="text-xs sm:text-sm text-muted-foreground truncate px-1">{user?.email}</p>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                    <Input
                      type="tel" placeholder="(11) 99999-9999" value={phone}
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
                  <CityPicker city={city} state={userState} onCityChange={setCity} onStateChange={setUserState} compact showDetect />
                </>
              ) : (
                <>
                  <p className="text-sm font-bold truncate">{displayName || t("name_placeholder", "Seu nome")}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">{user?.email}</p>
                  {phone && (
                    <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" /> {phone}
                    </p>
                  )}
                  {city && (
                    <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" /> {city}{userState ? ` — ${userState}` : ""}
                    </p>
                  )}
                </>
              )}
            </div>
            {!editing && (
              <button onClick={() => setEditing(true)} className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground shrink-0">
                <Pencil className="w-4 h-4" />
              </button>
            )}
          </div>
          {editing && (
            <div className="flex gap-2 mt-3">
              <DuoButton variant="outline" size="sm" className="flex-1" onClick={handleCancelEdit}>
                <X className="w-4 h-4" /> {t("cancel", "Cancelar")}
              </DuoButton>
              <DuoButton className="flex-1" size="sm" onClick={handleSaveProfile} disabled={savingProfile}>
                {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {t("save_btn", "Salvar")}
              </DuoButton>
            </div>
          )}
        </DuoCard>

        <DuoCard className="p-3.5 sm:p-5">
          <h3 className="font-bold text-sm sm:text-base mb-3 flex items-center gap-2"><Heart className="w-4 h-4 text-primary" /> {t("your_ngo", "Sua ONG")}</h3>
          {(() => {
            const selectedNgo = ngos.find(n => n.id === user?.selected_ngo_id);
            if (ngosLoading) return <p className="text-xs text-muted-foreground">{t("loading", "Carregando...")}</p>;
            if (!selectedNgo) return (
              <div className="text-center py-2">
                <p className="text-xs sm:text-sm text-muted-foreground mb-2">{t("no_ngo", "Nenhuma ONG selecionada")}</p>
                <Link to="/ongs" className="text-xs sm:text-sm font-bold text-primary hover:underline inline-flex items-center gap-1">{t("choose_ngo", "Escolher ONG")}</Link>
              </div>
            );
            return (
              <div className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl bg-primary/10 border-2 border-primary ring-1 ring-primary/20">
                {selectedNgo.logo_url ? (
                  <img src={selectedNgo.logo_url} alt={selectedNgo.name} className="w-8 h-8 rounded-xl object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center"><Heart className="w-4 h-4 text-primary" /></div>
                )}
                <span className="font-semibold text-xs sm:text-sm flex-1 truncate">{selectedNgo.name}</span>
                <Check className="w-4 h-4 text-primary" />
              </div>
            );
          })()}
          <Link to="/ongs" className="mt-2 block text-center text-xs sm:text-sm font-bold text-primary hover:underline">{t("change_ngo", "Trocar ONG")}</Link>
        </DuoCard>

        <DuoCard className="p-3.5 sm:p-5">
          <h3 className="font-bold text-sm sm:text-base mb-3 flex items-center gap-2"><Bell className="w-4 h-4 text-primary" /> {t("notifications_title", "Notificações")}</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-semibold">{t("push_label", "Push (navegador)")}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">{t("push_desc", "Receba alertas no navegador")}</p>
              </div>
              <Switch checked={notifyWeb} onCheckedChange={(v) => toggleNotification("notify_web", v)} disabled={savingPrefs} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-semibold">WhatsApp</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">{t("whatsapp_desc", "Receba atualizações no WhatsApp")}</p>
              </div>
              <Switch checked={notifyWhatsapp} onCheckedChange={(v) => toggleNotification("notify_whatsapp", v)} disabled={savingPrefs || !phone} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-semibold">E-mail</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">{t("email_desc", "Receba novidades por e-mail")}</p>
              </div>
              <Switch checked={notifyEmail} onCheckedChange={(v) => toggleNotification("notify_email", v)} disabled={savingPrefs} />
            </div>
          </div>
        </DuoCard>
      </div>

      {/* Right column */}
      <div className="space-y-4 sm:space-y-5">
        <LevelBadge totalDonated={mockTransactions.filter(tx => tx.status === 'donated').reduce((s, tx) => s + tx.amount, 0)} />

        <DuoCard className="p-3.5 sm:p-5">
          <h3 className="font-bold text-sm sm:text-base mb-3 flex items-center gap-2"><Sun className="w-4 h-4 text-primary" /> {t("appearance_title", "Aparência")}</h3>
          <div className="grid grid-cols-3 gap-2">
            {([
              { value: "light", label: t("theme_light", "Claro"), Icon: Sun },
              { value: "dark", label: t("theme_dark", "Escuro"), Icon: Moon },
              { value: "system", label: t("theme_auto", "Auto"), Icon: Monitor },
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

        <InstallAppBanner forceShow />

        <DuoButton variant="outline" className="w-full" onClick={handleLogout}>
          <LogOut className="w-4 h-4" /> {t("logout_btn", "Sair da conta")}
        </DuoButton>

        {!showDelete ? (
          <button onClick={() => setShowDelete(true)} className="w-full text-center text-xs sm:text-sm text-destructive font-bold hover:underline">
            {t("delete_account_link", "Excluir minha conta")}
          </button>
        ) : (
          <DuoCard className="border-destructive/30 bg-destructive/5 p-3.5 sm:p-5">
            <h3 className="font-bold text-destructive text-sm mb-2 flex items-center gap-2"><Trash2 className="w-4 h-4" /> {t("delete_title", "Excluir conta")}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
              {t("delete_warning", "Seus dados pessoais serão anonimizados conforme a LGPD. Registros de doações serão mantidos sem identificação pessoal. Esta ação não pode ser desfeita.")}
            </p>
            <div className="flex gap-2 sm:gap-3">
              <DuoButton variant="outline" size="sm" onClick={() => setShowDelete(false)} className="flex-1">{t("cancel", "Cancelar")}</DuoButton>
              <DuoButton variant="danger" size="sm" onClick={handleDelete} className="flex-1">{t("confirm_delete", "Confirmar exclusão")}</DuoButton>
            </div>
          </DuoCard>
        )}
      </div>
      </div>

      <div className="flex gap-4 justify-center text-[10px] sm:text-xs text-muted-foreground mt-5">
        <Link to="/privacidade" className="hover:text-primary font-semibold">{t("privacy_link", "Privacidade")}</Link>
        <Link to="/termos" className="hover:text-primary font-semibold">{t("terms_link", "Termos de Uso")}</Link>
      </div>
    </div>
  );
}
