"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarDays, Plus, Send, Trash2, ChevronDown, ChevronUp } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { createExamTimetable, addExamEntry, publishExamTimetable, deleteExamTimetable } from "@/lib/actions/exam-timetable"
import { useRouter } from "next/navigation"

interface Props { timetables: any[]; classes: any[]; userRole: string }

export function ExamTimetableClient({ timetables, classes, userRole }: Props) {
  const { toast } = useToast()
  const router = useRouter()
  const [showCreate, setShowCreate] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [showAddEntry, setShowAddEntry] = useState<string | null>(null)
  const [form, setForm] = useState({ title: "", academicYear: "", term: "", startDate: "", endDate: "" })
  const [entry, setEntry] = useState({ subject: "", classId: "", date: "", startTime: "", endTime: "", duration: "", totalMarks: "" })
  const canManage = ["SUPER_ADMIN", "TENANT_ADMIN", "HOD"].includes(userRole)

  const classMap: Record<string, string> = {}
  classes.forEach((c: any) => { classMap[c.id] = c.name })

  const handleCreate = async () => {
    if (!form.title || !form.academicYear || !form.startDate || !form.endDate) return
    try {
      await createExamTimetable(form)
      toast({ title: "Exam Timetable Created" })
      setShowCreate(false)
      setForm({ title: "", academicYear: "", term: "", startDate: "", endDate: "" })
      router.refresh()
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }) }
  }

  const handleAddEntry = async (timetableId: string) => {
    if (!entry.subject || !entry.classId || !entry.date || !entry.startTime || !entry.endTime) return
    try {
      await addExamEntry({ timetableId, ...entry, duration: entry.duration ? parseInt(entry.duration) : undefined, totalMarks: entry.totalMarks ? parseInt(entry.totalMarks) : undefined })
      toast({ title: "Exam Entry Added" })
      setShowAddEntry(null)
      setEntry({ subject: "", classId: "", date: "", startTime: "", endTime: "", duration: "", totalMarks: "" })
      router.refresh()
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }) }
  }

  const handlePublish = async (id: string) => {
    try { await publishExamTimetable(id); toast({ title: "Published" }); router.refresh() }
    catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }) }
  }

  const handleDelete = async (id: string) => {
    try { await deleteExamTimetable(id); toast({ title: "Deleted" }); router.refresh() }
    catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }) }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardDescription>Total Timetables</CardDescription><CardTitle className="text-3xl">{timetables.length}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Published</CardDescription><CardTitle className="text-3xl text-green-600">{timetables.filter((t: any) => t.status === "PUBLISHED").length}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Total Exams</CardDescription><CardTitle className="text-3xl">{timetables.reduce((s: number, t: any) => s + (t.entries?.length || 0), 0)}</CardTitle></CardHeader></Card>
      </div>

      {canManage && <Button onClick={() => setShowCreate(!showCreate)}><Plus className="h-4 w-4 mr-2" />New Exam Timetable</Button>}

      {showCreate && (
        <Card>
          <CardHeader><CardTitle className="text-base">Create Exam Timetable</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Mid-Term Exams 2025" /></div>
              <div><Label>Academic Year *</Label><Input value={form.academicYear} onChange={e => setForm({ ...form, academicYear: e.target.value })} placeholder="2024-2025" /></div>
              <div><Label>Term</Label><Input value={form.term} onChange={e => setForm({ ...form, term: e.target.value })} placeholder="Term 1" /></div>
              <div><Label>Start Date *</Label><Input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} /></div>
              <div><Label>End Date *</Label><Input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} /></div>
            </div>
            <div className="flex gap-2"><Button onClick={handleCreate}>Create</Button><Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button></div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {timetables.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground"><CalendarDays className="h-8 w-8 mx-auto mb-2 opacity-50" />No exam timetables yet.</CardContent></Card>
        ) : timetables.map((t: any) => (
          <Card key={t.id}>
            <CardHeader className="cursor-pointer" onClick={() => setExpanded(expanded === t.id ? null : t.id)}>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">{t.title} <Badge variant={t.status === "PUBLISHED" ? "default" : "secondary"}>{t.status}</Badge></CardTitle>
                  <CardDescription>{t.academicYear}{t.term ? ` · ${t.term}` : ""} · {new Date(t.startDate).toLocaleDateString()} – {new Date(t.endDate).toLocaleDateString()} · {t.entries?.length || 0} exams</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {canManage && t.status === "DRAFT" && <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handlePublish(t.id) }}><Send className="h-3 w-3 mr-1" />Publish</Button>}
                  {canManage && <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleDelete(t.id) }}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
                  {expanded === t.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </div>
            </CardHeader>
            {expanded === t.id && (
              <CardContent className="space-y-3">
                {t.entries?.length > 0 && (
                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted"><tr><th className="p-2 text-left">Date</th><th className="p-2 text-left">Subject</th><th className="p-2 text-left">Class</th><th className="p-2 text-left">Time</th><th className="p-2 text-left">Duration</th><th className="p-2 text-left">Marks</th></tr></thead>
                      <tbody>
                        {t.entries.map((e: any) => (
                          <tr key={e.id} className="border-t"><td className="p-2">{new Date(e.date).toLocaleDateString()}</td><td className="p-2 font-medium">{e.subject}</td><td className="p-2">{classMap[e.classId] || e.classId}</td><td className="p-2">{e.startTime}–{e.endTime}</td><td className="p-2">{e.duration ? `${e.duration}min` : "—"}</td><td className="p-2">{e.totalMarks || "—"}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {canManage && showAddEntry !== t.id && <Button size="sm" variant="outline" onClick={() => setShowAddEntry(t.id)}><Plus className="h-3 w-3 mr-1" />Add Exam</Button>}
                {showAddEntry === t.id && (
                  <div className="border rounded-md p-4 space-y-3">
                    <div className="grid gap-3 md:grid-cols-3">
                      <div><Label>Subject *</Label><Input value={entry.subject} onChange={e => setEntry({ ...entry, subject: e.target.value })} /></div>
                      <div><Label>Class *</Label><Select value={entry.classId} onValueChange={v => setEntry({ ...entry, classId: v })}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{classes.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div>
                      <div><Label>Date *</Label><Input type="date" value={entry.date} onChange={e => setEntry({ ...entry, date: e.target.value })} /></div>
                      <div><Label>Start Time *</Label><Input type="time" value={entry.startTime} onChange={e => setEntry({ ...entry, startTime: e.target.value })} /></div>
                      <div><Label>End Time *</Label><Input type="time" value={entry.endTime} onChange={e => setEntry({ ...entry, endTime: e.target.value })} /></div>
                      <div><Label>Duration (min)</Label><Input type="number" value={entry.duration} onChange={e => setEntry({ ...entry, duration: e.target.value })} /></div>
                      <div><Label>Total Marks</Label><Input type="number" value={entry.totalMarks} onChange={e => setEntry({ ...entry, totalMarks: e.target.value })} /></div>
                    </div>
                    <div className="flex gap-2"><Button size="sm" onClick={() => handleAddEntry(t.id)}>Add</Button><Button size="sm" variant="outline" onClick={() => setShowAddEntry(null)}>Cancel</Button></div>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
