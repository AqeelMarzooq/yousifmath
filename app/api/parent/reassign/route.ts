import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// How many questions to keep active per level (matches original A-pool sizes)
const ACTIVE_COUNT: Record<string, number> = {
  FLUENCY: 5,
  SKILL: 8,
  DEPTH: 4,
};

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "PARENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { topicId, level, resetProgress, rerollQuestions } = await req.json();
  if (!topicId || !level) {
    return NextResponse.json({ error: "Missing topicId or level" }, { status: 400 });
  }

  const student = await prisma.user.findUnique({ where: { username: "yousif" } });
  if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

  // ── 1. Reset progress ──────────────────────────────────────────────────────
  if (resetProgress) {
    // Find all sessions for this topic + level
    const sessions = await prisma.attemptSession.findMany({
      where: { userId: student.id, topicId, level },
      select: { id: true },
    });
    const sessionIds = sessions.map((s) => s.id);

    if (sessionIds.length > 0) {
      // Delete answers first (FK constraint)
      await prisma.answer.deleteMany({ where: { sessionId: { in: sessionIds } } });
      await prisma.attemptSession.deleteMany({ where: { id: { in: sessionIds } } });
    }
  }

  // ── 2. Re-roll questions ───────────────────────────────────────────────────
  if (rerollQuestions) {
    // Get ALL questions for this topic + level (active and inactive)
    const all = await prisma.question.findMany({
      where: { topicId, level },
      select: { id: true, isActive: true },
    });

    // Shuffle using Fisher-Yates
    const shuffled = [...all].sort(() => Math.random() - 0.5);
    const n = ACTIVE_COUNT[level] ?? 5;
    const toActivate = new Set(shuffled.slice(0, n).map((q) => q.id));

    // Set active/inactive in batch
    await prisma.question.updateMany({
      where: { topicId, level, id: { in: Array.from(toActivate) } },
      data: { isActive: true },
    });
    await prisma.question.updateMany({
      where: { topicId, level, id: { notIn: Array.from(toActivate) } },
      data: { isActive: false },
    });
  }

  return NextResponse.json({ ok: true });
}
