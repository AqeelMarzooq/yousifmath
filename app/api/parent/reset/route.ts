import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "PARENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const student = await prisma.user.findUnique({ where: { username: "yousif" } });
  if (!student) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.answer.deleteMany({
    where: { session: { userId: student.id } },
  });
  await prisma.attemptSession.deleteMany({ where: { userId: student.id } });

  return NextResponse.json({ ok: true });
}
