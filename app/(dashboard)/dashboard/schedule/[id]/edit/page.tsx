import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import ScheduleForm from "@/components/schedule/schedule-form"

async function getData(tenantId: string, id: string) {
  const [classes, teachers, rooms, schedule] = await Promise.all([
    prisma.class.findMany({ where: { tenantId, status: "ACTIVE" }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.teacher.findMany({ include: { User: { select: { name: true } } }, where: { status: "ACTIVE" }, orderBy: { createdAt: "desc" } }),
    prisma.room.findMany({ select: { id: true, name: true, building: true }, orderBy: { name: "asc" } }),
    prisma.schedule.findUnique({ where: { id } }),
  ])
  return { classes, teachers, rooms, schedule }
}

export default async function EditSchedulePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")
  if (!["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER"].includes(session.user.role)) redirect("/dashboard")

  const data = await getData(session.user.tenantId, params.id)
  if (!data.schedule) redirect("/dashboard/schedule")

  return (
    <div className="container max-w-2xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Edit Schedule</h1>
        <p className="text-muted-foreground">Update this schedule entry</p>
      </div>
      <ScheduleForm classes={data.classes} teachers={data.teachers.map((t: any) => ({ ...t, user: t.User }))} rooms={data.rooms} scheduleData={data.schedule} mode="edit" />
    </div>
  )
}
