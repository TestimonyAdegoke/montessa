import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { CheckInClient } from "@/components/checkin/checkin-client"

export default async function CheckInPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")
  if (!["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "HR"].includes(session.user.role)) redirect("/dashboard")

  const students = await prisma.student.findMany({
    where: { tenantId: session.user.tenantId, studentStatus: "ACTIVE" },
    select: {
      id: true,
      legalName: true,
      preferredName: true,
      admissionNumber: true,
      Class: { select: { name: true } },
    },
    orderBy: { legalName: "asc" },
  })

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const todayRecords = await prisma.attendanceRecord.findMany({
    where: {
      tenantId: session.user.tenantId,
      date: { gte: today, lt: tomorrow },
    },
    select: { studentId: true, status: true },
  })

  const studentList = students.map((s: any) => ({
    id: s.id,
    name: s.preferredName || s.legalName,
    admissionNumber: s.admissionNumber,
    className: s.currentClass?.name || "Unassigned",
  }))

  const todayMap: Record<string, string> = {}
  todayRecords.forEach((r: any) => { todayMap[r.studentId] = r.status })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Check-In / Check-Out</h1>
        <p className="text-muted-foreground">QR code kiosk mode for student attendance</p>
      </div>
      <CheckInClient
        students={studentList}
        todayAttendance={todayMap}
        tenantId={session.user.tenantId}
      />
    </div>
  )
}
