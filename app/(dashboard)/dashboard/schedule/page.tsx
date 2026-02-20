import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Plus } from "lucide-react"
import ScheduleRowActions from "@/components/schedule/schedule-row-actions"

type ScheduleItem = {
  id: string
  dayOfWeek: number
  startTime: string
  endTime: string
  subject: string
  class: { name: string }
  teacher: { user: { name: string | null } } | null
  room: { name: string; building: string | null } | null
}
async function getSchedules(tenantId: string): Promise<ScheduleItem[]> {
  const raw = await prisma.schedule.findMany({
    where: {
      Class: { tenantId },
    },
    include: {
      Class: { select: { name: true } },
      Teacher: { include: { User: { select: { name: true } } } },
      Room: { select: { name: true, building: true } },
    },
    orderBy: [
      { dayOfWeek: "asc" },
      { startTime: "asc" },
    ],
  })

  return raw.map(({ Class, Teacher, Room, ...rest }) => ({
    ...rest,
    class: Class,
    teacher: Teacher ? { ...Teacher, user: Teacher.User } : null,
    room: Room,
  }))
}

export default async function SchedulePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")
  if (!["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER"].includes(session.user.role)) redirect("/dashboard")

  const schedules = await getSchedules(session.user.tenantId)

  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

  // Group schedules by day
  const schedulesByDay = (schedules as ScheduleItem[]).reduce<Record<string, ScheduleItem[]>>((acc, schedule) => {
    const day = daysOfWeek[schedule.dayOfWeek]
    if (!acc[day]) acc[day] = []
    acc[day].push(schedule)
    return acc
  }, {} as Record<string, ScheduleItem[]>)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Class Schedule</h1>
          <p className="text-muted-foreground">Manage class schedules and timetables</p>
        </div>
        <Link href="/dashboard/schedule/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Schedule
          </Button>
        </Link>
      </div>

      {daysOfWeek.map((day) => {
        const daySchedules = schedulesByDay[day] || []
        if (daySchedules.length === 0) return null

        return (
          <Card key={day}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {day}
              </CardTitle>
              <CardDescription>{daySchedules.length} classes scheduled</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {daySchedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-sm font-medium text-muted-foreground">
                        {schedule.startTime} - {schedule.endTime}
                      </div>
                      <div>
                        <div className="font-medium">{schedule.subject}</div>
                        <div className="text-sm text-muted-foreground">
                          {schedule.class.name} • {schedule.teacher?.user.name || "No teacher assigned"}
                        </div>
                      </div>
                    </div>
                    {schedule.room && (
                      <div className="text-sm text-muted-foreground">
                        {schedule.room.name}
                        {schedule.room.building && ` - ${schedule.room.building}`}
                      </div>
                    )}
                    <div className="ml-4">
                      <ScheduleRowActions id={schedule.id} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      })}

      {schedules.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No schedules yet</p>
            <p className="text-sm text-muted-foreground">Create your first class schedule to get started</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
