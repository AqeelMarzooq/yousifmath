"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, Circle, ChevronDown, ChevronUp, BookOpen, RefreshCw, RotateCcw, Shuffle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import LessonOverlay from "@/components/student/LessonOverlay";
import { generateLessonContent, type LessonContent } from "@/lib/lessonContent";

const LEVEL_LABELS: Record<string, string> = {
  FLUENCY: "Warm-Up",
  SKILL: "Match Day",
  DEPTH: "Champions League",
};

const LEVEL_COLORS: Record<string, string> = {
  FLUENCY: "text-green-400 border-green-700/40 bg-green-900/10",
  SKILL: "text-blue-400 border-blue-700/40 bg-blue-900/10",
  DEPTH: "text-purple-400 border-purple-700/40 bg-purple-900/10",
};

const ACTIVE_COUNT: Record<string, number> = { FLUENCY: 5, SKILL: 8, DEPTH: 4 };

const TYPE_LABELS: Record<string, string> = {
  MCQ: "Multiple Choice",
  FILL_BLANK: "Fill in the Blank",
  TRUE_FALSE: "True / False",
  ORDER: "Ordering",
};

interface QuestionData {
  id: string;
  questionText: string;
  type: string;
  level: string;
  options: string[] | null;
  correctAnswer: string;
  explanation: string | null;
  xpValue: number;
  latestAnswer: { given: string; isCorrect: boolean } | null;
  totalAttempts: number;
  correctCount: number;
  history: Array<{ given: string; isCorrect: boolean; answeredAt: string }>;
}

interface LevelGroup {
  level: string;
  attempted: boolean;
  attempts: number;
  bestScore: number | null;
  lastAttempt: string | null;
  questions: QuestionData[];
}

export default function ParentTopicDetail() {
  const params = useParams();
  const topicId = params.id as string;
  const [data, setData] = useState<{ topic: any; grouped: LevelGroup[]; totalSessions: number } | null>(null);
  const [openLevels, setOpenLevels] = useState<Record<string, boolean>>({ FLUENCY: true, SKILL: true, DEPTH: true });
  const [expandedQ, setExpandedQ] = useState<Record<string, boolean>>({});
  const [overlay, setOverlay] = useState<LessonContent | null>(null);
  const [reassignPanel, setReassignPanel] = useState<string | null>(null); // level string
  const [resetProgress, setResetProgress] = useState(true);
  const [rerollQuestions, setRerollQuestions] = useState(true);
  const [reassigning, setReassigning] = useState(false);
  const [reassignDone, setReassignDone] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/parent/topic/${topicId}`).then((r) => r.json()).then(setData);
  }, [topicId]);

  if (!data) return <div className="animate-pulse space-y-4"><div className="h-32 bg-white/5 rounded-xl" /><div className="h-64 bg-white/5 rounded-xl" /></div>;

  const { topic, grouped } = data;
  const allQuestions = grouped.flatMap((g) => g.questions);
  const attempted = allQuestions.filter((q) => q.latestAnswer !== null);
  const correct = allQuestions.filter((q) => q.latestAnswer?.isCorrect);

  const handleReassign = async () => {
    if (!reassignPanel) return;
    setReassigning(true);
    await fetch("/api/parent/reassign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topicId, level: reassignPanel, resetProgress, rerollQuestions }),
    });
    setReassigning(false);
    setReassignPanel(null);
    setReassignDone(reassignPanel);
    setTimeout(() => setReassignDone(null), 3000);
    // Refresh data
    fetch(`/api/parent/topic/${topicId}`).then((r) => r.json()).then(setData);
  };

  const openLesson = (q: QuestionData) => {
    const content = generateLessonContent({
      questionText: q.questionText,
      type: q.type,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      topicId,
      level: q.level,
    });
    setOverlay(content);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Lesson overlay — read-only parent view */}
      {overlay && (
        <LessonOverlay
          content={overlay}
          onReady={() => setOverlay(null)}
          onClose={() => setOverlay(null)}
          readyLabel="Got it — Close 👍"
        />
      )}

      <Link href="/parent/progress" className="text-white/40 hover:text-white text-sm transition-colors">
        ← Back to Progress
      </Link>

      {/* Topic header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a1400] to-[#2d2000] border border-[#FFD700]/30 p-6">
        <div className="absolute top-0 right-0 text-[8rem] opacity-5 font-black select-none leading-none">⚽</div>
        <div className="relative">
          <h1 className="bebas text-3xl tracking-wider text-[#FFD700] leading-tight">{topic.title}</h1>
          <p className="text-white/50 mt-1 text-sm">{topic.lo}</p>
          <div className="flex gap-6 mt-4 text-sm">
            <div><span className="text-white/40">Questions: </span><span className="font-bold">{allQuestions.length}</span></div>
            <div><span className="text-white/40">Attempted: </span><span className="font-bold">{attempted.length}</span></div>
            <div><span className="text-white/40">Correct: </span><span className={`font-bold ${correct.length === attempted.length && attempted.length > 0 ? "text-[#FFD700]" : "text-white"}`}>{correct.length}</span></div>
            <div><span className="text-white/40">Sessions: </span><span className="font-bold">{data.totalSessions}</span></div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 text-xs text-white/40 bg-white/3 border border-white/8 rounded-xl px-4 py-2.5">
        <BookOpen className="w-3.5 h-3.5 text-[#FFD700]/60 flex-shrink-0" />
        <span>Questions Yousif got <span className="text-red-400">wrong</span> show a <span className="text-[#FFD700]">View Lesson</span> button — tap it to see the exact explanation he would receive, so you can reinforce it at home.</span>
      </div>

      {/* Level sections */}
      {grouped.map((group) => (
        <div key={group.level} className="space-y-2">
          {/* Level header */}
          <div className={`rounded-xl border ${LEVEL_COLORS[group.level]}`}>
            <button
              onClick={() => setOpenLevels((o) => ({ ...o, [group.level]: !o[group.level] }))}
              className="w-full flex items-center justify-between p-4 cursor-pointer"
            >
              <div className="flex items-center gap-3 flex-wrap">
                <span className="bebas text-xl tracking-wider">{LEVEL_LABELS[group.level]}</span>
                <span className="text-sm opacity-70">{group.questions.length} questions</span>
                {group.attempted && (
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                    group.bestScore! >= 80 ? "bg-[#FFD700]/10 border-[#FFD700]/30 text-[#FFD700]" :
                    group.bestScore! < 60 ? "bg-red-900/30 border-red-700/30 text-red-400" :
                    "bg-white/5 border-white/20 text-white/60"
                  }`}>
                    Best: {group.bestScore}%
                  </span>
                )}
                {!group.attempted && (
                  <span className="text-xs px-2 py-0.5 rounded-full border border-white/10 text-white/30">Not started</span>
                )}
                {reassignDone === group.level && (
                  <span className="text-xs px-2 py-0.5 rounded-full border border-green-600/40 bg-green-900/20 text-green-400">✓ Re-assigned!</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); setReassignPanel(reassignPanel === group.level ? null : group.level); setResetProgress(true); setRerollQuestions(true); }}
                  className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border border-white/20 text-white/50 hover:border-white/40 hover:text-white/80 transition-all cursor-pointer"
                  title="Re-assign this level"
                >
                  <RefreshCw className="w-3 h-3" />
                  Re-assign
                </button>
                {openLevels[group.level] ? <ChevronUp className="w-4 h-4 opacity-60" /> : <ChevronDown className="w-4 h-4 opacity-60" />}
              </div>
            </button>

            {/* Re-assign panel */}
            {reassignPanel === group.level && (
              <div className="border-t border-white/10 p-4 bg-black/30 space-y-3">
                <p className="text-xs text-white/50 font-medium uppercase tracking-wider">Re-assign options for {LEVEL_LABELS[group.level]}</p>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={resetProgress}
                    onChange={(e) => setResetProgress(e.target.checked)}
                    className="mt-0.5 accent-[#CC0000] w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <div className="flex items-center gap-1.5 text-sm font-medium text-white/80 group-hover:text-white">
                      <RotateCcw className="w-3.5 h-3.5 text-[#CC0000]" />
                      Reset Yousif&apos;s score
                    </div>
                    <p className="text-xs text-white/40 mt-0.5">Clears all attempt history for this level — he starts fresh with a clean score</p>
                  </div>
                </label>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={rerollQuestions}
                    onChange={(e) => setRerollQuestions(e.target.checked)}
                    className="mt-0.5 accent-[#FFD700] w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <div className="flex items-center gap-1.5 text-sm font-medium text-white/80 group-hover:text-white">
                      <Shuffle className="w-3.5 h-3.5 text-[#FFD700]" />
                      Give him a fresh set of questions
                    </div>
                    <p className="text-xs text-white/40 mt-0.5">Randomly picks {ACTIVE_COUNT[group.level]} questions from the full question bank — he may see different questions next time</p>
                  </div>
                </label>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleReassign}
                    disabled={reassigning || (!resetProgress && !rerollQuestions)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#CC0000] to-[#990000] rounded-lg text-sm font-bold hover:from-red-600 hover:to-red-800 transition-all disabled:opacity-40 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${reassigning ? "animate-spin" : ""}`} />
                    {reassigning ? "Re-assigning..." : "Confirm Re-assign"}
                  </button>
                  <button
                    onClick={() => setReassignPanel(null)}
                    className="px-4 py-2 border border-white/20 rounded-lg text-sm text-white/50 hover:text-white hover:border-white/40 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Questions */}
          {openLevels[group.level] && (
            <div className="space-y-2 pl-1">
              {group.questions.map((q, qi) => {
                const isExpanded = expandedQ[q.id];
                const status = q.latestAnswer === null ? "unattempted" : q.latestAnswer.isCorrect ? "correct" : "wrong";

                return (
                  <div
                    key={q.id}
                    className={`rounded-xl border transition-all overflow-hidden ${
                      status === "correct" ? "border-green-700/30 bg-green-900/5" :
                      status === "wrong" ? "border-red-700/30 bg-red-900/5" :
                      "border-white/8 bg-white/2"
                    }`}
                  >
                    {/* Question row */}
                    <button
                      onClick={() => setExpandedQ((e) => ({ ...e, [q.id]: !e[q.id] }))}
                      className="w-full text-left p-4 cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        {/* Status icon */}
                        <div className="flex-shrink-0 mt-0.5">
                          {status === "correct" && <CheckCircle className="w-5 h-5 text-green-400" />}
                          {status === "wrong" && <XCircle className="w-5 h-5 text-red-400" />}
                          {status === "unattempted" && <Circle className="w-5 h-5 text-white/20" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-white/30 text-xs font-mono">Q{qi + 1}</span>
                            <span className="text-xs text-white/30 border border-white/10 rounded px-1.5 py-0.5">{TYPE_LABELS[q.type]}</span>
                            {status === "wrong" && (
                              <span className="text-xs bg-red-900/30 text-red-400 border border-red-700/30 px-1.5 py-0.5 rounded">Wrong</span>
                            )}
                          </div>
                          <p className="text-sm font-medium text-white/90">{q.questionText}</p>

                          {/* Quick answer summary */}
                          {q.latestAnswer && (
                            <div className="mt-2 flex items-center gap-3 text-xs flex-wrap">
                              <span className="text-white/40">Yousif answered:</span>
                              <span className={`font-bold ${q.latestAnswer.isCorrect ? "text-green-400" : "text-red-400"}`}>
                                &ldquo;{q.latestAnswer.given}&rdquo;
                              </span>
                              {!q.latestAnswer.isCorrect && (
                                <>
                                  <span className="text-white/20">→</span>
                                  <span className="text-[#FFD700] font-medium">Correct: &ldquo;{q.correctAnswer}&rdquo;</span>
                                </>
                              )}
                            </div>
                          )}
                          {q.latestAnswer === null && (
                            <p className="mt-1 text-xs text-white/30 italic">Not yet attempted</p>
                          )}
                        </div>

                        <div className="flex-shrink-0 flex items-center gap-2">
                          {q.totalAttempts > 0 && (
                            <span className="text-xs text-white/30">{q.correctCount}/{q.totalAttempts}</span>
                          )}
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-white/30" /> : <ChevronDown className="w-4 h-4 text-white/30" />}
                        </div>
                      </div>
                    </button>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div className="border-t border-white/8 px-4 pb-4 pt-3 space-y-3">
                        {/* Options for MCQ */}
                        {q.type === "MCQ" && q.options && (
                          <div>
                            <p className="text-xs text-white/40 mb-2 uppercase tracking-wider">Options</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                              {q.options.map((opt) => {
                                const isCorrect = opt === q.correctAnswer;
                                const wasChosen = q.latestAnswer?.given === opt;
                                return (
                                  <div key={opt} className={`px-3 py-2 rounded-lg text-sm border flex items-center gap-2 ${
                                    isCorrect ? "border-green-700/50 bg-green-900/20 text-green-300" :
                                    wasChosen && !isCorrect ? "border-red-700/50 bg-red-900/20 text-red-300" :
                                    "border-white/8 text-white/50"
                                  }`}>
                                    {isCorrect && <CheckCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />}
                                    {wasChosen && !isCorrect && <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />}
                                    {!isCorrect && !wasChosen && <span className="w-3.5 h-3.5 flex-shrink-0" />}
                                    {opt}
                                    {isCorrect && <span className="ml-auto text-xs text-green-500">✓ correct</span>}
                                    {wasChosen && !isCorrect && <span className="ml-auto text-xs text-red-500">✗ chosen</span>}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Correct answer for non-MCQ */}
                        {q.type !== "MCQ" && (
                          <div className="flex items-center gap-3 text-sm">
                            <span className="text-white/40">Correct answer:</span>
                            <span className="font-bold text-green-300 bg-green-900/20 border border-green-700/30 px-2 py-0.5 rounded">
                              {q.correctAnswer}
                            </span>
                          </div>
                        )}

                        {/* Explanation */}
                        {q.explanation && (
                          <div className="bg-[#FFD700]/5 border border-[#FFD700]/20 rounded-lg px-3 py-2 text-sm text-[#FFD700]/80">
                            💡 {q.explanation}
                          </div>
                        )}

                        {/* View Lesson button — only for wrong answers */}
                        {status === "wrong" && (
                          <button
                            onClick={(e) => { e.stopPropagation(); openLesson(q); }}
                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-xl text-[#FFD700] text-sm font-semibold hover:bg-[#FFD700]/20 hover:border-[#FFD700]/50 transition-all cursor-pointer"
                          >
                            <BookOpen className="w-4 h-4" />
                            View Lesson — see how Yousif is taught this 📚
                          </button>
                        )}

                        {/* Attempt history */}
                        {q.history.length > 0 && (
                          <div>
                            <p className="text-xs text-white/40 mb-2 uppercase tracking-wider">Attempt History</p>
                            <div className="space-y-1">
                              {q.history.map((h, hi) => (
                                <div key={hi} className="flex items-center gap-2 text-xs text-white/50">
                                  {h.isCorrect
                                    ? <CheckCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                                    : <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                                  }
                                  <span className={h.isCorrect ? "text-green-400" : "text-red-400"}>
                                    &ldquo;{h.given}&rdquo;
                                  </span>
                                  <span className="text-white/20 ml-auto">
                                    {new Date(h.answeredAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
