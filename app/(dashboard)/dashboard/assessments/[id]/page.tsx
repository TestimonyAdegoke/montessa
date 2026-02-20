import { getServerSession } from "next-auth"
import { redirect, notFound } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import AssessmentDetailClient from "@/components/assessments/assessment-detail-client"

async function getAssessment(id: string, tenantId: string) {
  const assessment = await prisma.assessment.findFirst({
    where: {
      id,
      Class: { tenantId },
    },
    include: {
      Class: {
        select: { id: true, name: true, grade: true },
      },
      Teacher: {
        include: {
          User: { select: { name: true, email: true } },
        },
      },
      AssessmentResult: {
        include: {
          Student: {
            include: {
              User: { select: { name: true, email: true } },
            },
          },
        },
        orderBy: { submittedAt: "desc" },
      },
    },
  })

  if (!assessment) return null

  return {
    ...assessment,
    class: assessment.Class,
    teacher: assessment.Teacher
      ? { ...assessment.Teacher, user: assessment.Teacher.User }
      : null,
    results: assessment.AssessmentResult.map((r) => ({
      ...r,
      student: r.Student
        ? { ...r.Student, user: r.Student.User }
        : null,
    })),
  }
}

async function getClasses(tenantId: string) {
  return prisma.class.findMany({
    where: { tenantId, status: "ACTIVE" },
    select: { id: true, name: true, grade: true },
    orderBy: { name: "asc" },
  })
}

export default async function AssessmentDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")
  if (!["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER"].includes(session.user.role)) redirect("/dashboard")

  const [assessment, classes] = await Promise.all([
    getAssessment(params.id, session.user.tenantId),
    getClasses(session.user.tenantId),
  ])

  if (!assessment) notFound()

  return <AssessmentDetailClient assessment={assessment} classes={classes} userRole={session.user.role} />
}
