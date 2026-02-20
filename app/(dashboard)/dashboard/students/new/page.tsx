import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { getAvailableClasses } from "@/lib/actions/students"
import StudentForm from "@/components/students/student-form"

export default async function NewStudentPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) {
    redirect("/dashboard")
  }

  const classes = await getAvailableClasses()

  return (
    <div className="container max-w-5xl py-8">
      <StudentForm classes={classes} mode="create" />
    </div>
  )
}
