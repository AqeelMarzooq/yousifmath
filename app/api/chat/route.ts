import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET — fetch last 60 messages + unread count for this user
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const myRole = session.user.role; // "STUDENT" or "PARENT"
  const otherRole = myRole === "STUDENT" ? "PARENT" : "STUDENT";

  const messages = await prisma.message.findMany({
    orderBy: { createdAt: "asc" },
    take: 60,
  });

  // Unread = messages FROM the other side that haven't been read yet
  const unread = messages.filter((m) => m.senderRole === otherRole && !m.readAt).length;

  return NextResponse.json({ messages, unread });
}

// POST — send a message
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { content } = await req.json();
  if (!content?.trim()) return NextResponse.json({ error: "Empty message" }, { status: 400 });

  const message = await prisma.message.create({
    data: {
      senderId: session.user.id,
      senderRole: session.user.role,
      content: content.trim(),
    },
  });

  return NextResponse.json({ message });
}
