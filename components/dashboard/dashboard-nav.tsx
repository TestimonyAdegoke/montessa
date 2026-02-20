"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  UserCheck,
  BookOpen,
  Calendar,
  FileText,
  DollarSign,
  MessageSquare,
  BarChart3,
  Settings,
  Building2,
  ClipboardList,
  Heart,
  UserCog,
  Megaphone,
  GraduationCap,
  UserPlus,
  CalendarDays,
  Shield,
  DoorOpen,
  BookOpenCheck,
  PieChart,
  ScanLine,
  FileCheck,
  FolderOpen,
  Globe,
  Sun,
  Bell,
  Map,
  Briefcase,
  FileSignature,
  HelpCircle,
  Landmark,
  UserCheck2,
  HeartPulse,
  Percent,
  Bus,
  AlertTriangle,
  TrendingUp,
  Award,
  ArrowRightLeft,
  CalendarClock,
  ListTodo,
  Library,
  ScrollText,
  ListOrdered,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  X,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface DashboardNavProps {
  userRole: string
}

interface NavItem {
  title: string
  href: string
  icon: LucideIcon
  roles: string[]
}

interface NavGroup {
  label: string
  icon: LucideIcon
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    label: "Overview",
    icon: LayoutDashboard,
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "GUARDIAN", "STUDENT", "HOD", "HR", "FINANCE"] },
      { title: "Notifications", href: "/dashboard/notifications", icon: Bell, roles: ["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "GUARDIAN", "STUDENT", "HOD", "HR", "FINANCE"] },
      { title: "Tasks", href: "/dashboard/tasks", icon: ListTodo, roles: ["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "HOD", "HR", "FINANCE"] },
    ],
  },
  {
    label: "My Portal",
    icon: Heart,
    items: [
      { title: "My Children", href: "/dashboard/children", icon: Heart, roles: ["GUARDIAN"] },
      { title: "My Learning", href: "/dashboard/my-learning", icon: GraduationCap, roles: ["STUDENT"] },
    ],
  },
  {
    label: "Academics",
    icon: BookOpen,
    items: [
      { title: "Students", href: "/dashboard/students", icon: Users, roles: ["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "HOD"] },
      { title: "Classes", href: "/dashboard/classes", icon: BookOpen, roles: ["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "HOD"] },
      { title: "Assessments", href: "/dashboard/assessments", icon: FileText, roles: ["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "HOD"] },
      { title: "Gradebook", href: "/dashboard/gradebook", icon: BookOpenCheck, roles: ["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "HOD"] },
      { title: "Report Cards", href: "/dashboard/report-cards", icon: FileCheck, roles: ["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "HOD"] },
      { title: "Transcripts", href: "/dashboard/transcripts", icon: ScrollText, roles: ["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "HOD"] },
      { title: "Homework", href: "/dashboard/homework", icon: ClipboardList, roles: ["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "HOD"] },
      { title: "Question Bank", href: "/dashboard/question-bank", icon: HelpCircle, roles: ["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "HOD"] },
      { title: "Achievements", href: "/dashboard/achievements", icon: Award, roles: ["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "HOD"] },
    ],
  },
  {
    label: "Teaching",
    icon: ClipboardList,
    items: [
      { title: "Learning Plans", href: "/dashboard/learning-plans", icon: ClipboardList, roles: ["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "HOD"] },
      { title: "Lesson Plans", href: "/dashboard/lesson-plans", icon: BookOpenCheck, roles: ["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "HOD"] },
      { title: "Curriculum", href: "/dashboard/curriculum", icon: Map, roles: ["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "HOD", "GUARDIAN", "STUDENT"] },
      { title: "Progress Tracking", href: "/dashboard/progress", icon: BarChart3, roles: ["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "HOD"] },
      { title: "Daily Updates", href: "/dashboard/daily-updates", icon: Sun, roles: ["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "GUARDIAN", "HOD"] },
    ],
  },
  {
    label: "Scheduling",
    icon: Calendar,
    items: [
      { title: "Timetable", href: "/dashboard/schedule", icon: Calendar, roles: ["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "GUARDIAN", "HOD", "STUDENT"] },
      { title: "Exam Timetable", href: "/dashboard/exam-timetable", icon: CalendarClock, roles: ["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "HOD", "STUDENT", "GUARDIAN"] },
      { title: "Events", href: "/dashboard/events", icon: CalendarDays, roles: ["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "GUARDIAN", "STUDENT", "HOD"] },
      { title: "Substitutions", href: "/dashboard/substitutions", icon: ArrowRightLeft, roles: ["SUPER_ADMIN", "TENANT_ADMIN", "HOD", "HR"] },
      { title: "Room Booking", href: "/dashboard/rooms", icon: DoorOpen, roles: ["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "HOD"] },
    ],
  },
  {
    label: "Attendance",
    icon: UserCheck,
    items: [
      { title: "Student Attendance", href: "/dashboard/attendance", icon: UserCheck, roles: ["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "HOD"] },
      { title: "Check-In / Out", href: "/dashboard/checkin", icon: ScanLine, roles: ["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "HR"] },
      { title: "Pickup", href: "/dashboard/pickup", icon: Shield, roles: ["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "HR"] },
      { title: "Staff Attendance", href: "/dashboard/staff-attendance", icon: UserCog, roles: ["SUPER_ADMIN", "TENANT_ADMIN", "HR"] },
    ],
  },
  {
    label: "Communication",
    icon: MessageSquare,
    items: [
      { title: "Messages", href: "/dashboard/messages", icon: MessageSquare, roles: ["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "GUARDIAN", "HOD"] },
      { title: "Announcements", href: "/dashboard/announcements", icon: Megaphone, roles: ["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "GUARDIAN", "STUDENT", "HOD"] },
      { title: "Community", href: "/dashboard/community", icon: Globe, roles: ["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "GUARDIAN", "STUDENT", "HOD"] },
      { title: "Consent Forms", href: "/dashboard/consent", icon: FileSignature, roles: ["SUPER_ADMIN", "TENANT_ADMIN", "GUARDIAN"] },
    ],
  },
  {
    label: "Finance",
    icon: DollarSign,
    items: [
      { title: "Billing", href: "/dashboard/billing", icon: DollarSign, roles: ["SUPER_ADMIN", "TENANT_ADMIN", "GUARDIAN", "FINANCE"] },
      { title: "Discounts", href: "/dashboard/discounts", icon: Percent, roles: ["SUPER_ADMIN", "TENANT_ADMIN", "FINANCE"] },
      { title: "Contracts", href: "/dashboard/contracts", icon: FileSignature, roles: ["SUPER_ADMIN", "TENANT_ADMIN", "GUARDIAN"] },
      { title: "Reports", href: "/dashboard/reports", icon: PieChart, roles: ["SUPER_ADMIN", "TENANT_ADMIN", "FINANCE"] },
    ],
  },
  {
    label: "People & HR",
    icon: Briefcase,
    items: [
      { title: "Teachers", href: "/dashboard/teachers", icon: UserCog, roles: ["SUPER_ADMIN", "TENANT_ADMIN", "HR", "HOD"] },
      { title: "Parents", href: "/dashboard/parents", icon: Users, roles: ["SUPER_ADMIN", "TENANT_ADMIN", "HR", "HOD"] },
      { title: "Staff Directory", href: "/dashboard/staff", icon: Briefcase, roles: ["SUPER_ADMIN", "TENANT_ADMIN", "HR"] },
      { title: "Alumni", href: "/dashboard/alumni", icon: GraduationCap, roles: ["SUPER_ADMIN", "TENANT_ADMIN", "HR"] },
      { title: "Visitors", href: "/dashboard/visitors", icon: UserCheck2, roles: ["SUPER_ADMIN", "TENANT_ADMIN", "HR"] },
      { title: "Health Records", href: "/dashboard/health", icon: HeartPulse, roles: ["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "HOD", "HR"] },
    ],
  },
  {
    label: "Admissions",
    icon: UserPlus,
    items: [
      { title: "Applications", href: "/dashboard/admissions", icon: UserPlus, roles: ["SUPER_ADMIN", "TENANT_ADMIN"] },
      { title: "Waitlist", href: "/dashboard/admissions/waitlist", icon: ListOrdered, roles: ["SUPER_ADMIN", "TENANT_ADMIN"] },
    ],
  },
  {
    label: "Resources",
    icon: Library,
    items: [
      { title: "Library", href: "/dashboard/library", icon: Library, roles: ["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "HOD", "STUDENT"] },
      { title: "Documents", href: "/dashboard/documents", icon: FolderOpen, roles: ["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "HOD"] },
      { title: "Transport", href: "/dashboard/transport", icon: Bus, roles: ["SUPER_ADMIN", "TENANT_ADMIN"] },
    ],
  },
  {
    label: "Analytics",
    icon: TrendingUp,
    items: [
      { title: "Overview", href: "/dashboard/analytics", icon: BarChart3, roles: ["SUPER_ADMIN", "TENANT_ADMIN"] },
      { title: "Leadership", href: "/dashboard/analytics/leadership", icon: TrendingUp, roles: ["SUPER_ADMIN", "TENANT_ADMIN"] },
      { title: "At-Risk Students", href: "/dashboard/analytics/at-risk", icon: AlertTriangle, roles: ["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "HOD"] },
      { title: "Reports", href: "/dashboard/analytics/reports", icon: FileText, roles: ["SUPER_ADMIN", "TENANT_ADMIN", "FINANCE", "HR", "HOD"] },
    ],
  },
  {
    label: "Discipline",
    icon: Shield,
    items: [
      { title: "Incidents", href: "/dashboard/discipline", icon: Shield, roles: ["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "HOD"] },
    ],
  },
  {
    label: "Administration",
    icon: Settings,
    items: [
      { title: "Site Builder", href: "/dashboard/site-builder", icon: Sparkles, roles: ["SUPER_ADMIN", "TENANT_ADMIN"] },
      { title: "Form Builder", href: "/dashboard/form-builder", icon: ClipboardList, roles: ["SUPER_ADMIN", "TENANT_ADMIN"] },
      { title: "User Management", href: "/dashboard/users", icon: ShieldCheck, roles: ["SUPER_ADMIN", "TENANT_ADMIN"] },
      { title: "Campuses", href: "/dashboard/campuses", icon: Landmark, roles: ["SUPER_ADMIN", "TENANT_ADMIN"] },
      { title: "Tenants", href: "/dashboard/tenants", icon: Building2, roles: ["SUPER_ADMIN"] },
      { title: "Settings", href: "/dashboard/settings", icon: Settings, roles: ["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "GUARDIAN", "STUDENT", "HOD", "HR", "FINANCE"] },
    ],
  },
]

function NavGroupSection({
  group,
  userRole,
  collapsed,
  pathname,
  defaultOpen,
}: {
  group: NavGroup
  userRole: string
  collapsed: boolean
  pathname: string
  defaultOpen: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  const visibleItems = group.items.filter((item) => item.roles.includes(userRole))

  if (visibleItems.length === 0) return null

  const GroupIcon = group.icon
  const hasActiveChild = visibleItems.some(
    (item) => pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"))
  )

  if (collapsed) {
    return (
      <div className="mb-2">
        {visibleItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"))
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.title}
              className={cn(
                "flex items-center justify-center rounded-xl p-2.5 mb-1.5 transition-all duration-300",
                isActive
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105"
                  : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
              )}
            >
              <Icon className="h-5 w-5" />
            </Link>
          )
        })}
      </div>
    )
  }

  return (
    <div className="mb-2">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-[0.1em] transition-all duration-300",
          hasActiveChild
            ? "text-primary bg-primary/5"
            : "text-muted-foreground/70 hover:text-foreground hover:bg-muted/50"
        )}
      >
        <GroupIcon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
        <span className="flex-1 text-left">{group.label}</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-300",
            open ? "rotate-0" : "-rotate-90"
          )}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="mt-1 ml-4 border-l-2 border-primary/10 pl-3 space-y-1">
              {visibleItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl px-4 py-2 text-sm transition-all duration-200 relative",
                      isActive
                        ? "text-primary font-semibold bg-primary/10"
                        : "text-muted-foreground hover:bg-primary/5 hover:text-foreground"
                    )}
                  >
                    <Icon className={cn(
                      "h-4 w-4 shrink-0 transition-all duration-300",
                      isActive ? "scale-110" : "group-hover:scale-110"
                    )} />
                    <span className="truncate">{item.title}</span>
                    {isActive && (
                      <motion.div
                        layoutId="active-nav-indicator"
                        className="absolute left-[-13px] w-1 h-5 bg-primary rounded-full"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </Link>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function DashboardNav({ userRole }: DashboardNavProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    const handler = () => setMobileOpen((prev) => !prev)
    window.addEventListener("toggle-mobile-nav", handler)
    return () => window.removeEventListener("toggle-mobile-nav", handler)
  }, [])

  const isGroupActive = useCallback(
    (group: NavGroup) =>
      group.items.some(
        (item) =>
          item.roles.includes(userRole) &&
          (pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href + "/")))
      ),
    [pathname, userRole]
  )

  const sidebarContent = (isMobile: boolean) => (
    <ScrollArea className="h-full scrollbar-hide">
      <div className={cn("py-6", collapsed && !isMobile ? "px-2" : "px-4")}>
        {navGroups.map((group) => (
          <NavGroupSection
            key={group.label}
            group={group}
            userRole={userRole}
            collapsed={collapsed && !isMobile}
            pathname={pathname}
            defaultOpen={isGroupActive(group)}
          />
        ))}
      </div>
    </ScrollArea>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col bg-background/50 backdrop-blur-xl border-r transition-all duration-500 ease-in-out relative z-30",
          collapsed ? "w-[80px]" : "w-[280px]"
        )}
      >
        <div className={cn(
          "flex items-center h-20 px-6 border-b border-border/50 transition-all duration-500",
          collapsed ? "justify-center" : "justify-between"
        )}>
          {!collapsed && (
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-300">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg tracking-tight text-foreground leading-none">Montessa</span>
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-[0.2em] mt-1">SaaS Platform</span>
              </div>
            </Link>
          )}
          {collapsed && (
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center shadow-lg shadow-primary/20">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          )}
          {!collapsed && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 rounded-xl text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all duration-300"
            >
              <ChevronsLeft className="h-5 w-5" />
            </button>
          )}
        </div>

        {collapsed && (
          <div className="absolute -right-3 top-24 z-40">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-110 transition-transform"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="flex-1 overflow-hidden">
          {sidebarContent(false)}
        </div>

        <div className={cn(
          "p-4 border-t border-border/50 bg-muted/30 transition-all duration-300",
          collapsed ? "items-center" : ""
        )}>
          {!collapsed ? (
            <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-4 shadow-xl">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Pro Plan</p>
              <p className="text-sm font-medium text-white mb-3">Upgrade for more features</p>
              <button className="w-full py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold transition-all duration-300 shadow-lg shadow-primary/20">
                Upgrade Now
              </button>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[85%] max-w-[320px] border-r bg-background/95 backdrop-blur-xl shadow-2xl transform transition-transform duration-500 ease-in-out md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between h-20 px-6 border-b border-border/50">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">Montessa</span>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2.5 rounded-xl text-muted-foreground hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-hidden" style={{ height: "calc(100vh - 5rem)" }}>
          {sidebarContent(true)}
        </div>
      </aside>
    </>
  )
}

