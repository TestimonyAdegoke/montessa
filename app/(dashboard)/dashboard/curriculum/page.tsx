import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { CurriculumClient } from "@/components/curriculum/curriculum-client"
import { BookOpen, Layers, Target, CheckCircle2 } from "lucide-react"

export default async function CurriculumPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")
  if (!["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "HOD", "GUARDIAN", "STUDENT"].includes(session.user.role)) {
    redirect("/dashboard")
  }

  const maps = await prisma.curriculumMap.findMany({
    where: { tenantId: session.user.tenantId },
    include: {
      CurriculumUnit: {
        orderBy: { orderIndex: "asc" },
        include: {
          CurriculumTopic: { orderBy: { orderIndex: "asc" } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  const serialized = maps.map((m: any) => {
    const totalTopics = m.units.reduce((sum: number, u: any) => sum + u.topics.length, 0)
    const completedTopics = m.units.reduce(
      (sum: number, u: any) => sum + u.topics.filter((t: any) => t.status === "COMPLETED").length,
      0
    )
    const progressPercent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0

    return {
      id: m.id,
      title: m.title,
      subject: m.subject,
      grade: m.grade,
      academicYear: m.academicYear,
      description: m.description,
      board: m.board,
      status: m.status,
      totalTopics,
      completedTopics,
      progressPercent,
      units: m.units.map((u: any) => ({
        id: u.id,
        title: u.title,
        description: u.description,
        orderIndex: u.orderIndex,
        estimatedWeeks: u.estimatedWeeks,
        learningOutcomes: u.learningOutcomes,
        topics: u.topics.map((t: any) => ({
          id: t.id,
          title: t.title,
          description: t.description,
          orderIndex: t.orderIndex,
          content: t.content,
          resources: t.resources,
          activities: t.activities,
          assessmentCriteria: t.assessmentCriteria,
          estimatedHours: t.estimatedHours,
          status: t.status,
        })),
      })),
    }
  })

  const canEdit = ["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "HOD"].includes(session.user.role)

  return (
    <CurriculumClient
      initialMaps={serialized}
      canEdit={canEdit}
      userRole={session.user.role}
    />
  )
}
