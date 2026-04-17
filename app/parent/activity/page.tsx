"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { CheckCircle, XCircle, Clock } from "lucide-react";

const LEVEL_LABELS: Record<string, string> = { FLUENCY: "Warm-Up", SKILL: "Match Day", DEPTH: "Champions League" };

export default function ActivityPage() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch("/api/parent/stats").then((r) => r.json()).then(setStats);
  }, []);

  if (!stats) return <div className="animate-pulse h-64 bg-white/5 rounded-xl" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="bebas text-4xl tracking-wider text-[#FFD700]">Activity Log</h1>
        <p className="text-white/50 mt-1">Every session Yousif has completed</p>
      </div>

      {stats.recentSessions.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-4xl mb-3">📋</div>
          <div className="text-white/50">No activity yet — Yousif hasn't started any lessons</div>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-white/40 font-normal py-2 pr-4">Date</th>
                  <th className="text-left text-white/40 font-normal py-2 pr-4">Topic</th>
                  <th className="text-left text-white/40 font-normal py-2 pr-4">Level</th>
                  <th className="text-right text-white/40 font-normal py-2 pr-4">Score</th>
                  <th className="text-right text-white/40 font-normal py-2 pr-4">XP</th>
                  <th className="text-right text-white/40 font-normal py-2">Time</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentSessions.map((s: any) => (
                  <tr key={s.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 pr-4 text-white/50">
                      {new Date(s.completedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                    </td>
                    <td className="py-3 pr-4 text-white/80 max-w-[160px] truncate">{s.topicTitle}</td>
                    <td className="py-3 pr-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${
                        s.level === "FLUENCY" ? "border-green-700/40 text-green-400" :
                        s.level === "SKILL" ? "border-blue-700/40 text-blue-400" :
                        "border-purple-700/40 text-purple-400"
                      }`}>
                        {LEVEL_LABELS[s.level]}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <span className={`font-bold ${s.pct >= 80 ? "text-[#FFD700]" : s.pct < 60 ? "text-[#CC0000]" : "text-white/60"}`}>
                        {s.score}/{s.totalQs}
                      </span>
                      <span className="text-white/30 ml-1">({s.pct}%)</span>
                    </td>
                    <td className="py-3 pr-4 text-right text-[#CC0000] font-medium">+{s.xpEarned}</td>
                    <td className="py-3 text-right text-white/40">
                      <span className="flex items-center justify-end gap-1">
                        <Clock className="w-3 h-3" />
                        {Math.floor(s.duration / 60)}m
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
