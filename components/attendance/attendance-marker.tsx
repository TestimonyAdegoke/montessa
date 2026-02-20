"use client"

import { useState, useTransition } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { bulkMarkAttendance } from "@/lib/actions/attendance"
import { Check, X, Clock, AlertCircle, Save, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface AttendanceMarkerProps {
  students: Array<{
    id: string
    legalName: string
    preferredName: string | null
    admissionNumber: string
    profilePhoto: string | null
    attendance: {
      id: string
      status: string
      remarks: string | null
    } | null
  }>
  date: Date
  onComplete?: () => void
}

const statusOptions = [
  { value: "PRESENT", label: "Present", icon: Check, color: "text-green-600 bg-green-50 dark:bg-green-950" },
  { value: "ABSENT", label: "Absent", icon: X, color: "text-red-600 bg-red-50 dark:bg-red-950" },
  { value: "LATE", label: "Late", icon: Clock, color: "text-orange-600 bg-orange-50 dark:bg-orange-950" },
  { value: "EXCUSED", label: "Excused", icon: AlertCircle, color: "text-blue-600 bg-blue-50 dark:bg-blue-950" },
]

export default function AttendanceMarker({ students, date, onComplete }: AttendanceMarkerProps) {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [attendanceData, setAttendanceData] = useState<Record<string, { status: string; remarks: string }>>(
    students.reduce((acc, student) => {
      acc[student.id] = {
        status: student.attendance?.status || "",
        remarks: student.attendance?.remarks || "",
      }
      return acc
    }, {} as Record<string, { status: string; remarks: string }>)
  )

  const markAllPresent = () => {
    const updated = { ...attendanceData }
    students.forEach(student => {
      updated[student.id] = { ...updated[student.id], status: "PRESENT" }
    })
    setAttendanceData(updated)
  }

  const markAllAbsent = () => {
    const updated = { ...attendanceData }
    students.forEach(student => {
      updated[student.id] = { ...updated[student.id], status: "ABSENT" }
    })
    setAttendanceData(updated)
  }

  const handleStatusChange = (studentId: string, status: string) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], status },
    }))
  }

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], remarks },
    }))
  }

  const handleSubmit = () => {
    startTransition(async () => {
      const data = Object.entries(attendanceData)
        .filter(([_, value]) => value.status)
        .map(([studentId, value]) => ({
          studentId,
          status: value.status,
          remarks: value.remarks || undefined,
        }))

      if (data.length === 0) {
        toast({
          title: "No changes",
          description: "Please mark attendance for at least one student",
          variant: "destructive",
        })
        return
      }

      const result = await bulkMarkAttendance(data, date)

      if (result.success) {
        toast({
          title: "Success",
          description: `Attendance marked for ${result.count} students`,
        })
        onComplete?.()
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      }
    })
  }

  const getStats = () => {
    const statuses = Object.values(attendanceData).map(d => d.status).filter(Boolean)
    return {
      present: statuses.filter(s => s === "PRESENT").length,
      absent: statuses.filter(s => s === "ABSENT").length,
      late: statuses.filter(s => s === "LATE").length,
      excused: statuses.filter(s => s === "EXCUSED").length,
      unmarked: students.length - statuses.length,
    }
  }

  const stats = getStats()

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Summary</CardTitle>
          <CardDescription>
            {new Date(date).toLocaleDateString("en-US", { 
              weekday: "long", 
              year: "numeric", 
              month: "long", 
              day: "numeric" 
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{students.length}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.present}</div>
              <div className="text-sm text-muted-foreground">Present</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
              <div className="text-sm text-muted-foreground">Absent</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.late}</div>
              <div className="text-sm text-muted-foreground">Late</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{stats.unmarked}</div>
              <div className="text-sm text-muted-foreground">Unmarked</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <Button variant="outline" onClick={markAllPresent}>
          <Check className="mr-2 h-4 w-4" />
          Mark All Present
        </Button>
        <Button variant="outline" onClick={markAllAbsent}>
          <X className="mr-2 h-4 w-4" />
          Mark All Absent
        </Button>
        <div className="ml-auto">
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Attendance
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Student List */}
      <div className="space-y-2">
        {students.map((student) => {
          const studentStatus = attendanceData[student.id]?.status

          return (
            <Card key={student.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Student Info */}
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={student.profilePhoto || ""} alt={student.legalName} />
                    <AvatarFallback>
                      {student.legalName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="font-medium">{student.legalName}</div>
                    {student.preferredName && (
                      <div className="text-sm text-muted-foreground">({student.preferredName})</div>
                    )}
                    <div className="text-xs text-muted-foreground">{student.admissionNumber}</div>
                  </div>

                  {/* Status Buttons */}
                  <div className="flex gap-2">
                    {statusOptions.map((option) => {
                      const Icon = option.icon
                      const isSelected = studentStatus === option.value

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleStatusChange(student.id, option.value)}
                          className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all",
                            isSelected
                              ? option.color + " border-current"
                              : "border-transparent hover:bg-muted"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          <span className="text-sm font-medium hidden sm:inline">{option.label}</span>
                        </button>
                      )
                    })}
                  </div>

                  {/* Remarks */}
                  {studentStatus && (
                    <div className="w-64 hidden lg:block">
                      <Input
                        placeholder="Add remarks..."
                        value={attendanceData[student.id]?.remarks || ""}
                        onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                        className="h-9"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {students.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No students found</h3>
            <p className="text-muted-foreground text-center">
              There are no students enrolled in this class.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
