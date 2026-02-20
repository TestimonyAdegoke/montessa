import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatRelativeTime } from "@/lib/utils"
import {
  Users,
  UserCheck,
  BookOpen,
  DollarSign,
  Calendar,
  MessageSquare,
  AlertCircle,
  FileText,
  Shield,
  ClipboardList,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Clock,
  Layout,
  Sparkles,
  Zap,
} from "lucide-react"

const ACTION_ICONS: Record<string, { icon: any, color: string, bg: string }> = {
  CREATE: { icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
  UPDATE: { icon: FileText, color: "text-indigo-500", bg: "bg-indigo-500/10" },
  DELETE: { icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10" },
  ATTENDANCE_MARKED: { icon: UserCheck, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  MESSAGE_SENT: { icon: MessageSquare, color: "text-violet-500", bg: "bg-violet-500/10" },
  PAYMENT_RECEIVED: { icon: DollarSign, color: "text-green-500", bg: "bg-green-500/10" },
  PASSWORD_RESET_REQUESTED: { icon: Shield, color: "text-orange-500", bg: "bg-orange-500/10" },
  PASSWORD_RESET_COMPLETED: { icon: Shield, color: "text-green-500", bg: "bg-green-500/10" },
}

async function getDashboardStats(tenantId: string) {
  const totalStudents = await prisma.student.count({ where: { tenantId } })
  const activeStudents = await prisma.student.count({ where: { tenantId, studentStatus: "ACTIVE" } })
  const totalTeachers = await prisma.teacher.count({ where: { User: { tenantId } } })
  const totalClasses = await prisma.class.count({ where: { tenantId, status: "ACTIVE" } })
  const todayAttendance = await prisma.attendanceRecord.count({
    where: {
      tenantId,
      date: {
        gte: new Date(new Date().setHours(0, 0, 0, 0)),
        lt: new Date(new Date().setHours(23, 59, 59, 999)),
      },
      status: "PRESENT",
    },
  })
  const pendingInvoices = await prisma.invoice.count({
    where: { tenantId, status: { in: ["PENDING", "OVERDUE"] } },
  })
  const unreadMessages = await prisma.message.count({
    where: { tenantId, isRead: false },
  })

  return {
    totalStudents,
    activeStudents,
    totalTeachers,
    totalClasses,
    todayAttendance,
    pendingInvoices,
    unreadMessages,
  }
}

async function getRecentActivity(tenantId: string) {
  const logs = await prisma.auditLog.findMany({
    where: { tenantId },
    include: {
      User: { select: { name: true } },
    },
    orderBy: { timestamp: "desc" },
    take: 6,
  })
  return logs
}

async function getUpcomingSchedules(tenantId: string) {
  const today = new Date()
  const dayOfWeek = today.getDay()

  const schedules = await prisma.schedule.findMany({
    where: {
      Class: { tenantId },
      isActive: true,
      dayOfWeek: { gte: dayOfWeek },
    },
    include: {
      Class: { select: { name: true } },
      Room: { select: { name: true } },
    },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    take: 5,
  })

  return schedules
}

async function getUpcomingAssessments(tenantId: string) {
  const assessments = await prisma.assessment.findMany({
    where: {
      Class: { tenantId },
      scheduledDate: { gte: new Date() },
      status: { in: ["PUBLISHED", "ONGOING"] },
    },
    include: {
      Class: { select: { name: true } },
    },
    orderBy: { scheduledDate: "asc" },
    take: 3,
  })
  return assessments
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  const [stats, recentActivity, upcomingSchedules, upcomingAssessments] = await Promise.all([
    getDashboardStats(session.user.tenantId),
    getRecentActivity(session.user.tenantId),
    getUpcomingSchedules(session.user.tenantId),
    getUpcomingAssessments(session.user.tenantId),
  ])

  const attendanceRate = stats.activeStudents > 0
    ? Math.round((stats.todayAttendance / stats.activeStudents) * 100)
    : 0

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const STATS_CARDS = [
    {
      title: "Active Students",
      value: stats.totalStudents,
      description: `${stats.activeStudents} currently enrolled`,
      icon: Users,
      trend: "+12%",
      trendUp: true,
      color: "from-blue-600 to-cyan-500",
      iconBg: "bg-blue-500",
      ring: "ring-blue-500/20",
    },
    {
      title: "Attendance",
      value: `${attendanceRate}%`,
      description: `${stats.todayAttendance} students present`,
      icon: UserCheck,
      trend: "+5.2%",
      trendUp: true,
      color: "from-emerald-600 to-teal-500",
      iconBg: "bg-emerald-500",
      ring: "ring-emerald-500/20",
    },
    {
      title: "Classes",
      value: stats.totalClasses,
      description: `${stats.totalTeachers} active teachers`,
      icon: BookOpen,
      trend: "+2",
      trendUp: true,
      color: "from-violet-600 to-purple-500",
      iconBg: "bg-violet-500",
      ring: "ring-violet-500/20",
    },
    {
      title: "Pending Dues",
      value: stats.pendingInvoices,
      description: "Invoices awaiting payment",
      icon: DollarSign,
      trend: "-14%",
      trendUp: false,
      color: "from-orange-600 to-amber-500",
      iconBg: "bg-orange-500",
      ring: "ring-orange-500/20",
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Dashboard</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            School Overview
          </h1>
          <p className="text-muted-foreground mt-1.5">
            Welcome back, <span className="text-foreground font-semibold">{session.user.name || session.user.email}</span>. Here&apos;s what&apos;s happening across your school.
          </p>
        </div>
        <Button className="rounded-xl h-11 px-6 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-white font-bold transition-all hover:scale-[1.02] active:scale-95 self-start md:self-auto">
          <Layout className="w-4 h-4 mr-2" />
          Generate Report
        </Button>
      </div>

      {/* Stats Grid — perfectly aligned cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {STATS_CARDS.map((stat) => (
          <Card key={stat.title} className="group relative rounded-2xl border-border/40 bg-background/80 backdrop-blur-sm shadow-md hover:shadow-xl hover:border-primary/15 transition-all duration-300 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.iconBg} text-white shadow-lg ring-4 ${stat.ring} group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <Badge
                  variant="outline"
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border-0 ${stat.trendUp
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-red-500/10 text-red-600 dark:text-red-400"
                    }`}
                >
                  {stat.trendUp ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                  {stat.trend}
                </Badge>
              </div>
              <div className="text-3xl font-black tracking-tight leading-none">{stat.value}</div>
              <p className="text-sm font-semibold text-muted-foreground mt-1.5">{stat.title}</p>
              <p className="text-[11px] text-muted-foreground/60 mt-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0" />
                {stat.description}
              </p>
            </CardContent>
            {/* Subtle gradient overlay on hover */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500 pointer-events-none`} />
          </Card>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Recent Activity — takes 3 of 5 cols */}
        <Card className="lg:col-span-3 rounded-2xl border-border/40 shadow-lg overflow-hidden bg-background/80 backdrop-blur-sm">
          <CardHeader className="px-6 py-5 border-b border-border/30 bg-muted/10">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  Recent Activity
                </CardTitle>
                <CardDescription className="mt-0.5 text-xs">Latest updates from your school</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="rounded-lg text-xs font-bold text-primary hover:bg-primary/10">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {recentActivity.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Layout className="w-10 h-10 mb-3 opacity-10" />
                <p className="text-sm font-medium">No recent activity found</p>
              </div>
            ) : (
              <div className="divide-y divide-border/30">
                {recentActivity.map((log) => {
                  const iconConfig = ACTION_ICONS[log.action] || { icon: FileText, color: "text-muted-foreground", bg: "bg-muted" }
                  const Icon = iconConfig.icon
                  return (
                    <div key={log.id} className="px-6 py-4 transition-all hover:bg-muted/20 group flex items-center gap-4">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconConfig.bg} ${iconConfig.color} group-hover:scale-105 transition-transform`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold leading-tight truncate">
                          {log.action.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
                          {log.entity && ` — ${log.entity}`}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                          by <span className="text-foreground font-medium">{log.User?.name || "System"}</span>
                        </p>
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-tighter whitespace-nowrap shrink-0">
                        {formatRelativeTime(log.timestamp)}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right column — takes 2 of 5 cols */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming */}
          <Card className="rounded-2xl border-border/40 shadow-lg overflow-hidden bg-background/80 backdrop-blur-sm">
            <CardHeader className="px-6 py-5 border-b border-border/30 bg-muted/10">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                Next Up
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">Upcoming schedules & assessments</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2">
                {upcomingSchedules.length > 0 || upcomingAssessments.length > 0 ? (
                  <>
                    {upcomingSchedules.map((schedule) => (
                      <div key={schedule.id} className="group flex items-center gap-3 p-3 rounded-xl hover:bg-muted/30 transition-all">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-white shadow-md">
                          <Clock className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold leading-tight truncate">{schedule.subject}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {daysOfWeek[schedule.dayOfWeek]} {schedule.startTime} – {schedule.endTime}
                            {schedule.Room && ` · ${schedule.Room.name}`}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-[9px] shrink-0 font-bold">{schedule.Class.name}</Badge>
                      </div>
                    ))}

                    {upcomingAssessments.map((assessment) => (
                      <div key={assessment.id} className="group flex items-center gap-3 p-3 rounded-xl hover:bg-muted/30 transition-all">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-500 text-white shadow-md">
                          <ClipboardList className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold leading-tight truncate">{assessment.title}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {assessment.scheduledDate ? formatRelativeTime(assessment.scheduledDate) : 'Not scheduled'}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-[9px] shrink-0 font-bold">{assessment.Class.name}</Badge>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-muted-foreground/40">
                    <Calendar className="w-8 h-8 mb-2" />
                    <p className="text-xs font-medium">Nothing on the horizon</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Analytics CTA */}
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary via-indigo-600 to-violet-700 text-white p-7 shadow-xl shadow-primary/20">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="h-5 w-5 text-yellow-300" />
                <h3 className="text-lg font-bold">School Analytics</h3>
              </div>
              <p className="text-white/70 text-sm mb-5 leading-relaxed">Get deeper insights into student performance and attendance trends.</p>
              <Button className="w-full rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white font-bold h-10 border border-white/20 transition-all">
                View Reports
                <ArrowUpRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 blur-2xl" />
          </div>
        </div>
      </div>
    </div>
  )
}
