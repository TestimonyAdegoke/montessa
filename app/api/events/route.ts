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
    const month = searchParams.get("month") ? parseInt(searchParams.get("month")!) : undefined
    const year = searchParams.get("year") ? parseInt(searchParams.get("year")!) : undefined
    const type = searchParams.get("type") || undefined

    const now = new Date()
    const targetYear = year || now.getFullYear()
    const targetMonth = month !== undefined ? month : now.getMonth()

    const startOfMonth = new Date(targetYear, targetMonth, 1)
    const endOfMonth = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59)

    const where: any = {
      tenantId: session.user.tenantId,
      OR: [
        { startDate: { gte: startOfMonth, lte: endOfMonth } },
        { endDate: { gte: startOfMonth, lte: endOfMonth } },
        { AND: [{ startDate: { lte: startOfMonth } }, { endDate: { gte: endOfMonth } }] },
      ],
    }

    if (type) where.type = type

    const events = await prisma.event.findMany({
      where,
      orderBy: { startDate: "asc" },
    })

    return NextResponse.json({ data: events })
  } catch (error) {
    console.error("Get events error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "HOD"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    if (!body.title || !body.startDate || !body.endDate || !body.type) {
      return NextResponse.json({ error: "title, startDate, endDate, and type are required" }, { status: 400 })
    }

    const event = await prisma.event.create({
      data: {
        tenantId: session.user.tenantId,
        createdBy: session.user.id,
        title: body.title,
        description: body.description || null,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        allDay: body.allDay || false,
        location: body.location || null,
        isVirtual: body.isVirtual || false,
        meetingLink: body.meetingLink || null,
        type: body.type,
        audience: body.audience || "ALL",
        targetGroups: body.targetGroups || [],
        color: body.color || null,
        status: "SCHEDULED",
      },
    })

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error("Create event error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
