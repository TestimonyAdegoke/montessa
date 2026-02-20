import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { classId, teacherId, subject, dayOfWeek, startTime, endTime, roomId, effectiveFrom, effectiveTo } = await request.json()

    if (!classId || typeof dayOfWeek !== "number" || !subject || !startTime || !endTime) {
      return NextResponse.json({ error: "classId, subject, dayOfWeek, startTime, endTime are required" }, { status: 400 })
    }

    // Validate class belongs to tenant
    const cls = await prisma.class.findFirst({ where: { id: String(classId), tenantId: session.user.tenantId } })
    if (!cls) return NextResponse.json({ error: "Class not found" }, { status: 404 })

    // Optional: validate teacher and room
    if (teacherId) {
      const teacher = await prisma.teacher.findFirst({ where: { id: String(teacherId) } })
      if (!teacher) return NextResponse.json({ error: "Teacher not found" }, { status: 404 })
    }

    if (roomId) {
      const room = await prisma.room.findFirst({ where: { id: String(roomId) } })
      if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 })
    }

    const schedule = await prisma.schedule.create({
      data: {
        classId: String(classId),
        teacherId: teacherId ? String(teacherId) : null,
        subject: String(subject),
        dayOfWeek: Number(dayOfWeek),
        startTime: String(startTime),
        endTime: String(endTime),
        roomId: roomId ? String(roomId) : null,
        effectiveFrom: effectiveFrom ? new Date(effectiveFrom) : new Date(),
        effectiveTo: effectiveTo ? new Date(effectiveTo) : null,
      },
    })
    await prisma.auditLog.create({
      data: {
        tenantId: session.user.tenantId,
        userId: session.user.id,
        action: "CREATE",
        entity: "Schedule",
        entityId: schedule.id,
        newValues: schedule as any,
      },
    })

    return NextResponse.json(schedule, { status: 201 })
  } catch (error) {
    console.error("Create schedule error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
