import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import AssessmentsTable from "@/components/assessments/assessments-table"

async function getAssessments(tenantId: string) {
  const assessments = await prisma.assessment.findMany({
    where: {
      Class: {
        tenantId,
      },
    },
    include: {
      Class: { select: { name: true } },
      Teacher: {
        include: {
          User: {
            select: { name: true },
          },
        },
      },
      AssessmentResult: {
        select: {
          id: true,
          status: true,
          obtainedMarks: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })
  return assessments.map(({ Class, Teacher, AssessmentResult, ...rest }) => ({
    ...rest,
    class: Class,
    teacher: Teacher ? { ...Teacher, user: Teacher.User } : null,
    results: AssessmentResult,
  }))
}

export default async function AssessmentsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")
  if (!["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER"].includes(session.user.role)) redirect("/dashboard")

  const assessments = await getAssessments(session.user.tenantId)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Assessments</h1>
          <p className="text-muted-foreground">Create and manage tests, quizzes, and exams</p>
        </div>
        <Link href="/dashboard/assessments/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Assessment
          </Button>
        </Link>
      </div>
      <AssessmentsTable assessments={assessments} />
    </div>
  )
}
