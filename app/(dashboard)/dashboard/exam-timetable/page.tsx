import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getExamTimetables } from "@/lib/actions/exam-timetable"
import { prisma } from "@/lib/prisma"
import { ExamTimetableClient } from "@/components/exam-timetable/exam-timetable-client"

export default async function ExamTimetablePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")

  const timetables = await getExamTimetables()
  const classes = await prisma.class.findMany({
    where: { tenantId: session.user.tenantId, status: "ACTIVE" },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Exam Timetable</h1>
        <p className="text-muted-foreground">Create and manage examination schedules</p>
      </div>
      <ExamTimetableClient
        timetables={JSON.parse(JSON.stringify(timetables))}
        classes={JSON.parse(JSON.stringify(classes))}
        userRole={session.user.role}
      />
    </div>
  )
}
