import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import { Calendar, MapPin, Clock, Plus, Video } from "lucide-react"
import Link from "next/link"

const typeColors: Record<string, string> = {
  ACADEMIC: "default",
  HOLIDAY: "success",
  EXAM: "destructive",
  MEETING: "secondary",
  SPORTS: "outline",
  CULTURAL: "default",
  PARENT_TEACHER: "secondary",
  FIELD_TRIP: "success",
  OTHER: "outline",
}

export default async function EventsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")

  const now = new Date()
  const [upcoming, past] = await Promise.all([
    prisma.event.findMany({
      where: {
        tenantId: session.user.tenantId,
        startDate: { gte: now },
      },
      orderBy: { startDate: "asc" },
      take: 50,
    }),
    prisma.event.findMany({
      where: {
        tenantId: session.user.tenantId,
        startDate: { lt: now },
      },
      orderBy: { startDate: "desc" },
      take: 20,
    }),
  ])

  const canCreate = ["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "HOD"].includes(session.user.role)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Events Calendar</h1>
          <p className="text-muted-foreground">School events, holidays, and important dates</p>
        </div>
        {canCreate && (
          <Link href="/dashboard/events/new">
            <Button><Plus className="mr-2 h-4 w-4" />New Event</Button>
          </Link>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{upcoming.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {upcoming.filter((e: any) => new Date(e.startDate).getMonth() === now.getMonth()).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Past Events</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{past.length}</div></CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Upcoming Events</h2>
        {upcoming.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No upcoming events scheduled.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((event: any) => (
              <Card key={event.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">{event.title}</CardTitle>
                    <Badge variant={typeColors[event.type] as any}>{event.type.replace("_", " ")}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {event.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{formatDate(event.startDate)}</span>
                    {event.allDay && <Badge variant="outline" className="text-xs">All Day</Badge>}
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{event.location}</span>
                    </div>
                  )}
                  {event.isVirtual && event.meetingLink && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Video className="h-3.5 w-3.5" />
                      <a href={event.meetingLink} className="text-blue-500 hover:underline" target="_blank" rel="noopener">Join Meeting</a>
                    </div>
                  )}
                  <Badge variant={event.status === "CANCELLED" ? "destructive" : "outline"} className="text-xs">
                    {event.status}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {past.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Past Events</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {past.map((event: any) => (
              <Card key={event.id} className="opacity-75">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">{event.title}</CardTitle>
                    <Badge variant="outline">{event.type.replace("_", " ")}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{formatDate(event.startDate)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
