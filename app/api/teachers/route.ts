import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { userId, employeeId, department, specialization, qualification, experience, officePhone, emergencyContact, status, hireDate } = await request.json()

    if (!userId || !employeeId) {
      return NextResponse.json({ error: "userId and employeeId are required" }, { status: 400 })
    }

    const user = await prisma.user.findFirst({ where: { id: String(userId), tenantId: session.user.tenantId } })
    if (!user) return NextResponse.json({ error: "User not found in tenant" }, { status: 404 })

    const exists = await prisma.teacher.findUnique({ where: { userId: String(userId) } })
    if (exists) return NextResponse.json({ error: "Teacher already exists for this user" }, { status: 400 })

    const teacher = await prisma.teacher.create({
      data: {
        userId: String(userId),
        employeeId: String(employeeId),
        department: department || null,
        specialization: specialization || null,
        qualification: qualification || null,
        experience: typeof experience === "number" ? experience : null,
        officePhone: officePhone || null,
        emergencyContact: emergencyContact || null,
        status: status || "ACTIVE",
        hireDate: hireDate ? new Date(hireDate) : undefined,
      },
    })
    await prisma.auditLog.create({
      data: {
        tenantId: session.user.tenantId,
        userId: session.user.id,
        action: "CREATE",
        entity: "Teacher",
        entityId: teacher.id,
        newValues: teacher as any,
      },
    })

    return NextResponse.json(teacher, { status: 201 })
  } catch (error) {
    console.error("Create teacher error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
