"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, Zap, ChevronRight, RotateCcw, Home, BookOpen } from "lucide-react";
import { LEVEL_LABELS, type Level } from "@/types";
import LessonOverlay from "@/components/student/LessonOverlay";
import { generateLessonContent, type LessonContent } from "@/lib/lessonContent";

interface Question {
  id: string;
  questionText: string;
  type: string;
  options: string | null;
  xpValue: number;
  level: string;
  explanation: string | null;
  topicId: string;
}

interface AnswerRecord {
  questionId: string;
  given: string;
  isCorrect: boolean;
}

type Phase = "briefing" | "question" | "feedback" | "lesson" | "retry" | "retry_feedback" | "summary" | "celebration";

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const topicId = params.topicId as string;
  const level = params.level as Level;

  const [phase, setPhase] = useState<Phase>("briefing");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<string>("");
  const [fillInput, setFillInput] = useState("");
  const [feedbackData, setFeedbackData] = useState<{ isCorrect: boolean; correctAnswer: string; explanation: string } | null>(null);
  const [retryFeedbackData, setRetryFeedbackData] = useState<{ isCorrect: boolean; correctAnswer: string; explanation: string } | null>(null);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [xpPopups, setXpPopups] = useState<Array<{ id: number; xp: number; label?: string }>>([]);
  const [startTime] = useState(Date.now());
  const [shake, setShake] = useState(false);
  const [topicTitle, setTopicTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [hatTrick, setHatTrick] = useState(0);
  const [lessonContent, setLessonContent] = useState<LessonContent | null>(null);
  const [comebackKing, setComebackKing] = useState(false);
  const popupCounter = useRef(0);

  useEffect(() => {
    fetch(`/api/student/questions?topicId=${topicId}&level=${level}`)
      .then((r) => r.json())
      .then((d) => setQuestions(d.questions || []));

    fetch("/api/student/stats")
      .then((r) => r.json())
      .then((d) => {
        const t = d.topicStats?.find((x: any) => x.id === topicId);
        if (t) setTopicTitle(t.title);
      });
  }, [topicId, level]);

  const currentQuestion = questions[currentIdx];
  const parsedOptions = currentQuestion?.options ? JSON.parse(currentQuestion.options) as string[] : [];

  const showXpPopup = (xp: number, label?: string) => {
    const id = ++popupCounter.current;
    setXpPopups((prev) => [...prev, { id, xp, label }]);
    setTimeout(() => setXpPopups((prev) => prev.filter((p) => p.id !== id)), 1800);
  };

  const advanceOrFinish = useCallback((allAnswers: AnswerRecord[]) => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((i) => i + 1);
      setSelected("");
      setFillInput("");
      setFeedbackData(null);
      setRetryFeedbackData(null);
      setPhase("question");
    } else {
      const totalCorrect = allAnswers.filter((a) => a.isCorrect).length;
      const xpEarned = allAnswers.reduce((s, a) => s + (a.isCorrect ? 10 : 0), 0);
      const duration = Math.floor((Date.now() - startTime) / 1000);
      const pct = questions.length > 0 ? (totalCorrect / questions.length) * 100 : 0;

      fetch("/api/student/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicId,
          level,
          score: totalCorrect,
          totalQs: questions.length,
          xpEarned,
          duration,
          answers: allAnswers,
        }),
      });

      setPhase(pct >= 80 ? "celebration" : "summary");
    }
  }, [currentIdx, questions, startTime, topicId, level]);

  const handleSubmit = useCallback(async () => {
    if (!currentQuestion) return;
    const answer = currentQuestion.type === "FILL_BLANK" ? fillInput : selected;
    if (!answer) return;
    setSubmitting(true);

    const res = await fetch("/api/student/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId: currentQuestion.id, answer }),
    });
    const data = await res.json();
    setFeedbackData(data);
    setSubmitting(false);

    const record: AnswerRecord = { questionId: currentQuestion.id, given: answer, isCorrect: data.isCorrect };
    const newAnswers = [...answers, record];
    setAnswers(newAnswers);

    if (data.isCorrect) {
      showXpPopup(currentQuestion.xpValue);
      setHatTrick((h) => h + 1);
      setPhase("feedback");
    } else {
      setShake(true);
      setHatTrick(0);
      setTimeout(() => setShake(false), 500);
      setPhase("feedback");
    }
  }, [currentQuestion, fillInput, selected, answers]);

  const handleShowLesson = useCallback(() => {
    if (!currentQuestion) return;
    const content = generateLessonContent({
      questionText: currentQuestion.questionText,
      type: currentQuestion.type,
      correctAnswer: feedbackData?.correctAnswer ?? "",
      explanation: currentQuestion.explanation,
      topicId: currentQuestion.topicId,
      level: currentQuestion.level,
    });
    setLessonContent(content);
    setPhase("lesson");
  }, [currentQuestion, feedbackData]);

  const handleLessonReady = useCallback(() => {
    setSelected("");
    setFillInput("");
    setPhase("retry");
  }, []);

  const handleRetrySubmit = useCallback(async () => {
    if (!currentQuestion) return;
    const answer = currentQuestion.type === "FILL_BLANK" ? fillInput : selected;
    if (!answer) return;
    setSubmitting(true);

    const res = await fetch("/api/student/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId: currentQuestion.id, answer }),
    });
    const data = await res.json();
    setRetryFeedbackData(data);
    setSubmitting(false);

    if (data.isCorrect) {
      setComebackKing(true);
      showXpPopup(currentQuestion.xpValue + 5, "⚡ Comeback King +5");
      const updated = answers.map((a) =>
        a.questionId === currentQuestion.id ? { ...a, isCorrect: true } : a
      );
      setAnswers(updated);
      setTimeout(() => setComebackKing(false), 2000);
    }

    setPhase("retry_feedback");
  }, [currentQuestion, fillInput, selected, answers]);

  const handleNext = useCallback(() => {
    advanceOrFinish(answers);
  }, [answers, advanceOrFinish]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (phase === "question" && (selected || fillInput) && e.key === "Enter") handleSubmit();
      if (phase === "retry" && (selected || fillInput) && e.key === "Enter") handleRetrySubmit();
      if ((phase === "feedback" || phase === "retry_feedback") && e.key === "Enter") handleNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [phase, selected, fillInput, handleSubmit, handleRetrySubmit, handleNext]);

  if (phase === "lesson" && lessonContent) {
    return (
      <LessonOverlay
        content={lessonContent}
        onReady={handleLessonReady}
        onClose={() => setPhase("feedback")}
      />
    );
  }

  if (phase === "briefing") {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a0000] to-[#2d0000] border border-[#CC0000]/40 p-8 text-center">
          <div className="absolute inset-0 flex items-center justify-center opacity-5 text-[12rem] font-black select-none">7</div>
          <div className="relative">
            <div className="text-5xl mb-4">📋</div>
            <h1 className="bebas text-4xl tracking-wider mb-2">Mission Briefing</h1>
            <div className="inline-flex items-center gap-2 bg-[#CC0000]/20 border border-[#CC0000]/30 rounded-full px-4 py-1.5 mb-4">
              <span className="text-[#CC0000] font-semibold text-sm">{LEVEL_LABELS[level]} Level</span>
            </div>
            <p className="text-white/70 text-lg mb-2">{topicTitle}</p>
            <p className="text-white/50 mb-8">{questions.length > 0 ? `${questions.length} questions to score` : "Loading questions..."}</p>

            <div className="grid grid-cols-3 gap-3 mb-8">
              <div className="cr7-card rounded-xl p-3 text-center">
                <div className="text-2xl mb-1">⚽</div>
                <div className="text-xs text-white/50">+10 XP per goal</div>
              </div>
              <div className="cr7-card rounded-xl p-3 text-center">
                <div className="text-2xl mb-1">🎩</div>
                <div className="text-xs text-white/50">Hat-trick bonus</div>
              </div>
              <div className="cr7-card rounded-xl p-3 text-center">
                <div className="text-2xl mb-1">📚</div>
                <div className="text-xs text-white/50">Lesson on wrong</div>
              </div>
            </div>

            <button
              onClick={() => setPhase("question")}
              disabled={questions.length === 0}
              className="w-full py-4 bg-gradient-to-r from-[#CC0000] to-[#990000] rounded-xl bebas text-xl tracking-widest hover:from-red-600 hover:to-red-800 transition-all hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer"
            >
              {questions.length === 0 ? "Loading..." : "Kick Off! ⚽"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "celebration" || phase === "summary") {
    const totalCorrect = answers.filter((a) => a.isCorrect).length;
    const pct = questions.length > 0 ? Math.round((totalCorrect / questions.length) * 100) : 0;
    const xpEarned = answers.reduce((s, a) => s + (a.isCorrect ? 10 : 0), 0);
    const isCelebration = phase === "celebration";

    return (
      <div className="max-w-2xl mx-auto">
        {isCelebration && <Confetti />}
        <div className={`relative overflow-hidden rounded-2xl p-8 text-center border ${
          isCelebration
            ? "bg-gradient-to-br from-[#1a1400] to-[#2d2000] border-[#FFD700]/40"
            : "bg-gradient-to-br from-[#111] to-[#1a1a1a] border-white/10"
        }`}>
          <div className="text-6xl mb-4">{isCelebration ? "🏆" : "📊"}</div>
          <h1 className="bebas text-5xl tracking-wider mb-2 text-glow-gold">
            {isCelebration ? "SIUUUU!" : "Match Over"}
          </h1>
          <p className="text-white/60 mb-6">
            {isCelebration ? "Outstanding performance, champion!" : "Keep training to improve!"}
          </p>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <ScoreCard label="Goals" value={`${totalCorrect}/${questions.length}`} color="red" />
            <ScoreCard label="Accuracy" value={`${pct}%`} color={pct >= 80 ? "gold" : "default"} />
            <ScoreCard label="XP Earned" value={`+${xpEarned}`} color="gold" />
          </div>

          {hatTrick >= 3 && (
            <div className="mb-4 bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-xl p-3">
              <div className="text-[#FFD700] font-bold">🎩 Hat-Trick Hero!</div>
              <div className="text-white/50 text-sm">3+ consecutive correct answers!</div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => { setAnswers([]); setCurrentIdx(0); setSelected(""); setFillInput(""); setFeedbackData(null); setRetryFeedbackData(null); setPhase("briefing"); }}
              className="flex-1 flex items-center justify-center gap-2 py-3 border border-white/20 rounded-xl hover:bg-white/10 transition-all text-white/70 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Replay
            </button>
            <button
              onClick={() => router.push(`/student/topics/${topicId}`)}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#CC0000] to-[#990000] rounded-xl bebas tracking-wider hover:from-red-600 hover:to-red-800 transition-all cursor-pointer"
            >
              Next Match
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) return <div className="text-center py-20 text-white/50">Loading...</div>;

  const progress = (currentIdx / questions.length) * 100;
  const isRetry = phase === "retry" || phase === "retry_feedback";
  const activeFeedback = isRetry ? retryFeedbackData : feedbackData;
  const isInFeedback = phase === "feedback" || phase === "retry_feedback";

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* XP popups */}
      <div className="fixed top-20 right-4 z-50 space-y-2 pointer-events-none">
        {xpPopups.map((p) => (
          <div key={p.id} className="float-xp bg-[#FFD700] text-black font-black rounded-full px-4 py-1.5 text-sm shadow-lg">
            {p.label ? p.label : `+${p.xp} ⭐`}
          </div>
        ))}
      </div>

      {/* Comeback King flash */}
      {comebackKing && (
        <div className="fixed inset-0 z-40 pointer-events-none flex items-center justify-center">
          <div className="bg-[#FFD700] text-black bebas text-5xl tracking-widest px-12 py-6 rounded-2xl shadow-2xl animate-ping-once">
            ⚡ COMEBACK KING!
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.push(`/student/topics/${topicId}`)} className="text-white/40 hover:text-white transition-colors">
          <Home className="w-4 h-4" />
        </button>
        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#CC0000] to-[#FFD700] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-white/40 text-sm">{currentIdx + 1}/{questions.length}</span>
      </div>

      {/* Retry banner */}
      {isRetry && (
        <div className="flex items-center gap-2 bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-xl px-4 py-2.5">
          <span className="text-[#FFD700] text-sm font-bold">⚡ Retry — You can do it!</span>
          <span className="text-white/40 text-xs ml-auto">Comeback King bonus if correct</span>
        </div>
      )}

      {/* Hat-trick indicator */}
      {hatTrick >= 2 && !isRetry && (
        <div className="flex items-center gap-1 text-xs text-[#FFD700]">
          {[...Array(Math.min(hatTrick, 3))].map((_, i) => <span key={i}>⚽</span>)}
          {hatTrick >= 2 && <span className="ml-1">{hatTrick >= 3 ? "HAT-TRICK!" : "2 in a row!"}</span>}
        </div>
      )}

      {/* Question card */}
      <div className={`cr7-card rounded-2xl p-6 border ${isRetry ? "border-[#FFD700]/20" : "border-white/10"} ${shake ? "shake" : ""}`}>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs text-white/30 uppercase tracking-widest">{LEVEL_LABELS[level]}</span>
          <span className="text-white/20">•</span>
          <span className="flex items-center gap-1 text-xs text-[#FFD700]/70">
            <Zap className="w-3 h-3" />+{currentQuestion.xpValue} XP
          </span>
          {isRetry && <span className="ml-auto text-xs text-[#FFD700]/60">+5 bonus if correct</span>}
        </div>

        <h2 className="text-xl font-bold mb-6 leading-relaxed">{currentQuestion.questionText}</h2>

        {/* MCQ */}
        {currentQuestion.type === "MCQ" && (
          <div className="space-y-2">
            {parsedOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => !isInFeedback && setSelected(opt)}
                disabled={isInFeedback}
                className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all min-h-[52px] cursor-pointer text-sm font-medium ${
                  isInFeedback
                    ? opt === activeFeedback?.correctAnswer
                      ? "bg-green-900/40 border-green-600/60 text-green-300"
                      : opt === selected && !activeFeedback?.isCorrect
                      ? "bg-red-900/40 border-red-600/60 text-red-300"
                      : "border-white/10 text-white/40"
                    : selected === opt
                    ? "bg-[#CC0000]/20 border-[#CC0000]/60 text-white"
                    : "border-white/10 hover:border-[#CC0000]/40 hover:bg-white/5 text-white/80"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {/* TRUE/FALSE */}
        {currentQuestion.type === "TRUE_FALSE" && (
          <div className="grid grid-cols-2 gap-3">
            {["True", "False"].map((opt) => (
              <button
                key={opt}
                onClick={() => !isInFeedback && setSelected(opt)}
                disabled={isInFeedback}
                className={`py-4 rounded-xl border transition-all font-bold cursor-pointer ${
                  isInFeedback
                    ? opt === activeFeedback?.correctAnswer
                      ? "bg-green-900/40 border-green-600/60 text-green-300"
                      : opt === selected && !activeFeedback?.isCorrect
                      ? "bg-red-900/40 border-red-600/60 text-red-300"
                      : "border-white/10 text-white/40"
                    : selected === opt
                    ? opt === "True" ? "bg-green-900/30 border-green-600/50 text-green-300" : "bg-red-900/30 border-red-600/50 text-red-300"
                    : "border-white/10 hover:border-white/30 hover:bg-white/5 text-white/80"
                }`}
              >
                {opt === "True" ? "✓ True" : "✗ False"}
              </button>
            ))}
          </div>
        )}

        {/* FILL BLANK */}
        {currentQuestion.type === "FILL_BLANK" && (
          <div>
            <input
              type="text"
              value={fillInput}
              onChange={(e) => !isInFeedback && setFillInput(e.target.value)}
              disabled={isInFeedback}
              placeholder="Type your answer..."
              className={`w-full px-4 py-3.5 rounded-xl border bg-white/5 text-white text-lg font-bold focus:outline-none transition-all ${
                isInFeedback
                  ? activeFeedback?.isCorrect
                    ? "border-green-600/60 bg-green-900/20"
                    : "border-red-600/60 bg-red-900/20"
                  : "border-white/20 focus:border-[#CC0000]/60"
              }`}
              autoFocus
            />
          </div>
        )}
      </div>

      {/* Feedback */}
      {isInFeedback && activeFeedback && (
        <div className={`rounded-xl p-4 border ${
          activeFeedback.isCorrect
            ? "bg-green-900/20 border-green-700/40"
            : "bg-red-900/20 border-red-700/40"
        }`}>
          <div className="flex items-start gap-3">
            {activeFeedback.isCorrect
              ? <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              : <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            }
            <div className="flex-1">
              <div className={`font-bold ${activeFeedback.isCorrect ? "text-green-400" : "text-red-400"}`}>
                {activeFeedback.isCorrect
                  ? (isRetry ? "⚡ Comeback King! Brilliant recovery!" : "⚽ GOAL! Brilliant!")
                  : (isRetry ? "Don't worry — check the answer below" : "Not quite — want to understand why?")}
              </div>
              {!activeFeedback.isCorrect && (
                <div className="text-white/60 text-sm mt-0.5">
                  Correct answer: <span className="font-bold text-white">{activeFeedback.correctAnswer}</span>
                </div>
              )}
              {activeFeedback.explanation && (
                <div className="text-white/50 text-sm mt-1">{activeFeedback.explanation}</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Action buttons */}
      {!isInFeedback ? (
        <button
          onClick={isRetry ? handleRetrySubmit : handleSubmit}
          disabled={(!selected && !fillInput) || submitting}
          className="w-full py-4 bg-gradient-to-r from-[#CC0000] to-[#990000] rounded-xl bebas text-xl tracking-widest hover:from-red-600 hover:to-red-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-0.5 cursor-pointer"
        >
          {submitting ? "Checking..." : "Take the Shot ⚽"}
        </button>
      ) : (
        <div className="space-y-2">
          {/* Show Me How button — only on first wrong, not on retry feedback */}
          {phase === "feedback" && !feedbackData?.isCorrect && (
            <button
              onClick={handleShowLesson}
              className="w-full py-3.5 flex items-center justify-center gap-2 bg-gradient-to-r from-[#FFD700]/20 to-[#cc9900]/20 border border-[#FFD700]/40 rounded-xl bebas text-lg tracking-wider text-[#FFD700] hover:border-[#FFD700]/70 hover:bg-[#FFD700]/10 transition-all cursor-pointer"
            >
              <BookOpen className="w-5 h-5" />
              Show Me How 📚
            </button>
          )}
          <button
            onClick={handleNext}
            className="w-full py-4 bg-gradient-to-r from-[#222] to-[#333] border border-white/20 rounded-xl bebas text-xl tracking-widest hover:border-[#CC0000]/40 hover:bg-[#CC0000]/10 transition-all cursor-pointer"
          >
            {currentIdx + 1 < questions.length ? "Next Question →" : "See Results 🏆"}
          </button>
        </div>
      )}
    </div>
  );
}

function ScoreCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="cr7-card rounded-xl p-3 text-center">
      <div className={`bebas text-3xl tracking-wider ${
        color === "gold" ? "text-[#FFD700]" : color === "red" ? "text-[#CC0000]" : "text-white"
      }`}>{value}</div>
      <div className="text-white/40 text-xs">{label}</div>
    </div>
  );
}

function Confetti() {
  const pieces = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    color: i % 3 === 0 ? "#CC0000" : i % 3 === 1 ? "#FFD700" : "#FFFFFF",
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 2}s`,
    duration: `${2 + Math.random() * 2}s`,
    size: `${6 + Math.random() * 10}px`,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute confetti-piece rounded-sm"
          style={{
            left: p.left,
            top: "-20px",
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}
    </div>
  );
}
