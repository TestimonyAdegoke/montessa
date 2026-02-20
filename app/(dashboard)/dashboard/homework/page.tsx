import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Clock, CheckCircle2, AlertCircle } from "lucide-react"

function statusBadge(status: string) {
  switch (status) {
    case "DRAFT": return <Badge variant="secondary">Draft</Badge>
    case "PUBLISHED": return <Badge variant="outline">Published</Badge>
    case "ONGOING": return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Ongoing</Badge>
    case "COMPLETED": return <Badge variant="success">Completed</Badge>
    case "ARCHIVED": return <Badge variant="destructive">Archived</Badge>
    default: return <Badge variant="outline">{status}</Badge>
  }
}

export default async function HomeworkPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user || !["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "HOD"].includes(session.user.role)) {
    redirect("/dashboard")
  }

  const rawAssessments = await prisma.assessment.findMany({
    where: {
      Class: { tenantId: session.user.tenantId },
      type: { in: ["ASSIGNMENT", "PROJECT"] },
    },
    include: {
      Class: { select: { name: true, grade: true } },
      Teacher: { include: { User: { select: { name: true } } } },
      AssessmentResult: {
        select: { id: true, status: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })
  const assessments = rawAssessments.map(({ Class, Teacher, AssessmentResult, ...rest }) => ({
    ...rest,
    class: Class,
    teacher: Teacher ? { ...Teacher, user: Teacher.User } : null as any,
    results: AssessmentResult,
  }))

  const now = new Date()
  const upcoming = assessments.filter((a) => a.scheduledDate && new Date(a.scheduledDate) > now && a.status !== "COMPLETED")
  const active = assessments.filter((a) => a.status === "PUBLISHED" || a.status === "ONGOING")
  const completed = assessments.filter((a) => a.status === "COMPLETED" || a.status === "ARCHIVED")

  const totalSubmissions = assessments.reduce((sum, a) => sum + a.results.length, 0)
  const gradedSubmissions = assessments.reduce((sum, a) => sum + a.results.filter((r) => r.status === "GRADED").length, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Homework & Classwork</h1>
        <p className="text-muted-foreground">Track assignments, projects, and student submissions</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assessments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{active.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Submissions</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubmissions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Graded</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gradedSubmissions}</div>
            <p className="text-xs text-muted-foreground">
              {totalSubmissions > 0 ? Math.round((gradedSubmissions / totalSubmissions) * 100) : 0}% complete
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active ({active.length})</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
          <TabsTrigger value="all">All ({assessments.length})</TabsTrigger>
        </TabsList>

        {[
          { key: "active", items: active },
          { key: "upcoming", items: upcoming },
          { key: "completed", items: completed },
          { key: "all", items: assessments },
        ].map(({ key, items }) => (
          <TabsContent key={key} value={key}>
            {items.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-1">No {key} assignments</h3>
                  <p className="text-sm text-muted-foreground">
                    {key === "active" ? "No active homework or classwork right now" : `No ${key} assignments found`}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>{key.charAt(0).toUpperCase() + key.slice(1)} Assignments</CardTitle>
                  <CardDescription>{items.length} assignment(s)</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Teacher</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-center">Due Date</TableHead>
                        <TableHead className="text-center">Submissions</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((a) => (
                        <TableRow key={a.id}>
                          <TableCell className="font-medium">{a.title}</TableCell>
                          <TableCell>{a.subject}</TableCell>
                          <TableCell>{a.class.name}</TableCell>
                          <TableCell>{a.teacher.user.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">{a.type}</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            {a.scheduledDate
                              ? new Date(a.scheduledDate).toLocaleDateString()
                              : "—"}
                          </TableCell>
                          <TableCell className="text-center">
                            {a.results.length}
                          </TableCell>
                          <TableCell className="text-center">
                            {statusBadge(a.status)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
