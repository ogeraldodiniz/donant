import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

/**
 * Checks if a logged-in user needs onboarding (missing phone or selected_ngo_id).
 * Redirects to /onboarding if needed. Runs once per session.
 */
export function OnboardingGuard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const checkedRef = useRef(false);

  useEffect(() => {
    if (loading || !user || checkedRef.current) return;

    // Don't redirect if already on onboarding, auth, or admin pages
    const skip = ["/onboarding", "/auth", "/admin", "/redefinir-senha", "/termos", "/privacidade"];
    if (skip.some((p) => location.pathname.startsWith(p))) return;

    checkedRef.current = true;

    const check = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("phone, selected_ngo_id")
        .eq("id", user.id)
        .single();

      if (data && (!data.phone || !data.selected_ngo_id)) {
        navigate("/onboarding", { replace: true });
      }
    };

    void check();
  }, [loading, user, location.pathname, navigate]);

  return null;
}
