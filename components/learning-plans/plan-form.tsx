"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { createLearningPlan, updateLearningPlan } from "@/lib/actions/learning-plans"
import { Loader2, Save, X, Plus, Trash2 } from "lucide-react"

interface Objective {
  title: string
  description: string
  targetDate: string
}

interface PlanFormProps {
  plan?: any
  students: any[]
  mode: "create" | "edit"
}

export default function PlanForm({ plan, students, mode }: PlanFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [objectives, setObjectives] = useState<Objective[]>(
    plan?.objectives || [{ title: "", description: "", targetDate: "" }]
  )

  const addObjective = () => {
    setObjectives([...objectives, { title: "", description: "", targetDate: "" }])
  }

  const removeObjective = (index: number) => {
    setObjectives(objectives.filter((_, i) => i !== index))
  }

  const updateObjective = (index: number, field: keyof Objective, value: string) => {
    const updated = [...objectives]
    updated[index][field] = value
    setObjectives(updated)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    const formData = new FormData(e.currentTarget)
    formData.set("objectives", JSON.stringify(objectives.filter(obj => obj.title)))

    startTransition(async () => {
      const result = mode === "create"
        ? await createLearningPlan(formData)
        : await updateLearningPlan(plan.id, formData)

      if (result.success) {
        toast({
          title: "Success",
          description: `Learning plan ${mode === "create" ? "created" : "updated"} successfully`,
        })
        router.push("/dashboard/learning-plans")
        router.refresh()
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      }
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">
            {mode === "create" ? "Create Learning Plan" : "Edit Learning Plan"}
          </h1>
          <p className="text-muted-foreground">
            {mode === "create" ? "Design an individual learning plan for a student" : "Update learning plan details"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isPending}
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Plan
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList>
          <TabsTrigger value="details">Plan Details</TabsTrigger>
          <TabsTrigger value="objectives">Learning Objectives</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Define the core details of this learning plan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mode === "create" && (
                <div className="space-y-2">
                  <Label htmlFor="studentId">Student *</Label>
                  <Select name="studentId" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.legalName} - {student.currentClass?.name || "No class"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="title">Plan Title *</Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={plan?.title}
                  required
                  placeholder="e.g., Q1 2025 Montessori Learning Plan"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={plan?.description || ""}
                  placeholder="Describe the focus areas and approach for this learning plan..."
                  rows={4}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    defaultValue={plan?.startDate ? new Date(plan.startDate).toISOString().split("T")[0] : ""}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date (Optional)</Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="date"
                    defaultValue={plan?.endDate ? new Date(plan.endDate).toISOString().split("T")[0] : ""}
                  />
                </div>
              </div>

              {mode === "edit" && (
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select name="status" defaultValue={plan?.status || "ACTIVE"}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="ON_HOLD">On Hold</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="objectives">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Learning Objectives</CardTitle>
                  <CardDescription>Define specific goals and targets for this plan</CardDescription>
                </div>
                <Button type="button" onClick={addObjective} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Objective
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {objectives.map((objective, index) => (
                <Card key={index} className="border-2">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <h4 className="font-semibold">Objective {index + 1}</h4>
                      {objectives.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeObjective(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Objective Title *</Label>
                      <Input
                        value={objective.title}
                        onChange={(e) => updateObjective(index, "title", e.target.value)}
                        placeholder="e.g., Master practical life skills"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={objective.description}
                        onChange={(e) => updateObjective(index, "description", e.target.value)}
                        placeholder="Describe what success looks like for this objective..."
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Target Date</Label>
                      <Input
                        type="date"
                        value={objective.targetDate}
                        onChange={(e) => updateObjective(index, "targetDate", e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}

              {objectives.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="mb-4">No objectives added yet</p>
                  <Button type="button" onClick={addObjective} variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Objective
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </form>
  )
}
