import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User as AppUser } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";

interface AuthContextType {
  isLoggedIn: boolean;
  user: AppUser | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: Error | null }>;
  signup: (email: string, password: string, name: string) => Promise<{ error: Error | null }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (password: string) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  user: null,
  session: null,
  loading: true,
  login: async () => ({ error: null }),
  signup: async () => ({ error: null }),
  logout: async () => {},
  resetPassword: async () => ({ error: null }),
  updatePassword: async () => ({ error: null }),
  refreshProfile: async () => {},
});

function mapUser(supaUser: User, profile?: Partial<AppUser>): AppUser {
  return {
    id: supaUser.id,
    email: supaUser.email ?? "",
    display_name: profile?.display_name ?? supaUser.user_metadata?.full_name ?? supaUser.email ?? "",
    avatar_url: profile?.avatar_url ?? supaUser.user_metadata?.avatar_url,
    selected_ngo_id: profile?.selected_ngo_id,
    phone: profile?.phone,
    gender: profile?.gender,
    birth_date: profile?.birth_date,
    city: profile?.city,
    state: profile?.state,
    notify_web: profile?.notify_web ?? true,
    notify_whatsapp: profile?.notify_whatsapp ?? false,
    notify_email: profile?.notify_email ?? true,
    created_at: supaUser.created_at,
    updated_at: profile?.updated_at ?? supaUser.created_at,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (supaUser: User) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", supaUser.id)
        .single();

      if (error) {
        console.warn("Erro ao buscar perfil, usando dados básicos do usuário:", error.message);
      }

      setUser(mapUser(supaUser, data ?? undefined));
    } catch (error) {
      console.error("Falha ao buscar perfil, usando fallback:", error);
      setUser(mapUser(supaUser));
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession);
        setLoading(false);

        if (newSession?.user) {
          void fetchProfile(newSession.user);
          // Sync new users (e.g. Google OAuth) to Brevo on first sign-in
          if (event === "SIGNED_IN") {
            const u = newSession.user;
            void supabase.functions.invoke("brevo-sync", {
              body: {
                action: "create_or_update",
                email: u.email,
                attributes: { FIRSTNAME: u.user_metadata?.full_name || u.email },
              },
            });
          }
        } else {
          setUser(null);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setLoading(false);

      if (s?.user) {
        void fetchProfile(s.user);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const saveGeolocation = async (userId: string) => {
    try {
      // Only set geolocation if city/state are not already set
      const { data: existing } = await supabase
        .from("profiles")
        .select("city, state, locale")
        .eq("id", userId)
        .single();

      const res = await fetch("https://ip-api.com/json/?fields=city,regionName,countryCode");
      if (res.ok) {
        const geo = await res.json();
        const updates: Record<string, string | null> = {};
        // Only overwrite city/state if they're empty
        if (!existing?.city && !existing?.state) {
          if (geo.city || geo.regionName) {
            updates.city = geo.city || null;
            updates.state = geo.regionName || null;
          }
        }
        // Only set locale if not already set or still default
        const esCountries = ["ES", "MX", "AR", "CO", "CL", "PE", "VE", "EC", "GT", "CU", "BO", "DO", "HN", "PY", "SV", "NI", "CR", "PA", "UY"];
        if (geo.countryCode === "BR") {
          updates.locale = "pt";
        } else if (esCountries.includes(geo.countryCode)) {
          updates.locale = "es";
        }
        if (Object.keys(updates).length > 0) {
          await supabase.from("profiles").update(updates).eq("id", userId);
        }
      }
    } catch (e) {
      console.warn("Geolocalização não disponível:", e);
    }
  };

  const login = async (email: string, password: string) => {
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    if (!error && data.user) {
      void saveGeolocation(data.user.id);
    }
    return { error: error ? new Error(error.message) : null };
  };

  const signup = async (email: string, password: string, name: string) => {
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: window.location.origin,
      },
    });
    if (!error && data.user) {
      void saveGeolocation(data.user.id);
      // Sync contact to Brevo
      void supabase.functions.invoke("brevo-sync", {
        body: { action: "create_or_update", email, attributes: { FIRSTNAME: name } },
      });
      // Send welcome email via Brevo
      void supabase.functions.invoke("brevo-email", {
        body: { type: "welcome", to: { email, name }, data: { name } },
      });
    }
    return { error: error ? new Error(error.message) : null };
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error("signOut error:", e);
    }
    setUser(null);
    setSession(null);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });
    return { error: error ? new Error(error.message) : null };
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    return { error: error ? new Error(error.message) : null };
  };

  const refreshProfile = async () => {
    if (session?.user) {
      await fetchProfile(session.user);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: !!session,
        user,
        session,
        loading,
        login,
        signup,
        logout,
        resetPassword,
        updatePassword,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
