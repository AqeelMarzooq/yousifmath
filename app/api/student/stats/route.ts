import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getLevel } from "@/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const sessions = await prisma.attemptSession.findMany({
    where: { userId },
    include: { topic: true },
    orderBy: { completedAt: "desc" },
  });

  const totalXP = sessions.reduce((s, a) => s + a.xpEarned, 0);
  const totalQuestions = sessions.reduce((s, a) => s + a.totalQs, 0);
  const correctAnswers = sessions.reduce((s, a) => s + a.score, 0);

  // Streak calculation
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

  // Per-topic stats
  const topics = await prisma.topic.findMany({ orderBy: { order: "asc" } });
  const topicStats = topics.map((t) => {
    const topicSessions = sessions.filter((s) => s.topicId === t.id);
    const levels = ["FLUENCY", "SKILL", "DEPTH"];
    const completedLevels = new Set(topicSessions.map((s) => s.level));
    const completionPct = (completedLevels.size / 3) * 100;
    const avgScore =
      topicSessions.length > 0
        ? topicSessions.reduce((sum, s) => sum + (s.totalQs > 0 ? (s.score / s.totalQs) * 100 : 0), 0) / topicSessions.length
        : 0;
    return {
      id: t.id,
      title: t.title,
      lo: t.lo,
      order: t.order,
      isAssigned: t.isAssigned,
      completionPct: Math.round(completionPct),
      avgScore: Math.round(avgScore),
      attempts: topicSessions.length,
      lastAttempt: topicSessions[0]?.completedAt ?? null,
    };
  });

  const badges = [];
  if (totalXP >= 10) badges.push("first_goal");
  if (sessions.some((s, i) => {
    const sorted = sessions.slice(i, i + 3);
    return sorted.length === 3 && sorted.every((ss) => ss.score === ss.totalQs);
  })) badges.push("hat_trick");
  if (sessions.some((s) => s.score === s.totalQs && s.totalQs > 0)) badges.push("clean_sheet");
  if (topicStats.every((t) => t.completionPct === 100)) badges.push("champions_league");

  return NextResponse.json({
    totalXP,
    level: getLevel(totalXP),
    streak,
    totalQuestions,
    correctAnswers,
    accuracy: totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0,
    topicStats,
    recentSessions: sessions.slice(0, 10).map((s) => ({
      id: s.id,
      topicTitle: s.topic.title,
      level: s.level,
      score: s.score,
      totalQs: s.totalQs,
      xpEarned: s.xpEarned,
      duration: s.duration,
      completedAt: s.completedAt,
    })),
    badges,
  });
}
