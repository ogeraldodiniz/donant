import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, User, Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DuoButton } from "@/components/ui/duo-button";
import { DuoCard } from "@/components/ui/duo-card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSiteContent } from "@/hooks/useSiteContent";

type AuthView = "login" | "signup" | "forgot";

export default function Auth() {
  const [view, setView] = useState<AuthView>("login");
  const [showPw, setShowPw] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { login, signup, resetPassword } = useAuth();
  const navigate = useNavigate();
  const { t } = useSiteContent("auth");

  const checkOnboardingNeeded = async (userId: string): Promise<boolean> => {
    const { data } = await supabase.from("profiles").select("phone, selected_ngo_id").eq("id", userId).single();
    return !data?.phone || !data?.selected_ngo_id;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await login(email, password);
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t("login_success", "Bem-vindo de volta!"));
      const { data: { session: s } } = await supabase.auth.getSession();
      if (s?.user) {
        const needsOnboarding = await checkOnboardingNeeded(s.user.id);
        navigate(needsOnboarding ? "/onboarding" : "/");
      } else {
        navigate("/");
      }
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) { toast.error(t("agree_error", "Aceite os termos para continuar")); return; }
    setSubmitting(true);
    const { error } = await signup(email, password, name);
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t("signup_success", "Conta criada! Verifique seu email para confirmar o cadastro."));
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await resetPassword(email);
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t("forgot_success", "Email de redefinição enviado! Verifique sua caixa de entrada."));
    }
  };

  const handleGoogle = async () => {
    const hostname = window.location.hostname;
    const isCustomDomain =
      !hostname.includes("lovable.app") &&
      !hostname.includes("lovableproject.com") &&
      !hostname.includes("localhost");

    if (isCustomDomain) {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
          skipBrowserRedirect: true,
        },
      });

      if (error) {
        toast.error(t("google_error", "Erro ao entrar com Google"));
        return;
      }

      try {
        if (!data?.url) throw new Error("OAuth URL ausente");

        const oauthUrl = new URL(data.url);
        const backendHost = new URL(import.meta.env.VITE_SUPABASE_URL).hostname;
        const allowedHosts = ["accounts.google.com", backendHost];

        if (!allowedHosts.some((host) => oauthUrl.hostname.includes(host))) {
          throw new Error("Invalid OAuth redirect URL");
        }

        window.location.href = data.url;
        return;
      } catch {
        toast.error(t("google_error", "Erro ao entrar com Google"));
        return;
      }
    }

    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });

    if (error) {
      toast.error(t("google_error", "Erro ao entrar com Google"));
    }
  };

  return (
    <div className="container py-12 max-w-md">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl text-primary-foreground font-black">D</span>
        </div>
        <h1 className="text-2xl font-black">
          {view === "login" ? t("login_title", "Bem-vindo de volta!") : view === "signup" ? t("signup_title", "Crie sua conta") : t("forgot_title", "Esqueceu a senha?")}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {view === "login" ? t("login_subtitle", "Entre para continuar doando") : view === "signup" ? t("signup_subtitle", "Comece a fazer a diferença hoje") : t("forgot_subtitle", "Enviaremos um link para redefinir")}
        </p>
      </div>

      <DuoCard>
        {view === "forgot" ? (
          <>
            <button
              onClick={() => setView("login")}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="w-4 h-4" /> {t("back_to_login", "Voltar ao login")}
            </button>
            <form onSubmit={handleForgot} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 h-12 rounded-2xl border-2" required />
              </div>
              <DuoButton type="submit" size="lg" className="w-full" disabled={submitting}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : t("forgot_btn", "Enviar link")}
              </DuoButton>
            </form>
          </>
        ) : (
          <>
            <DuoButton variant="outline" className="w-full mb-4" onClick={handleGoogle}>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              {t("google_btn", "Continuar com Google")}
            </DuoButton>

            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs font-bold text-muted-foreground">{t("or", "ou")}</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <form onSubmit={view === "login" ? handleLogin : handleSignup} className="space-y-4">
              {view === "signup" && (
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder={t("name_placeholder", "Seu nome")} value={name} onChange={(e) => setName(e.target.value)} className="pl-10 h-12 rounded-2xl border-2" required />
                </div>
              )}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 h-12 rounded-2xl border-2" required />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type={showPw ? "text" : "password"} placeholder={t("password_placeholder", "Senha")} value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10 h-12 rounded-2xl border-2" required minLength={6} />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {view === "login" && (
                <button type="button" onClick={() => setView("forgot")} className="text-sm text-primary font-bold hover:underline">
                  {t("forgot_link", "Esqueceu a senha?")}
                </button>
              )}

              {view === "signup" && (
                <label className="flex items-start gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1 accent-[hsl(var(--primary))]" />
                  <span className="text-muted-foreground">
                    {t("agree_prefix", "Concordo com os")}{" "}
                    <Link to="/termos" className="text-primary font-bold hover:underline">{t("terms_link", "Termos de Uso")}</Link>{" "}
                    {t("agree_and", "e a")}{" "}
                    <Link to="/privacidade" className="text-primary font-bold hover:underline">{t("privacy_link", "Política de Privacidade")}</Link>
                  </span>
                </label>
              )}

              <DuoButton type="submit" size="lg" className="w-full" disabled={submitting}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : view === "login" ? t("login_btn", "Entrar") : t("signup_btn", "Criar conta")}
              </DuoButton>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-4">
              {view === "login" ? t("no_account", "Não tem conta? ") : t("has_account", "Já tem conta? ")}
              <button onClick={() => setView(view === "login" ? "signup" : "login")} className="text-primary font-bold hover:underline">
                {view === "login" ? t("signup_link", "Cadastre-se") : t("login_link", "Entrar")}
              </button>
            </p>
          </>
        )}
      </DuoCard>
    </div>
  );
}
