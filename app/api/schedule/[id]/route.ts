import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const id = params.id
    const { classId, teacherId, subject, dayOfWeek, startTime, endTime, roomId, effectiveFrom, effectiveTo } = await request.json()

    const before = await prisma.schedule.findUnique({ where: { id } })

    const updated = await prisma.schedule.update({
      where: { id },
      data: {
        classId: classId ?? undefined,
        teacherId: teacherId === null ? null : teacherId ?? undefined,
        subject: subject ?? undefined,
        dayOfWeek: typeof dayOfWeek === "number" ? dayOfWeek : undefined,
        startTime: startTime ?? undefined,
        endTime: endTime ?? undefined,
        roomId: roomId === null ? null : roomId ?? undefined,
        effectiveFrom: effectiveFrom ? new Date(effectiveFrom) : undefined,
        effectiveTo: effectiveTo === null ? null : effectiveTo ? new Date(effectiveTo) : undefined,
      },
    })

    await prisma.auditLog.create({
      data: {
        tenantId: session.user.tenantId,
        userId: session.user.id,
        action: "UPDATE",
        entity: "Schedule",
        entityId: id,
        oldValues: before as any,
        newValues: updated as any,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Update schedule error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const id = params.id
    const before = await prisma.schedule.findUnique({ where: { id } })
    if (!before) return NextResponse.json({ error: "Not found" }, { status: 404 })

    await prisma.schedule.delete({ where: { id } })

    await prisma.auditLog.create({
      data: {
        tenantId: session.user.tenantId,
        userId: session.user.id,
        action: "DELETE",
        entity: "Schedule",
        entityId: id,
        oldValues: before as any,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Delete schedule error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
