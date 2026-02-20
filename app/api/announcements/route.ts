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
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    const where = { tenantId: session.user.tenantId }

    const [announcements, total] = await Promise.all([
      prisma.announcement.findMany({
        where,
        include: { User: { select: { name: true, image: true } } },
        orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
      prisma.announcement.count({ where }),
    ])

    return NextResponse.json({
      data: announcements,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error("Get announcements error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, content, audience, targetGroups, priority, isPinned } = await request.json()

    if (!title || !content || !audience) {
      return NextResponse.json({ error: "title, content, and audience are required" }, { status: 400 })
    }

    const announcement = await prisma.announcement.create({
      data: {
        tenantId: session.user.tenantId,
        authorId: session.user.id,
        title,
        content,
        audience,
        targetGroups: targetGroups || [],
        priority: priority || "NORMAL",
        isPinned: isPinned || false,
        attachments: [],
        publishedAt: new Date(),
      },
    })

    return NextResponse.json(announcement, { status: 201 })
  } catch (error) {
    console.error("Create announcement error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
