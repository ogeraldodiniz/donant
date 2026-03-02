import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";
import { useAuth } from "@/hooks/useAuth";
import { OnboardingGuard } from "@/components/OnboardingGuard";

export function AppLayout() {
  const { isLoggedIn } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <OnboardingGuard />
      <main className="flex-1 pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0">
        <Outlet />
      </main>
      {isLoggedIn && <BottomNav />}
    </div>
  );
}
