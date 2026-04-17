"use client";
import { useState, useEffect } from "react";
import { X, ChevronRight, ChevronLeft } from "lucide-react";
import type { LessonContent, LessonVisual } from "@/lib/lessonContent";

interface Props {
  content: LessonContent;
  onReady: () => void;
  onClose: () => void;
  /** Override the final-step button label. Defaults to student retry label. */
  readyLabel?: string;
}

export default function LessonOverlay({ content, onReady, onClose, readyLabel }: Props) {
  const [stepIdx, setStepIdx] = useState(0);
  const [animating, setAnimating] = useState(false);

  const step = content.steps[stepIdx];
  const isLast = stepIdx === content.steps.length - 1;

  const go = (dir: 1 | -1) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setStepIdx((i) => i + dir);
      setAnimating(false);
    }, 150);
  };

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" && !isLast) go(1);
      if (e.key === "ArrowLeft" && stepIdx > 0) go(-1);
      if (e.key === "Enter" && isLast) onReady();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs text-white/40 uppercase tracking-widest mb-0.5">📚 Learn It</div>
            <h2 className="bebas text-2xl tracking-wider text-[#FFD700]">{content.heading}</h2>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors p-1 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step dots */}
        <div className="flex gap-1.5 mb-4">
          {content.steps.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                i <= stepIdx ? "bg-[#FFD700]" : "bg-white/10"
              }`}
            />
          ))}
        </div>

        {/* Step card */}
        <div
          className={`cr7-card rounded-2xl p-6 border border-white/10 space-y-4 transition-opacity duration-150 ${
            animating ? "opacity-0" : "opacity-100"
          }`}
        >
          <div>
            <h3 className="font-bold text-lg text-white mb-2">{step.title}</h3>
            <p className="text-white/70 leading-relaxed">{step.body}</p>
          </div>

          {/* Visual */}
          {step.visual && <VisualRenderer visual={step.visual} />}

          {/* Highlight */}
          {step.highlight && (
            <div className="bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-xl px-4 py-2.5 text-center">
              <span className="text-[#FFD700] font-bold text-sm">{step.highlight}</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-3 mt-4">
          {stepIdx > 0 && (
            <button
              onClick={() => go(-1)}
              className="flex items-center gap-1.5 px-4 py-3 border border-white/20 rounded-xl text-white/60 hover:text-white hover:border-white/40 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          )}
          <div className="flex-1" />
          {!isLast ? (
            <button
              onClick={() => go(1)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#CC0000] to-[#990000] rounded-xl bebas tracking-wider hover:from-red-600 hover:to-red-800 transition-all cursor-pointer"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onReady}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FFD700] to-[#cc9900] rounded-xl bebas tracking-wider text-black hover:brightness-110 transition-all cursor-pointer animate-pulse"
            >
              {readyLabel ?? "I'm ready to try again! ⚽"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function VisualRenderer({ visual }: { visual: LessonVisual }) {
  switch (visual.type) {
    case "fraction_bar":
      return <FractionBar numerator={visual.numerator} denominator={visual.denominator} label={visual.label} />;
    case "number_line":
      return <NumberLine value={visual.value} label={visual.label} />;
    case "hundred_square":
      return <HundredSquare shaded={visual.shaded} label={visual.label} />;
    case "place_value":
      return <PlaceValueChart digits={visual.digits} highlight={visual.highlight} />;
    case "equation_chain":
      return <EquationChain steps={visual.steps} />;
    case "comparison":
      return <Comparison left={visual.left} right={visual.right} operator={visual.operator} explanation={visual.explanation} />;
    default:
      return null;
  }
}

function FractionBar({ numerator, denominator, label }: { numerator: number; denominator: number; label?: string }) {
  return (
    <div className="space-y-2">
      <div className="flex rounded-lg overflow-hidden h-10 border border-white/20">
        {Array.from({ length: denominator }, (_, i) => (
          <div
            key={i}
            className={`flex-1 border-r border-white/10 last:border-r-0 transition-colors ${
              i < numerator ? "bg-[#CC0000]/70" : "bg-white/5"
            }`}
          />
        ))}
      </div>
      <div className="flex justify-between text-xs text-white/40">
        <span>0</span>
        {label && <span className="text-[#FFD700] font-bold">{label}</span>}
        <span>1 whole</span>
      </div>
    </div>
  );
}

function NumberLine({ value, label }: { value: number; label?: string }) {
  const pct = Math.min(Math.max(value, 0), 1) * 100;
  return (
    <div className="space-y-2 py-2">
      <div className="relative">
        {/* Track */}
        <div className="h-2 bg-white/10 rounded-full" />
        {/* Fill */}
        <div
          className="absolute top-0 left-0 h-2 bg-gradient-to-r from-[#CC0000] to-[#FFD700] rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
        {/* Marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-[#FFD700] rounded-full border-2 border-black shadow-lg transition-all"
          style={{ left: `calc(${pct}% - 8px)` }}
        />
      </div>
      <div className="flex justify-between text-xs text-white/40">
        <span>0</span>
        {label && (
          <span
            className="text-[#FFD700] font-bold absolute"
            style={{ left: `calc(${pct}% )`, transform: "translateX(-50%)" }}
          >
            {label}
          </span>
        )}
        <span>1</span>
      </div>
    </div>
  );
}

function HundredSquare({ shaded, label }: { shaded: number; label?: string }) {
  const cells = Array.from({ length: 100 }, (_, i) => i < shaded);
  return (
    <div className="space-y-2">
      <div className="grid gap-px" style={{ gridTemplateColumns: "repeat(10, 1fr)" }}>
        {cells.map((filled, i) => (
          <div
            key={i}
            className={`aspect-square rounded-sm transition-colors ${filled ? "bg-[#CC0000]/80" : "bg-white/8"}`}
          />
        ))}
      </div>
      {label && (
        <div className="text-center text-xs text-[#FFD700] font-bold">{label}</div>
      )}
    </div>
  );
}

const PLACE_VALUE_COLS = [
  { key: "ones", label: "Ones", color: "text-white" },
  { key: "tenths", label: "Tenths", color: "text-green-400" },
  { key: "hundredths", label: "Hundredths", color: "text-blue-400" },
  { key: "thousandths", label: "Thousandths", color: "text-purple-400" },
] as const;

function PlaceValueChart({
  digits,
  highlight,
}: {
  digits: { ones?: string; tenths?: string; hundredths?: string; thousandths?: string };
  highlight?: string;
}) {
  const cols = PLACE_VALUE_COLS.filter((c) => digits[c.key] !== undefined);
  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1 min-w-0">
        {/* Decimal dot marker */}
        {cols.some((c) => c.key === "ones") && cols.some((c) => c.key !== "ones") && (
          <div className="flex flex-col items-center justify-end pb-2 w-3">
            <span className="text-white/60 font-black text-xl">.</span>
          </div>
        )}
        {cols.map((col) => {
          const isHighlighted = highlight === col.key;
          return (
            <div key={col.key} className="flex-1 min-w-[60px]">
              <div
                className={`rounded-t-lg px-2 py-1 text-center text-xs font-medium ${
                  isHighlighted ? "bg-[#FFD700]/20 border-t border-x border-[#FFD700]/50" : "bg-white/5 border-t border-x border-white/10"
                }`}
              >
                <span className={isHighlighted ? "text-[#FFD700]" : col.color}>{col.label}</span>
              </div>
              <div
                className={`rounded-b-lg px-2 py-3 text-center font-black text-2xl border-b border-x ${
                  isHighlighted
                    ? "bg-[#FFD700]/10 border-[#FFD700]/50 text-[#FFD700]"
                    : "bg-white/5 border-white/10 text-white"
                }`}
              >
                {digits[col.key]}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EquationChain({ steps }: { steps: string[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="bg-white/8 border border-white/15 rounded-lg px-3 py-2 text-sm font-mono font-bold text-white/90">
            {step}
          </div>
          {i < steps.length - 1 && (
            <ChevronRight className="w-4 h-4 text-white/30 flex-shrink-0" />
          )}
        </div>
      ))}
    </div>
  );
}

function Comparison({ left, right, operator, explanation }: { left: string; right: string; operator: string; explanation: string }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center gap-4">
        <div className="bg-[#CC0000]/20 border border-[#CC0000]/40 rounded-xl px-6 py-4 text-center">
          <div className="bebas text-3xl text-white">{left}</div>
        </div>
        <div className="bebas text-4xl text-[#FFD700]">{operator}</div>
        <div className="bg-white/5 border border-white/15 rounded-xl px-6 py-4 text-center">
          <div className="bebas text-3xl text-white/70">{right}</div>
        </div>
      </div>
      <div className="text-center text-xs text-white/50">{explanation}</div>
    </div>
  );
}
