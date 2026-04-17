import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// PATCH — mark all messages FROM the other role as read
export async function PATCH() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const otherRole = session.user.role === "STUDENT" ? "PARENT" : "STUDENT";

  await prisma.message.updateMany({
    where: { senderRole: otherRole, readAt: null },
    data: { readAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
