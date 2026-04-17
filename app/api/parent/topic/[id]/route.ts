import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "PARENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const topicId = params.id;

  const student = await prisma.user.findUnique({ where: { username: "yousif" } });
  if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

  // Get topic
  const topic = await prisma.topic.findUnique({ where: { id: topicId } });
  if (!topic) return NextResponse.json({ error: "Topic not found" }, { status: 404 });

  // Get all questions for the topic, grouped by level
  const questions = await prisma.question.findMany({
    where: { topicId },
    orderBy: [{ level: "asc" }, { id: "asc" }],
    include: {
      answers: {
        where: { session: { userId: student.id } },
        include: { session: { select: { completedAt: true, level: true } } },
        orderBy: { session: { completedAt: "desc" } },
      },
    },
  });

  // Get attempt sessions for this topic
  const sessions = await prisma.attemptSession.findMany({
    where: { userId: student.id, topicId },
    orderBy: { completedAt: "desc" },
  });

  const LEVEL_ORDER = ["FLUENCY", "SKILL", "DEPTH"];

  const grouped = LEVEL_ORDER.map((level) => {
    const qs = questions.filter((q) => q.level === level);
    const levelSessions = sessions.filter((s) => s.level === level);
    const bestSession = levelSessions[0] ?? null;

    return {
      level,
      attempted: levelSessions.length > 0,
      attempts: levelSessions.length,
      bestScore: bestSession
        ? Math.round((bestSession.score / bestSession.totalQs) * 100)
        : null,
      lastAttempt: bestSession?.completedAt ?? null,
      questions: qs.map((q) => {
        const options = q.options ? JSON.parse(q.options) : null;
        // Most recent answer for this question
        const latestAnswer = q.answers[0] ?? null;
        // All attempts (deduplicated by session)
        const attempts = q.answers.map((a) => ({
          given: a.given,
          isCorrect: a.isCorrect,
          answeredAt: a.session.completedAt,
        }));

        return {
          id: q.id,
          questionText: q.questionText,
          type: q.type,
          level: q.level,
          options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          xpValue: q.xpValue,
          latestAnswer: latestAnswer
            ? { given: latestAnswer.given, isCorrect: latestAnswer.isCorrect }
            : null,
          totalAttempts: attempts.length,
          correctCount: attempts.filter((a) => a.isCorrect).length,
          history: attempts.slice(0, 5),
        };
      }),
    };
  });

  return NextResponse.json({ topic, grouped, totalSessions: sessions.length });
}
