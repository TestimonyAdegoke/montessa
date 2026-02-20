"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Plus, Send, ChevronDown, ChevronUp, ArrowUpCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { createTranscript, publishTranscript, promoteStudent } from "@/lib/actions/transcripts"
import { useRouter } from "next/navigation"

const PROMOTION_STATUSES = ["PROMOTED", "RETAINED", "CONDITIONAL", "GRADUATED"]

interface Props { transcripts: any[]; students: any[]; classes: any[]; userRole: string }

export function TranscriptsClient({ transcripts, students, classes, userRole }: Props) {
  const { toast } = useToast()
  const router = useRouter()
  const [showCreate, setShowCreate] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [form, setForm] = useState({ studentId: "", academicYear: "", term: "", classId: "", classTeacherRemarks: "", principalRemarks: "" })
  const [grades, setGrades] = useState([{ subject: "", score: 0, grade: "", remarks: "" }])
  const canManage = ["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "HOD"].includes(userRole)
  const canPromote = ["SUPER_ADMIN", "TENANT_ADMIN", "HOD"].includes(userRole)

  const studentMap: Record<string, string> = {}
  students.forEach((s: any) => { studentMap[s.id] = s.legalName })
  const classMap: Record<string, string> = {}
  classes.forEach((c: any) => { classMap[c.id] = c.name })

  const handleCreate = async () => {
    if (!form.studentId || !form.academicYear || !form.classId) return
    const validGrades = grades.filter(g => g.subject)
    const totalScore = validGrades.reduce((s, g) => s + g.score, 0)
    const averageScore = validGrades.length > 0 ? totalScore / validGrades.length : 0
    try {
      await createTranscript({ ...form, grades: validGrades, totalScore, averageScore })
      toast({ title: "Transcript Created" })
      setShowCreate(false)
      setForm({ studentId: "", academicYear: "", term: "", classId: "", classTeacherRemarks: "", principalRemarks: "" })
      setGrades([{ subject: "", score: 0, grade: "", remarks: "" }])
      router.refresh()
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }) }
  }

  const handlePublish = async (id: string) => {
    try { await publishTranscript(id); toast({ title: "Published" }); router.refresh() }
    catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }) }
  }

  const handlePromote = async (id: string, status: string, classId?: string) => {
    try { await promoteStudent(id, status, classId); toast({ title: `Student ${status.toLowerCase()}` }); router.refresh() }
    catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }) }
  }

  const addGradeRow = () => setGrades([...grades, { subject: "", score: 0, grade: "", remarks: "" }])

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardDescription>Total Transcripts</CardDescription><CardTitle className="text-3xl">{transcripts.length}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Published</CardDescription><CardTitle className="text-3xl text-green-600">{transcripts.filter((t: any) => t.isPublished).length}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Promoted</CardDescription><CardTitle className="text-3xl text-blue-600">{transcripts.filter((t: any) => t.promotionStatus === "PROMOTED").length}</CardTitle></CardHeader></Card>
      </div>

      {canManage && <Button onClick={() => setShowCreate(!showCreate)}><Plus className="h-4 w-4 mr-2" />New Transcript</Button>}

      {showCreate && (
        <Card>
          <CardHeader><CardTitle className="text-base">Create Transcript</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div><Label>Student *</Label><Select value={form.studentId} onValueChange={v => setForm({ ...form, studentId: v })}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{students.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.legalName} ({s.admissionNumber})</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Academic Year *</Label><Input value={form.academicYear} onChange={e => setForm({ ...form, academicYear: e.target.value })} placeholder="2024-2025" /></div>
              <div><Label>Term</Label><Input value={form.term} onChange={e => setForm({ ...form, term: e.target.value })} placeholder="Term 1" /></div>
              <div><Label>Class *</Label><Select value={form.classId} onValueChange={v => setForm({ ...form, classId: v })}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{classes.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div>
              <Label className="mb-2 block">Grades</Label>
              <div className="space-y-2">
                {grades.map((g, i) => (
                  <div key={i} className="grid gap-2 grid-cols-4">
                    <Input placeholder="Subject" value={g.subject} onChange={e => { const ng = [...grades]; ng[i].subject = e.target.value; setGrades(ng) }} />
                    <Input type="number" placeholder="Score" value={g.score || ""} onChange={e => { const ng = [...grades]; ng[i].score = parseFloat(e.target.value) || 0; setGrades(ng) }} />
                    <Input placeholder="Grade (A, B...)" value={g.grade} onChange={e => { const ng = [...grades]; ng[i].grade = e.target.value; setGrades(ng) }} />
                    <Input placeholder="Remarks" value={g.remarks} onChange={e => { const ng = [...grades]; ng[i].remarks = e.target.value; setGrades(ng) }} />
                  </div>
                ))}
                <Button size="sm" variant="outline" onClick={addGradeRow}><Plus className="h-3 w-3 mr-1" />Add Subject</Button>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div><Label>Class Teacher Remarks</Label><Input value={form.classTeacherRemarks} onChange={e => setForm({ ...form, classTeacherRemarks: e.target.value })} /></div>
              <div><Label>Principal Remarks</Label><Input value={form.principalRemarks} onChange={e => setForm({ ...form, principalRemarks: e.target.value })} /></div>
            </div>
            <div className="flex gap-2"><Button onClick={handleCreate}>Create</Button><Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button></div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {transcripts.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground"><FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />No transcripts yet.</CardContent></Card>
        ) : transcripts.map((t: any) => {
          const gradesList = Array.isArray(t.grades) ? t.grades : []
          return (
            <Card key={t.id}>
              <CardHeader className="cursor-pointer py-3" onClick={() => setExpanded(expanded === t.id ? null : t.id)}>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{studentMap[t.studentId] || t.studentId}</CardTitle>
                    <CardDescription>{t.academicYear}{t.term ? ` · ${t.term}` : ""} · {classMap[t.classId] || t.classId}{t.averageScore ? ` · Avg: ${t.averageScore.toFixed(1)}` : ""}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {t.promotionStatus && <Badge variant={t.promotionStatus === "PROMOTED" ? "default" : "secondary"}>{t.promotionStatus}</Badge>}
                    <Badge variant={t.isPublished ? "default" : "outline"}>{t.isPublished ? "Published" : "Draft"}</Badge>
                    {expanded === t.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </div>
              </CardHeader>
              {expanded === t.id && (
                <CardContent className="space-y-3">
                  {gradesList.length > 0 && (
                    <div className="border rounded-md overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-muted"><tr><th className="p-2 text-left">Subject</th><th className="p-2 text-left">Score</th><th className="p-2 text-left">Grade</th><th className="p-2 text-left">Remarks</th></tr></thead>
                        <tbody>{gradesList.map((g: any, i: number) => <tr key={i} className="border-t"><td className="p-2">{g.subject}</td><td className="p-2">{g.score}</td><td className="p-2 font-medium">{g.grade}</td><td className="p-2 text-muted-foreground">{g.remarks || "—"}</td></tr>)}</tbody>
                      </table>
                    </div>
                  )}
                  {t.classTeacherRemarks && <p className="text-sm"><strong>Class Teacher:</strong> {t.classTeacherRemarks}</p>}
                  {t.principalRemarks && <p className="text-sm"><strong>Principal:</strong> {t.principalRemarks}</p>}
                  <div className="flex gap-2">
                    {canManage && !t.isPublished && <Button size="sm" variant="outline" onClick={() => handlePublish(t.id)}><Send className="h-3 w-3 mr-1" />Publish</Button>}
                    {canPromote && !t.promotionStatus && (
                      <Select onValueChange={v => handlePromote(t.id, v)}>
                        <SelectTrigger className="w-[160px] h-8 text-xs"><SelectValue placeholder="Set Promotion" /></SelectTrigger>
                        <SelectContent>{PROMOTION_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
