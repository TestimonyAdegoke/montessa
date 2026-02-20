import { NextResponse } from "next/server"
import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const searchParams = request.nextUrl.searchParams
    const folder = searchParams.get("folder") || "inbox"
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    const where = folder === "sent"
      ? { tenantId: session.user.tenantId, senderId: session.user.id }
      : { tenantId: session.user.tenantId, recipientId: session.user.id }

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where,
        include: {
          User_Message_senderIdToUser: { select: { name: true, email: true, image: true } },
          User_Message_recipientIdToUser: { select: { name: true, email: true, image: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.message.count({ where }),
    ])

    return NextResponse.json({
      data: messages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get messages error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { recipientId, subject, content } = await request.json()

    if (!recipientId || !content) {
      return NextResponse.json({ error: "recipientId and content are required" }, { status: 400 })
    }

    const msg = await prisma.message.create({
      data: {
        tenantId: session.user.tenantId,
        senderId: session.user.id,
        recipientId: String(recipientId),
        subject: subject || null,
        content: String(content),
        attachments: [],
      },
    })

    // Audit log
    await prisma.auditLog.create({
      data: {
        tenantId: session.user.tenantId,
        userId: session.user.id,
        action: "CREATE",
        entity: "Message",
        entityId: msg.id,
        newValues: msg as any,
      },
    })

    return NextResponse.json(msg, { status: 201 })
  } catch (error) {
    console.error("Send message error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
