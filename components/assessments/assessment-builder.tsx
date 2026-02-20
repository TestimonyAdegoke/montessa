"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { createAssessment, updateAssessment } from "@/lib/actions/assessments"
import { Loader2, Save, X, Plus, Trash2, GripVertical } from "lucide-react"

interface Question {
  type: "MCQ" | "SHORT_ANSWER" | "ESSAY"
  question: string
  marks: number
  options?: string[]
  correctAnswer?: string
}

interface AssessmentBuilderProps {
  assessment?: any
  classes: any[]
  mode: "create" | "edit"
}

export default function AssessmentBuilder({ assessment, classes, mode }: AssessmentBuilderProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [questions, setQuestions] = useState<Question[]>(assessment?.questions || [])

  const addQuestion = (type: Question["type"]) => {
    setQuestions([
      ...questions,
      {
        type,
        question: "",
        marks: 1,
        options: type === "MCQ" ? ["", "", "", ""] : undefined,
        correctAnswer: undefined,
      },
    ])
  }

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const updated = [...questions]
    updated[index] = { ...updated[index], [field]: value }
    setQuestions(updated)
  }

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    const updated = [...questions]
    if (updated[qIndex].options) {
      updated[qIndex].options![oIndex] = value
    }
    setQuestions(updated)
  }

  const calculateTotalMarks = () => {
    return questions.reduce((sum, q) => sum + q.marks, 0)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    const formData = new FormData(e.currentTarget)
    formData.set("questions", JSON.stringify(questions))
    formData.set("totalMarks", calculateTotalMarks().toString())

    startTransition(async () => {
      const result = mode === "create"
        ? await createAssessment(formData)
        : await updateAssessment(assessment.id, formData)

      if (result.success) {
        toast({
          title: "Success",
          description: `Assessment ${mode === "create" ? "created" : "updated"} successfully`,
        })
        router.push("/dashboard/assessments")
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
            {mode === "create" ? "Create Assessment" : "Edit Assessment"}
          </h1>
          <p className="text-muted-foreground">Build tests, quizzes, and exams</p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isPending}>
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
                Save Assessment
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="questions">Questions ({questions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Assessment Details</CardTitle>
              <CardDescription>Basic information about the assessment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input id="title" name="title" defaultValue={assessment?.title} required placeholder="e.g., Math Quiz - Week 1" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Type *</Label>
                  <Select name="type" defaultValue={assessment?.type || "QUIZ"} required>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="QUIZ">Quiz</SelectItem>
                      <SelectItem value="TEST">Test</SelectItem>
                      <SelectItem value="EXAM">Exam</SelectItem>
                      <SelectItem value="ASSIGNMENT">Assignment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" defaultValue={assessment?.description || ""} placeholder="Instructions for students..." rows={3} />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input id="subject" name="subject" defaultValue={assessment?.subject} required placeholder="e.g., Mathematics" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes) *</Label>
                  <Input id="duration" name="duration" type="number" defaultValue={assessment?.duration || 60} required min="1" />
                </div>

                <div className="space-y-2">
                  <Label>Total Marks</Label>
                  <Input value={calculateTotalMarks()} disabled className="bg-muted" />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="classId">Assign to Class *</Label>
                  <Select name="classId" defaultValue={assessment?.classId} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name} ({cls._count.enrollments} students)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scheduledFor">Schedule For</Label>
                  <Input id="scheduledFor" name="scheduledFor" type="datetime-local" defaultValue={assessment?.scheduledFor ? new Date(assessment.scheduledFor).toISOString().slice(0, 16) : ""} />
                </div>
              </div>

              {mode === "edit" && (
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select name="status" defaultValue={assessment?.status || "DRAFT"}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="PUBLISHED">Published</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questions">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Questions</CardTitle>
                  <CardDescription>Add questions to your assessment</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button type="button" onClick={() => addQuestion("MCQ")} size="sm" variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    MCQ
                  </Button>
                  <Button type="button" onClick={() => addQuestion("SHORT_ANSWER")} size="sm" variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Short Answer
                  </Button>
                  <Button type="button" onClick={() => addQuestion("ESSAY")} size="sm" variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Essay
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {questions.map((question, qIndex) => (
                <Card key={qIndex} className="border-2">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                        <h4 className="font-semibold">Question {qIndex + 1}</h4>
                        <span className="text-xs text-muted-foreground">({question.type.replace("_", " ")})</span>
                      </div>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeQuestion(qIndex)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label>Question Text *</Label>
                      <Textarea
                        value={question.question}
                        onChange={(e) => updateQuestion(qIndex, "question", e.target.value)}
                        placeholder="Enter your question..."
                        rows={2}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Marks *</Label>
                      <Input
                        type="number"
                        value={question.marks}
                        onChange={(e) => updateQuestion(qIndex, "marks", parseInt(e.target.value) || 1)}
                        min="1"
                        className="w-32"
                        required
                      />
                    </div>

                    {question.type === "MCQ" && (
                      <div className="space-y-4">
                        <Label>Options</Label>
                        {question.options?.map((option, oIndex) => (
                          <div key={oIndex} className="flex gap-2">
                            <Input
                              value={option}
                              onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                              placeholder={`Option ${oIndex + 1}`}
                            />
                          </div>
                        ))}
                        <div className="space-y-2">
                          <Label>Correct Answer</Label>
                          <Select
                            value={question.correctAnswer}
                            onValueChange={(value) => updateQuestion(qIndex, "correctAnswer", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select correct answer" />
                            </SelectTrigger>
                            <SelectContent>
                              {question.options?.map((option, oIndex) => (
                                <SelectItem key={oIndex} value={oIndex.toString()}>
                                  Option {oIndex + 1}: {option || "(empty)"}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {questions.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="mb-4">No questions added yet</p>
                  <div className="flex gap-2 justify-center">
                    <Button type="button" onClick={() => addQuestion("MCQ")} variant="outline">
                      Add MCQ
                    </Button>
                    <Button type="button" onClick={() => addQuestion("SHORT_ANSWER")} variant="outline">
                      Add Short Answer
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </form>
  )
}
