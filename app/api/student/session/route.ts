import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { topicId, level, score, totalQs, xpEarned, duration, answers } = body;

  const attemptSession = await prisma.attemptSession.create({
    data: {
      userId: session.user.id,
      topicId,
      level,
      score,
      totalQs,
      xpEarned,
      duration,
      answers: {
        create: answers.map((a: { questionId: string; given: string; isCorrect: boolean }) => ({
          questionId: a.questionId,
          given: a.given,
          isCorrect: a.isCorrect,
        })),
      },
    },
  });

  return NextResponse.json({ sessionId: attemptSession.id, ok: true });
}
