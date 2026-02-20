import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { QuestionBankClient } from "@/components/question-bank/question-bank-client"
import { HelpCircle } from "lucide-react"

export default async function QuestionBankPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")
  if (!["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "HOD"].includes(session.user.role)) {
    redirect("/dashboard")
  }

  const items = await prisma.questionBankItem.findMany({
    where: { tenantId: session.user.tenantId },
    orderBy: { createdAt: "desc" },
  })

  const serialized = items.map((item: any) => ({
    id: item.id,
    subject: item.subject,
    grade: item.grade,
    topic: item.topic,
    difficulty: item.difficulty,
    questionType: item.questionType,
    questionText: item.questionText,
    options: item.options as any[] | null,
    correctAnswer: item.correctAnswer,
    explanation: item.explanation,
    marks: item.marks,
    tags: item.tags,
    timesUsed: item.timesUsed,
    createdAt: item.createdAt.toISOString(),
  }))

  const subjects = Array.from(new Set(items.map((i: any) => i.subject))) as string[]

  return (
    <QuestionBankClient
      initialItems={serialized}
      subjects={subjects}
    />
  )
}
