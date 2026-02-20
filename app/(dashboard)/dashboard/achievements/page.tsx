import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getAchievements } from "@/lib/actions/achievements"
import { prisma } from "@/lib/prisma"
import { AchievementsClient } from "@/components/achievements/achievements-client"

export default async function AchievementsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")

  const achievements = await getAchievements()
  const students = await prisma.student.findMany({
    where: { tenantId: session.user.tenantId },
    select: { id: true, legalName: true, admissionNumber: true },
    orderBy: { legalName: "asc" },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Achievements & Badges</h1>
        <p className="text-muted-foreground">Award and track student achievements, badges, and recognition</p>
      </div>
      <AchievementsClient
        achievements={JSON.parse(JSON.stringify(achievements))}
        students={JSON.parse(JSON.stringify(students))}
        userRole={session.user.role}
      />
    </div>
  )
}
