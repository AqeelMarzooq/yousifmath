import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const topicId = searchParams.get("topicId");
  const level = searchParams.get("level");

  if (!topicId || !level) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  const questions = await prisma.question.findMany({
    where: { topicId, level },
    select: {
      id: true,
      questionText: true,
      type: true,
      options: true,
      xpValue: true,
      level: true,
    },
  });

  return NextResponse.json({ questions });
}
