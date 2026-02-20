import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const data = await request.json()

    if (!data.subdomain || !data.studentName || !data.guardianEmail || !data.guardianPhone || !data.guardianName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Find tenant by subdomain
    const tenant = await prisma.tenant.findUnique({
      where: { subdomain: data.subdomain },
      select: { id: true, status: true },
    })

    if (!tenant || tenant.status !== "ACTIVE") {
      return NextResponse.json({ error: "School not found or inactive" }, { status: 404 })
    }

    const application = await prisma.application.create({
      data: {
        tenantId: tenant.id,
        studentName: data.studentName,
        dateOfBirth: new Date(data.dateOfBirth),
        gender: data.gender as any,
        guardianName: data.guardianName,
        guardianEmail: data.guardianEmail,
        guardianPhone: data.guardianPhone,
        relationship: (data.relationship as any) || "GUARDIAN",
        address: data.address || null,
        city: data.city || null,
        state: data.state || null,
        previousSchool: data.previousSchool || null,
        desiredGrade: data.desiredGrade || null,
        academicYear: data.academicYear || new Date().getFullYear().toString(),
        status: "SUBMITTED",
      },
    })

    return NextResponse.json({ id: application.id }, { status: 201 })
  } catch (error) {
    console.error("Public application error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
