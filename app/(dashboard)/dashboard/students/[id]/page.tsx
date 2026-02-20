import { getServerSession } from "next-auth"
import { redirect, notFound } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDate, calculateAge } from "@/lib/utils"
import { Edit, Mail, Phone, MapPin, Heart, AlertCircle } from "lucide-react"
import Link from "next/link"

async function getStudent(id: string, tenantId: string) {
  const raw = await prisma.student.findFirst({
    where: { id, tenantId },
    include: {
      User: true,
      Class: {
        include: {
          ClassTeacher: {
            include: {
              Teacher: {
                include: {
                  User: true,
                },
              },
            },
          },
        },
      },
      StudentGuardian: {
        include: {
          Guardian: {
            include: {
              User: true,
            },
          },
        },
      },
      IndividualLearningPlan: {
        include: {
          Teacher: {
            include: {
              User: true,
            },
          },
          LearningActivity: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      },
      AttendanceRecord: {
        orderBy: {
          date: "desc",
        },
        take: 10,
      },
      AssessmentResult: {
        include: {
          Assessment: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      },
    },
  })

  if (!raw) return null
  return {
    ...raw,
    user: raw.User,
    currentClass: raw.Class ? {
      ...raw.Class,
      teachers: raw.Class.ClassTeacher.map((ct) => ({
        ...ct,
        teacher: { ...ct.Teacher, user: ct.Teacher.User },
      })),
    } : null,
    guardians: raw.StudentGuardian.map((sg) => ({
      ...sg,
      guardian: { ...sg.Guardian, user: sg.Guardian.User },
    })),
    learningPlans: raw.IndividualLearningPlan.map((lp) => ({
      ...lp,
      teacher: { ...lp.Teacher, user: lp.Teacher.User },
      activities: lp.LearningActivity,
    })),
    attendanceRecords: raw.AttendanceRecord,
    assessmentResults: raw.AssessmentResult.map((ar) => ({
      ...ar,
      assessment: ar.Assessment,
    })),
  }
}

export default async function StudentDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  const student = await getStudent(params.id, session.user.tenantId)

  if (!student) {
    notFound()
  }

  const primaryGuardian = student.guardians.find((g) => g.isPrimary) || student.guardians[0]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{student.legalName}</h1>
          <p className="text-muted-foreground">Student Profile</p>
        </div>
        <Link href={`/dashboard/students/${student.id}/edit`}>
          <Button>
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        </Link>
      </div>

      {/* Profile Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader className="text-center">
            <Avatar className="h-32 w-32 mx-auto mb-4">
              <AvatarImage src={student.profilePhoto || ""} alt={student.legalName} />
              <AvatarFallback className="text-4xl">
                {student.legalName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <CardTitle>{student.legalName}</CardTitle>
            {student.preferredName && (
              <CardDescription>&quot;{student.preferredName}&quot;</CardDescription>
            )}
            <div className="pt-2">
              <Badge>{student.studentStatus}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Admission Number</div>
              <div className="text-sm font-mono">{student.admissionNumber}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Date of Birth</div>
              <div className="text-sm">{formatDate(student.dateOfBirth)}</div>
              <div className="text-xs text-muted-foreground">{calculateAge(student.dateOfBirth)} years old</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Gender</div>
              <div className="text-sm capitalize">{student.gender.toLowerCase()}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Current Class</div>
              <div className="text-sm">
                {student.currentClass ? student.currentClass.name : "Not assigned"}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                    <Mail className="h-4 w-4" />
                    Email
                  </div>
                  <div className="text-sm">{student.user.email || "Not provided"}</div>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                    <Phone className="h-4 w-4" />
                    Phone
                  </div>
                  <div className="text-sm">{student.user.phone || "Not provided"}</div>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                  <MapPin className="h-4 w-4" />
                  Address
                </div>
                <div className="text-sm">
                  {student.address && (
                    <>
                      {student.address}<br />
                      {student.city}, {student.state} {student.zipCode}
                    </>
                  )}
                  {!student.address && "Not provided"}
                </div>
              </div>
            </div>

            {primaryGuardian && (
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 text-sm font-medium mb-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  Primary Guardian
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <div className="text-sm font-medium">{primaryGuardian.guardian.user.name}</div>
                    <div className="text-sm text-muted-foreground capitalize">
                      {primaryGuardian.relationship.toLowerCase()}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm">{primaryGuardian.guardian.user.email}</div>
                    <div className="text-sm">{primaryGuardian.guardian.user.phone}</div>
                  </div>
                </div>
              </div>
            )}

            {(student.allergies.length > 0 || student.medicalConditions.length > 0) && (
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 text-sm font-medium mb-2">
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                  Health Information
                </div>
                <div className="space-y-2">
                  {student.allergies.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Allergies</div>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {student.allergies.map((allergy, index) => (
                          <Badge key={index} variant="warning">{allergy}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {student.medicalConditions.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Medical Conditions</div>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {student.medicalConditions.map((condition, index) => (
                          <Badge key={index} variant="destructive">{condition}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="learning-plans" className="space-y-4">
        <TabsList>
          <TabsTrigger value="learning-plans">Learning Plans</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="guardians">Guardians</TabsTrigger>
        </TabsList>

        <TabsContent value="learning-plans" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Individual Learning Plans</CardTitle>
              <CardDescription>Montessori personalized learning objectives</CardDescription>
            </CardHeader>
            <CardContent>
              {student.learningPlans.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No learning plans created yet
                </p>
              ) : (
                <div className="space-y-4">
                  {student.learningPlans.map((plan) => (
                    <div key={plan.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold">{plan.title}</h3>
                          <p className="text-sm text-muted-foreground">{plan.description}</p>
                        </div>
                        <Badge>{plan.status}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Teacher: {plan.teacher.user.name}</span>
                        <span>•</span>
                        <span>{plan.activities.length} activities</span>
                        <span>•</span>
                        <span>{formatDate(plan.startDate)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Attendance History</CardTitle>
              <CardDescription>Recent attendance records</CardDescription>
            </CardHeader>
            <CardContent>
              {student.attendanceRecords.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No attendance records yet
                </p>
              ) : (
                <div className="space-y-2">
                  {student.attendanceRecords.map((record) => (
                    <div key={record.id} className="flex items-center justify-between py-2 border-b">
                      <div>
                        <div className="font-medium">{formatDate(record.date)}</div>
                        {record.remarks && (
                          <div className="text-sm text-muted-foreground">{record.remarks}</div>
                        )}
                      </div>
                      <Badge variant={record.status === "PRESENT" ? "success" : "destructive"}>
                        {record.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assessments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Assessment Results</CardTitle>
              <CardDescription>Recent test and exam scores</CardDescription>
            </CardHeader>
            <CardContent>
              {student.assessmentResults.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No assessment results yet
                </p>
              ) : (
                <div className="space-y-4">
                  {student.assessmentResults.map((result) => (
                    <div key={result.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold">{result.assessment.title}</h3>
                          <p className="text-sm text-muted-foreground">{result.assessment.subject}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">{result.percentage}%</div>
                          {result.grade && <div className="text-sm text-muted-foreground">Grade: {result.grade}</div>}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {result.obtainedMarks} / {result.totalMarks} marks
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guardians" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Guardians</CardTitle>
              <CardDescription>Authorized guardians and emergency contacts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {student.guardians.map((sg) => (
                  <div key={sg.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{sg.guardian.user.name}</h3>
                        <p className="text-sm text-muted-foreground capitalize">
                          {sg.relationship.toLowerCase()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {sg.isPrimary && <Badge>Primary</Badge>}
                        {sg.canPickup && <Badge variant="outline">Can Pickup</Badge>}
                      </div>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        {sg.guardian.user.email}
                      </div>
                      {sg.guardian.user.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3" />
                          {sg.guardian.user.phone}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
