import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDate } from "@/lib/utils"
import { BookOpen, Plus, Clock } from "lucide-react"
import Link from "next/link"

const statusColors: Record<string, string> = {
  DRAFT: "secondary",
  APPROVED: "success",
  COMPLETED: "default",
  CANCELLED: "destructive",
}

export default async function LessonPlansPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")
  if (!["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "HOD"].includes(session.user.role)) redirect("/dashboard")

  const where: any = {}
  if (session.user.role === "TEACHER") {
    const teacher = await prisma.teacher.findFirst({ where: { userId: session.user.id } })
    if (teacher) where.teacherId = teacher.id
  } else {
    where.Teacher = { User: { tenantId: session.user.tenantId } }
  }

  const rawPlans = await prisma.lessonPlan.findMany({
    where,
    include: {
      Teacher: { include: { User: { select: { name: true } } } },
    },
    orderBy: { scheduledDate: "desc" },
    take: 100,
  })
  const plans = rawPlans.map(({ Teacher, ...rest }: any) => ({
    ...rest,
    teacher: Teacher ? { ...Teacher, user: Teacher.User } : null,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lesson Plans</h1>
          <p className="text-muted-foreground">Plan and organize your lessons</p>
        </div>
        <Link href="/dashboard/lesson-plans/new">
          <Button><Plus className="mr-2 h-4 w-4" />New Lesson Plan</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{plans.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{plans.filter((p: any) => p.status === "DRAFT").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{plans.filter((p: any) => p.status === "APPROVED").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{plans.filter((p: any) => p.status === "COMPLETED").length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>Scheduled</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((plan: any) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium">{plan.title}</TableCell>
                  <TableCell>{plan.subject}</TableCell>
                  <TableCell>{plan.teacher?.user?.name || "—"}</TableCell>
                  <TableCell>{formatDate(plan.scheduledDate)}</TableCell>
                  <TableCell>{plan.duration} min</TableCell>
                  <TableCell>
                    <Badge variant={statusColors[plan.status] as any}>{plan.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
              {plans.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No lesson plans yet. Create your first lesson plan to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
