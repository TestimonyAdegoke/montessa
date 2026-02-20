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
import { formatDate, calculateAge } from "@/lib/utils"
import { BookOpen, Users, UserCheck, Calendar, Edit, ArrowLeft } from "lucide-react"
import Link from "next/link"

async function getClassDetails(classId: string, tenantId: string) {
  const raw = await prisma.class.findFirst({
    where: { id: classId, tenantId },
    include: {
      ClassTeacher: {
        include: {
          Teacher: {
            include: { User: { select: { name: true, email: true, image: true } } },
          },
        },
      },
      ClassEnrollment: {
        where: { status: "ACTIVE" },
        include: {
          Student: {
            include: {
              User: { select: { name: true, email: true } },
            },
          },
        },
      },
      Schedule: {
        where: { isActive: true },
        include: {
          Teacher: { include: { User: { select: { name: true } } } },
          Room: { select: { name: true } },
        },
        orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
      },
      Assessment: {
        include: {
          Teacher: { include: { User: { select: { name: true } } } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  })

  if (!raw) return { cls: null, todayAttendance: [] }

  const cls = {
    ...raw,
    teachers: raw.ClassTeacher.map((ct) => ({
      ...ct,
      teacher: { ...ct.Teacher, user: ct.Teacher.User },
    })),
    enrollments: raw.ClassEnrollment.map((ce) => ({
      ...ce,
      student: { ...ce.Student, user: ce.Student.User },
    })),
    schedules: raw.Schedule.map((s) => ({
      ...s,
      teacher: s.Teacher ? { ...s.Teacher, user: s.Teacher.User } : null,
      room: s.Room,
    })),
    assessments: raw.Assessment.map((a) => ({
      ...a,
      teacher: a.Teacher ? { ...a.Teacher, user: a.Teacher.User } : null,
    })),
  }

  // Get today's attendance for students in this class
  let todayAttendance: { status: string }[] = []
  const studentIds = cls.enrollments.map((e: any) => e.student.id)
  if (studentIds.length > 0) {
    todayAttendance = await prisma.attendanceRecord.findMany({
      where: {
        studentId: { in: studentIds },
        date: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
      select: { status: true },
    })
  }

  return { cls, todayAttendance }
}

export default async function ClassDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")

  const result = await getClassDetails(params.id, session.user.tenantId)
  if (!result.cls) notFound()

  const cls = result.cls
  const totalStudents = cls.enrollments.length
  const todayPresent = result.todayAttendance.filter((r) => r.status === "PRESENT").length
  const todayAttendanceRate = totalStudents > 0 ? Math.round((todayPresent / totalStudents) * 100) : 0
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/classes">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <BookOpen className="h-8 w-8" />
              {cls.name}
            </h1>
            <p className="text-muted-foreground">
              {cls.grade && `Grade ${cls.grade}`}
              {cls.section && ` · Section ${cls.section}`}
              {cls.academicYear && ` · ${cls.academicYear}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={cls.status === "ACTIVE" ? "success" : "outline"}>{cls.status}</Badge>
          <Link href={`/dashboard/classes/${cls.id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            {cls.capacity && (
              <p className="text-xs text-muted-foreground">of {cls.capacity} capacity</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teachers</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cls.teachers.length}</div>
            <p className="text-xs text-muted-foreground">Assigned teachers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Attendance</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayAttendanceRate}%</div>
            <p className="text-xs text-muted-foreground">{todayPresent} of {totalStudents} present</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assessments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cls.assessments.length}</div>
            <p className="text-xs text-muted-foreground">Total assessments</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="students" className="space-y-4">
        <TabsList>
          <TabsTrigger value="students">Students ({totalStudents})</TabsTrigger>
          <TabsTrigger value="teachers">Teachers ({cls.teachers.length})</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
        </TabsList>

        <TabsContent value="students">
          <Card>
            <CardHeader>
              <CardTitle>Enrolled Students</CardTitle>
              <CardDescription>Students currently enrolled in this class</CardDescription>
            </CardHeader>
            <CardContent>
              {cls.enrollments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No students enrolled</p>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Admission #</TableHead>
                        <TableHead>Age</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Enrolled</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cls.enrollments.map((enrollment) => (
                        <TableRow key={enrollment.id}>
                          <TableCell>
                            <Link href={`/dashboard/students/${enrollment.student.id}`} className="hover:underline">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback>
                                    {enrollment.student.legalName.substring(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{enrollment.student.legalName}</div>
                                  <div className="text-xs text-muted-foreground">{enrollment.student.user.email}</div>
                                </div>
                              </div>
                            </Link>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{enrollment.student.admissionNumber}</TableCell>
                          <TableCell>{calculateAge(enrollment.student.dateOfBirth)} yrs</TableCell>
                          <TableCell>
                            <Badge variant={enrollment.student.studentStatus === "ACTIVE" ? "success" : "outline"}>
                              {enrollment.student.studentStatus}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(enrollment.enrolledAt)}
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

        <TabsContent value="teachers">
          <Card>
            <CardHeader>
              <CardTitle>Assigned Teachers</CardTitle>
              <CardDescription>Teachers assigned to this class</CardDescription>
            </CardHeader>
            <CardContent>
              {cls.teachers.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No teachers assigned</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {cls.teachers.map((ct) => (
                    <div key={ct.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={ct.teacher.user.image || ""} />
                        <AvatarFallback>
                          {(ct.teacher.user.name || "?").substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold">{ct.teacher.user.name}</div>
                        <div className="text-sm text-muted-foreground">{ct.teacher.user.email}</div>
                        <div className="flex gap-2 mt-1">
                          {ct.isPrimary && <Badge variant="default">Primary</Badge>}
                          <Badge variant="outline">{ct.subject || "General"}</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Class Schedule</CardTitle>
              <CardDescription>Weekly timetable for this class</CardDescription>
            </CardHeader>
            <CardContent>
              {cls.schedules.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No schedule set up</p>
              ) : (
                <div className="space-y-6">
                  {daysOfWeek.map((day, idx) => {
                    const daySchedules = cls.schedules.filter((s) => s.dayOfWeek === idx)
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
                                    {schedule.teacher?.user.name || "TBA"}
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
              <CardTitle>Assessments</CardTitle>
              <CardDescription>Tests, exams, and assignments for this class</CardDescription>
            </CardHeader>
            <CardContent>
              {cls.assessments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No assessments yet</p>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Total Marks</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cls.assessments.map((assessment) => (
                        <TableRow key={assessment.id}>
                          <TableCell className="font-medium">{assessment.title}</TableCell>
                          <TableCell>{assessment.subject}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{assessment.type}</Badge>
                          </TableCell>
                          <TableCell>{assessment.totalMarks}</TableCell>
                          <TableCell>
                            <Badge variant={assessment.status === "COMPLETED" ? "success" : "outline"}>
                              {assessment.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {assessment.scheduledDate ? formatDate(assessment.scheduledDate) : "Not scheduled"}
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
      </Tabs>
    </div>
  )
}
