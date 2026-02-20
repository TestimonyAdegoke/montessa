import { getServerSession } from "next-auth"
import { redirect, notFound } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDate, formatCurrency } from "@/lib/utils"
import {
  Users,
  UserCheck,
  BookOpen,
  DollarSign,
  ClipboardList,
  Heart,
  Calendar,
} from "lucide-react"

async function getGuardianChildren(userId: string, tenantId: string) {
  const raw = await prisma.guardian.findUnique({
    where: { userId },
    include: {
      StudentGuardian: {
        include: {
          Student: {
            include: {
              User: { select: { name: true, email: true } },
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
                take: 20,
              },
              AssessmentResult: {
                include: {
                  Assessment: { select: { title: true, subject: true, totalMarks: true } },
                },
                orderBy: { createdAt: "desc" },
                take: 10,
              },
              IndividualLearningPlan: {
                where: { status: "ACTIVE" },
                include: {
                  Teacher: { include: { User: { select: { name: true } } } },
                  LearningActivity: {
                    orderBy: { createdAt: "desc" },
                    take: 5,
                  },
                },
                orderBy: { createdAt: "desc" },
                take: 3,
              },
              BillingRecord: {
                include: {
                  Invoice: { select: { invoiceNumber: true, status: true, totalAmount: true, dueDate: true } },
                },
                orderBy: { createdAt: "desc" },
                take: 10,
              },
            },
          },
        },
      },
    },
  })

  if (!raw) return null
  return {
    ...raw,
    students: raw.StudentGuardian.map((sg) => ({
      ...sg,
      student: {
        ...sg.Student,
        user: sg.Student.User,
        currentClass: sg.Student.Class ? {
          ...sg.Student.Class,
          teachers: sg.Student.Class.ClassTeacher.map((ct) => ({
            ...ct,
            teacher: { ...ct.Teacher, user: ct.Teacher.User },
          })),
        } : null,
        attendanceRecords: sg.Student.AttendanceRecord,
        assessmentResults: sg.Student.AssessmentResult.map((ar) => ({
          ...ar,
          assessment: ar.Assessment,
        })),
        learningPlans: sg.Student.IndividualLearningPlan.map((lp) => ({
          ...lp,
          teacher: { ...lp.Teacher, user: lp.Teacher.User },
          activities: lp.LearningActivity,
        })),
        billingRecords: sg.Student.BillingRecord.map((br) => ({
          ...br,
          invoice: br.Invoice,
        })),
      },
    })),
  }
}

export default async function ChildrenPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")
  if (session.user.role !== "GUARDIAN") redirect("/dashboard")

  const guardian = await getGuardianChildren(session.user.id, session.user.tenantId)

  if (!guardian || guardian.students.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Heart className="h-8 w-8 text-red-500" />
            My Children
          </h1>
          <p className="text-muted-foreground">View your children&apos;s academic progress</p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Children Linked</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Your account is not yet linked to any students. Please contact the school
              administration to link your children to your account.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Heart className="h-8 w-8 text-red-500" />
          My Children
        </h1>
        <p className="text-muted-foreground">
          View your children&apos;s academic progress, attendance, and billing
        </p>
      </div>

      <Tabs defaultValue={guardian.students[0]?.student.id} className="space-y-6">
        {guardian.students.length > 1 && (
          <TabsList>
            {guardian.students.map(({ student }) => (
              <TabsTrigger key={student.id} value={student.id}>
                {student.preferredName || student.legalName}
              </TabsTrigger>
            ))}
          </TabsList>
        )}

        {guardian.students.map(({ student, relationship, isPrimary }) => {
          const attendancePresent = student.attendanceRecords.filter((r) => r.status === "PRESENT").length
          const attendanceTotal = student.attendanceRecords.length
          const attendanceRate = attendanceTotal > 0 ? Math.round((attendancePresent / attendanceTotal) * 100) : 0

          const avgScore = student.assessmentResults.length > 0
            ? Math.round(
                student.assessmentResults.reduce((sum, r) => sum + (r.percentage || 0), 0) /
                student.assessmentResults.length
              )
            : 0

          return (
            <TabsContent key={student.id} value={student.id} className="space-y-6">
              {/* Child Overview */}
              <div className="grid gap-4 md:grid-cols-4">
                <Card className="md:col-span-1">
                  <CardContent className="pt-6 text-center">
                    <Avatar className="h-20 w-20 mx-auto mb-3">
                      <AvatarImage src={student.profilePhoto || ""} alt={student.legalName} />
                      <AvatarFallback className="text-2xl">
                        {student.legalName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-semibold text-lg">{student.legalName}</h3>
                    {student.preferredName && (
                      <p className="text-sm text-muted-foreground">&quot;{student.preferredName}&quot;</p>
                    )}
                    <div className="mt-2 space-y-1">
                      <Badge>{student.studentStatus}</Badge>
                      {isPrimary && <Badge variant="outline" className="ml-1">Primary Guardian</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 capitalize">
                      {relationship.toLowerCase()}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Class</CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold">
                      {student.currentClass?.name || "Not Assigned"}
                    </div>
                    {student.currentClass?.teachers?.[0] && (
                      <p className="text-xs text-muted-foreground">
                        Teacher: {student.currentClass.teachers[0].teacher.user.name}
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Attendance</CardTitle>
                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold">{attendanceRate}%</div>
                    <p className="text-xs text-muted-foreground">
                      {attendancePresent} of {attendanceTotal} days present
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
                    <ClipboardList className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold">{avgScore}%</div>
                    <p className="text-xs text-muted-foreground">
                      {student.assessmentResults.length} assessments
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Detail Tabs */}
              <Tabs defaultValue="attendance" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="attendance">Attendance</TabsTrigger>
                  <TabsTrigger value="grades">Grades</TabsTrigger>
                  <TabsTrigger value="learning">Learning Plans</TabsTrigger>
                  <TabsTrigger value="billing">Billing</TabsTrigger>
                </TabsList>

                {/* Attendance Tab */}
                <TabsContent value="attendance">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Attendance</CardTitle>
                      <CardDescription>Last 20 attendance records</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {student.attendanceRecords.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">No attendance records yet</p>
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

                {/* Grades Tab */}
                <TabsContent value="grades">
                  <Card>
                    <CardHeader>
                      <CardTitle>Assessment Results</CardTitle>
                      <CardDescription>Recent test and exam scores</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {student.assessmentResults.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">No assessment results yet</p>
                      ) : (
                        <div className="space-y-4">
                          {student.assessmentResults.map((result) => (
                            <div key={result.id} className="border rounded-lg p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h4 className="font-semibold">{result.assessment.title}</h4>
                                  <p className="text-sm text-muted-foreground">{result.assessment.subject}</p>
                                </div>
                                <div className="text-right">
                                  <div className="text-2xl font-bold">{result.percentage}%</div>
                                  {result.grade && (
                                    <div className="text-sm text-muted-foreground">Grade: {result.grade}</div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>{result.obtainedMarks} / {result.totalMarks} marks</span>
                                <Badge variant={result.status === "GRADED" ? "success" : "outline"}>
                                  {result.status}
                                </Badge>
                              </div>
                              {result.feedback && (
                                <p className="text-sm mt-2 p-2 bg-muted rounded">{result.feedback}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Learning Plans Tab */}
                <TabsContent value="learning">
                  <Card>
                    <CardHeader>
                      <CardTitle>Active Learning Plans</CardTitle>
                      <CardDescription>Montessori Individual Learning Plans</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {student.learningPlans.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">No active learning plans</p>
                      ) : (
                        <div className="space-y-4">
                          {student.learningPlans.map((plan) => {
                            const completedActivities = plan.activities.filter((a) => a.status === "COMPLETED").length
                            const totalActivities = plan.activities.length
                            const progress = totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0

                            return (
                              <div key={plan.id} className="border rounded-lg p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h4 className="font-semibold">{plan.title}</h4>
                                    {plan.description && (
                                      <p className="text-sm text-muted-foreground">{plan.description}</p>
                                    )}
                                  </div>
                                  <Badge>{plan.status}</Badge>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                                  <span>Teacher: {plan.teacher.user.name}</span>
                                  <span>Started: {formatDate(plan.startDate)}</span>
                                </div>
                                <div className="space-y-1">
                                  <div className="flex justify-between text-sm">
                                    <span>Progress</span>
                                    <span>{completedActivities}/{totalActivities} activities</span>
                                  </div>
                                  <div className="w-full bg-muted rounded-full h-2">
                                    <div
                                      className="bg-primary h-2 rounded-full transition-all"
                                      style={{ width: `${progress}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Billing Tab */}
                <TabsContent value="billing">
                  <Card>
                    <CardHeader>
                      <CardTitle>Billing Records</CardTitle>
                      <CardDescription>Fees and payment history</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {student.billingRecords.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">No billing records</p>
                      ) : (
                        <div className="space-y-3">
                          {student.billingRecords.map((record) => (
                            <div key={record.id} className="flex items-center justify-between py-3 border-b last:border-0">
                              <div>
                                <div className="font-medium text-sm">{record.description}</div>
                                <div className="text-xs text-muted-foreground">
                                  {record.type} · Due {formatDate(record.dueDate)}
                                  {record.invoice && ` · ${record.invoice.invoiceNumber}`}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold">{formatCurrency(record.amount)}</div>
                                <Badge
                                  variant={
                                    record.status === "PAID" ? "success" :
                                    record.status === "OVERDUE" ? "destructive" :
                                    "outline"
                                  }
                                >
                                  {record.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}
