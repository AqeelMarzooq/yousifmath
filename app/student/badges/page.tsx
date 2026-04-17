"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

const ALL_BADGES = [
  { id: "first_goal", icon: "⚽", name: "First Goal", description: "Score your first correct answer", rarity: "Common" },
  { id: "hat_trick", icon: "🎩", name: "Hat-Trick Hero", description: "Get 3 correct answers in a row", rarity: "Rare" },
  { id: "clean_sheet", icon: "🧤", name: "Clean Sheet", description: "Score 100% on any topic level", rarity: "Epic" },
  { id: "champions_league", icon: "🏆", name: "Champions League", description: "Complete all topics", rarity: "Legendary" },
  { id: "penalty_king", icon: "🥅", name: "Penalty King", description: "Score 5 correct answers in a row", rarity: "Rare" },
  { id: "world_class", icon: "⭐", name: "World Class", description: "Reach 500 XP", rarity: "Epic" },
];

const RARITY_COLOR: Record<string, string> = {
  Common: "text-white/60 border-white/20",
  Rare: "text-blue-400 border-blue-700/40",
  Epic: "text-purple-400 border-purple-700/40",
  Legendary: "text-[#FFD700] border-[#FFD700]/40",
};

export default function BadgesPage() {
  const [earnedBadges, setEarnedBadges] = useState<string[]>([]);
  const [totalXP, setTotalXP] = useState(0);

  useEffect(() => {
    fetch("/api/student/stats").then((r) => r.json()).then((d) => {
      setEarnedBadges(d.badges || []);
      setTotalXP(d.totalXP || 0);

      // Add extra badge checks
      const extra: string[] = [];
      if (d.totalXP >= 500) extra.push("world_class");
      setEarnedBadges([...(d.badges || []), ...extra]);
    });
  }, []);

  const earned = ALL_BADGES.filter((b) => earnedBadges.includes(b.id));
  const locked = ALL_BADGES.filter((b) => !earnedBadges.includes(b.id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="bebas text-4xl tracking-wider">Trophy Cabinet</h1>
        <p className="text-white/50 mt-1">{earned.length} / {ALL_BADGES.length} badges earned</p>
      </div>

      {/* Earned */}
      {earned.length > 0 && (
        <div>
          <h2 className="bebas text-2xl tracking-wider text-[#FFD700] mb-3">Earned Badges</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {earned.map((b) => (
              <div key={b.id} className={`cr7-card-gold rounded-2xl p-5 text-center border ${RARITY_COLOR[b.rarity]} glow-gold`}>
                <div className="text-4xl mb-2">{b.icon}</div>
                <div className="bebas text-lg tracking-wider text-[#FFD700]">{b.name}</div>
                <div className="text-white/50 text-xs mt-1">{b.description}</div>
                <div className={`text-xs mt-2 font-semibold ${RARITY_COLOR[b.rarity].split(" ")[0]}`}>
                  {b.rarity}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Locked */}
      <div>
        <h2 className="bebas text-2xl tracking-wider text-white/30 mb-3">Locked Badges</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {locked.map((b) => (
            <div key={b.id} className="cr7-card rounded-2xl p-5 text-center border border-white/5 opacity-40">
              <div className="text-4xl mb-2 grayscale">{b.icon}</div>
              <div className="bebas text-lg tracking-wider text-white/40">{b.name}</div>
              <div className="text-white/30 text-xs mt-1">{b.description}</div>
              <div className="text-xs mt-2 text-white/20">🔒 {b.rarity}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
