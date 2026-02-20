"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { generateReportCard, type ReportCardData } from "@/lib/actions/report-cards"
import { FileText, Download, Printer } from "lucide-react"

export default function ReportCardsPage() {
  const { toast } = useToast()
  const [students, setStudents] = useState<any[]>([])
  const [selectedStudent, setSelectedStudent] = useState("")
  const [term, setTerm] = useState("Term 1")
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear().toString())
  const [reportCard, setReportCard] = useState<ReportCardData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch("/api/students?limit=500")
      .then((r) => r.json())
      .then((data) => setStudents(data.data || []))
      .catch(() => {})
  }, [])

  const handleGenerate = async () => {
    if (!selectedStudent) {
      toast({ title: "Please select a student", variant: "destructive" })
      return
    }
    setLoading(true)
    const result = await generateReportCard(selectedStudent, term, academicYear)
    if (result.success && result.data) {
      setReportCard(result.data)
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" })
    }
    setLoading(false)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Report Cards</h1>
          <p className="text-muted-foreground">Generate and print student report cards</p>
        </div>
      </div>

      <Card className="print:hidden">
        <CardHeader><CardTitle>Generate Report Card</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                <SelectContent>
                  {students.map((s: any) => (
                    <SelectItem key={s.id} value={s.id}>{s.user?.name || s.legalName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={term} onValueChange={setTerm}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Term 1">Term 1</SelectItem>
                  <SelectItem value="Term 2">Term 2</SelectItem>
                  <SelectItem value="Term 3">Term 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={academicYear} onValueChange={setAcademicYear}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[0, -1, -2].map((offset) => {
                    const y = new Date().getFullYear() + offset
                    return <SelectItem key={y} value={y.toString()}>{y}/{y + 1}</SelectItem>
                  })}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleGenerate} disabled={loading}>
              <FileText className="h-4 w-4 mr-2" />{loading ? "Generating..." : "Generate"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {reportCard && (
        <div id="report-card">
          <div className="flex justify-end gap-2 mb-4 print:hidden">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />Print
            </Button>
            <Button variant="outline" onClick={handlePrint}>
              <Download className="h-4 w-4 mr-2" />Export PDF
            </Button>
          </div>

          <Card className="print:shadow-none print:border-2">
            <CardContent className="p-8">
              {/* Header */}
              <div className="text-center mb-8 border-b pb-6">
                <h2 className="text-2xl font-bold">STUDENT REPORT CARD</h2>
                <p className="text-muted-foreground">{reportCard.term} &mdash; Academic Year {reportCard.academicYear}</p>
              </div>

              {/* Student Info */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div>
                  <p className="text-sm text-muted-foreground">Student Name</p>
                  <p className="font-semibold">{reportCard.student.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Admission Number</p>
                  <p className="font-semibold">{reportCard.student.admissionNumber || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Class</p>
                  <p className="font-semibold">{reportCard.student.className || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Grade</p>
                  <p className="font-semibold">{reportCard.student.grade || "N/A"}</p>
                </div>
              </div>

              {/* Academic Performance */}
              <div className="mb-8">
                <h3 className="font-semibold text-lg mb-3">Academic Performance</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead className="text-center">Marks Obtained</TableHead>
                      <TableHead className="text-center">Total Marks</TableHead>
                      <TableHead className="text-center">Percentage</TableHead>
                      <TableHead className="text-center">Grade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportCard.subjects.map((sub, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{sub.name}</TableCell>
                        <TableCell className="text-center">{sub.obtainedMarks}</TableCell>
                        <TableCell className="text-center">{sub.totalMarks}</TableCell>
                        <TableCell className="text-center">{sub.percentage}%</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={sub.grade === "F" ? "destructive" : "outline"}>{sub.grade}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {reportCard.subjects.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-4">
                          No assessment results found for this period.
                        </TableCell>
                      </TableRow>
                    )}
                    <TableRow className="font-bold bg-muted/50">
                      <TableCell>Overall</TableCell>
                      <TableCell className="text-center">{reportCard.subjects.reduce((s, sub) => s + sub.obtainedMarks, 0)}</TableCell>
                      <TableCell className="text-center">{reportCard.subjects.reduce((s, sub) => s + sub.totalMarks, 0)}</TableCell>
                      <TableCell className="text-center">{reportCard.overallPercentage}%</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={reportCard.overallGrade === "F" ? "destructive" : "default"}>{reportCard.overallGrade}</Badge>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* Attendance */}
              <div className="mb-8">
                <h3 className="font-semibold text-lg mb-3">Attendance Summary</h3>
                <div className="grid grid-cols-5 gap-4 text-center">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-2xl font-bold">{reportCard.attendance.totalDays}</p>
                    <p className="text-xs text-muted-foreground">Total Days</p>
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{reportCard.attendance.present}</p>
                    <p className="text-xs text-muted-foreground">Present</p>
                  </div>
                  <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                    <p className="text-2xl font-bold text-red-600">{reportCard.attendance.absent}</p>
                    <p className="text-xs text-muted-foreground">Absent</p>
                  </div>
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                    <p className="text-2xl font-bold text-yellow-600">{reportCard.attendance.late}</p>
                    <p className="text-xs text-muted-foreground">Late</p>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{reportCard.attendance.percentage}%</p>
                    <p className="text-xs text-muted-foreground">Attendance</p>
                  </div>
                </div>
              </div>

              {/* Remarks */}
              <div className="mb-8">
                <h3 className="font-semibold text-lg mb-2">Teacher&apos;s Remarks</h3>
                <p className="p-4 bg-muted rounded-lg italic">{reportCard.teacherRemarks}</p>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t">
                <div className="text-center">
                  <div className="border-b border-dashed mb-2 h-12" />
                  <p className="text-sm text-muted-foreground">Class Teacher</p>
                </div>
                <div className="text-center">
                  <div className="border-b border-dashed mb-2 h-12" />
                  <p className="text-sm text-muted-foreground">Head of Department</p>
                </div>
                <div className="text-center">
                  <div className="border-b border-dashed mb-2 h-12" />
                  <p className="text-sm text-muted-foreground">Principal</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
