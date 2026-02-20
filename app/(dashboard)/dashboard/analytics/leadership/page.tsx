import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, GraduationCap, DollarSign, TrendingUp, BarChart3, AlertTriangle } from "lucide-react"

export default async function LeadershipDashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) redirect("/dashboard")

  const tenantId = session.user.tenantId

  const [
    totalStudents,
    activeStudents,
    totalTeachers,
    totalGuardians,
    totalClasses,
    totalInvoices,
    paidInvoices,
    pendingInvoices,
    overdueInvoices,
    recentEnrollments,
    attendanceRecords,
  ] = await Promise.all([
    prisma.student.count({ where: { tenantId } }),
    prisma.student.count({ where: { tenantId, studentStatus: "ACTIVE" } }),
    prisma.user.count({ where: { tenantId, role: "TEACHER", isActive: true } }),
    prisma.guardian.count({ where: { tenantId } }),
    prisma.class.count({ where: { tenantId } }),
    prisma.invoice.count({ where: { tenantId } }),
    prisma.invoice.count({ where: { tenantId, status: "PAID" } }),
    prisma.invoice.count({ where: { tenantId, status: "PENDING" } }),
    prisma.invoice.count({ where: { tenantId, status: "OVERDUE" } }),
    prisma.student.count({
      where: {
        tenantId,
        admissionDate: { gte: new Date(new Date().getFullYear(), new Date().getMonth() - 3, 1) },
      },
    }),
    prisma.attendanceRecord.findMany({
      where: {
        tenantId,
        date: { gte: new Date(new Date().setDate(new Date().getDate() - 30)) },
      },
      select: { status: true },
    }),
  ])

  const attendancePresent = attendanceRecords.filter((r: any) => r.status === "PRESENT").length
  const attendanceRate = attendanceRecords.length > 0
    ? Math.round((attendancePresent / attendanceRecords.length) * 100)
    : 0

  const collectionRate = totalInvoices > 0
    ? Math.round((paidInvoices / totalInvoices) * 100)
    : 0

  const genderStats = await prisma.student.groupBy({
    by: ["gender"],
    where: { tenantId, studentStatus: "ACTIVE" },
    _count: { id: true },
  })

  const genderMap: Record<string, number> = {}
  genderStats.forEach((g: any) => { genderMap[g.gender] = g._count.id })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Leadership Dashboard</h1>
        <p className="text-muted-foreground">High-level overview of your institution&apos;s performance</p>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="enrollment">Enrollment</TabsTrigger>
          <TabsTrigger value="finance">Finance</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeStudents}</div>
                <p className="text-xs text-muted-foreground">{totalStudents} total (incl. inactive)</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Teachers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalTeachers}</div>
                <p className="text-xs text-muted-foreground">Ratio: 1:{activeStudents > 0 && totalTeachers > 0 ? Math.round(activeStudents / totalTeachers) : "N/A"}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{attendanceRate}%</div>
                <p className="text-xs text-muted-foreground">Last 30 days average</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{collectionRate}%</div>
                <p className="text-xs text-muted-foreground">{paidInvoices} of {totalInvoices} invoices paid</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Classes</span>
                  <span className="font-semibold">{totalClasses}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Guardians</span>
                  <span className="font-semibold">{totalGuardians}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Recent Enrollments (3mo)</span>
                  <span className="font-semibold">{recentEnrollments}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Gender Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(genderMap).map(([gender, count]) => (
                  <div key={gender} className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground capitalize">{gender.toLowerCase()}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{count}</span>
                      <Badge variant="outline" className="text-xs">
                        {activeStudents > 0 ? Math.round((count / activeStudents) * 100) : 0}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="enrollment" className="space-y-4 mt-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Students</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeStudents}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New This Quarter</CardTitle>
                <GraduationCap className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{recentEnrollments}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Student:Teacher Ratio</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {totalTeachers > 0 ? `${Math.round(activeStudents / totalTeachers)}:1` : "N/A"}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="finance" className="space-y-4 mt-4">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent><div className="text-2xl font-bold">{totalInvoices}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Paid</CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent><div className="text-2xl font-bold text-green-600">{paidInvoices}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <DollarSign className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent><div className="text-2xl font-bold text-amber-600">{pendingInvoices}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent><div className="text-2xl font-bold text-red-600">{overdueInvoices}</div></CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4 mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Attendance Overview (30 Days)</CardTitle>
                <CardDescription>Based on {attendanceRecords.length} records</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Present</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: `${attendanceRate}%` }} />
                    </div>
                    <span className="font-semibold text-sm">{attendanceRate}%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Absent</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full" style={{ width: `${100 - attendanceRate}%` }} />
                    </div>
                    <span className="font-semibold text-sm">{100 - attendanceRate}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Fee Collection</CardTitle>
                <CardDescription>Overall collection performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Collected</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: `${collectionRate}%` }} />
                    </div>
                    <span className="font-semibold text-sm">{collectionRate}%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Outstanding</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${100 - collectionRate}%` }} />
                    </div>
                    <span className="font-semibold text-sm">{100 - collectionRate}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
