import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDate } from "@/lib/utils"
import { Users, Calendar, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import StaffDirectory from "@/components/staff/staff-directory"

function leaveBadge(status: string) {
  switch (status) {
    case "PENDING": return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300">Pending</Badge>
    case "APPROVED": return <Badge variant="success">Approved</Badge>
    case "REJECTED": return <Badge variant="destructive">Rejected</Badge>
    case "CANCELLED": return <Badge variant="secondary">Cancelled</Badge>
    default: return <Badge variant="outline">{status}</Badge>
  }
}

function staffBadge(status: string) {
  switch (status) {
    case "ACTIVE": return <Badge variant="success">Active</Badge>
    case "ON_LEAVE": return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">On Leave</Badge>
    case "SUSPENDED": return <Badge variant="destructive">Suspended</Badge>
    case "TERMINATED": return <Badge variant="secondary">Terminated</Badge>
    default: return <Badge variant="outline">{status}</Badge>
  }
}

export default async function StaffPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")

  const isAdmin = ["SUPER_ADMIN", "TENANT_ADMIN", "HR"].includes(session.user.role)
  if (!isAdmin) redirect("/dashboard")

  const [staffRecords, leaveRequests] = await Promise.all([
    prisma.staffRecord.findMany({
      where: { tenantId: session.user.tenantId },
      orderBy: { fullName: "asc" },
    }),
    prisma.leaveRequest.findMany({
      where: { tenantId: session.user.tenantId },
      include: {
        StaffRecord: { select: { fullName: true, department: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ])

  const activeStaff = staffRecords.filter((s: any) => s.status === "ACTIVE").length
  const onLeave = staffRecords.filter((s: any) => s.status === "ON_LEAVE").length
  const pendingLeaves = leaveRequests.filter((l: any) => l.status === "PENDING").length
  const departments = Array.from(new Set(staffRecords.map((s: any) => s.department))) as string[]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
        <p className="text-muted-foreground">Manage staff records, departments, and leave requests</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{staffRecords.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{activeStaff}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Leave</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{onLeave}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Leaves</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{pendingLeaves}</div></CardContent>
        </Card>
      </div>

      <Tabs defaultValue="staff">
        <TabsList>
          <TabsTrigger value="staff">Staff Directory ({staffRecords.length})</TabsTrigger>
          <TabsTrigger value="leaves">Leave Requests ({leaveRequests.length})</TabsTrigger>
          <TabsTrigger value="departments">Departments ({departments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="staff">
          <StaffDirectory staffRecords={staffRecords} staffBadge={staffBadge} />
        </TabsContent>

        <TabsContent value="leaves">
          <Card>
            <CardHeader>
              <CardTitle>Leave Requests</CardTitle>
              <CardDescription>All leave requests and their status</CardDescription>
            </CardHeader>
            <CardContent>
              {leaveRequests.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-1">No leave requests</h3>
                  <p className="text-sm text-muted-foreground">Leave requests will appear here.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Staff Member</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead className="text-center">Days</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaveRequests.map((leave: any) => (
                      <TableRow key={leave.id}>
                        <TableCell className="font-medium">{leave.StaffRecord?.fullName || "N/A"}</TableCell>
                        <TableCell>{leave.StaffRecord?.department}</TableCell>
                        <TableCell><Badge variant="outline" className="text-xs">{leave.leaveType}</Badge></TableCell>
                        <TableCell>{formatDate(leave.startDate)}</TableCell>
                        <TableCell>{formatDate(leave.endDate)}</TableCell>
                        <TableCell className="text-center">{leave.totalDays}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{leave.reason}</TableCell>
                        <TableCell>{leaveBadge(leave.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {departments.map((dept: any) => {
              const deptStaff = staffRecords.filter((s: any) => s.department === dept)
              const active = deptStaff.filter((s: any) => s.status === "ACTIVE").length
              return (
                <Card key={dept}>
                  <CardHeader>
                    <CardTitle className="text-lg">{dept}</CardTitle>
                    <CardDescription>{deptStaff.length} staff member{deptStaff.length !== 1 ? "s" : ""}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                        <span>{active} active</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{deptStaff.length - active} other</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
