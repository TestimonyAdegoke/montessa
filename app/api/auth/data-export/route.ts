import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const rawUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        Student: {
          select: {
            legalName: true,
            dateOfBirth: true,
            gender: true,
            admissionNumber: true,
            admissionDate: true,
            bloodGroup: true,
            medicalConditions: true,
            allergies: true,
            address: true,
            Class: { select: { name: true, grade: true } },
            AttendanceRecord: {
              select: { date: true, status: true },
              orderBy: { date: "desc" },
              take: 100,
            },
            AssessmentResult: {
              select: {
                Assessment: { select: { title: true, subject: true } },
                obtainedMarks: true,
                totalMarks: true,
                percentage: true,
                grade: true,
                status: true,
              },
            },
          },
        },
        Guardian: {
          select: {
            occupation: true,
            address: true,
            StudentGuardian: {
              select: {
                relationship: true,
                Student: {
                  select: {
                    legalName: true,
                    admissionNumber: true,
                    User: { select: { name: true } },
                  },
                },
              },
            },
          },
        },
        Teacher: {
          select: {
            employeeId: true,
            department: true,
            specialization: true,
            qualification: true,
            hireDate: true,
          },
        },
      },
    })

    if (!rawUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const exportData = {
      exportedAt: new Date().toISOString(),
      format: "GDPR Data Export",
      user: {
        ...rawUser,
        studentProfile: rawUser.Student || undefined,
        guardianProfile: rawUser.Guardian || undefined,
        teacherProfile: rawUser.Teacher || undefined,
      },
    }

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="data-export-${session.user.id}.json"`,
      },
    })
  } catch (error) {
    console.error("Data export error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
