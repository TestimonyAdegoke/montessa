import { getServerSession } from "next-auth"
import { redirect, notFound } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getAvailableClasses } from "@/lib/actions/students"
import StudentForm from "@/components/students/student-form"

async function getStudent(id: string, tenantId: string) {
  const student = await prisma.student.findFirst({
    where: { id, tenantId },
    include: {
      User: true,
    },
  })

  return student
}

export default async function EditStudentPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  if (!["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER"].includes(session.user.role)) {
    redirect("/dashboard")
  }

  const [student, classes] = await Promise.all([
    getStudent(params.id, session.user.tenantId),
    getAvailableClasses(),
  ])

  if (!student) {
    notFound()
  }

  return (
    <div className="container max-w-5xl py-8">
      <StudentForm student={student} classes={classes} mode="edit" />
    </div>
  )
}
