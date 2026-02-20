"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { createEvent } from "@/lib/actions/events"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewEventPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [allDay, setAllDay] = useState(false)
  const [isVirtual, setIsVirtual] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.set("allDay", allDay.toString())
    formData.set("isVirtual", isVirtual.toString())

    const result = await createEvent(formData)

    if (result.success) {
      toast({ title: "Event created successfully" })
      router.push("/dashboard/events")
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" })
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/events">
          <Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">New Event</h1>
      </div>

      <Card>
        <CardHeader><CardTitle>Event Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input id="title" name="title" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select name="type" required>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACADEMIC">Academic</SelectItem>
                    <SelectItem value="HOLIDAY">Holiday</SelectItem>
                    <SelectItem value="EXAM">Exam</SelectItem>
                    <SelectItem value="MEETING">Meeting</SelectItem>
                    <SelectItem value="SPORTS">Sports</SelectItem>
                    <SelectItem value="CULTURAL">Cultural</SelectItem>
                    <SelectItem value="PARENT_TEACHER">Parent-Teacher</SelectItem>
                    <SelectItem value="FIELD_TRIP">Field Trip</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" rows={3} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date/Time *</Label>
                <Input id="startDate" name="startDate" type="datetime-local" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date/Time *</Label>
                <Input id="endDate" name="endDate" type="datetime-local" required />
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={allDay} onCheckedChange={setAllDay} />
                <Label>All Day Event</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={isVirtual} onCheckedChange={setIsVirtual} />
                <Label>Virtual Event</Label>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" name="location" placeholder="e.g., Main Hall" />
              </div>
              {isVirtual && (
                <div className="space-y-2">
                  <Label htmlFor="meetingLink">Meeting Link</Label>
                  <Input id="meetingLink" name="meetingLink" placeholder="https://..." />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="audience">Audience</Label>
                <Select name="audience" defaultValue="ALL">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All</SelectItem>
                    <SelectItem value="TEACHERS">Teachers</SelectItem>
                    <SelectItem value="GUARDIANS">Parents/Guardians</SelectItem>
                    <SelectItem value="STUDENTS">Students</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Input id="color" name="color" type="color" defaultValue="#3b82f6" className="w-16 h-10" />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Link href="/dashboard/events"><Button variant="outline">Cancel</Button></Link>
              <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create Event"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
