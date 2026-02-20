import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDate } from "@/lib/utils"
import { DailyUpdateForm } from "@/components/daily-updates/daily-update-form"
import { Sun, Utensils, Moon, Smile, Camera, Clock, CheckCircle2, AlertCircle } from "lucide-react"

const moodEmojis: Record<string, string> = {
  HAPPY: "😊",
  CALM: "😌",
  TIRED: "😴",
  UPSET: "😢",
  ENERGETIC: "⚡",
}

export default async function DailyUpdatesPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")

  const isTeacher = ["TEACHER", "TENANT_ADMIN", "SUPER_ADMIN", "HOD"].includes(session.user.role)
  const isGuardian = session.user.role === "GUARDIAN"

  if (!isTeacher && !isGuardian) redirect("/dashboard")

  // For teachers: get their classes and today's updates
  let classes: any[] = []
  let todayUpdates: any[] = []
  let studentList: any[] = []

  if (isTeacher) {
    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.user.id },
      include: {
        ClassTeacher: {
          include: { Class: { select: { id: true, name: true, grade: true } } },
        },
      },
    })

    classes = teacher?.ClassTeacher.map((ct) => ct.Class) || []

    if (classes.length > 0) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      todayUpdates = await prisma.dailyUpdate.findMany({
        where: {
          tenantId: session.user.tenantId,
          classId: { in: classes.map((c: any) => c.id) },
          date: { gte: today, lt: tomorrow },
        },
      })

      // Get students in first class
      if (classes[0]) {
        studentList = await prisma.student.findMany({
          where: { currentClassId: classes[0].id, studentStatus: "ACTIVE" },
          select: { id: true, legalName: true, preferredName: true, profilePhoto: true },
          orderBy: { legalName: "asc" },
        })
      }
    }
  }

  // For guardians: get their children's updates
  let childUpdates: any[] = []
  if (isGuardian) {
    const guardian = await prisma.guardian.findUnique({
      where: { userId: session.user.id },
      include: {
        StudentGuardian: {
          include: {
            Student: {
              select: { id: true, legalName: true, preferredName: true, profilePhoto: true },
            },
          },
        },
      },
    })

    const studentIds = guardian?.StudentGuardian.map((sg) => sg.Student.id) || []

    if (studentIds.length > 0) {
      childUpdates = await prisma.dailyUpdate.findMany({
        where: { studentId: { in: studentIds }, isPublished: true },
        orderBy: { date: "desc" },
        take: 30,
      })

      // Enrich with student names
      const studentMap = new Map(
        guardian?.StudentGuardian.map((sg) => [sg.Student.id, sg.Student]) || []
      )
      childUpdates = childUpdates.map((u: any) => ({
        ...u,
        student: studentMap.get(u.studentId),
      }))
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Daily Updates</h1>
        <p className="text-muted-foreground">
          {isTeacher
            ? "Record and share daily activities, meals, and observations for each student"
            : "See what your child did today at school"}
        </p>
      </div>

      {isTeacher && (
        <Tabs defaultValue="create">
          <TabsList>
            <TabsTrigger value="create">Create Updates</TabsTrigger>
            <TabsTrigger value="today">Today&apos;s Updates ({todayUpdates.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="create">
            <DailyUpdateForm
              classes={classes}
              students={studentList}
              tenantId={session.user.tenantId}
            />
          </TabsContent>

          <TabsContent value="today">
            {todayUpdates.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Sun className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-1">No updates created today</h3>
                  <p className="text-sm text-muted-foreground">Switch to the Create tab to start recording daily activities.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {todayUpdates.map((update: any) => (
                  <DailyUpdateCard key={update.id} update={update} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      {isGuardian && (
        <div className="space-y-4">
          {childUpdates.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Sun className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-1">No updates yet</h3>
                <p className="text-sm text-muted-foreground">Daily updates from your child&apos;s teacher will appear here.</p>
              </CardContent>
            </Card>
          ) : (
            childUpdates.map((update: any) => (
              <DailyUpdateCard key={update.id} update={update} showStudentName />
            ))
          )}
        </div>
      )}
    </div>
  )
}

function DailyUpdateCard({ update, showStudentName }: { update: any; showStudentName?: boolean }) {
  const activities = (update.activities as any[]) || []
  const meals = update.meals as any
  const nap = update.nap as any

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            {showStudentName && update.student && (
              <CardTitle className="text-lg">{update.student.preferredName || update.student.legalName}</CardTitle>
            )}
            <CardDescription className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5" />
              {formatDate(update.date)}
              {update.mood && <span className="text-base">{moodEmojis[update.mood] || update.mood}</span>}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {update.isPublished ? (
              <Badge variant="success" className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Published
              </Badge>
            ) : (
              <Badge variant="secondary">Draft</Badge>
            )}
            {update.parentViewed && (
              <Badge variant="outline" className="text-xs">Viewed by parent</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Activities */}
        {activities.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-1.5">
              <Sun className="h-4 w-4 text-yellow-500" /> Activities
            </h4>
            <div className="space-y-1.5">
              {activities.map((a: any, i: number) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-muted-foreground min-w-[60px]">{a.time}</span>
                  <div>
                    <span className="font-medium">{a.activity}</span>
                    {a.category && (
                      <Badge variant="outline" className="ml-2 text-[10px]">{a.category}</Badge>
                    )}
                    {a.notes && <p className="text-xs text-muted-foreground mt-0.5">{a.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Meals */}
        {meals && (
          <div>
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-1.5">
              <Utensils className="h-4 w-4 text-orange-500" /> Meals
            </h4>
            <div className="grid grid-cols-3 gap-3 text-sm">
              {["breakfast", "lunch", "snack"].map((meal) => {
                const m = meals[meal]
                if (!m) return null
                return (
                  <div key={meal} className="bg-muted/50 rounded-lg p-2">
                    <span className="font-medium capitalize">{meal}</span>
                    <Badge variant="outline" className="ml-1 text-[10px]">{m.status}</Badge>
                    {m.notes && <p className="text-xs text-muted-foreground mt-1">{m.notes}</p>}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Nap */}
        {nap && nap.startTime && (
          <div>
            <h4 className="font-semibold text-sm mb-1 flex items-center gap-1.5">
              <Moon className="h-4 w-4 text-indigo-500" /> Nap
            </h4>
            <p className="text-sm">
              {nap.startTime} - {nap.endTime || "ongoing"}
              {nap.quality && <Badge variant="outline" className="ml-2 text-[10px]">{nap.quality}</Badge>}
            </p>
          </div>
        )}

        {/* Photos */}
        {update.photos?.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-1.5">
              <Camera className="h-4 w-4 text-pink-500" /> Photos
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {update.photos.map((photo: string, i: number) => (
                <img key={i} src={photo} alt="" className="rounded-lg object-cover w-full h-32" />
              ))}
            </div>
          </div>
        )}

        {/* Highlights & Concerns */}
        {update.highlights && (
          <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-3">
            <h4 className="font-semibold text-sm text-green-700 dark:text-green-400 mb-1">Highlights</h4>
            <p className="text-sm">{update.highlights}</p>
          </div>
        )}

        {update.concerns && (
          <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-3">
            <h4 className="font-semibold text-sm text-amber-700 dark:text-amber-400 mb-1 flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5" /> Concerns
            </h4>
            <p className="text-sm">{update.concerns}</p>
          </div>
        )}

        {update.teacherNote && (
          <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3">
            <h4 className="font-semibold text-sm text-blue-700 dark:text-blue-400 mb-1">Teacher&apos;s Note</h4>
            <p className="text-sm">{update.teacherNote}</p>
          </div>
        )}

        {update.parentComment && (
          <div className="bg-purple-50 dark:bg-purple-950/30 rounded-lg p-3">
            <h4 className="font-semibold text-sm text-purple-700 dark:text-purple-400 mb-1">Parent&apos;s Comment</h4>
            <p className="text-sm">{update.parentComment}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
