"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function ParentProgress() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch("/api/parent/stats").then((r) => r.json()).then(setStats);
  }, []);

  if (!stats) return <div className="animate-pulse h-64 bg-white/5 rounded-xl" />;

  const chartData = stats.topicStats.map((t: any) => ({
    name: `Topic ${t.order}`,
    score: t.avgScore || 0,
    completion: t.completionPct,
  }));

  const LEVEL_LABELS: Record<string, string> = { FLUENCY: "Warm-Up", SKILL: "Match Day", DEPTH: "Champions League" };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="bebas text-4xl tracking-wider text-[#FFD700]">Detailed Progress</h1>
        <p className="text-white/50 mt-1">Click any topic to see questions and Yousif&apos;s answers</p>
      </div>

      {/* Score chart */}
      <Card>
        <h2 className="bebas text-2xl tracking-wider mb-4">Average Score by Topic</h2>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff" }}
                formatter={(val: any) => [`${val}%`]}
              />
              <Bar dataKey="score" fill="#CC0000" radius={[4, 4, 0, 0]} name="Avg Score" />
              <Bar dataKey="completion" fill="#FFD700" radius={[4, 4, 0, 0]} name="Completion" />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 justify-center mt-2 text-xs text-white/40">
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-[#CC0000] rounded inline-block" /> Avg Score</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-[#FFD700] rounded inline-block" /> Completion</span>
          </div>
        </div>
      </Card>

      {/* Detailed topic cards — each links to question drill-down */}
      <div className="space-y-4">
        {stats.topicStats.map((t: any, i: number) => (
          <Link key={t.id} href={`/parent/topics/${t.id}`}>
            <Card className={`group cursor-pointer hover:-translate-y-0.5 transition-all ${
              t.isWeak ? "border-red-700/30 hover:border-red-600/50" :
              t.isStrong ? "border-[#FFD700]/30 hover:border-[#FFD700]/60" :
              "hover:border-white/20"
            }`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold group-hover:text-[#FFD700] transition-colors">{t.title}</h3>
                    {t.isWeak && <span className="text-xs bg-red-900/40 text-red-400 border border-red-700/30 px-1.5 py-0.5 rounded">Weak</span>}
                    {t.isStrong && <span className="text-xs bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/30 px-1.5 py-0.5 rounded">Strong</span>}
                  </div>
                  <p className="text-white/40 text-sm">{t.lo}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className={`bebas text-2xl ${t.isWeak ? "text-[#CC0000]" : t.isStrong ? "text-[#FFD700]" : "text-white/60"}`}>
                    {t.avgScore > 0 ? `${t.avgScore}%` : "—"}
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-[#FFD700] group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3">
                {["FLUENCY", "SKILL", "DEPTH"].map((level) => {
                  const levelSessions = stats.recentSessions?.filter((s: any) =>
                    s.topicTitle === t.title && s.level === level
                  ) || [];
                  const done = levelSessions.length > 0;
                  const best = done ? Math.max(...levelSessions.map((s: any) => s.pct)) : null;
                  return (
                    <div key={level} className={`rounded-lg p-2 text-center border ${done ? "border-green-700/30 bg-green-900/10" : "border-white/5"}`}>
                      <div className="text-xs text-white/40">{LEVEL_LABELS[level]}</div>
                      <div className={`font-bold text-sm ${done ? (best! >= 80 ? "text-[#FFD700]" : best! < 60 ? "text-[#CC0000]" : "text-white") : "text-white/20"}`}>
                        {best !== null ? `${best}%` : "—"}
                      </div>
                    </div>
                  );
                })}
              </div>

              <Progress value={t.completionPct} color={t.completionPct === 100 ? "gold" : t.isWeak ? "red" : "green"} />
              <div className="flex justify-between mt-1 text-xs text-white/30">
                <span>{t.completionPct}% complete</span>
                <span className="text-[#FFD700]/50 group-hover:text-[#FFD700] transition-colors">View questions →</span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
