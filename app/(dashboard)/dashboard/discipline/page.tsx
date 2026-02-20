import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDate } from "@/lib/utils"
import { AlertTriangle, CheckCircle, Plus, Shield } from "lucide-react"
import Link from "next/link"

const severityColors: Record<string, string> = {
  LOW: "outline",
  MEDIUM: "secondary",
  HIGH: "default",
  CRITICAL: "destructive",
}

export default async function DisciplinePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")
  if (!["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "HOD"].includes(session.user.role)) redirect("/dashboard")

  const rawRecords = await prisma.disciplineRecord.findMany({
    where: { Student: { tenantId: session.user.tenantId } },
    include: {
      Student: { include: { User: { select: { name: true } } } },
    },
    orderBy: { incidentDate: "desc" },
    take: 100,
  })
  const records = rawRecords.map(({ Student, ...rest }: any) => ({
    ...rest,
    student: { ...Student, user: Student.User },
  }))

  const unresolved = records.filter((r: any) => !r.resolved).length
  const positive = records.filter((r: any) => r.type === "POSITIVE_BEHAVIOR").length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Discipline Records</h1>
          <p className="text-muted-foreground">Track student behavior and disciplinary actions</p>
        </div>
        <Link href="/dashboard/discipline/new">
          <Button><Plus className="mr-2 h-4 w-4" />New Record</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{records.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unresolved</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-orange-500">{unresolved}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Positive</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-500">{positive}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{records.length - unresolved}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record: any) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.student.user.name || record.student.legalName}</TableCell>
                  <TableCell>
                    <Badge variant={record.type === "POSITIVE_BEHAVIOR" ? "success" : "outline"}>
                      {record.type.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={severityColors[record.severity] as any}>{record.severity}</Badge>
                  </TableCell>
                  <TableCell>{record.title}</TableCell>
                  <TableCell>{formatDate(record.incidentDate)}</TableCell>
                  <TableCell>
                    {record.resolved ? (
                      <Badge variant="success">Resolved</Badge>
                    ) : (
                      <Badge variant="destructive">Open</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {records.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No discipline records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
