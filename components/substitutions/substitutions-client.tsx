"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRightLeft, Plus, Check, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { createSubstitution, approveSubstitution, deleteSubstitution } from "@/lib/actions/substitutions"
import { useRouter } from "next/navigation"

interface Props { substitutions: any[]; teachers: any[]; classes: any[] }

export function SubstitutionsClient({ substitutions, teachers, classes }: Props) {
  const { toast } = useToast()
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ date: "", originalTeacherId: "", substituteTeacherId: "", classId: "", subject: "", startTime: "", endTime: "", reason: "" })

  const teacherMap: Record<string, string> = {}
  teachers.forEach((t: any) => { teacherMap[t.id] = t.name || t.email })
  const classMap: Record<string, string> = {}
  classes.forEach((c: any) => { classMap[c.id] = c.name })

  const handleCreate = async () => {
    if (!form.date || !form.originalTeacherId || !form.substituteTeacherId || !form.classId || !form.subject) return
    try {
      await createSubstitution(form)
      toast({ title: "Substitution Created" })
      setShowForm(false)
      setForm({ date: "", originalTeacherId: "", substituteTeacherId: "", classId: "", subject: "", startTime: "", endTime: "", reason: "" })
      router.refresh()
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }) }
  }

  const handleApprove = async (id: string) => {
    try { await approveSubstitution(id); toast({ title: "Approved" }); router.refresh() }
    catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }) }
  }

  const handleDelete = async (id: string) => {
    try { await deleteSubstitution(id); toast({ title: "Deleted" }); router.refresh() }
    catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }) }
  }

  const pending = substitutions.filter((s: any) => s.status === "PENDING").length
  const approved = substitutions.filter((s: any) => s.status === "APPROVED").length

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardDescription>Total</CardDescription><CardTitle className="text-3xl">{substitutions.length}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Pending</CardDescription><CardTitle className="text-3xl text-orange-500">{pending}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Approved</CardDescription><CardTitle className="text-3xl text-green-600">{approved}</CardTitle></CardHeader></Card>
      </div>

      <Button onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-2" />New Substitution</Button>

      {showForm && (
        <Card>
          <CardHeader><CardTitle className="text-base">Create Substitution</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div><Label>Date *</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
              <div><Label>Original Teacher *</Label><Select value={form.originalTeacherId} onValueChange={v => setForm({ ...form, originalTeacherId: v })}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{teachers.map((t: any) => <SelectItem key={t.id} value={t.id}>{t.name || t.email}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Substitute Teacher *</Label><Select value={form.substituteTeacherId} onValueChange={v => setForm({ ...form, substituteTeacherId: v })}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{teachers.map((t: any) => <SelectItem key={t.id} value={t.id}>{t.name || t.email}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Class *</Label><Select value={form.classId} onValueChange={v => setForm({ ...form, classId: v })}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{classes.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Subject *</Label><Input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} /></div>
              <div><Label>Reason</Label><Input value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} /></div>
              <div><Label>Start Time</Label><Input type="time" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} /></div>
              <div><Label>End Time</Label><Input type="time" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} /></div>
            </div>
            <div className="flex gap-2"><Button onClick={handleCreate}>Create</Button><Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button></div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {substitutions.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">No substitutions found.</CardContent></Card>
        ) : substitutions.map((s: any) => (
          <Card key={s.id}>
            <CardContent className="py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ArrowRightLeft className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-semibold">{s.subject} — {classMap[s.classId] || s.classId}</p>
                  <p className="text-sm text-muted-foreground">
                    {teacherMap[s.originalTeacherId] || "Unknown"} → {teacherMap[s.substituteTeacherId] || "Unknown"}
                    {s.date ? ` · ${new Date(s.date).toLocaleDateString()}` : ""}
                    {s.startTime ? ` · ${s.startTime}–${s.endTime}` : ""}
                  </p>
                  {s.reason && <p className="text-xs text-muted-foreground mt-1">Reason: {s.reason}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={s.status === "APPROVED" ? "default" : s.status === "PENDING" ? "secondary" : "outline"}>{s.status}</Badge>
                {s.status === "PENDING" && <Button size="sm" variant="outline" onClick={() => handleApprove(s.id)}><Check className="h-3 w-3 mr-1" />Approve</Button>}
                <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
