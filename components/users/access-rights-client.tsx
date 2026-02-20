"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ShieldCheck,
  Check,
  X,
  ArrowLeft,
  Info,
  Shield,
  Eye,
} from "lucide-react"

const ROLES = [
  { value: "SUPER_ADMIN", label: "Super Admin", description: "Full platform access. Can manage tenants, all users, and all settings." },
  { value: "TENANT_ADMIN", label: "Tenant Admin", description: "Full access within their tenant. Can manage users, settings, and all modules." },
  { value: "TEACHER", label: "Teacher", description: "Access to academic modules, attendance, classes, and student management." },
  { value: "HOD", label: "Head of Dept", description: "Same as Teacher plus department oversight, substitutions, and analytics." },
  { value: "GUARDIAN", label: "Guardian", description: "Access to their children's data, billing, consent forms, and communication." },
  { value: "STUDENT", label: "Student", description: "Access to their own learning portal, timetable, library, and community." },
  { value: "HR", label: "HR", description: "Access to staff management, attendance, visitors, alumni, and substitutions." },
  { value: "FINANCE", label: "Finance", description: "Access to billing, discounts, financial reports, and tasks." },
]

interface PermissionModule {
  category: string
  modules: {
    name: string
    roles: string[]
  }[]
}

const PERMISSIONS: PermissionModule[] = [
  {
    category: "Overview",
    modules: [
      { name: "Dashboard", roles: ["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "GUARDIAN", "STUDENT", "HOD", "HR", "FINANCE"] },
      { name: "Notifications", roles: ["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "GUARDIAN", "STUDENT", "HOD", "HR", "FINANCE"] },
      { name: "Tasks", roles: ["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "HOD", "HR", "FINANCE"] },
    ],
  },
  {
    category: "Academics",
    modules: [
      { name: "Students", roles: ["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "HOD"] },
      { name: "Classes", roles: ["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "HOD"] },
      { name: "Assessments", roles: ["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "HOD"] },
      { name: "Gradebook", roles: ["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "HOD"] },
      { name: "Report Cards", roles: ["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "HOD"] },
      { name: "Transcripts", roles: ["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "HOD"] },
      { name: "Homework", roles: ["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "HOD"] },
      { name: "Question Bank", roles: ["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "HOD"] },
      { name: "Achievements", roles: ["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "HOD"] },
    ],
  },
  {
    category: "Teaching",
    modules: [
      { name: "Learning Plans", roles: ["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "HOD"] },
      { name: "Lesson Plans", roles: ["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "HOD"] },
      { name: "Curriculum", roles: ["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "HOD", "GUARDIAN", "STUDENT"] },
      { name: "Progress Tracking", roles: ["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "HOD"] },
      { name: "Daily Updates", roles: ["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "GUARDIAN", "HOD"] },
    ],
  },
  {
    category: "Scheduling",
    modules: [
      { name: "Timetable", roles: ["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "GUARDIAN", "HOD", "STUDENT"] },
      { name: "Exam Timetable", roles: ["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "HOD", "STUDENT", "GUARDIAN"] },
      { name: "Events", roles: ["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "GUARDIAN", "STUDENT", "HOD"] },
      { name: "Substitutions", roles: ["SUPER_ADMIN", "TENANT_ADMIN", "HOD", "HR"] },
      { name: "Room Booking", roles: ["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "HOD"] },
    ],
  },
  {
    category: "Attendance",
    modules: [
      { name: "Student Attendance", roles: ["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "HOD"] },
      { name: "Check-In / Out", roles: ["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "HR"] },
      { name: "Pickup", roles: ["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "HR"] },
      { name: "Staff Attendance", roles: ["SUPER_ADMIN", "TENANT_ADMIN", "HR"] },
    ],
  },
  {
    category: "Communication",
    modules: [
      { name: "Messages", roles: ["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "GUARDIAN", "HOD"] },
      { name: "Announcements", roles: ["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "GUARDIAN", "STUDENT", "HOD"] },
      { name: "Community", roles: ["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "GUARDIAN", "STUDENT", "HOD"] },
      { name: "Consent Forms", roles: ["SUPER_ADMIN", "TENANT_ADMIN", "GUARDIAN"] },
    ],
  },
  {
    category: "Finance",
    modules: [
      { name: "Billing", roles: ["SUPER_ADMIN", "TENANT_ADMIN", "GUARDIAN", "FINANCE"] },
      { name: "Discounts", roles: ["SUPER_ADMIN", "TENANT_ADMIN", "FINANCE"] },
      { name: "Contracts", roles: ["SUPER_ADMIN", "TENANT_ADMIN", "GUARDIAN"] },
      { name: "Financial Reports", roles: ["SUPER_ADMIN", "TENANT_ADMIN", "FINANCE"] },
    ],
  },
  {
    category: "People & HR",
    modules: [
      { name: "Teachers", roles: ["SUPER_ADMIN", "TENANT_ADMIN", "HR", "HOD"] },
      { name: "Staff Directory", roles: ["SUPER_ADMIN", "TENANT_ADMIN", "HR"] },
      { name: "Alumni", roles: ["SUPER_ADMIN", "TENANT_ADMIN", "HR"] },
      { name: "Visitors", roles: ["SUPER_ADMIN", "TENANT_ADMIN", "HR"] },
      { name: "Health Records", roles: ["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "HOD", "HR"] },
    ],
  },
  {
    category: "Admissions",
    modules: [
      { name: "Applications", roles: ["SUPER_ADMIN", "TENANT_ADMIN"] },
      { name: "Waitlist", roles: ["SUPER_ADMIN", "TENANT_ADMIN"] },
    ],
  },
  {
    category: "Resources",
    modules: [
      { name: "Library", roles: ["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "HOD", "STUDENT"] },
      { name: "Documents", roles: ["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "HOD"] },
      { name: "Transport", roles: ["SUPER_ADMIN", "TENANT_ADMIN"] },
    ],
  },
  {
    category: "Analytics",
    modules: [
      { name: "Analytics Overview", roles: ["SUPER_ADMIN", "TENANT_ADMIN"] },
      { name: "Leadership Dashboard", roles: ["SUPER_ADMIN", "TENANT_ADMIN"] },
      { name: "At-Risk Students", roles: ["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "HOD"] },
      { name: "Analytics Reports", roles: ["SUPER_ADMIN", "TENANT_ADMIN", "FINANCE", "HR", "HOD"] },
    ],
  },
  {
    category: "Administration",
    modules: [
      { name: "User Management", roles: ["SUPER_ADMIN", "TENANT_ADMIN"] },
      { name: "Access Rights", roles: ["SUPER_ADMIN", "TENANT_ADMIN"] },
      { name: "Campuses", roles: ["SUPER_ADMIN", "TENANT_ADMIN"] },
      { name: "Tenants", roles: ["SUPER_ADMIN"] },
      { name: "Settings", roles: ["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "GUARDIAN", "STUDENT", "HOD", "HR", "FINANCE"] },
    ],
  },
]

const ALL_ROLE_KEYS = ["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "HOD", "GUARDIAN", "STUDENT", "HR", "FINANCE"]

export default function AccessRightsClient({ currentUserRole }: { currentUserRole: string }) {
  const [viewMode, setViewMode] = useState<"matrix" | "role">("matrix")
  const [selectedRole, setSelectedRole] = useState("TEACHER")

  const roleInfo = ROLES.find((r) => r.value === selectedRole)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            Access Rights & Permissions
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            View and understand role-based access control across all modules
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/users">
              <ArrowLeft className="h-4 w-4 mr-1" />
              User Management
            </Link>
          </Button>
          <Select value={viewMode} onValueChange={(v: any) => setViewMode(v)}>
            <SelectTrigger className="w-[160px]">
              <Eye className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="matrix">Matrix View</SelectItem>
              <SelectItem value="role">Role View</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Role descriptions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {ROLES.map((role) => (
          <Card
            key={role.value}
            className={`cursor-pointer transition-all ${
              viewMode === "role" && selectedRole === role.value
                ? "ring-2 ring-primary shadow-md"
                : "hover:shadow-sm"
            }`}
            onClick={() => {
              setSelectedRole(role.value)
              setViewMode("role")
            }}
          >
            <CardContent className="pt-4 pb-3 px-4">
              <div className="flex items-center gap-2 mb-1.5">
                <Shield className="h-4 w-4 text-primary" />
                <span className="font-semibold text-sm">{role.label}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{role.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {viewMode === "matrix" ? (
        /* Full Matrix View */
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Permission Matrix</CardTitle>
            <CardDescription>Complete overview of module access by role</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[200px] sticky left-0 bg-card z-10">Module</TableHead>
                    {ALL_ROLE_KEYS.map((role) => {
                      const r = ROLES.find((x) => x.value === role)
                      return (
                        <TableHead key={role} className="text-center min-w-[90px]">
                          <span className="text-xs font-semibold">{r?.label || role}</span>
                        </TableHead>
                      )
                    })}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {PERMISSIONS.map((cat) => (
                    <>
                      <TableRow key={cat.category} className="bg-muted/30 hover:bg-muted/30">
                        <TableCell colSpan={ALL_ROLE_KEYS.length + 1} className="py-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            {cat.category}
                          </span>
                        </TableCell>
                      </TableRow>
                      {cat.modules.map((mod) => (
                        <TableRow key={`${cat.category}-${mod.name}`}>
                          <TableCell className="sticky left-0 bg-card z-10 font-medium text-sm">
                            {mod.name}
                          </TableCell>
                          {ALL_ROLE_KEYS.map((role) => (
                            <TableCell key={role} className="text-center">
                              {mod.roles.includes(role) ? (
                                <Check className="h-4 w-4 text-green-600 mx-auto" />
                              ) : (
                                <X className="h-4 w-4 text-muted-foreground/30 mx-auto" />
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Single Role View */
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  {roleInfo?.label} Permissions
                </CardTitle>
                <CardDescription>{roleInfo?.description}</CardDescription>
              </div>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {PERMISSIONS.map((cat) => {
                const accessible = cat.modules.filter((m) => m.roles.includes(selectedRole))
                const denied = cat.modules.filter((m) => !m.roles.includes(selectedRole))

                if (accessible.length === 0 && denied.length === 0) return null

                return (
                  <div key={cat.category}>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                      {cat.category}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {cat.modules.map((mod) => {
                        const hasAccess = mod.roles.includes(selectedRole)
                        return (
                          <div
                            key={mod.name}
                            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm border ${
                              hasAccess
                                ? "bg-green-500/5 border-green-200 dark:border-green-900 text-foreground"
                                : "bg-muted/30 border-transparent text-muted-foreground line-through"
                            }`}
                          >
                            {hasAccess ? (
                              <Check className="h-4 w-4 text-green-600 shrink-0" />
                            ) : (
                              <X className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                            )}
                            {mod.name}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Summary */}
            <div className="mt-6 p-4 rounded-lg bg-muted/50 border">
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-4 w-4 text-primary" />
                <span className="font-semibold text-sm">Access Summary</span>
              </div>
              <div className="flex gap-4 text-sm">
                <span className="text-green-600 font-medium">
                  {PERMISSIONS.flatMap((c) => c.modules).filter((m) => m.roles.includes(selectedRole)).length} modules accessible
                </span>
                <span className="text-muted-foreground">
                  {PERMISSIONS.flatMap((c) => c.modules).filter((m) => !m.roles.includes(selectedRole)).length} restricted
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info note */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-4 pb-3">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium">About Role-Based Access Control</p>
              <p className="text-muted-foreground mt-1">
                Permissions are enforced at both the navigation level (menu visibility) and the server level (API authorization).
                Changing a user&apos;s role immediately updates their access across all modules. Only Super Admins and Tenant Admins
                can manage users and access rights.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
