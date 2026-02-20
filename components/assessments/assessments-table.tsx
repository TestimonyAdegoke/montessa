"use client"

import { useState } from "react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, Search, FileText, CheckCircle } from "lucide-react"

export default function AssessmentsTable({ assessments }: { assessments: any[] }) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredAssessments = assessments.filter((a) => {
    const query = searchQuery.toLowerCase()
    return a.title.toLowerCase().includes(query) || a.subject.toLowerCase().includes(query) || a.class.name.toLowerCase().includes(query)
  })

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      DRAFT: "secondary",
      PUBLISHED: "default",
      COMPLETED: "success",
    }
    return <Badge variant={variants[status] || "default"}>{status}</Badge>
  }

  const getCompletionStats = (results: any[]) => {
    const completed = results.filter(r => r.status === "GRADED").length
    const total = results.length
    return { completed, total, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search assessments..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Total Marks</TableHead>
              <TableHead>Completion</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAssessments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">No assessments found</TableCell>
              </TableRow>
            ) : (
              filteredAssessments.map((assessment) => {
                const stats = getCompletionStats(assessment.results)
                return (
                  <TableRow key={assessment.id}>
                    <TableCell>
                      <div className="font-medium">{assessment.title}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {assessment.duration} minutes
                      </div>
                    </TableCell>
                    <TableCell>{assessment.type}</TableCell>
                    <TableCell>{assessment.subject}</TableCell>
                    <TableCell>{assessment.class.name}</TableCell>
                    <TableCell>{assessment.totalMarks}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <span className="font-medium">{stats.completed}</span> / {stats.total}
                        <div className="w-24 h-1 bg-muted rounded-full mt-1 overflow-hidden">
                          <div className="h-full bg-green-500" style={{ width: `${stats.percentage}%` }} />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(assessment.status)}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/dashboard/assessments/${assessment.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
