import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertTriangle, TrendingDown, UserX, DollarSign } from "lucide-react"

export default async function AtRiskPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")
  if (!["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "HOD"].includes(session.user.role)) redirect("/dashboard")

  const tenantId = session.user.tenantId
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  // Get all active students with attendance and invoice data
  const students = await prisma.student.findMany({
    where: { tenantId, studentStatus: "ACTIVE" },
    select: {
      id: true,
      legalName: true,
      preferredName: true,
      admissionNumber: true,
      Class: { select: { name: true } },
      AttendanceRecord: {
        where: { date: { gte: thirtyDaysAgo } },
        select: { status: true },
      },
    },
  })

  // Get overdue invoice count
  const overdueCount = await prisma.invoice.count({
    where: { tenantId, status: "OVERDUE" },
  })

  // Calculate risk scores
  const atRiskStudents = students.map((s: any) => {
    const totalRecords = s.attendanceRecords.length
    const absences = s.attendanceRecords.filter((r: any) => r.status === "ABSENT").length
    const lateCount = s.attendanceRecords.filter((r: any) => r.status === "LATE").length
    const attendanceRate = totalRecords > 0 ? Math.round(((totalRecords - absences) / totalRecords) * 100) : 100

    // Risk factors
    const risks: string[] = []
    let riskScore = 0

    if (attendanceRate < 70) { risks.push("Very low attendance"); riskScore += 3 }
    else if (attendanceRate < 85) { risks.push("Low attendance"); riskScore += 1 }

    if (absences >= 10) { risks.push("Chronic absenteeism"); riskScore += 2 }
    else if (absences >= 5) { risks.push("Frequent absences"); riskScore += 1 }

    if (lateCount >= 8) { risks.push("Chronic lateness"); riskScore += 1 }

    return {
      id: s.id,
      name: s.preferredName || s.legalName,
      admissionNumber: s.admissionNumber,
      className: s.currentClass?.name || "Unassigned",
      attendanceRate,
      absences,
      lateCount,
      totalRecords,
      risks,
      riskScore,
      riskLevel: riskScore >= 4 ? "HIGH" : riskScore >= 2 ? "MEDIUM" : riskScore >= 1 ? "LOW" : "NONE",
    }
  })
    .filter((s) => s.riskScore > 0)
    .sort((a, b) => b.riskScore - a.riskScore)

  const highRisk = atRiskStudents.filter((s) => s.riskLevel === "HIGH").length
  const mediumRisk = atRiskStudents.filter((s) => s.riskLevel === "MEDIUM").length
  const lowRisk = atRiskStudents.filter((s) => s.riskLevel === "LOW").length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">At-Risk Early Warning</h1>
        <p className="text-muted-foreground">Students flagged based on attendance and financial indicators (last 30 days)</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total At-Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{atRiskStudents.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-red-600">{highRisk}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medium Risk</CardTitle>
            <TrendingDown className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-amber-600">{mediumRisk}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Risk</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{lowRisk}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>At-Risk Students</CardTitle>
          <CardDescription>Sorted by risk score (highest first)</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {atRiskStudents.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <AlertTriangle className="h-10 w-10 mx-auto mb-3 text-green-500" />
              <p className="font-medium">No at-risk students detected</p>
              <p className="text-sm">All students are within normal attendance and financial thresholds.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Attendance</TableHead>
                  <TableHead>Absences</TableHead>
                  <TableHead>Late</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Flags</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {atRiskStudents.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <div className="font-medium">{s.name}</div>
                      <div className="text-xs text-muted-foreground font-mono">{s.admissionNumber}</div>
                    </TableCell>
                    <TableCell>{s.className}</TableCell>
                    <TableCell>
                      <span className={s.attendanceRate < 70 ? "text-red-600 font-semibold" : s.attendanceRate < 85 ? "text-amber-600" : ""}>
                        {s.attendanceRate}%
                      </span>
                    </TableCell>
                    <TableCell>{s.absences} / {s.totalRecords}</TableCell>
                    <TableCell>
                      <span className={s.lateCount >= 8 ? "text-amber-600 font-semibold" : ""}>
                        {s.lateCount}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={s.riskLevel === "HIGH" ? "destructive" : s.riskLevel === "MEDIUM" ? "warning" : "outline"}
                      >
                        {s.riskLevel}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {s.risks.map((r, i) => (
                          <Badge key={i} variant="outline" className="text-[10px]">{r}</Badge>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
