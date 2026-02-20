"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { createDisciplineRecord } from "@/lib/actions/discipline"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewDisciplineRecordPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [students, setStudents] = useState<any[]>([])

  useEffect(() => {
    fetch("/api/students?limit=500")
      .then((r) => r.json())
      .then((data) => setStudents(data.data || []))
      .catch(() => {})
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await createDisciplineRecord(formData)

    if (result.success) {
      toast({ title: "Record created successfully" })
      router.push("/dashboard/discipline")
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" })
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/discipline">
          <Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">New Discipline Record</h1>
      </div>

      <Card>
        <CardHeader><CardTitle>Record Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="studentId">Student *</Label>
                <Select name="studentId" required>
                  <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                  <SelectContent>
                    {students.map((s: any) => (
                      <SelectItem key={s.id} value={s.id}>{s.user?.name || s.legalName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="incidentDate">Incident Date *</Label>
                <Input id="incidentDate" name="incidentDate" type="datetime-local" required />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select name="type" required>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="POSITIVE_BEHAVIOR">Positive Behavior</SelectItem>
                    <SelectItem value="MINOR_INFRACTION">Minor Infraction</SelectItem>
                    <SelectItem value="MAJOR_INFRACTION">Major Infraction</SelectItem>
                    <SelectItem value="BULLYING">Bullying</SelectItem>
                    <SelectItem value="ACADEMIC_DISHONESTY">Academic Dishonesty</SelectItem>
                    <SelectItem value="ATTENDANCE_ISSUE">Attendance Issue</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="severity">Severity *</Label>
                <Select name="severity" required>
                  <SelectTrigger><SelectValue placeholder="Select severity" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="CRITICAL">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" name="title" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea id="description" name="description" rows={4} required />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" name="location" placeholder="e.g., Classroom 3A" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="actionTaken">Action Taken</Label>
                <Input id="actionTaken" name="actionTaken" />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Link href="/dashboard/discipline"><Button variant="outline">Cancel</Button></Link>
              <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create Record"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
