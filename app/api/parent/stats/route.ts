import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getLevel } from "@/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "PARENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const student = await prisma.user.findUnique({ where: { username: "yousif" } });
  if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

  const sessions = await prisma.attemptSession.findMany({
    where: { userId: student.id },
    include: { topic: true, answers: { include: { question: true } } },
    orderBy: { completedAt: "desc" },
  });

  const totalXP = sessions.reduce((s, a) => s + a.xpEarned, 0);
  const totalQs = sessions.reduce((s, a) => s + a.totalQs, 0);
  const correct = sessions.reduce((s, a) => s + a.score, 0);
  const totalTime = sessions.reduce((s, a) => s + a.duration, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const uniqueDays = new Set(
    sessions.map((s) => {
      const d = new Date(s.completedAt);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    })
  );
  let streak = 0;
  const checkDay = new Date(today);
  while (uniqueDays.has(checkDay.getTime())) {
    streak++;
    checkDay.setDate(checkDay.getDate() - 1);
  }

  const topics = await prisma.topic.findMany({ orderBy: { order: "asc" } });
  const topicStats = topics.map((t) => {
    const topicSessions = sessions.filter((s) => s.topicId === t.id);
    const completedLevels = new Set(topicSessions.map((s) => s.level));
    const completionPct = (completedLevels.size / 3) * 100;
    const avgScore =
      topicSessions.length > 0
        ? topicSessions.reduce((sum, s) => sum + (s.totalQs > 0 ? (s.score / s.totalQs) * 100 : 0), 0) / topicSessions.length
        : 0;
    const timeSpent = topicSessions.reduce((s, a) => s + a.duration, 0);
    return {
      id: t.id,
      title: t.title,
      lo: t.lo,
      order: t.order,
      isAssigned: t.isAssigned,
      completionPct: Math.round(completionPct),
      avgScore: Math.round(avgScore),
      attempts: topicSessions.length,
      timeSpent,
      lastAttempt: topicSessions[0]?.completedAt ?? null,
      isWeak: topicSessions.length > 0 && avgScore < 60,
      isStrong: topicSessions.length > 0 && avgScore >= 80,
    };
  });

  return NextResponse.json({
    student: { id: student.id, username: student.username },
    totalXP,
    level: getLevel(totalXP),
    streak,
    totalQs,
    correct,
    accuracy: totalQs > 0 ? Math.round((correct / totalQs) * 100) : 0,
    totalTime,
    topicsCompleted: topicStats.filter((t) => t.completionPct === 100).length,
    topicStats,
    recentSessions: sessions.slice(0, 20).map((s) => ({
      id: s.id,
      topicTitle: s.topic.title,
      level: s.level,
      score: s.score,
      totalQs: s.totalQs,
      xpEarned: s.xpEarned,
      duration: s.duration,
      completedAt: s.completedAt,
      pct: s.totalQs > 0 ? Math.round((s.score / s.totalQs) * 100) : 0,
    })),
    weakAreas: topicStats.filter((t) => t.isWeak).map((t) => t.title),
    strongAreas: topicStats.filter((t) => t.isStrong).map((t) => t.title),
  });
}
