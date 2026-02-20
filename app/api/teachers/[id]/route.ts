import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const id = params.id
    const { department, specialization, qualification, experience, officePhone, emergencyContact, status, hireDate } = await request.json()

    const before = await prisma.teacher.findUnique({ where: { id } })

    const updated = await prisma.teacher.update({
      where: { id },
      data: {
        department: department ?? undefined,
        specialization: specialization ?? undefined,
        qualification: qualification ?? undefined,
        experience: typeof experience === "number" ? experience : undefined,
        officePhone: officePhone ?? undefined,
        emergencyContact: emergencyContact ?? undefined,
        status: status ?? undefined,
        hireDate: hireDate ? new Date(hireDate) : undefined,
      },
    })

    await prisma.auditLog.create({
      data: {
        tenantId: session.user.tenantId,
        userId: session.user.id,
        action: "UPDATE",
        entity: "Teacher",
        entityId: id,
        oldValues: before as any,
        newValues: updated as any,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Update teacher error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const id = params.id
    const before = await prisma.teacher.findUnique({ where: { id } })
    if (!before) return NextResponse.json({ error: "Not found" }, { status: 404 })

    await prisma.teacher.delete({ where: { id } })

    await prisma.auditLog.create({
      data: {
        tenantId: session.user.tenantId,
        userId: session.user.id,
        action: "DELETE",
        entity: "Teacher",
        entityId: id,
        oldValues: before as any,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Delete teacher error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
