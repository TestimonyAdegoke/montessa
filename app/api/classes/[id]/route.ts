import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const id = params.id
    const body = await request.json()
    const { name, grade, section, academicYear, roomNumber, capacity, status } = body

    const before = await prisma.class.findUnique({ where: { id } })

    const updated = await prisma.class.update({
      where: { id },
      data: {
        name: name ?? undefined,
        grade: grade ?? undefined,
        section: section ?? undefined,
        academicYear: academicYear ?? undefined,
        roomNumber: roomNumber ?? undefined,
        capacity: typeof capacity === "number" ? capacity : undefined,
        status: status ?? undefined,
      },
    })

    await prisma.auditLog.create({
      data: {
        tenantId: session.user.tenantId,
        userId: session.user.id,
        action: "UPDATE",
        entity: "Class",
        entityId: id,
        oldValues: before as any,
        newValues: updated as any,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Update class error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
