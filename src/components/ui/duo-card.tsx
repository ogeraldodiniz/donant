import * as React from "react";
import { cn } from "@/lib/utils";

interface DuoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

const DuoCard = React.forwardRef<HTMLDivElement, DuoCardProps>(
  ({ className, hover = false, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl border-2 border-border bg-card p-3.5 sm:p-5 transition-all duration-200",
        hover && "hover:border-primary hover:shadow-lg cursor-pointer hover:-translate-y-1",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
DuoCard.displayName = "DuoCard";

export { DuoCard };
