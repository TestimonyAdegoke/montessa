import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { getActiveStudents } from "@/lib/actions/learning-plans"
import PlanForm from "@/components/learning-plans/plan-form"

export default async function NewLearningPlanPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  if (!["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER"].includes(session.user.role)) {
    redirect("/dashboard")
  }

  const students = await getActiveStudents()

  return (
    <div className="container max-w-5xl py-8">
      <PlanForm students={students} mode="create" />
    </div>
  )
}
