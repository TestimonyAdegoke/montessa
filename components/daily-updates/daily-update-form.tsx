"use client"

import { useState, useTransition } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, X, Send, CheckCircle2 } from "lucide-react"
import { createDailyUpdate, publishDailyUpdate } from "@/lib/actions/daily-updates"
import { useToast } from "@/components/ui/use-toast"

interface DailyUpdateFormProps {
  classes: { id: string; name: string; grade?: string | null }[]
  students: { id: string; legalName: string; preferredName?: string | null; profilePhoto?: string | null }[]
  tenantId: string
}

interface ActivityEntry {
  time: string
  activity: string
  category: string
  notes: string
}

export function DailyUpdateForm({ classes, students, tenantId }: DailyUpdateFormProps) {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [selectedClass, setSelectedClass] = useState(classes[0]?.id || "")
  const [selectedStudent, setSelectedStudent] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [activities, setActivities] = useState<ActivityEntry[]>([
    { time: "08:30", activity: "", category: "LEARNING", notes: "" },
  ])
  const [mood, setMood] = useState("")
  const [highlights, setHighlights] = useState("")
  const [concerns, setConcerns] = useState("")
  const [teacherNote, setTeacherNote] = useState("")
  const [breakfastStatus, setBreakfastStatus] = useState("")
  const [lunchStatus, setLunchStatus] = useState("")
  const [snackStatus, setSnackStatus] = useState("")
  const [saved, setSaved] = useState(false)
  const [savedId, setSavedId] = useState("")

  const addActivity = () => {
    setActivities([...activities, { time: "", activity: "", category: "LEARNING", notes: "" }])
  }

  const removeActivity = (index: number) => {
    setActivities(activities.filter((_, i) => i !== index))
  }

  const updateActivity = (index: number, field: keyof ActivityEntry, value: string) => {
    const updated = [...activities]
    updated[index] = { ...updated[index], [field]: value }
    setActivities(updated)
  }

  const handleSave = () => {
    if (!selectedStudent || !selectedClass) {
      toast({ title: "Error", description: "Please select a class and student", variant: "destructive" })
      return
    }

    const validActivities = activities.filter((a) => a.activity.trim())
    if (validActivities.length === 0) {
      toast({ title: "Error", description: "Add at least one activity", variant: "destructive" })
      return
    }

    startTransition(async () => {
      try {
        const meals: any = {}
        if (breakfastStatus) meals.breakfast = { status: breakfastStatus }
        if (lunchStatus) meals.lunch = { status: lunchStatus }
        if (snackStatus) meals.snack = { status: snackStatus }

        const result = await createDailyUpdate({
          studentId: selectedStudent,
          classId: selectedClass,
          date,
          activities: validActivities,
          meals: Object.keys(meals).length > 0 ? meals : undefined,
          mood: mood || undefined,
          highlights: highlights || undefined,
          concerns: concerns || undefined,
          teacherNote: teacherNote || undefined,
        })

        setSaved(true)
        setSavedId(result.id)
        toast({ title: "Saved!", description: "Daily update saved as draft." })
      } catch (e: any) {
        toast({ title: "Error", description: e.message, variant: "destructive" })
      }
    })
  }

  const handlePublish = () => {
    if (!savedId) return
    startTransition(async () => {
      try {
        await publishDailyUpdate(savedId)
        toast({ title: "Published!", description: "Parents have been notified." })
      } catch (e: any) {
        toast({ title: "Error", description: e.message, variant: "destructive" })
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Record Daily Update</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Class, Student, Date */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Class</Label>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
              <SelectContent>
                {classes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Student</Label>
            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
              <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
              <SelectContent>
                {students.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.preferredName || s.legalName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>

        {/* Activities */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label className="text-base font-semibold">Activities</Label>
            <Button variant="outline" size="sm" onClick={addActivity}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Activity
            </Button>
          </div>
          <div className="space-y-3">
            {activities.map((activity, i) => (
              <div key={i} className="flex gap-2 items-start">
                <Input
                  type="time"
                  value={activity.time}
                  onChange={(e) => updateActivity(i, "time", e.target.value)}
                  className="w-28"
                />
                <Input
                  placeholder="Activity description"
                  value={activity.activity}
                  onChange={(e) => updateActivity(i, "activity", e.target.value)}
                  className="flex-1"
                />
                <Select value={activity.category} onValueChange={(v) => updateActivity(i, "category", v)}>
                  <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LEARNING">Learning</SelectItem>
                    <SelectItem value="PLAY">Play</SelectItem>
                    <SelectItem value="ART">Art</SelectItem>
                    <SelectItem value="MUSIC">Music</SelectItem>
                    <SelectItem value="OUTDOOR">Outdoor</SelectItem>
                    <SelectItem value="SOCIAL">Social</SelectItem>
                    <SelectItem value="PRACTICAL_LIFE">Practical Life</SelectItem>
                    <SelectItem value="SENSORIAL">Sensorial</SelectItem>
                  </SelectContent>
                </Select>
                {activities.length > 1 && (
                  <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={() => removeActivity(i)}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Meals */}
        <div>
          <Label className="text-base font-semibold mb-3 block">Meals</Label>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Breakfast", value: breakfastStatus, setter: setBreakfastStatus },
              { label: "Lunch", value: lunchStatus, setter: setLunchStatus },
              { label: "Snack", value: snackStatus, setter: setSnackStatus },
            ].map(({ label, value, setter }) => (
              <div key={label}>
                <Label className="text-sm">{label}</Label>
                <Select value={value} onValueChange={setter}>
                  <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Ate All</SelectItem>
                    <SelectItem value="MOST">Ate Most</SelectItem>
                    <SelectItem value="SOME">Ate Some</SelectItem>
                    <SelectItem value="LITTLE">Ate Little</SelectItem>
                    <SelectItem value="NONE">Did Not Eat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </div>

        {/* Mood */}
        <div>
          <Label className="text-base font-semibold mb-3 block">Mood</Label>
          <div className="flex gap-2">
            {[
              { value: "HAPPY", emoji: "😊", label: "Happy" },
              { value: "CALM", emoji: "😌", label: "Calm" },
              { value: "ENERGETIC", emoji: "⚡", label: "Energetic" },
              { value: "TIRED", emoji: "😴", label: "Tired" },
              { value: "UPSET", emoji: "😢", label: "Upset" },
            ].map((m) => (
              <Button
                key={m.value}
                variant={mood === m.value ? "default" : "outline"}
                size="sm"
                onClick={() => setMood(mood === m.value ? "" : m.value)}
                className="gap-1"
              >
                <span>{m.emoji}</span> {m.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Highlights</Label>
            <Textarea
              placeholder="What went well today..."
              value={highlights}
              onChange={(e) => setHighlights(e.target.value)}
              rows={3}
            />
          </div>
          <div>
            <Label>Concerns</Label>
            <Textarea
              placeholder="Any concerns to note..."
              value={concerns}
              onChange={(e) => setConcerns(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <div>
          <Label>Teacher&apos;s Note to Parent</Label>
          <Textarea
            placeholder="A personal note for the parent..."
            value={teacherNote}
            onChange={(e) => setTeacherNote(e.target.value)}
            rows={2}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleSave} disabled={isPending}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Save as Draft
          </Button>
          {saved && (
            <Button onClick={handlePublish} disabled={isPending}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
              Publish & Notify Parents
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
