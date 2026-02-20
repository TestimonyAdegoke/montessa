import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDate } from "@/lib/utils"
import { VisitorClient } from "@/components/visitors/visitor-client"
import { UserCheck, UserX, Clock, Users } from "lucide-react"

export default async function VisitorsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")
  if (!["SUPER_ADMIN", "TENANT_ADMIN", "HR"].includes(session.user.role)) redirect("/dashboard")

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const [visitors, todayCount, currentlyIn] = await Promise.all([
    prisma.visitor.findMany({
      where: { tenantId: session.user.tenantId },
      orderBy: { checkInTime: "desc" },
      take: 100,
    }),
    prisma.visitor.count({
      where: { tenantId: session.user.tenantId, checkInTime: { gte: today, lt: tomorrow } },
    }),
    prisma.visitor.count({
      where: { tenantId: session.user.tenantId, status: "CHECKED_IN" },
    }),
  ])

  const serialized = visitors.map((v: any) => ({
    id: v.id,
    fullName: v.fullName,
    phone: v.phone,
    email: v.email,
    company: v.company,
    purpose: v.purpose,
    hostName: v.hostName,
    hostDepartment: v.hostDepartment,
    badgeNumber: v.badgeNumber,
    status: v.status,
    checkInTime: v.checkInTime.toISOString(),
    checkOutTime: v.checkOutTime?.toISOString() || null,
    notes: v.notes,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Visitor Management</h1>
        <p className="text-muted-foreground">Track and manage all visitors to your campus</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Visitors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{todayCount}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Currently On-Site</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{currentlyIn}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{visitors.length}</div></CardContent>
        </Card>
      </div>

      <VisitorClient visitors={serialized} />
    </div>
  )
}
