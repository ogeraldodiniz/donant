import * as React from "react";
import { cn } from "@/lib/utils";

interface DuoButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
}

const DuoButton = React.forwardRef<HTMLButtonElement, DuoButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    const base = "inline-flex items-center justify-center font-bold rounded-2xl transition-all duration-100 active:translate-y-1 active:shadow-none select-none";
    const variants = {
      primary: "bg-primary text-primary-foreground duo-shadow hover:brightness-105",
      secondary: "bg-secondary text-secondary-foreground duo-shadow-blue hover:brightness-105",
      outline: "bg-card text-foreground border-2 border-border duo-shadow-sm hover:bg-muted",
      danger: "bg-destructive text-destructive-foreground shadow-[0_4px_0_0_hsl(0_80%_45%)] hover:brightness-105",
    };
    const sizes = {
      sm: "h-9 px-4 text-sm gap-1.5",
      md: "h-12 px-6 text-base gap-2",
      lg: "h-14 px-8 text-lg gap-2.5",
    };
    return (
      <button ref={ref} className={cn(base, variants[variant], sizes[size], className)} {...props}>
        {children}
      </button>
    );
  }
);
DuoButton.displayName = "DuoButton";

export { DuoButton };
