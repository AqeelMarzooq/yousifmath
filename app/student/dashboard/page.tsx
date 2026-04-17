"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Zap, Flame, Target, Trophy, ChevronRight, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getLevel } from "@/types";

interface Stats {
  totalXP: number;
  level: string;
  streak: number;
  accuracy: number;
  topicStats: Array<{
    id: string;
    title: string;
    completionPct: number;
    avgScore: number;
    isAssigned: boolean;
  }>;
  badges: string[];
}

const LEVEL_XP: Record<string, { min: number; max: number }> = {
  Starter: { min: 0, max: 200 },
  Pro: { min: 200, max: 600 },
  Elite: { min: 600, max: 1200 },
  GOAT: { min: 1200, max: 2000 },
};

const BADGE_DATA: Record<string, { icon: string; name: string }> = {
  first_goal: { icon: "⚽", name: "First Goal" },
  hat_trick: { icon: "🎩", name: "Hat-Trick Hero" },
  clean_sheet: { icon: "🧤", name: "Clean Sheet" },
  champions_league: { icon: "🏆", name: "Champions League" },
};

export default function StudentDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/student/stats").then((r) => r.json()).then((d) => {
      setStats(d);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingSkeleton />;
  if (!stats) return null;

  const levelData = LEVEL_XP[stats.level] || LEVEL_XP.Starter;
  const xpInLevel = stats.totalXP - levelData.min;
  const xpRange = levelData.max - levelData.min;
  const xpPct = Math.min(100, (xpInLevel / xpRange) * 100);
  const assignedTopics = stats.topicStats.filter((t) => t.isAssigned);

  return (
    <div className="space-y-6">
      {/* Hero header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a0000] via-[#2d0000] to-[#1a0000] border border-[#CC0000]/30 p-6">
        <div className="absolute top-0 right-0 w-32 h-32 flex items-center justify-center opacity-10 text-[8rem] font-black select-none leading-none">
          7
        </div>
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-full bg-[#CC0000]/30 border-2 border-[#CC0000]/50 flex items-center justify-center text-2xl">
              ⚽
            </div>
            <div>
              <h1 className="bebas text-3xl tracking-wider">Yousif ⚽</h1>
              <div className="flex items-center gap-2">
                <span className="text-[#FFD700] text-sm font-semibold">{stats.level}</span>
                <span className="text-white/30 text-sm">•</span>
                <span className="text-white/50 text-sm">{stats.totalXP} XP</span>
              </div>
            </div>
          </div>

          {/* XP Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-white/50">
              <span>Level Progress: {stats.level} → {getNextLevel(stats.level)}</span>
              <span>{Math.round(xpPct)}%</span>
            </div>
            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#CC0000] to-[#FFD700] transition-all duration-1000"
                style={{ width: `${xpPct}%` }}
              />
            </div>
            <div className="text-right text-xs text-white/30">
              {stats.totalXP - levelData.min} / {xpRange} XP to next level
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={<Zap className="w-5 h-5 text-[#FFD700]" />} label="Goals Scored" value={stats.totalXP} unit="XP" color="gold" />
        <StatCard icon={<Flame className="w-5 h-5 text-orange-400" />} label="Match Streak" value={stats.streak} unit="days" color="orange" />
        <StatCard icon={<Target className="w-5 h-5 text-green-400" />} label="Accuracy" value={stats.accuracy} unit="%" color="green" />
        <StatCard icon={<Trophy className="w-5 h-5 text-[#CC0000]" />} label="Badges" value={stats.badges.length} unit="earned" color="red" />
      </div>

      {/* Assigned homework */}
      {assignedTopics.length > 0 && (
        <div>
          <h2 className="bebas text-2xl tracking-wider text-[#FFD700] mb-3">⚡ Today's Mission</h2>
          <div className="space-y-2">
            {assignedTopics.map((t) => (
              <Link key={t.id} href={`/student/topics/${t.id}`}>
                <div className="cr7-card-gold rounded-xl p-4 border border-[#FFD700]/30 hover:border-[#FFD700]/60 transition-all group cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold group-hover:text-[#FFD700] transition-colors">{t.title}</div>
                      <div className="text-white/40 text-sm">Assigned by Manager</div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[#FFD700] group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Topic progress */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="bebas text-2xl tracking-wider">Training Ground</h2>
          <Link href="/student/topics" className="text-[#CC0000] text-sm hover:text-red-400 transition-colors">
            All Topics →
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {stats.topicStats.map((t, i) => (
            <Link key={t.id} href={`/student/topics/${t.id}`}>
              <Card className="hover:border-[#CC0000]/30 transition-all group cursor-pointer">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#CC0000]/20 flex items-center justify-center text-sm font-bold text-[#CC0000] flex-shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm group-hover:text-[#CC0000] transition-colors truncate">{t.title}</div>
                    <Progress value={t.completionPct} className="mt-2 h-2" color={t.completionPct === 100 ? "gold" : "red"} />
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-white/40">{t.completionPct}% complete</span>
                      {t.avgScore > 0 && (
                        <span className={`text-xs ${t.avgScore >= 80 ? "text-[#FFD700]" : t.avgScore < 60 ? "text-[#CC0000]" : "text-white/40"}`}>
                          Avg: {t.avgScore}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Badges */}
      {stats.badges.length > 0 && (
        <div>
          <h2 className="bebas text-2xl tracking-wider mb-3">Trophy Cabinet</h2>
          <div className="flex gap-3 flex-wrap">
            {stats.badges.map((b) => (
              <div key={b} className="cr7-card-gold rounded-xl p-3 border border-[#FFD700]/30 flex items-center gap-2">
                <span className="text-2xl">{BADGE_DATA[b]?.icon}</span>
                <span className="text-sm font-semibold text-[#FFD700]">{BADGE_DATA[b]?.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, unit, color }: {
  icon: React.ReactNode;
  label: string;
  value: number;
  unit: string;
  color: string;
}) {
  return (
    <Card className="text-center">
      <div className="flex justify-center mb-2">{icon}</div>
      <div className={`bebas text-3xl tracking-wider ${
        color === "gold" ? "text-[#FFD700]" :
        color === "red" ? "text-[#CC0000]" :
        color === "orange" ? "text-orange-400" :
        "text-green-400"
      }`}>
        {value}
      </div>
      <div className="text-white/30 text-xs">{unit}</div>
      <div className="text-white/60 text-xs mt-0.5">{label}</div>
    </Card>
  );
}

function getNextLevel(current: string) {
  const levels = ["Starter", "Pro", "Elite", "GOAT"];
  const idx = levels.indexOf(current);
  return levels[idx + 1] || "GOAT";
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-40 bg-white/5 rounded-2xl" />
      <div className="grid grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-white/5 rounded-xl" />)}
      </div>
      <div className="h-32 bg-white/5 rounded-xl" />
    </div>
  );
}
