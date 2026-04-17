"use client";
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "red" | "gold" | "outline" | "ghost" | "dark";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "red", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-bold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
          {
            "bg-gradient-to-br from-[#CC0000] to-[#990000] text-white hover:from-red-600 hover:to-red-800 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-900/50 bebas tracking-widest": variant === "red",
            "bg-gradient-to-br from-[#FFD700] to-[#FFA500] text-black hover:from-yellow-300 hover:to-yellow-500 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-yellow-700/30 bebas tracking-widest": variant === "gold",
            "border border-white/20 text-white hover:bg-white/10 hover:border-white/40": variant === "outline",
            "text-white/60 hover:text-white hover:bg-white/10": variant === "ghost",
            "bg-[#1a1a1a] border border-white/10 text-white hover:bg-[#222] hover:border-white/20": variant === "dark",
          },
          {
            "text-sm px-3 py-1.5 min-h-[36px]": size === "sm",
            "text-base px-5 py-2.5 min-h-[44px]": size === "md",
            "text-lg px-7 py-3.5 min-h-[52px]": size === "lg",
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
