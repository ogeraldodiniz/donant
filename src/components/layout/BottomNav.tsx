import { Link, useLocation } from "react-router-dom";
import { Home, Store, Heart, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/lojas", icon: Store, label: "Lojas" },
  { to: "/ongs", icon: Heart, label: "ONGs" },
  { to: "/impacto", icon: BarChart3, label: "Impacto" },
  { to: "/configuracoes", icon: Settings, label: "Menu" },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t-2 border-border safe-area-pb">
      <div className="flex items-center justify-around h-16">
        {items.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to || (to !== "/" && location.pathname.startsWith(to));
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors min-w-[56px]",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className={cn("w-5 h-5", active && "stroke-[2.5]")} />
              <span className="text-[10px] font-bold">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
