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
    const classes = await prisma.class.findMany({
      where: {
        tenantId: session.user.tenantId,
        status: "ACTIVE",
      },
      select: {
        id: true,
        name: true,
        grade: true,
        capacity: true,
        roomNumber: true,
        _count: {
          select: {
            Student: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json(classes)
  } catch (error) {
    console.error("Get classes error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      grade,
      section,
      academicYear,
      roomNumber,
      capacity,
      teacherId,
      description, // currently unused in schema, kept for forward-compat
      status,
    } = body

    if (!name || !academicYear) {
      return NextResponse.json({ error: "name and academicYear are required" }, { status: 400 })
    }

    const created = await prisma.$transaction(async (tx: any) => {
      const cls = await tx.class.create({
        data: {
          tenantId: session.user.tenantId,
          name,
          grade: grade || null,
          section: section || null,
          academicYear,
          roomNumber: roomNumber || null,
          capacity: typeof capacity === "number" ? capacity : 30,
          status: status || "ACTIVE",
        },
      })

      if (teacherId) {
        await tx.classTeacher.create({
          data: {
            classId: cls.id,
            teacherId: String(teacherId),
            isPrimary: true,
          },
        })
      }

      return cls
    })

    // Audit log
    await prisma.auditLog.create({
      data: {
        tenantId: session.user.tenantId,
        userId: session.user.id,
        action: "CREATE",
        entity: "Class",
        entityId: created.id,
        newValues: created as any,
      },
    })

    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    console.error("Create class error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
