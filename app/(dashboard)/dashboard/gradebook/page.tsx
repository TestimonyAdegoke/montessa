import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getGradebookData } from "@/lib/actions/grading"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BookOpen, BarChart3, Users, CheckCircle } from "lucide-react"

function gradeColor(percentage: number) {
  if (percentage >= 80) return "text-green-600"
  if (percentage >= 60) return "text-yellow-600"
  if (percentage >= 40) return "text-orange-600"
  return "text-red-600"
}

function gradeBadgeVariant(percentage: number): "success" | "outline" | "destructive" | "secondary" {
  if (percentage >= 70) return "success"
  if (percentage >= 50) return "outline"
  if (percentage >= 30) return "secondary"
  return "destructive"
}

export default async function GradebookPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user || !["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "HOD"].includes(session.user.role)) {
    redirect("/dashboard")
  }

  const result = await getGradebookData()
  const data = result.success ? result.data : null

  const totalAssessments = data?.assessments.length || 0
  const totalResults = data?.assessments.reduce((sum: number, a: any) => sum + a.results.length, 0) || 0
  const gradedResults = data?.assessments.reduce(
    (sum: number, a: any) => sum + a.results.filter((r: any) => r.status === "GRADED").length, 0
  ) || 0
  const overallAvg = gradedResults > 0
    ? Math.round(
        (data?.assessments.reduce(
          (sum: number, a: any) => sum + a.results
            .filter((r: any) => r.status === "GRADED")
            .reduce((s: number, r: any) => s + r.percentage, 0),
          0
        ) || 0) / gradedResults * 10
      ) / 10
    : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gradebook</h1>
        <p className="text-muted-foreground">Class-level grade overview and assessment results</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAssessments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalResults}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Graded</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gradedResults}</div>
            <p className="text-xs text-muted-foreground">
              {totalResults > 0 ? Math.round((gradedResults / totalResults) * 100) : 0}% complete
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${gradeColor(overallAvg)}`}>{overallAvg}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Class Summaries */}
      {data?.classSummaries && data.classSummaries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Class Performance Summary</CardTitle>
            <CardDescription>Average scores by class</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead className="text-center">Assessments</TableHead>
                  <TableHead className="text-center">Submissions</TableHead>
                  <TableHead className="text-center">Graded</TableHead>
                  <TableHead className="text-right">Avg Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.classSummaries.map((cls: any) => (
                  <TableRow key={cls.classId}>
                    <TableCell className="font-medium">{cls.className}</TableCell>
                    <TableCell>{cls.grade || "—"}</TableCell>
                    <TableCell className="text-center">{cls.totalAssessments}</TableCell>
                    <TableCell className="text-center">{cls.totalResults}</TableCell>
                    <TableCell className="text-center">{cls.gradedResults}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={gradeBadgeVariant(cls.averagePercentage)}>
                        {cls.averagePercentage}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Assessment Details */}
      {data?.assessments && data.assessments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Assessment Results</CardTitle>
            <CardDescription>Detailed per-student scores for each assessment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {data.assessments.slice(0, 10).map((assessment: any) => (
              <div key={assessment.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">{assessment.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {assessment.subject} · {assessment.class?.name} · {assessment.totalMarks} marks
                    </p>
                  </div>
                  <Badge variant="outline">{assessment.results.length} submissions</Badge>
                </div>
                {assessment.results.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Admission #</TableHead>
                        <TableHead className="text-center">Marks</TableHead>
                        <TableHead className="text-center">Percentage</TableHead>
                        <TableHead className="text-center">Grade</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assessment.results.map((r: any) => (
                        <TableRow key={r.id}>
                          <TableCell className="font-medium">{r.student?.user?.name || "—"}</TableCell>
                          <TableCell>{r.student?.admissionNumber || "—"}</TableCell>
                          <TableCell className="text-center">
                            {r.obtainedMarks} / {r.totalMarks}
                          </TableCell>
                          <TableCell className={`text-center font-semibold ${gradeColor(r.percentage)}`}>
                            {r.percentage}%
                          </TableCell>
                          <TableCell className="text-center">{r.grade || "—"}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant={r.status === "GRADED" ? "success" : "outline"}>
                              {r.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No submissions yet</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {(!data?.assessments || data.assessments.length === 0) && (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-1">No assessments yet</h3>
            <p className="text-sm text-muted-foreground">Create assessments to start tracking grades</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
