import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDate } from "@/lib/utils"
import { FileText, Clock, CheckCircle, XCircle, Users } from "lucide-react"
import Link from "next/link"

const statusColors: Record<string, string> = {
  SUBMITTED: "default",
  UNDER_REVIEW: "secondary",
  WAITLISTED: "outline",
  ACCEPTED: "success",
  REJECTED: "destructive",
  ENROLLED: "success",
  WITHDRAWN: "secondary",
}

export default async function AdmissionsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) redirect("/dashboard")

  const applications = await prisma.application.findMany({
    where: { tenantId: session.user.tenantId },
    orderBy: { createdAt: "desc" },
  })

  const stats = {
    total: applications.length,
    submitted: applications.filter((a: any) => a.status === "SUBMITTED").length,
    underReview: applications.filter((a: any) => a.status === "UNDER_REVIEW").length,
    accepted: applications.filter((a: any) => a.status === "ACCEPTED").length,
    rejected: applications.filter((a: any) => a.status === "REJECTED").length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admissions</h1>
          <p className="text-muted-foreground">Manage student applications and enrollment</p>
        </div>
        <Link href="/dashboard/admissions/new">
          <Button><FileText className="mr-2 h-4 w-4" />New Application</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.total}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.submitted}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Under Review</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.underReview}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accepted</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.accepted}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.rejected}</div></CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({stats.submitted})</TabsTrigger>
          <TabsTrigger value="review">Under Review ({stats.underReview})</TabsTrigger>
          <TabsTrigger value="accepted">Accepted ({stats.accepted})</TabsTrigger>
        </TabsList>

        {["all", "pending", "review", "accepted"].map((tab) => (
          <TabsContent key={tab} value={tab}>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Guardian</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Applied</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications
                      .filter((a: any) => {
                        if (tab === "all") return true
                        if (tab === "pending") return a.status === "SUBMITTED"
                        if (tab === "review") return a.status === "UNDER_REVIEW"
                        if (tab === "accepted") return a.status === "ACCEPTED"
                        return true
                      })
                      .map((app: any) => (
                        <TableRow key={app.id}>
                          <TableCell className="font-medium">{app.studentName}</TableCell>
                          <TableCell>{app.guardianName}<br /><span className="text-xs text-muted-foreground">{app.guardianEmail}</span></TableCell>
                          <TableCell>{app.desiredGrade || "—"}</TableCell>
                          <TableCell><Badge variant={statusColors[app.status] as any}>{app.status.replace("_", " ")}</Badge></TableCell>
                          <TableCell>{formatDate(app.createdAt)}</TableCell>
                          <TableCell>
                            <Link href={`/dashboard/admissions/${app.id}`}>
                              <Button variant="outline" size="sm">Review</Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    {applications.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No applications yet. Share your admissions portal link to start receiving applications.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
