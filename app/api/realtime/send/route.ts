import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { pushToUser } from "@/lib/realtime"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { recipientId, content, type } = await req.json()
  if (!recipientId || !content) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }

  const message = await prisma.message.create({
    data: {
      tenantId: session.user.tenantId,
      senderId: session.user.id,
      recipientId,
      subject: type === "typing" ? "" : "Direct Message",
      content,
    },
  })

  pushToUser(recipientId, {
    type: "message",
    data: {
      id: message.id,
      senderId: session.user.id,
      senderName: session.user.name || session.user.email,
      content,
    },
    userId: session.user.id,
    timestamp: new Date().toISOString(),
  })

  return NextResponse.json({ success: true, messageId: message.id })
}
