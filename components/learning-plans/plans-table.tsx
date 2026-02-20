"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, Search, Calendar, Target } from "lucide-react"
import { formatDistance } from "date-fns"

interface Plan {
  id: string
  title: string
  startDate: Date
  endDate: Date | null
  status: string
  objectives: any
  student: {
    legalName: string
    user: {
      name: string | null
    }
    currentClass: {
      name: string
    } | null
  }
  teacher: {
    user: {
      name: string | null
    }
  }
  activities: Array<{
    id: string
    status: string
  }>
}

interface PlansTableProps {
  plans: Plan[]
}

export default function LearningPlansTable({ plans }: PlansTableProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredPlans = plans.filter((plan) => {
    const query = searchQuery.toLowerCase()
    return (
      plan.title.toLowerCase().includes(query) ||
      plan.student.legalName.toLowerCase().includes(query) ||
      plan.teacher.user.name?.toLowerCase().includes(query)
    )
  })

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      ACTIVE: "default",
      COMPLETED: "success",
      ON_HOLD: "secondary",
      CANCELLED: "destructive",
    }

    return (
      <Badge variant={variants[status] || "default"}>
        {status.replace("_", " ")}
      </Badge>
    )
  }

  const getActivityStats = (activities: Plan["activities"]) => {
    const completed = activities.filter(a => a.status === "COMPLETED").length
    const total = activities.length
    return { completed, total }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by plan title, student, or teacher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plan Title</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Objectives</TableHead>
              <TableHead>Activities</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPlans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground">
                  No learning plans found
                </TableCell>
              </TableRow>
            ) : (
              filteredPlans.map((plan) => {
                const activityStats = getActivityStats(plan.activities)
                
                return (
                  <TableRow key={plan.id}>
                    <TableCell>
                      <div className="font-medium">{plan.title}</div>
                      <div className="text-xs text-muted-foreground">
                        Started {formatDistance(new Date(plan.startDate), new Date(), { addSuffix: true })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{plan.student.legalName}</div>
                    </TableCell>
                    <TableCell>
                      {plan.student.currentClass?.name || (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {plan.endDate
                          ? `${formatDistance(new Date(plan.startDate), new Date(plan.endDate))}`
                          : "Ongoing"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Target className="h-3 w-3 text-muted-foreground" />
                        {plan.objectives.length} objectives
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <span className="font-medium">{activityStats.completed}</span> / {activityStats.total}
                        {activityStats.total > 0 && (
                          <div className="w-24 h-1 bg-muted rounded-full mt-1 overflow-hidden">
                            <div
                              className="h-full bg-green-500"
                              style={{ width: `${(activityStats.completed / activityStats.total) * 100}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{plan.teacher.user.name}</div>
                    </TableCell>
                    <TableCell>{getStatusBadge(plan.status)}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/dashboard/learning-plans/${plan.id}`}>
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

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          Showing {filteredPlans.length} of {plans.length} learning plans
        </div>
      </div>
    </div>
  )
}
