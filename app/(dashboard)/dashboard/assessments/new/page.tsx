import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { getClassesForAssessment } from "@/lib/actions/assessments"
import AssessmentBuilder from "@/components/assessments/assessment-builder"

export default async function NewAssessmentPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")
  if (!["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER"].includes(session.user.role)) redirect("/dashboard")

  const classes = await getClassesForAssessment()

  return (
    <div className="container max-w-5xl py-8">
      <AssessmentBuilder classes={classes} mode="create" />
    </div>
  )
}
