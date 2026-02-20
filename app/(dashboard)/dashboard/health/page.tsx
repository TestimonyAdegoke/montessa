import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { HealthClient } from "@/components/health/health-client"
import { Heart, AlertTriangle, CheckCircle2, Clock } from "lucide-react"

export default async function HealthPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")
  if (!["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "HOD", "HR"].includes(session.user.role)) redirect("/dashboard")

  const incidents = await prisma.healthIncident.findMany({
    where: { tenantId: session.user.tenantId },
    orderBy: { incidentTime: "desc" },
    take: 100,
  })

  const students = await prisma.student.findMany({
    where: { tenantId: session.user.tenantId, studentStatus: "ACTIVE" },
    select: { id: true, legalName: true, preferredName: true },
    orderBy: { legalName: "asc" },
  })

  const unresolved = incidents.filter((i: any) => !i.resolvedAt).length
  const severe = incidents.filter((i: any) => ["SEVERE", "EMERGENCY"].includes(i.severity)).length

  const serialized = incidents.map((i: any) => ({
    id: i.id,
    studentId: i.studentId,
    type: i.type,
    description: i.description,
    severity: i.severity,
    treatment: i.treatment,
    medication: i.medication,
    parentNotified: i.parentNotified,
    parentPickedUp: i.parentPickedUp,
    reportedBy: i.reportedBy,
    incidentTime: i.incidentTime.toISOString(),
    resolvedAt: i.resolvedAt?.toISOString() || null,
    notes: i.notes,
  }))

  const studentList = students.map((s: any) => ({
    id: s.id,
    name: s.preferredName || s.legalName,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Health & Sick Bay</h1>
        <p className="text-muted-foreground">Log and track student health incidents</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Incidents</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{incidents.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unresolved</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{unresolved}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Severe/Emergency</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{severe}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{incidents.length - unresolved}</div></CardContent>
        </Card>
      </div>

      <HealthClient incidents={serialized} students={studentList} />
    </div>
  )
}
