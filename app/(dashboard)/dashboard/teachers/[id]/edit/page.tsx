import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import TeacherForm from "@/components/teachers/teacher-form"

async function getData(id: string) {
  const rawTeacher = await prisma.teacher.findUnique({ where: { id }, include: { User: { select: { name: true, email: true } } } })
  const teacher = rawTeacher ? { ...rawTeacher, user: rawTeacher.User } : null
  return { teacher }
}

export default async function EditTeacherPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) redirect("/dashboard")

  const { teacher } = await getData(params.id)
  if (!teacher) redirect("/dashboard/teachers")

  // Reuse the form in edit mode by passing a single selectable user (it won't change userId)
  const users = [{ id: teacher.userId, name: (teacher as any).user?.name, email: (teacher as any).user?.email }]

  return (
    <div className="container max-w-2xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Edit Teacher</h1>
        <p className="text-muted-foreground">Update teacher details</p>
      </div>
      <TeacherForm users={users} />
    </div>
  )
}
