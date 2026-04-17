"use client";
import { useEffect, useState } from "react";
import { Card, CardRed, CardGold } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Zap, Flame, Target, Clock, Trophy, AlertTriangle, Star } from "lucide-react";

interface ParentStats {
  totalXP: number;
  level: string;
  streak: number;
  accuracy: number;
  totalTime: number;
  topicsCompleted: number;
  topicStats: Array<{
    id: string;
    title: string;
    completionPct: number;
    avgScore: number;
    attempts: number;
    isWeak: boolean;
    isStrong: boolean;
  }>;
  weakAreas: string[];
  strongAreas: string[];
  recentSessions: Array<{
    id: string;
    topicTitle: string;
    level: string;
    score: number;
    totalQs: number;
    xpEarned: number;
    duration: number;
    completedAt: string;
    pct: number;
  }>;
}

export default function ParentDashboard() {
  const [stats, setStats] = useState<ParentStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/parent/stats").then((r) => r.json()).then((d) => {
      setStats(d);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-32 bg-white/5 rounded-xl" /><div className="h-64 bg-white/5 rounded-xl" /></div>;
  if (!stats) return null;

  const totalHours = Math.floor(stats.totalTime / 3600);
  const totalMins = Math.floor((stats.totalTime % 3600) / 60);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a1400] to-[#2d2000] border border-[#FFD700]/30 p-6">
        <div className="absolute top-0 right-0 text-[8rem] opacity-5 font-black select-none leading-none">⚽</div>
        <div className="relative">
          <h1 className="bebas text-4xl tracking-wider text-[#FFD700]">Manager's Office</h1>
          <p className="text-white/50 mt-1">Yousif's performance report — Year 5 Maths</p>
        </div>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="text-center">
          <Trophy className="w-6 h-6 text-[#FFD700] mx-auto mb-2" />
          <div className="bebas text-3xl text-[#FFD700]">{stats.topicsCompleted}/4</div>
          <div className="text-white/40 text-xs">Topics Done</div>
        </Card>
        <Card className="text-center">
          <Target className="w-6 h-6 text-green-400 mx-auto mb-2" />
          <div className="bebas text-3xl text-green-400">{stats.accuracy}%</div>
          <div className="text-white/40 text-xs">Accuracy</div>
        </Card>
        <Card className="text-center">
          <Flame className="w-6 h-6 text-orange-400 mx-auto mb-2" />
          <div className="bebas text-3xl text-orange-400">{stats.streak}</div>
          <div className="text-white/40 text-xs">Day Streak</div>
        </Card>
        <Card className="text-center">
          <Clock className="w-6 h-6 text-blue-400 mx-auto mb-2" />
          <div className="bebas text-3xl text-blue-400">
            {totalHours > 0 ? `${totalHours}h` : `${totalMins}m`}
          </div>
          <div className="text-white/40 text-xs">Total Time</div>
        </Card>
      </div>

      {/* Alerts */}
      {stats.weakAreas.length > 0 && (
        <CardRed className="border-[#CC0000]/40">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#CC0000] flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-[#CC0000] mb-1">Needs More Practice</div>
              {stats.weakAreas.map((area) => (
                <div key={area} className="text-white/70 text-sm">• {area}</div>
              ))}
            </div>
          </div>
        </CardRed>
      )}

      {stats.strongAreas.length > 0 && (
        <CardGold className="border-[#FFD700]/40">
          <div className="flex items-start gap-3">
            <Star className="w-5 h-5 text-[#FFD700] flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-[#FFD700] mb-1">Strong Areas</div>
              {stats.strongAreas.map((area) => (
                <div key={area} className="text-white/70 text-sm">• {area}</div>
              ))}
            </div>
          </div>
        </CardGold>
      )}

      {/* Topic breakdown */}
      <Card>
        <h2 className="bebas text-2xl tracking-wider mb-4">Topic Breakdown</h2>
        <div className="space-y-4">
          {stats.topicStats.map((t, i) => (
            <div key={t.id} className={`p-3 rounded-xl border ${
              t.isWeak ? "border-red-700/30 bg-red-900/10" :
              t.isStrong ? "border-[#FFD700]/30 bg-[#FFD700]/5" :
              "border-white/5"
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-white/30 text-sm">#{i + 1}</span>
                  <span className="font-medium text-sm">{t.title}</span>
                  {t.isWeak && <span className="text-xs bg-red-900/40 text-red-400 border border-red-700/30 px-1.5 py-0.5 rounded">Weak</span>}
                  {t.isStrong && <span className="text-xs bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/30 px-1.5 py-0.5 rounded">Strong</span>}
                </div>
                <div className="flex items-center gap-3 text-sm">
                  {t.avgScore > 0 && (
                    <span className={t.avgScore >= 80 ? "text-[#FFD700]" : t.avgScore < 60 ? "text-[#CC0000]" : "text-white/50"}>
                      {t.avgScore}% avg
                    </span>
                  )}
                  <span className="text-white/30">{t.attempts} tries</span>
                </div>
              </div>
              <Progress
                value={t.completionPct}
                color={t.completionPct === 100 ? "gold" : t.isWeak ? "red" : "green"}
                className="h-1.5"
              />
              <div className="text-right text-xs text-white/30 mt-0.5">{t.completionPct}% complete</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent activity */}
      {stats.recentSessions.length > 0 && (
        <Card>
          <h2 className="bebas text-2xl tracking-wider mb-4">Recent Activity</h2>
          <div className="space-y-2">
            {stats.recentSessions.slice(0, 8).map((s) => (
              <div key={s.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div>
                  <div className="text-sm text-white/80">{s.topicTitle}</div>
                  <div className="text-xs text-white/30">
                    {new Date(s.completedAt).toLocaleDateString()} · {s.level} · {Math.floor(s.duration / 60)}m
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-bold ${s.pct >= 80 ? "text-[#FFD700]" : s.pct < 60 ? "text-[#CC0000]" : "text-white/60"}`}>
                    {s.score}/{s.totalQs} ({s.pct}%)
                  </div>
                  <div className="text-xs text-[#CC0000]">+{s.xpEarned} XP</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
