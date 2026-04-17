import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

export function Card({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("cr7-card p-5", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardRed({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("cr7-card-red p-5", className)} {...props}>
      {children}
    </div>
  );
}

export function CardGold({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("cr7-card-gold p-5", className)} {...props}>
      {children}
    </div>
  );
}
