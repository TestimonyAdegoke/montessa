"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"

const LABEL_MAP: Record<string, string> = {
  dashboard: "Dashboard",
  students: "Students",
  teachers: "Teachers",
  classes: "Classes",
  attendance: "Attendance",
  schedule: "Schedule",
  billing: "Billing",
  messages: "Messages",
  analytics: "Analytics",
  settings: "Settings",
  announcements: "Announcements",
  "learning-plans": "Learning Plans",
  assessments: "Assessments",
  admissions: "Admissions",
  events: "Events",
  discipline: "Discipline",
  rooms: "Rooms",
  "lesson-plans": "Lesson Plans",
  reports: "Reports",
  "check-in": "Check-In/Out",
  "report-cards": "Report Cards",
  gradebook: "Gradebook",
  documents: "Documents",
  tenants: "Tenants",
  children: "My Children",
  "my-learning": "My Learning",
  users: "User Management",
  community: "Community",
  "daily-updates": "Daily Updates",
  curriculum: "Curriculum",
  "question-bank": "Question Bank",
  consent: "Consent Forms",
  staff: "Staff",
  campuses: "Campuses",
  visitors: "Visitors",
  health: "Health Records",
  discounts: "Discounts",
  checkin: "Check-In",
  pickup: "Pickup",
  "staff-attendance": "Staff Attendance",
  transport: "Transport",
  achievements: "Achievements",
  alumni: "Alumni",
  substitutions: "Substitutions",
  "exam-timetable": "Exam Timetable",
  tasks: "Tasks",
  library: "Library",
  contracts: "Contracts",
  transcripts: "Transcripts",
  waitlist: "Waitlist",
  leadership: "Leadership",
  "at-risk": "At-Risk Students",
  notifications: "Notifications",
  homework: "Homework",
  progress: "Progress Tracking",
  "website-builder": "Site Builder",
  "form-builder": "Form Builder",
  editor: "Editor",
  templates: "Templates",
  theme: "Design System",
  menus: "Menus",
  funnels: "Funnels",
  forms: "Forms",
  submissions: "Submissions",
  cms: "CMS",
  "access-rights": "Access Rights",
  profile: "Profile",
  new: "New",
  edit: "Edit",
  take: "Take",
}

function getLabel(segment: string): string {
  return LABEL_MAP[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ")
}

export default function Breadcrumbs() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)

  // Remove "dashboard" prefix for cleaner breadcrumbs
  const dashboardIndex = segments.indexOf("dashboard")
  const crumbs = dashboardIndex >= 0 ? segments.slice(dashboardIndex) : segments

  if (crumbs.length <= 1) return null

  return (
    <nav className="flex items-center gap-2 text-sm font-medium mb-8 bg-muted/30 w-fit px-4 py-1.5 rounded-full border border-border/40 backdrop-blur-sm">
      <Link href="/dashboard" className="text-muted-foreground hover:text-primary transition-all duration-300 flex items-center gap-1.5 group">
        <Home className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
        <span className="text-xs">Home</span>
      </Link>
      {crumbs.slice(1).map((segment, i) => {
        const href = "/dashboard/" + crumbs.slice(1, i + 2).join("/")
        const isLast = i === crumbs.length - 2
        const label = getLabel(segment)

        // Skip CUID-like segments (dynamic route params)
        if (segment.length > 20 && !LABEL_MAP[segment]) {
          return (
            <span key={i} className="flex items-center gap-2 text-muted-foreground/40">
              <ChevronRight className="h-3 w-3" />
              <span className="text-[10px] font-mono truncate max-w-[60px] text-muted-foreground/60">{segment.slice(0, 8)}…</span>
            </span>
          )
        }

        return (
          <span key={i} className="flex items-center gap-2">
            <ChevronRight className="h-3 w-3 text-muted-foreground/40" />
            {isLast ? (
              <span className="text-foreground font-bold text-xs">{label}</span>
            ) : (
              <Link href={href} className="text-muted-foreground hover:text-primary transition-all duration-300 text-xs">
                {label}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}

