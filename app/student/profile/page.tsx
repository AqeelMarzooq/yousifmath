"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getLevel } from "@/types";
import { Zap, Flame, Target, Clock, Trophy } from "lucide-react";

const LEVEL_XP: Record<string, { min: number; max: number; color: string }> = {
  Starter: { min: 0, max: 200, color: "text-white/60" },
  Pro: { min: 200, max: 600, color: "text-blue-400" },
  Elite: { min: 600, max: 1200, color: "text-purple-400" },
  GOAT: { min: 1200, max: 2000, color: "text-[#FFD700]" },
};

export default function ProfilePage() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch("/api/student/stats").then((r) => r.json()).then(setStats);
  }, []);

  if (!stats) return <div className="animate-pulse h-64 bg-white/5 rounded-xl" />;

  const levelData = LEVEL_XP[stats.level] || LEVEL_XP.Starter;
  const xpInLevel = stats.totalXP - levelData.min;
  const xpRange = levelData.max - levelData.min;
  const xpPct = Math.min(100, (xpInLevel / xpRange) * 100);
  const totalTime = stats.recentSessions?.reduce((s: number, a: any) => s + a.duration, 0) || 0;
  const timeHours = Math.floor(totalTime / 3600);
  const timeMins = Math.floor((totalTime % 3600) / 60);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a0000] to-[#2d0000] border border-[#CC0000]/30 p-8 text-center">
        <div className="absolute top-0 right-0 text-[10rem] opacity-5 font-black select-none leading-none">7</div>
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-[#CC0000]/30 border-2 border-[#CC0000]/50 flex items-center justify-center text-4xl mx-auto mb-4">
            ⚽
          </div>
          <h1 className="bebas text-4xl tracking-wider">Yousif</h1>
          <div className={`bebas text-2xl tracking-wider mt-1 ${levelData.color}`}>{stats.level}</div>

          <div className="mt-4 space-y-1">
            <div className="flex justify-between text-xs text-white/40">
              <span>{stats.level}</span>
              <span>{stats.totalXP} XP</span>
            </div>
            <Progress value={xpPct} color="red" className="h-2" />
            <div className="text-right text-xs text-white/30">
              {Math.round(xpRange - xpInLevel)} XP to next level
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="flex items-center gap-3">
          <Zap className="w-8 h-8 text-[#FFD700] flex-shrink-0" />
          <div>
            <div className="bebas text-2xl text-[#FFD700]">{stats.totalXP}</div>
            <div className="text-white/40 text-xs">Total XP (Goals)</div>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <Flame className="w-8 h-8 text-orange-400 flex-shrink-0" />
          <div>
            <div className="bebas text-2xl text-orange-400">{stats.streak}</div>
            <div className="text-white/40 text-xs">Day Streak</div>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <Target className="w-8 h-8 text-green-400 flex-shrink-0" />
          <div>
            <div className="bebas text-2xl text-green-400">{stats.accuracy}%</div>
            <div className="text-white/40 text-xs">Accuracy Rate</div>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <Clock className="w-8 h-8 text-blue-400 flex-shrink-0" />
          <div>
            <div className="bebas text-2xl text-blue-400">
              {timeHours > 0 ? `${timeHours}h ${timeMins}m` : `${timeMins}m`}
            </div>
            <div className="text-white/40 text-xs">Time Trained</div>
          </div>
        </Card>
      </div>

      {/* Level progression */}
      <Card>
        <h2 className="bebas text-2xl tracking-wider mb-4">Level Progression</h2>
        <div className="space-y-3">
          {Object.entries(LEVEL_XP).map(([lvl, data]) => {
            const isCompleted = stats.totalXP >= data.max;
            const isCurrent = stats.level === lvl;
            const isLocked = stats.totalXP < data.min;
            const lvlPct = isCurrent ? xpPct : isCompleted ? 100 : 0;
            return (
              <div key={lvl} className={`flex items-center gap-3 p-3 rounded-xl border ${
                isCurrent ? "bg-[#CC0000]/10 border-[#CC0000]/30" :
                isCompleted ? "bg-white/5 border-white/10" :
                "border-white/5 opacity-40"
              }`}>
                <div className={`bebas text-lg w-16 ${data.color}`}>{lvl}</div>
                <div className="flex-1">
                  <Progress value={lvlPct} color={isCompleted ? "gold" : "red"} className="h-1.5" />
                </div>
                <div className="text-xs text-white/40 w-20 text-right">
                  {data.min}–{data.max === 2000 ? "∞" : data.max} XP
                </div>
                {isCompleted && <span className="text-[#FFD700] text-sm">✓</span>}
                {isCurrent && <span className="text-[#CC0000] text-xs font-bold">NOW</span>}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Recent sessions */}
      {stats.recentSessions?.length > 0 && (
        <Card>
          <h2 className="bebas text-2xl tracking-wider mb-4">Recent Matches</h2>
          <div className="space-y-2">
            {stats.recentSessions.slice(0, 5).map((s: any) => (
              <div key={s.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div>
                  <div className="text-sm font-medium text-white/80 truncate max-w-[200px]">{s.topicTitle}</div>
                  <div className="text-xs text-white/30">{new Date(s.completedAt).toLocaleDateString()}</div>
                </div>
                <div className="flex items-center gap-3 text-right">
                  <div>
                    <div className={`text-sm font-bold ${
                      s.totalQs > 0 && (s.score / s.totalQs) >= 0.8 ? "text-[#FFD700]" : "text-white/60"
                    }`}>
                      {s.score}/{s.totalQs}
                    </div>
                    <div className="text-xs text-[#CC0000]">+{s.xpEarned} XP</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
