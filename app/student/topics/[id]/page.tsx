"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronRight, BookOpen, Target, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LEVEL_LABELS, LEVEL_ORDER, type Level } from "@/types";

interface TopicDetail {
  id: string;
  title: string;
  lo: string;
  completionPct: number;
  avgScore: number;
  attempts: number;
}

interface LevelInfo {
  level: Level;
  label: string;
  completed: boolean;
  score: number | null;
  questionsCount: number;
}

export default function TopicDetailPage() {
  const params = useParams();
  const topicId = params.id as string;
  const [topic, setTopic] = useState<TopicDetail | null>(null);
  const [levels, setLevels] = useState<LevelInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/student/stats").then((r) => r.json()).then((d) => {
      const t = d.topicStats?.find((x: TopicDetail) => x.id === topicId);
      if (t) setTopic(t);

      // Build level info from sessions
      const sessions = d.recentSessions?.filter((s: any) => s.topicTitle === t?.title) || [];
      const levelData: LevelInfo[] = LEVEL_ORDER.map((lv) => {
        const lvSessions = sessions.filter((s: any) => s.level === lv);
        const best = lvSessions.length > 0
          ? Math.max(...lvSessions.map((s: any) => s.totalQs > 0 ? Math.round((s.score / s.totalQs) * 100) : 0))
          : null;
        return {
          level: lv,
          label: LEVEL_LABELS[lv],
          completed: lvSessions.length > 0,
          score: best,
          questionsCount: lv === "FLUENCY" ? 5 : lv === "SKILL" ? 8 : 4,
        };
      });
      setLevels(levelData);
      setLoading(false);
    });
  }, [topicId]);

  if (loading) return <div className="animate-pulse h-64 bg-white/5 rounded-xl" />;
  if (!topic) return <div className="text-center text-white/50 py-20">Topic not found</div>;

  const LEVEL_ICONS: Record<Level, string> = {
    FLUENCY: "⚽",
    SKILL: "🔥",
    DEPTH: "👑",
  };

  const LEVEL_DESCRIPTIONS: Record<Level, string> = {
    FLUENCY: "Warm-up drills — get the basics right",
    SKILL: "Match day — show your skills",
    DEPTH: "Champions League — go deep",
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back + Topic header */}
      <Link href="/student/topics" className="text-white/40 hover:text-white text-sm transition-colors">
        ← Back to Training Ground
      </Link>

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a0000] to-[#2d0000] border border-[#CC0000]/30 p-6">
        <div className="absolute top-0 right-0 text-[6rem] opacity-5 font-black select-none leading-none">7</div>
        <div className="relative">
          <div className="flex items-start gap-3 mb-4">
            <BookOpen className="w-6 h-6 text-[#CC0000] flex-shrink-0 mt-0.5" />
            <div>
              <h1 className="bebas text-3xl tracking-wider leading-tight">{topic.title}</h1>
              <p className="text-white/50 text-sm mt-1">{topic.lo}</p>
            </div>
          </div>
          <Progress value={topic.completionPct} color={topic.completionPct === 100 ? "gold" : "red"} />
          <div className="flex justify-between mt-1 text-xs text-white/40">
            <span>{topic.completionPct}% complete</span>
            {topic.avgScore > 0 && <span>Average score: {topic.avgScore}%</span>}
          </div>
        </div>
      </div>

      {/* Mission Briefing */}
      <Card className="border-[#FFD700]/20">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-4 h-4 text-[#FFD700]" />
          <span className="bebas tracking-wider text-[#FFD700]">Mission Briefing</span>
        </div>
        <p className="text-white/70 text-sm">{topic.lo}</p>
      </Card>

      {/* Level selection */}
      <div>
        <h2 className="bebas text-2xl tracking-wider mb-3">Choose Your Level</h2>
        <div className="space-y-3">
          {levels.map((lv, idx) => {
            const isLocked = idx > 0 && !levels[idx - 1].completed;
            return (
              <div key={lv.level}>
                {isLocked ? (
                  <div className="cr7-card rounded-xl p-4 border border-white/5 opacity-40 cursor-not-allowed">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-xl">
                        🔒
                      </div>
                      <div>
                        <div className="font-bold">{lv.label}</div>
                        <div className="text-white/40 text-sm">Complete previous level first</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link href={`/student/lesson/${topicId}/${lv.level}`}>
                    <div className={`group rounded-xl p-4 border transition-all hover:-translate-y-0.5 cursor-pointer ${
                      lv.completed
                        ? "bg-gradient-to-r from-green-950/50 to-green-900/30 border-green-700/30 hover:border-green-600/50"
                        : "cr7-card border-white/10 hover:border-[#CC0000]/40"
                    }`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                          lv.completed ? "bg-green-800/40" : "bg-[#CC0000]/20"
                        }`}>
                          {lv.completed ? "✅" : LEVEL_ICONS[lv.level]}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold group-hover:text-[#CC0000] transition-colors">{lv.label}</span>
                            <span className="text-white/30 text-xs">{lv.questionsCount} questions</span>
                          </div>
                          <div className="text-white/40 text-sm">{LEVEL_DESCRIPTIONS[lv.level]}</div>
                          {lv.score !== null && (
                            <div className={`text-xs mt-0.5 font-medium ${lv.score >= 80 ? "text-[#FFD700]" : lv.score < 60 ? "text-[#CC0000]" : "text-white/60"}`}>
                              Best score: {lv.score}%
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-white/40 group-hover:text-[#CC0000] transition-colors">
                          <Zap className="w-4 h-4" />
                          <span className="text-xs">+{lv.questionsCount * 10} XP</span>
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
