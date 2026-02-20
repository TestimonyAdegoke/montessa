import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, Palette, Calculator, Globe, Heart, Dumbbell, BookOpen } from "lucide-react"

const CATEGORY_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  PRACTICAL_LIFE: { label: "Practical Life", icon: Heart, color: "text-pink-500" },
  SENSORIAL: { label: "Sensorial", icon: Brain, color: "text-purple-500" },
  LANGUAGE: { label: "Language", icon: BookOpen, color: "text-blue-500" },
  MATHEMATICS: { label: "Mathematics", icon: Calculator, color: "text-green-500" },
  CULTURAL: { label: "Cultural", icon: Globe, color: "text-amber-500" },
  CREATIVE_ARTS: { label: "Creative Arts", icon: Palette, color: "text-rose-500" },
  PHYSICAL_EDUCATION: { label: "Physical Education", icon: Dumbbell, color: "text-cyan-500" },
}

function getMasteryLevel(percentage: number): { label: string; variant: "success" | "outline" | "secondary" | "destructive" } {
  if (percentage >= 80) return { label: "Mastered", variant: "success" }
  if (percentage >= 60) return { label: "Proficient", variant: "outline" }
  if (percentage >= 30) return { label: "Developing", variant: "secondary" }
  return { label: "Emerging", variant: "destructive" }
}

export default async function ProgressTrackingPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user || !["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "HOD"].includes(session.user.role)) {
    redirect("/dashboard")
  }

  // Fetch all active learning plans with activities
  const rawPlans = await prisma.individualLearningPlan.findMany({
    where: {
      Teacher: { User: { tenantId: session.user.tenantId } },
      status: "ACTIVE",
    },
    include: {
      Student: {
        include: { User: { select: { name: true } } },
      },
      Teacher: {
        include: { User: { select: { name: true } } },
      },
      LearningActivity: {
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { updatedAt: "desc" },
  })
  const plans = rawPlans.map(({ Student, Teacher, LearningActivity, ...rest }) => ({
    ...rest,
    student: { ...Student, user: Student.User },
    teacher: { ...Teacher, user: Teacher.User },
    activities: LearningActivity,
  }))

  // Build category summaries across all plans
  const categorySummaries = Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
    const activities = plans.flatMap((p) => p.activities).filter((a) => a.category === key)
    const completed = activities.filter((a) => a.status === "COMPLETED").length
    const total = activities.length
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

    return {
      category: key,
      ...config,
      completed,
      total,
      percentage,
      mastery: getMasteryLevel(percentage),
    }
  })

  const totalActivities = plans.reduce((sum, p) => sum + p.activities.length, 0)
  const completedActivities = plans.reduce(
    (sum, p) => sum + p.activities.filter((a) => a.status === "COMPLETED").length, 0
  )
  const overallProgress = totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Progress Tracking</h1>
        <p className="text-muted-foreground">Montessori skill mastery and activity completion by category</p>
      </div>

      {/* Overall Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{plans.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Activities Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedActivities} / {totalActivities}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{overallProgress}%</div>
            <Progress value={overallProgress} className="h-2" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="categories">
        <TabsList>
          <TabsTrigger value="categories">By Category</TabsTrigger>
          <TabsTrigger value="students">By Student</TabsTrigger>
        </TabsList>

        {/* Categories View */}
        <TabsContent value="categories">
          <div className="grid gap-4 md:grid-cols-2">
            {categorySummaries.map((cat) => {
              const Icon = cat.icon
              return (
                <Card key={cat.category}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className={`h-5 w-5 ${cat.color}`} />
                        <CardTitle className="text-base">{cat.label}</CardTitle>
                      </div>
                      <Badge variant={cat.mastery.variant}>{cat.mastery.label}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{cat.completed} / {cat.total} activities</span>
                        <span className="font-medium">{cat.percentage}%</span>
                      </div>
                      <Progress value={cat.percentage} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Students View */}
        <TabsContent value="students">
          {plans.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-1">No active learning plans</h3>
                <p className="text-sm text-muted-foreground">Create learning plans to start tracking progress</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {plans.map((plan) => {
                const completed = plan.activities.filter((a) => a.status === "COMPLETED").length
                const total = plan.activities.length
                const pct = total > 0 ? Math.round((completed / total) * 100) : 0
                const mastery = getMasteryLevel(pct)

                // Group activities by category
                const byCategory = plan.activities.reduce((acc, a) => {
                  if (!acc[a.category]) acc[a.category] = { completed: 0, total: 0 }
                  acc[a.category].total++
                  if (a.status === "COMPLETED") acc[a.category].completed++
                  return acc
                }, {} as Record<string, { completed: number; total: number }>)

                return (
                  <Card key={plan.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{plan.title}</CardTitle>
                          <CardDescription>
                            {plan.student.user.name} · Teacher: {plan.teacher.user.name}
                          </CardDescription>
                        </div>
                        <Badge variant={mastery.variant}>{mastery.label} ({pct}%)</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Overall</span>
                            <span>{completed}/{total}</span>
                          </div>
                          <Progress value={pct} className="h-2" />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 pt-2">
                          {Object.entries(byCategory).map(([cat, data]) => {
                            const config = CATEGORY_CONFIG[cat]
                            const catPct = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0
                            return (
                              <div key={cat} className="flex items-center gap-2 text-sm">
                                <div className={`w-2 h-2 rounded-full ${config?.color.replace("text-", "bg-") || "bg-gray-400"}`} />
                                <span className="text-muted-foreground truncate">{config?.label || cat}</span>
                                <span className="ml-auto font-medium">{catPct}%</span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
