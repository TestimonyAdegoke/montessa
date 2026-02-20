import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getClassAttendance } from "@/lib/actions/attendance"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const classId = searchParams.get("classId")
    const dateStr = searchParams.get("date")

    if (!classId || !dateStr) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const date = new Date(dateStr)
    const students = await getClassAttendance(classId, date)

    return NextResponse.json(students)
  } catch (error) {
    console.error("Get class attendance error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
