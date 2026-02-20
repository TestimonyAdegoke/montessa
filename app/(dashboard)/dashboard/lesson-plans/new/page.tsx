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
import { createLessonPlan } from "@/lib/actions/lesson-plans"
import { ArrowLeft, Plus, X } from "lucide-react"
import Link from "next/link"

export default function NewLessonPlanPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [classes, setClasses] = useState<any[]>([])
  const [objectives, setObjectives] = useState<string[]>([""])
  const [materials, setMaterials] = useState<string[]>([""])

  useEffect(() => {
    fetch("/api/classes?limit=100")
      .then((r) => r.json())
      .then((data) => setClasses(data.data || data || []))
      .catch(() => {})
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.set("objectives", JSON.stringify(objectives.filter((o) => o.trim())))
    formData.set("materials", JSON.stringify(materials.filter((m) => m.trim())))

    const result = await createLessonPlan(formData)

    if (result.success) {
      toast({ title: "Lesson plan created successfully" })
      router.push("/dashboard/lesson-plans")
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" })
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/lesson-plans">
          <Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">New Lesson Plan</h1>
      </div>

      <Card>
        <CardHeader><CardTitle>Lesson Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input id="title" name="title" required placeholder="e.g., Introduction to Fractions" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input id="subject" name="subject" required placeholder="e.g., Mathematics" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="classId">Class *</Label>
                <Select name="classId" required>
                  <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                  <SelectContent>
                    {classes.map((c: any) => (
                      <SelectItem key={c.id} value={c.id}>{c.name} ({c.grade})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="scheduledDate">Date *</Label>
                  <Input id="scheduledDate" name="scheduledDate" type="date" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (min) *</Label>
                  <Input id="duration" name="duration" type="number" defaultValue="45" required />
                </div>
              </div>
            </div>

            {/* Objectives */}
            <div className="space-y-2">
              <Label>Learning Objectives</Label>
              {objectives.map((obj, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={obj}
                    onChange={(e) => {
                      const updated = [...objectives]
                      updated[i] = e.target.value
                      setObjectives(updated)
                    }}
                    placeholder={`Objective ${i + 1}`}
                  />
                  {objectives.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => setObjectives(objectives.filter((_, j) => j !== i))}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => setObjectives([...objectives, ""])}>
                <Plus className="h-3 w-3 mr-1" />Add Objective
              </Button>
            </div>

            {/* Materials */}
            <div className="space-y-2">
              <Label>Materials Needed</Label>
              {materials.map((mat, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={mat}
                    onChange={(e) => {
                      const updated = [...materials]
                      updated[i] = e.target.value
                      setMaterials(updated)
                    }}
                    placeholder={`Material ${i + 1}`}
                  />
                  {materials.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => setMaterials(materials.filter((_, j) => j !== i))}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => setMaterials([...materials, ""])}>
                <Plus className="h-3 w-3 mr-1" />Add Material
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="procedure">Lesson Procedure *</Label>
              <Textarea id="procedure" name="procedure" rows={6} required placeholder="Step-by-step lesson procedure..." />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="assessment">Assessment Method</Label>
                <Textarea id="assessment" name="assessment" rows={3} placeholder="How will you assess understanding?" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="homework">Homework</Label>
                <Textarea id="homework" name="homework" rows={3} placeholder="Homework assignment..." />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea id="notes" name="notes" rows={2} />
            </div>

            <div className="flex justify-end gap-3">
              <Link href="/dashboard/lesson-plans"><Button variant="outline">Cancel</Button></Link>
              <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create Lesson Plan"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
