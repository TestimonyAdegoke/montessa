import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDate } from "@/lib/utils"
import {
  BookOpen,
  UserCheck,
  ClipboardList,
  Calendar,
  GraduationCap,
  Target,
} from "lucide-react"

async function getStudentData(userId: string, tenantId: string) {
  const raw = await prisma.student.findFirst({
    where: { userId, tenantId },
    include: {
      User: { select: { name: true, email: true, image: true } },
      Class: {
        include: {
          ClassTeacher: {
            include: {
              Teacher: { include: { User: { select: { name: true } } } },
            },
          },
        },
      },
      AttendanceRecord: {
        orderBy: { date: "desc" },
        take: 30,
      },
      AssessmentResult: {
        include: {
          Assessment: {
            select: { title: true, subject: true, totalMarks: true, type: true, scheduledDate: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 15,
      },
      IndividualLearningPlan: {
        where: { status: { in: ["ACTIVE", "COMPLETED"] } },
        include: {
          Teacher: { include: { User: { select: { name: true } } } },
          LearningActivity: {
            orderBy: { createdAt: "desc" },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  })

  if (!raw) return { student: null, schedules: [] }

  const student = {
    ...raw,
    user: raw.User,
    currentClass: raw.Class ? {
      ...raw.Class,
      teachers: raw.Class.ClassTeacher.map((ct) => ({
        ...ct,
        teacher: { ...ct.Teacher, user: ct.Teacher.User },
      })),
    } : null,
    attendanceRecords: raw.AttendanceRecord,
    assessmentResults: raw.AssessmentResult.map((ar) => ({
      ...ar,
      assessment: ar.Assessment,
    })),
    learningPlans: raw.IndividualLearningPlan.map((lp) => ({
      ...lp,
      teacher: { ...lp.Teacher, user: lp.Teacher.User },
      activities: lp.LearningActivity,
    })),
  }

  // Get schedule for the student's class
  let schedules: any[] = []
  if (student.currentClassId) {
    const rawSchedules = await prisma.schedule.findMany({
      where: {
        classId: student.currentClassId,
        isActive: true,
      },
      include: {
        Teacher: { include: { User: { select: { name: true } } } },
        Room: { select: { name: true } },
      },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    })
    schedules = rawSchedules.map(({ Teacher, Room, ...rest }) => ({
      ...rest,
      teacher: Teacher ? { ...Teacher, user: Teacher.User } : null,
      room: Room,
    }))
  }

  return { student, schedules }
}

export default async function MyLearningPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")
  if (session.user.role !== "STUDENT") redirect("/dashboard")

  const { student, schedules } = await getStudentData(session.user.id, session.user.tenantId)

  if (!student) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            My Learning
          </h1>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <GraduationCap className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Profile Not Found</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Your student profile has not been set up yet. Please contact your school administration.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const attendancePresent = student.attendanceRecords.filter((r) => r.status === "PRESENT").length
  const attendanceTotal = student.attendanceRecords.length
  const attendanceRate = attendanceTotal > 0 ? Math.round((attendancePresent / attendanceTotal) * 100) : 0

  const avgScore = student.assessmentResults.length > 0
    ? Math.round(
        student.assessmentResults.reduce((sum, r) => sum + (r.percentage || 0), 0) /
        student.assessmentResults.length
      )
    : 0

  const activePlans = student.learningPlans.filter((p) => p.status === "ACTIVE").length

  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Avatar className="h-14 w-14">
          <AvatarImage src={student.profilePhoto || student.user.image || ""} />
          <AvatarFallback className="text-xl">
            {student.legalName.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Learning</h1>
          <p className="text-muted-foreground">
            {student.currentClass?.name || "No class assigned"} · {student.admissionNumber}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceRate}%</div>
            <p className="text-xs text-muted-foreground">{attendancePresent}/{attendanceTotal} days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgScore}%</div>
            <p className="text-xs text-muted-foreground">{student.assessmentResults.length} assessments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Learning Plans</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePlans}</div>
            <p className="text-xs text-muted-foreground">Active plans</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Classes Today</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {schedules.filter((s) => s.dayOfWeek === new Date().getDay()).length}
            </div>
            <p className="text-xs text-muted-foreground">Scheduled sessions</p>
          </CardContent>
        </Card>
      </div>

      {/* Detail Tabs */}
      <Tabs defaultValue="timetable" className="space-y-4">
        <TabsList>
          <TabsTrigger value="timetable">Timetable</TabsTrigger>
          <TabsTrigger value="grades">My Grades</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="learning-plans">Learning Plans</TabsTrigger>
        </TabsList>

        {/* Timetable */}
        <TabsContent value="timetable">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Timetable</CardTitle>
              <CardDescription>Your class schedule for the week</CardDescription>
            </CardHeader>
            <CardContent>
              {schedules.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No schedule available</p>
              ) : (
                <div className="space-y-6">
                  {daysOfWeek.map((day, idx) => {
                    const daySchedules = schedules.filter((s) => s.dayOfWeek === idx)
                    if (daySchedules.length === 0) return null
                    const isToday = new Date().getDay() === idx

                    return (
                      <div key={day}>
                        <h4 className={`font-semibold mb-2 flex items-center gap-2 ${isToday ? "text-primary" : ""}`}>
                          {day}
                          {isToday && <Badge variant="outline" className="text-xs">Today</Badge>}
                        </h4>
                        <div className="space-y-2">
                          {daySchedules.map((schedule) => (
                            <div
                              key={schedule.id}
                              className={`flex items-center justify-between p-3 border rounded-lg ${isToday ? "border-primary/30 bg-primary/5" : ""}`}
                            >
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

        {/* Grades */}
        <TabsContent value="grades">
          <Card>
            <CardHeader>
              <CardTitle>Assessment Results</CardTitle>
              <CardDescription>Your test and exam scores</CardDescription>
            </CardHeader>
            <CardContent>
              {student.assessmentResults.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No results yet</p>
              ) : (
                <div className="space-y-4">
                  {student.assessmentResults.map((result) => (
                    <div key={result.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold">{result.assessment.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {result.assessment.subject} · {result.assessment.type}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">{result.percentage}%</div>
                          {result.grade && <div className="text-sm text-muted-foreground">Grade: {result.grade}</div>}
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 mb-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            (result.percentage || 0) >= 80 ? "bg-green-500" :
                            (result.percentage || 0) >= 60 ? "bg-yellow-500" :
                            "bg-red-500"
                          }`}
                          style={{ width: `${result.percentage || 0}%` }}
                        />
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {result.obtainedMarks} / {result.totalMarks} marks
                      </div>
                      {result.feedback && (
                        <p className="text-sm mt-2 p-2 bg-muted rounded italic">{result.feedback}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attendance */}
        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle>Attendance History</CardTitle>
              <CardDescription>Your recent attendance records</CardDescription>
            </CardHeader>
            <CardContent>
              {student.attendanceRecords.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No attendance records</p>
              ) : (
                <div className="space-y-2">
                  {student.attendanceRecords.map((record) => (
                    <div key={record.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <div className="font-medium text-sm">{formatDate(record.date)}</div>
                        {record.remarks && (
                          <div className="text-xs text-muted-foreground">{record.remarks}</div>
                        )}
                      </div>
                      <Badge
                        variant={
                          record.status === "PRESENT" ? "success" :
                          record.status === "LATE" ? "warning" :
                          record.status === "EXCUSED" ? "outline" :
                          "destructive"
                        }
                      >
                        {record.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Learning Plans */}
        <TabsContent value="learning-plans">
          <Card>
            <CardHeader>
              <CardTitle>My Learning Plans</CardTitle>
              <CardDescription>Individual Learning Plans and activities</CardDescription>
            </CardHeader>
            <CardContent>
              {student.learningPlans.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No learning plans</p>
              ) : (
                <div className="space-y-6">
                  {student.learningPlans.map((plan) => {
                    const completed = plan.activities.filter((a) => a.status === "COMPLETED").length
                    const total = plan.activities.length
                    const progress = total > 0 ? Math.round((completed / total) * 100) : 0

                    return (
                      <div key={plan.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold">{plan.title}</h4>
                            {plan.description && (
                              <p className="text-sm text-muted-foreground">{plan.description}</p>
                            )}
                          </div>
                          <Badge>{plan.status}</Badge>
                        </div>

                        <div className="space-y-1 mb-4">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{completed}/{total} activities ({progress}%)</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          {plan.activities.map((activity) => (
                            <div
                              key={activity.id}
                              className="flex items-center gap-3 p-2 rounded border"
                            >
                              <div className={`h-2 w-2 rounded-full ${
                                activity.status === "COMPLETED" ? "bg-green-500" :
                                activity.status === "IN_PROGRESS" ? "bg-blue-500" :
                                activity.status === "SKIPPED" ? "bg-gray-400" :
                                "bg-muted-foreground"
                              }`} />
                              <div className="flex-1">
                                <div className="text-sm font-medium">{activity.title}</div>
                                <div className="text-xs text-muted-foreground">
                                  {activity.category.replace(/_/g, " ")}
                                </div>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {activity.status.replace(/_/g, " ")}
                              </Badge>
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
      </Tabs>
    </div>
  )
}
