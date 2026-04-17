"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Lock, CheckCircle2, Circle, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface Topic {
  id: string;
  title: string;
  lo: string;
  order: number;
  isAssigned: boolean;
  completionPct: number;
  avgScore: number;
  attempts: number;
}

const LEVEL_LABELS = { FLUENCY: "Warm-Up", SKILL: "Match Day", DEPTH: "Champions League" };

export default function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/student/stats").then((r) => r.json()).then((d) => {
      setTopics(d.topicStats || []);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-white/5 rounded-xl" />)}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="bebas text-4xl tracking-wider">Training Ground</h1>
        <p className="text-white/50 mt-1">Year 5 — Decimals & Fractions Unit</p>
      </div>

      <div className="space-y-3">
        {topics.map((topic, i) => (
          <Link key={topic.id} href={`/student/topics/${topic.id}`}>
            <div className={`group cr7-card rounded-xl p-5 border transition-all hover:-translate-y-0.5 cursor-pointer ${
              topic.isAssigned
                ? "border-[#FFD700]/40 hover:border-[#FFD700]/70"
                : topic.completionPct === 100
                ? "border-green-700/30 hover:border-green-600/50"
                : "border-white/10 hover:border-[#CC0000]/40"
            }`}>
              <div className="flex items-center gap-4">
                {/* Number badge */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black flex-shrink-0 ${
                  topic.completionPct === 100
                    ? "bg-green-800/40 text-green-400 border border-green-700/40"
                    : topic.isAssigned
                    ? "bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/30"
                    : "bg-[#CC0000]/20 text-[#CC0000] border border-[#CC0000]/30"
                }`}>
                  {topic.completionPct === 100 ? "✓" : i + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold group-hover:text-[#CC0000] transition-colors">
                      {topic.title}
                    </span>
                    {topic.isAssigned && (
                      <span className="text-xs bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/30 px-2 py-0.5 rounded-full">
                        Assigned
                      </span>
                    )}
                    {topic.completionPct === 100 && (
                      <span className="text-xs bg-green-900/30 text-green-400 border border-green-700/30 px-2 py-0.5 rounded-full">
                        Complete
                      </span>
                    )}
                  </div>
                  <p className="text-white/40 text-sm mt-0.5 truncate">{topic.lo}</p>

                  <div className="mt-2 space-y-1">
                    <Progress value={topic.completionPct} color={topic.completionPct === 100 ? "gold" : "red"} className="h-1.5" />
                    <div className="flex gap-4 text-xs text-white/30">
                      <span>{topic.completionPct}% complete</span>
                      {topic.attempts > 0 && <span>Avg: {topic.avgScore}%</span>}
                      {topic.attempts > 0 && <span>{topic.attempts} attempt{topic.attempts !== 1 ? "s" : ""}</span>}
                    </div>
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-[#CC0000] group-hover:translate-x-1 transition-all flex-shrink-0" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
