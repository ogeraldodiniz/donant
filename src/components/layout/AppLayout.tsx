import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";
import { useAuth } from "@/hooks/useAuth";

export function AppLayout() {
  const { isLoggedIn } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 pb-20 md:pb-0">
        <Outlet />
      </main>
      {isLoggedIn && <BottomNav />}
    </div>
  );
}
