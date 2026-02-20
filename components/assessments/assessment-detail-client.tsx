"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  ArrowLeft, Edit, Trash2, Send, Clock, Users, FileText, CheckCircle,
  BarChart3, Calendar, BookOpen, Award, AlertCircle,
} from "lucide-react"
import { publishAssessment, deleteAssessment } from "@/lib/actions/assessments"

interface Props {
  assessment: any
  classes: any[]
  userRole: string
}

export default function AssessmentDetailClient({ assessment, classes, userRole }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  const questions: any[] = Array.isArray(assessment.questions) ? assessment.questions : []
  const results: any[] = assessment.results || []
  const totalMarks = assessment.totalMarks || 0

  const stats = {
    total: results.length,
    submitted: results.filter((r: any) => r.status === "SUBMITTED" || r.status === "GRADED").length,
    graded: results.filter((r: any) => r.status === "GRADED").length,
    pending: results.filter((r: any) => r.status === "PENDING").length,
    avgScore: results.filter((r: any) => r.status === "GRADED").length > 0
      ? Math.round(results.filter((r: any) => r.status === "GRADED").reduce((sum: number, r: any) => sum + (r.percentage || 0), 0) / results.filter((r: any) => r.status === "GRADED").length)
      : 0,
    highestScore: results.filter((r: any) => r.status === "GRADED").length > 0
      ? Math.max(...results.filter((r: any) => r.status === "GRADED").map((r: any) => r.obtainedMarks || 0))
      : 0,
    lowestScore: results.filter((r: any) => r.status === "GRADED").length > 0
      ? Math.min(...results.filter((r: any) => r.status === "GRADED").map((r: any) => r.obtainedMarks || 0))
      : 0,
  }

  const handlePublish = () => {
    startTransition(async () => {
      const result = await publishAssessment(assessment.id)
      if (result.success) {
        toast({ title: "Assessment published", description: "Students can now take this assessment." })
        router.refresh()
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" })
      }
    })
  }

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteAssessment(assessment.id)
      if (result.success) {
        toast({ title: "Assessment deleted" })
        router.push("/dashboard/assessments")
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" })
      }
    })
  }

  const statusColor: Record<string, string> = {
    DRAFT: "secondary",
    PUBLISHED: "default",
    COMPLETED: "outline",
  }

  const resultStatusColor: Record<string, string> = {
    PENDING: "secondary",
    SUBMITTED: "default",
    GRADED: "outline",
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link href="/dashboard/assessments">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">{assessment.title}</h1>
            <Badge variant={statusColor[assessment.status] as any || "default"}>
              {assessment.status}
            </Badge>
          </div>
          {assessment.description && (
            <p className="text-muted-foreground ml-10">{assessment.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {assessment.status === "DRAFT" && (
            <>
              <Button variant="outline" size="sm" onClick={handlePublish} disabled={isPending}>
                <Send className="h-4 w-4 mr-2" />
                Publish
              </Button>
              <Link href={`/dashboard/assessments/${assessment.id}/edit`}>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </Link>
            </>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" disabled={isPending}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Assessment?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this assessment and all associated results. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Questions</p>
                <p className="text-lg font-bold">{questions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <Award className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Marks</p>
                <p className="text-lg font-bold">{totalMarks}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Submissions</p>
                <p className="text-lg font-bold">{stats.submitted} / {stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <BarChart3 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avg Score</p>
                <p className="text-lg font-bold">{stats.avgScore}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="questions">Questions ({questions.length})</TabsTrigger>
          <TabsTrigger value="results">Results ({results.length})</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Assessment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Type</span>
                  <span className="font-medium">{assessment.type}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subject</span>
                  <span className="font-medium">{assessment.subject}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Class</span>
                  <span className="font-medium">{assessment.class?.name || "—"}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {assessment.duration} minutes
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Passing Marks</span>
                  <span className="font-medium">{assessment.passingMarks} / {totalMarks}</span>
                </div>
                {assessment.scheduledDate && (
                  <>
                    <Separator />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Scheduled</span>
                      <span className="font-medium flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(assessment.scheduledDate).toLocaleDateString()}
                      </span>
                    </div>
                  </>
                )}
                {assessment.teacher && (
                  <>
                    <Separator />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Created by</span>
                      <span className="font-medium">{assessment.teacher.user?.name || "—"}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Performance Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Students</span>
                  <span className="font-medium">{stats.total}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Submitted</span>
                  <span className="font-medium text-blue-600">{stats.submitted}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Graded</span>
                  <span className="font-medium text-green-600">{stats.graded}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Pending</span>
                  <span className="font-medium text-amber-600">{stats.pending}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Highest Score</span>
                  <span className="font-medium">{stats.highestScore} / {totalMarks}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Lowest Score</span>
                  <span className="font-medium">{stats.lowestScore} / {totalMarks}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Average</span>
                  <span className="font-bold text-lg">{stats.avgScore}%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Questions Tab */}
        <TabsContent value="questions">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Questions</CardTitle>
              <CardDescription>All questions in this assessment</CardDescription>
            </CardHeader>
            <CardContent>
              {questions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No questions added yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {questions.map((q: any, i: number) => (
                    <div key={i} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                            {i + 1}
                          </span>
                          <Badge variant="outline" className="text-[10px]">
                            {q.type === "MCQ" ? "Multiple Choice" : q.type === "SHORT_ANSWER" ? "Short Answer" : q.type === "TRUE_FALSE" ? "True/False" : "Essay"}
                          </Badge>
                        </div>
                        <Badge variant="secondary">{q.marks || q.points || 1} pts</Badge>
                      </div>
                      <p className="text-sm font-medium mb-2">{q.question || q.text}</p>
                      {q.options && q.options.length > 0 && (
                        <div className="space-y-1 ml-4">
                          {q.options.map((opt: string, j: number) => (
                            <div key={j} className={`text-xs px-2 py-1 rounded ${q.correctAnswer === opt ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-medium" : "text-muted-foreground"}`}>
                              {String.fromCharCode(65 + j)}. {opt}
                              {q.correctAnswer === opt && <CheckCircle className="h-3 w-3 inline ml-1" />}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Student Results</CardTitle>
              <CardDescription>Submissions and grades for this assessment</CardDescription>
            </CardHeader>
            <CardContent>
              {results.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No results yet. Publish the assessment to assign it to students.</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Percentage</TableHead>
                        <TableHead>Submitted</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.map((r: any) => (
                        <TableRow key={r.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">{r.student?.user?.name || "Unknown"}</p>
                              <p className="text-xs text-muted-foreground">{r.student?.user?.email || ""}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={resultStatusColor[r.status] as any || "secondary"}>
                              {r.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            {r.status === "PENDING" ? "—" : `${r.obtainedMarks} / ${r.totalMarks}`}
                          </TableCell>
                          <TableCell>
                            {r.status === "PENDING" ? "—" : (
                              <span className={r.percentage >= 40 ? "text-green-600" : "text-red-600"}>
                                {r.percentage}%
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {r.submittedAt ? new Date(r.submittedAt).toLocaleString() : "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
