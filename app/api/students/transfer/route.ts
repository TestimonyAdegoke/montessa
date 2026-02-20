import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { studentId, action, reason, targetSchool, classId } = await req.json()
  if (!studentId || !action) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }

  if (action === "transfer") {
    await prisma.student.update({
      where: { id: studentId },
      data: { status: "TRANSFERRED" } as any,
    })

    await prisma.auditLog.create({
      data: {
        tenantId: session.user.tenantId,
        userId: session.user.id,
        action: "STUDENT_TRANSFERRED",
        entity: "Student",
        entityId: studentId,
        details: { reason, targetSchool } as any,
      } as any,
    })

    return NextResponse.json({ success: true })
  }

  if (action === "readmit") {
    await prisma.student.update({
      where: { id: studentId },
      data: { status: "ACTIVE", classId: classId || undefined } as any,
    })

    await prisma.auditLog.create({
      data: {
        tenantId: session.user.tenantId,
        userId: session.user.id,
        action: "STUDENT_READMITTED",
        entity: "Student",
        entityId: studentId,
        details: { reason, classId } as any,
      } as any,
    })

    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 })
}
