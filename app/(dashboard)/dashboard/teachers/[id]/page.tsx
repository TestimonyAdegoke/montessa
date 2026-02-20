import { getServerSession } from "next-auth"
import { redirect, notFound } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatDate } from "@/lib/utils"
import { UserCog, BookOpen, Calendar, ClipboardList, Edit, ArrowLeft, Mail, Phone } from "lucide-react"
import Link from "next/link"

async function getTeacherDetails(teacherId: string, tenantId: string) {
  const raw = await prisma.teacher.findFirst({
    where: {
      id: teacherId,
      User: { tenantId },
    },
    include: {
      User: {
        select: { name: true, email: true, phone: true, image: true, isActive: true, lastLoginAt: true },
      },
      ClassTeacher: {
        include: {
          Class: {
            select: { id: true, name: true, grade: true, section: true, status: true },
            include: {
              _count: { select: { ClassEnrollment: true } },
            },
          },
        },
      },
      Schedule: {
        where: { isActive: true },
        include: {
          Class: { select: { name: true } },
          Room: { select: { name: true } },
        },
        orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
      },
      Assessment: {
        include: {
          Class: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      IndividualLearningPlan: {
        where: { status: "ACTIVE" },
        include: {
          Student: { select: { legalName: true } },
        },
        take: 5,
      },
    },
  })
  if (!raw) return null
  return {
    ...raw,
    user: raw.User,
    classes: raw.ClassTeacher.map((ct) => ({
      ...ct,
      class: { ...ct.Class, _count: { enrollments: ct.Class._count.ClassEnrollment } },
    })),
    schedules: raw.Schedule.map((s) => ({ ...s, class: s.Class, room: s.Room })),
    assessments: raw.Assessment.map((a) => ({ ...a, class: a.Class })),
    learningPlans: raw.IndividualLearningPlan.map((lp) => ({ ...lp, student: lp.Student })),
  }
}

export default async function TeacherDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")
  if (!["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) redirect("/dashboard")

  const teacher = await getTeacherDetails(params.id, session.user.tenantId)
  if (!teacher) notFound()

  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/teachers">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <Avatar className="h-14 w-14">
            <AvatarImage src={teacher.user.image || ""} />
            <AvatarFallback className="text-xl">
              {(teacher.user.name || "?").substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{teacher.user.name}</h1>
            <div className="flex items-center gap-3 text-muted-foreground">
              {teacher.user.email && (
                <span className="flex items-center gap-1 text-sm">
                  <Mail className="h-3 w-3" /> {teacher.user.email}
                </span>
              )}
              {teacher.user.phone && (
                <span className="flex items-center gap-1 text-sm">
                  <Phone className="h-3 w-3" /> {teacher.user.phone}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={teacher.user.isActive ? "success" : "destructive"}>
            {teacher.user.isActive ? "Active" : "Inactive"}
          </Badge>
          <Link href={`/dashboard/teachers/${teacher.id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Employee ID</CardTitle>
            <UserCog className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold font-mono">{teacher.employeeId}</div>
            <p className="text-xs text-muted-foreground capitalize">{teacher.status.replace("_", " ").toLowerCase()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Classes</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{teacher.classes.length}</div>
            <p className="text-xs text-muted-foreground">Assigned classes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Specialization</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{teacher.specialization || "General"}</div>
            {teacher.department && (
              <p className="text-xs text-muted-foreground">{teacher.department}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hired</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{formatDate(teacher.hireDate)}</div>
            <p className="text-xs text-muted-foreground">
              {teacher.user.lastLoginAt ? `Last login: ${formatDate(teacher.user.lastLoginAt)}` : "Never logged in"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detail Tabs */}
      <Tabs defaultValue="classes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="classes">Classes</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="classes">
          <Card>
            <CardHeader>
              <CardTitle>Assigned Classes</CardTitle>
            </CardHeader>
            <CardContent>
              {teacher.classes.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No classes assigned</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {teacher.classes.map((ct) => (
                    <Link key={ct.id} href={`/dashboard/classes/${ct.class.id}`}>
                      <div className="border rounded-lg p-4 hover:bg-accent transition-colors">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold">{ct.class.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {ct.class.grade && `Grade ${ct.class.grade}`}
                              {ct.class.section && ` · Section ${ct.class.section}`}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {ct.isPrimary && <Badge>Primary</Badge>}
                            <Badge variant={ct.class.status === "ACTIVE" ? "success" : "outline"}>
                              {ct.class.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-muted-foreground">
                          {ct.subject && `Subject: ${ct.subject} · `}
                          {ct.class._count.enrollments} students
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              {teacher.schedules.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No schedule set</p>
              ) : (
                <div className="space-y-6">
                  {daysOfWeek.map((day, idx) => {
                    const daySchedules = teacher.schedules.filter((s) => s.dayOfWeek === idx)
                    if (daySchedules.length === 0) return null
                    return (
                      <div key={day}>
                        <h4 className="font-semibold mb-2">{day}</h4>
                        <div className="space-y-2">
                          {daySchedules.map((schedule) => (
                            <div key={schedule.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="text-sm font-mono text-muted-foreground w-28">
                                  {schedule.startTime} – {schedule.endTime}
                                </div>
                                <div>
                                  <div className="font-medium">{schedule.subject}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {schedule.class.name}
                                    {schedule.room && ` · ${schedule.room.name}`}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assessments">
          <Card>
            <CardHeader>
              <CardTitle>Recent Assessments</CardTitle>
            </CardHeader>
            <CardContent>
              {teacher.assessments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No assessments created</p>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teacher.assessments.map((a) => (
                        <TableRow key={a.id}>
                          <TableCell className="font-medium">{a.title}</TableCell>
                          <TableCell>{a.class.name}</TableCell>
                          <TableCell>{a.subject}</TableCell>
                          <TableCell><Badge variant="outline">{a.type}</Badge></TableCell>
                          <TableCell>
                            <Badge variant={a.status === "COMPLETED" ? "success" : "outline"}>
                              {a.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Teacher Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Qualification</p>
                    <p className="text-sm">{teacher.qualification || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Specialization</p>
                    <p className="text-sm">{teacher.specialization || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Department</p>
                    <p className="text-sm">{teacher.department || "Not specified"}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Experience</p>
                    <p className="text-sm">{teacher.experience ? `${teacher.experience} years` : "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Hire Date</p>
                    <p className="text-sm">{formatDate(teacher.hireDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Emergency Contact</p>
                    <p className="text-sm">{teacher.emergencyContact || "Not specified"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
