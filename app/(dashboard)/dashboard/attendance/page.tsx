"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "lucide-react"
import AttendanceMarker from "@/components/attendance/attendance-marker"

export default function AttendancePage() {
  const [selectedClass, setSelectedClass] = useState<string | undefined>(undefined)
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [classes, setClasses] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Fetch classes
    fetch("/api/classes")
      .then(res => res.json())
      .then(data => setClasses(data))
      .catch(console.error)
  }, [])

  useEffect(() => {
    if (selectedClass && selectedDate) {
      setLoading(true)
      fetch(`/api/attendance/class?classId=${selectedClass}&date=${selectedDate}`)
        .then(res => res.json())
        .then(data => setStudents(data))
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [selectedClass, selectedDate])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
        <p className="text-muted-foreground">Mark daily attendance for students</p>
      </div>

      {/* Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle>Select Class and Date</CardTitle>
          <CardDescription>Choose a class and date to mark attendance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name} {cls.grade && `(Grade ${cls.grade})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date</Label>
              <div className="relative">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
                <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Marker */}
      {selectedClass && selectedDate && !loading && (
        <AttendanceMarker
          students={students}
          date={new Date(selectedDate)}
          onComplete={() => {
            // Reload students
            setLoading(true)
            fetch(`/api/attendance/class?classId=${selectedClass}&date=${selectedDate}`)
              .then(res => res.json())
              .then(data => setStudents(data))
              .catch(console.error)
              .finally(() => setLoading(false))
          }}
        />
      )}

      {loading && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading students...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedClass && selectedDate && !loading && students.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h3 className="text-lg font-semibold mb-2">No Students Found</h3>
            <p className="text-muted-foreground text-center">
              This class doesn&apos;t have any active students enrolled.
            </p>
          </CardContent>
        </Card>
      )}

      {!selectedClass && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Select a Class</h3>
            <p className="text-muted-foreground text-center">
              Choose a class and date above to start marking attendance
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
