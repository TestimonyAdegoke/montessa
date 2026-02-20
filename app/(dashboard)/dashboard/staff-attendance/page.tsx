import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StaffAttendanceClient } from "@/components/staff-attendance/staff-attendance-client"
import { Users, UserCheck, Clock, UserX } from "lucide-react"

export default async function StaffAttendancePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")
  if (!["SUPER_ADMIN", "TENANT_ADMIN", "HR"].includes(session.user.role)) redirect("/dashboard")

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const staff = await prisma.user.findMany({
    where: {
      tenantId: session.user.tenantId,
      role: { in: ["TEACHER", "HOD", "HR", "FINANCE"] },
      isActive: true,
    },
    select: { id: true, name: true, email: true, role: true, image: true },
    orderBy: { name: "asc" },
  })

  const todayRecords = await prisma.staffAttendance.findMany({
    where: {
      tenantId: session.user.tenantId,
      date: { gte: today, lt: tomorrow },
    },
  })

  const present = todayRecords.filter((r: any) => r.status === "PRESENT").length
  const late = todayRecords.filter((r: any) => r.status === "LATE").length
  const absent = staff.length - todayRecords.length

  const staffList = staff.map((s: any) => ({
    id: s.id,
    name: s.name || s.email,
    email: s.email,
    role: s.role,
    image: s.image,
  }))

  const attendanceMap: Record<string, { status: string; checkIn: string | null; checkOut: string | null }> = {}
  todayRecords.forEach((r: any) => {
    attendanceMap[r.userId] = {
      status: r.status,
      checkIn: r.checkInTime?.toISOString() || null,
      checkOut: r.checkOutTime?.toISOString() || null,
    }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Staff Attendance</h1>
        <p className="text-muted-foreground">Track daily staff attendance and check-in/out times</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{staff.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{present}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Late</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-amber-600">{late}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Not Marked</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{absent}</div></CardContent>
        </Card>
      </div>

      <StaffAttendanceClient staff={staffList} attendanceMap={attendanceMap} />
    </div>
  )
}
