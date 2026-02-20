import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import ClassForm from "@/components/classes/class-form"

async function getTeachers() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return []

  const teachers = await prisma.teacher.findMany({
    where: {
      User: {
        tenantId: session.user.tenantId,
      },
      status: "ACTIVE",
    },
    include: {
      User: {
        select: {
          name: true,
        },
      },
    },
  })

  return teachers
}

export default async function NewClassPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) redirect("/dashboard")

  const teachers = await getTeachers()

  return (
    <div className="container max-w-2xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create New Class</h1>
        <p className="text-muted-foreground">Add a new class to your school</p>
      </div>
      <ClassForm teachers={teachers.map((t: any) => ({ ...t, user: t.User }))} mode="create" />
    </div>
  )
}
