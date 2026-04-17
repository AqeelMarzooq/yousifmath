import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number;
  max?: number;
  color?: "red" | "gold" | "green";
  className?: string;
  showLabel?: boolean;
}

export function Progress({ value, max = 100, color = "red", className, showLabel }: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={cn("relative h-3 w-full rounded-full bg-white/10 overflow-hidden", className)}>
      <div
        className={cn("h-full rounded-full transition-all duration-700", {
          "bg-gradient-to-r from-[#CC0000] to-[#ff4444]": color === "red",
          "bg-gradient-to-r from-[#FFD700] to-[#FFA500]": color === "gold",
          "bg-gradient-to-r from-green-600 to-green-400": color === "green",
        })}
        style={{ width: `${pct}%` }}
      />
      {showLabel && (
        <span className="absolute right-0 top-1/2 -translate-y-1/2 text-xs text-white/70 pr-1">
          {Math.round(pct)}%
        </span>
      )}
    </div>
  );
}
