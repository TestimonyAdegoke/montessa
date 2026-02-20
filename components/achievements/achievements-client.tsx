"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Award, Plus, Trash2, Trophy, Star, Medal } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { createAchievement, deleteAchievement } from "@/lib/actions/achievements"
import { useRouter } from "next/navigation"

const CATEGORIES = ["ACADEMIC", "SPORTS", "ARTS", "LEADERSHIP", "COMMUNITY_SERVICE", "ATTENDANCE", "BEHAVIOR", "SPECIAL"]
const BADGE_COLORS: Record<string, string> = {
  ACADEMIC: "#3b82f6", SPORTS: "#22c55e", ARTS: "#a855f7", LEADERSHIP: "#f59e0b",
  COMMUNITY_SERVICE: "#ec4899", ATTENDANCE: "#06b6d4", BEHAVIOR: "#84cc16", SPECIAL: "#f97316",
}

interface Props {
  achievements: any[]
  students: any[]
  userRole: string
}

export function AchievementsClient({ achievements, students, userRole }: Props) {
  const { toast } = useToast()
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [studentId, setStudentId] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("ACADEMIC")
  const [points, setPoints] = useState("10")
  const canManage = ["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "HOD"].includes(userRole)

  const handleCreate = async () => {
    if (!studentId || !title) return
    try {
      await createAchievement({ studentId, title, description, category, points: parseInt(points) || 0, badgeColor: BADGE_COLORS[category] })
      toast({ title: "Achievement Awarded" })
      setShowForm(false)
      setTitle("")
      setDescription("")
      setStudentId("")
      router.refresh()
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }) }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteAchievement(id)
      toast({ title: "Achievement Removed" })
      router.refresh()
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }) }
  }

  const totalPoints = achievements.reduce((sum: number, a: any) => sum + (a.points || 0), 0)
  const studentMap: Record<string, string> = {}
  students.forEach((s: any) => { studentMap[s.id] = s.legalName })

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardDescription>Total Achievements</CardDescription><CardTitle className="text-3xl flex items-center gap-2"><Trophy className="h-6 w-6 text-yellow-500" />{achievements.length}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Total Points</CardDescription><CardTitle className="text-3xl flex items-center gap-2"><Star className="h-6 w-6 text-yellow-500" />{totalPoints}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Unique Students</CardDescription><CardTitle className="text-3xl flex items-center gap-2"><Medal className="h-6 w-6 text-blue-500" />{Array.from(new Set(achievements.map((a: any) => a.studentId))).length}</CardTitle></CardHeader></Card>
      </div>

      {canManage && (
        <div>
          {!showForm ? (
            <Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4 mr-2" />Award Achievement</Button>
          ) : (
            <Card>
              <CardHeader><CardTitle className="text-base">Award New Achievement</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div><Label>Student</Label><Select value={studentId} onValueChange={setStudentId}><SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger><SelectContent>{students.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.legalName} ({s.admissionNumber})</SelectItem>)}</SelectContent></Select></div>
                  <div><Label>Category</Label><Select value={category} onValueChange={setCategory}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c.replace(/_/g, " ")}</SelectItem>)}</SelectContent></Select></div>
                  <div><Label>Title</Label><Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Math Olympiad Winner" /></div>
                  <div><Label>Points</Label><Input type="number" value={points} onChange={e => setPoints(e.target.value)} /></div>
                </div>
                <div><Label>Description</Label><Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional description" /></div>
                <div className="flex gap-2"><Button onClick={handleCreate}>Award</Button><Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button></div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <div className="space-y-3">
        {achievements.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">No achievements awarded yet.</CardContent></Card>
        ) : achievements.map((a: any) => (
          <Card key={a.id}>
            <CardContent className="py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full flex items-center justify-center text-white text-lg" style={{ backgroundColor: a.badgeColor || "#3b82f6" }}>
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">{a.title}</p>
                  <p className="text-sm text-muted-foreground">{studentMap[a.studentId] || a.studentId} · {a.description || ""}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline">{a.category?.replace(/_/g, " ")}</Badge>
                <Badge>{a.points} pts</Badge>
                {canManage && <Button variant="ghost" size="icon" onClick={() => handleDelete(a.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
