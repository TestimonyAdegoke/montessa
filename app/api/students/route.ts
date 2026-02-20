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
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const search = searchParams.get("search") || ""
    const classId = searchParams.get("classId") || ""
    const skip = (page - 1) * limit

    const where: any = { tenantId: session.user.tenantId }

    if (search) {
      where.OR = [
        { legalName: { contains: search, mode: "insensitive" } },
        { User: { name: { contains: search, mode: "insensitive" } } },
        { admissionNumber: { contains: search, mode: "insensitive" } },
      ]
    }

    if (classId) {
      where.currentClassId = classId
    }

    const [rawStudents, total] = await Promise.all([
      prisma.student.findMany({
        where,
        include: {
          User: { select: { name: true, email: true, image: true } },
          Class: { select: { name: true, grade: true } },
        },
        orderBy: { User: { name: "asc" } },
        skip,
        take: limit,
      }),
      prisma.student.count({ where }),
    ])
    const students = rawStudents.map(({ User, Class, ...rest }) => ({
      ...rest,
      user: User,
      currentClass: Class,
    }))

    return NextResponse.json({
      data: students,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error("Get students error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
