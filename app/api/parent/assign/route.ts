import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "PARENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { topicId, assigned } = await req.json();
  await prisma.topic.update({ where: { id: topicId }, data: { isAssigned: assigned } });
  return NextResponse.json({ ok: true });
}
