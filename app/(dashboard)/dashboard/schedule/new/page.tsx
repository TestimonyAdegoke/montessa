import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import ScheduleForm from "@/components/schedule/schedule-form"

async function getData(tenantId: string) {
  const [classes, teachers, rooms] = await Promise.all([
    prisma.class.findMany({
      where: { tenantId, status: "ACTIVE" },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.teacher.findMany({
      include: { User: { select: { name: true } } },
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
    }),
    prisma.room.findMany({
      select: { id: true, name: true, building: true },
      orderBy: { name: "asc" },
    }),
  ])

  return { classes, teachers, rooms }
}

export default async function NewSchedulePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")
  if (!["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER"].includes(session.user.role)) redirect("/dashboard")

  const data = await getData(session.user.tenantId)

  return (
    <div className="container max-w-2xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Add Schedule</h1>
        <p className="text-muted-foreground">Create a new class schedule entry</p>
      </div>
      <ScheduleForm classes={data.classes} teachers={data.teachers.map((t: any) => ({ ...t, user: t.User }))} rooms={data.rooms} />
    </div>
  )
}
