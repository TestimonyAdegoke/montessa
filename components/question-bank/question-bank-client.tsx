"use client"

import { useState, useTransition } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { HelpCircle, Plus, Loader2, Trash2, Search, Filter, Eye } from "lucide-react"
import { createQuestionBankItem, deleteQuestionBankItem } from "@/lib/actions/question-bank"
import { useToast } from "@/components/ui/use-toast"

interface QuestionItem {
  id: string
  subject: string
  grade: string | null
  topic: string | null
  difficulty: string
  questionType: string
  questionText: string
  options: any[] | null
  correctAnswer: string | null
  explanation: string | null
  marks: number
  tags: string[]
  timesUsed: number
  createdAt: string
}

const difficultyColors: Record<string, string> = {
  EASY: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  MEDIUM: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  HARD: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  EXPERT: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
}

const typeLabels: Record<string, string> = {
  MCQ: "Multiple Choice",
  TRUE_FALSE: "True/False",
  SHORT_ANSWER: "Short Answer",
  LONG_ANSWER: "Long Answer",
  FILL_IN_BLANK: "Fill in Blank",
  MATCHING: "Matching",
}

export function QuestionBankClient({
  initialItems,
  subjects,
}: {
  initialItems: QuestionItem[]
  subjects: string[]
}) {
  const { toast } = useToast()
  const [items, setItems] = useState(initialItems)
  const [isPending, startTransition] = useTransition()
  const [showCreate, setShowCreate] = useState(false)
  const [viewItem, setViewItem] = useState<QuestionItem | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterSubject, setFilterSubject] = useState("all")
  const [filterDifficulty, setFilterDifficulty] = useState("all")
  const [filterType, setFilterType] = useState("all")

  // New question form
  const [newSubject, setNewSubject] = useState("")
  const [newGrade, setNewGrade] = useState("")
  const [newTopic, setNewTopic] = useState("")
  const [newDifficulty, setNewDifficulty] = useState("MEDIUM")
  const [newType, setNewType] = useState("MCQ")
  const [newText, setNewText] = useState("")
  const [newCorrectAnswer, setNewCorrectAnswer] = useState("")
  const [newExplanation, setNewExplanation] = useState("")
  const [newMarks, setNewMarks] = useState("1")
  const [newOptions, setNewOptions] = useState([
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ])

  const filtered = items.filter((item) => {
    if (searchQuery && !item.questionText.toLowerCase().includes(searchQuery.toLowerCase())) return false
    if (filterSubject !== "all" && item.subject !== filterSubject) return false
    if (filterDifficulty !== "all" && item.difficulty !== filterDifficulty) return false
    if (filterType !== "all" && item.questionType !== filterType) return false
    return true
  })

  const handleCreate = () => {
    if (!newSubject || !newText) return
    startTransition(async () => {
      try {
        const options = newType === "MCQ" ? newOptions.filter((o) => o.text.trim()) : undefined
        await createQuestionBankItem({
          subject: newSubject,
          grade: newGrade || undefined,
          topic: newTopic || undefined,
          difficulty: newDifficulty,
          questionType: newType,
          questionText: newText,
          options,
          correctAnswer: newCorrectAnswer || undefined,
          explanation: newExplanation || undefined,
          marks: parseInt(newMarks) || 1,
        })
        toast({ title: "Created!", description: "Question added to the bank." })
        setShowCreate(false)
        resetForm()
      } catch (e: any) {
        toast({ title: "Error", description: e.message, variant: "destructive" })
      }
    })
  }

  const handleDelete = (id: string) => {
    if (!confirm("Delete this question?")) return
    startTransition(async () => {
      try {
        await deleteQuestionBankItem(id)
        setItems(items.filter((i) => i.id !== id))
        toast({ title: "Deleted" })
      } catch (e: any) {
        toast({ title: "Error", description: e.message, variant: "destructive" })
      }
    })
  }

  const resetForm = () => {
    setNewSubject(""); setNewGrade(""); setNewTopic(""); setNewDifficulty("MEDIUM")
    setNewType("MCQ"); setNewText(""); setNewCorrectAnswer(""); setNewExplanation("")
    setNewMarks("1"); setNewOptions([{ text: "", isCorrect: false }, { text: "", isCorrect: false }, { text: "", isCorrect: false }, { text: "", isCorrect: false }])
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Question Bank</h1>
          <p className="text-muted-foreground">{items.length} questions across {subjects.length} subjects</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add Question
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search questions..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterSubject} onValueChange={setFilterSubject}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Subject" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {subjects.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
          <SelectTrigger className="w-[130px]"><SelectValue placeholder="Difficulty" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="EASY">Easy</SelectItem>
            <SelectItem value="MEDIUM">Medium</SelectItem>
            <SelectItem value="HARD">Hard</SelectItem>
            <SelectItem value="EXPERT">Expert</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="MCQ">MCQ</SelectItem>
            <SelectItem value="TRUE_FALSE">True/False</SelectItem>
            <SelectItem value="SHORT_ANSWER">Short Answer</SelectItem>
            <SelectItem value="LONG_ANSWER">Long Answer</SelectItem>
            <SelectItem value="FILL_IN_BLANK">Fill in Blank</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Add Question</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Subject *</Label><Input value={newSubject} onChange={(e) => setNewSubject(e.target.value)} placeholder="Mathematics" /></div>
              <div><Label>Grade</Label><Input value={newGrade} onChange={(e) => setNewGrade(e.target.value)} placeholder="Grade 5" /></div>
            </div>
            <div><Label>Topic</Label><Input value={newTopic} onChange={(e) => setNewTopic(e.target.value)} placeholder="Fractions" /></div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Type</Label>
                <Select value={newType} onValueChange={setNewType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MCQ">MCQ</SelectItem>
                    <SelectItem value="TRUE_FALSE">True/False</SelectItem>
                    <SelectItem value="SHORT_ANSWER">Short Answer</SelectItem>
                    <SelectItem value="LONG_ANSWER">Long Answer</SelectItem>
                    <SelectItem value="FILL_IN_BLANK">Fill in Blank</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Difficulty</Label>
                <Select value={newDifficulty} onValueChange={setNewDifficulty}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EASY">Easy</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HARD">Hard</SelectItem>
                    <SelectItem value="EXPERT">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Marks</Label><Input type="number" value={newMarks} onChange={(e) => setNewMarks(e.target.value)} min={1} /></div>
            </div>
            <div><Label>Question *</Label><Textarea value={newText} onChange={(e) => setNewText(e.target.value)} rows={3} placeholder="Enter the question text..." /></div>

            {newType === "MCQ" && (
              <div>
                <Label>Options</Label>
                <div className="space-y-2 mt-1">
                  {newOptions.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correct"
                        checked={opt.isCorrect}
                        onChange={() => setNewOptions(newOptions.map((o, j) => ({ ...o, isCorrect: j === i })))}
                        className="h-4 w-4"
                      />
                      <Input
                        value={opt.text}
                        onChange={(e) => {
                          const updated = [...newOptions]
                          updated[i] = { ...updated[i], text: e.target.value }
                          setNewOptions(updated)
                        }}
                        placeholder={`Option ${String.fromCharCode(65 + i)}`}
                        className="flex-1"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {newType !== "MCQ" && (
              <div><Label>Correct Answer</Label><Input value={newCorrectAnswer} onChange={(e) => setNewCorrectAnswer(e.target.value)} /></div>
            )}

            <div><Label>Explanation</Label><Textarea value={newExplanation} onChange={(e) => setNewExplanation(e.target.value)} rows={2} placeholder="Explain the answer..." /></div>

            <Button onClick={handleCreate} disabled={isPending || !newSubject || !newText} className="w-full">
              {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Add to Bank
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={!!viewItem} onOpenChange={() => setViewItem(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Question Details</DialogTitle></DialogHeader>
          {viewItem && (
            <div className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline">{viewItem.subject}</Badge>
                {viewItem.grade && <Badge variant="outline">{viewItem.grade}</Badge>}
                {viewItem.topic && <Badge variant="outline">{viewItem.topic}</Badge>}
                <Badge className={difficultyColors[viewItem.difficulty]}>{viewItem.difficulty}</Badge>
                <Badge variant="secondary">{typeLabels[viewItem.questionType] || viewItem.questionType}</Badge>
                <Badge variant="outline">{viewItem.marks} mark{viewItem.marks !== 1 ? "s" : ""}</Badge>
              </div>
              <p className="text-sm font-medium">{viewItem.questionText}</p>
              {viewItem.options && viewItem.options.length > 0 && (
                <div className="space-y-1">
                  {viewItem.options.map((opt: any, i: number) => (
                    <div key={i} className={`text-sm px-3 py-1.5 rounded ${opt.isCorrect ? "bg-green-50 dark:bg-green-950/30 font-medium" : "bg-muted/50"}`}>
                      {String.fromCharCode(65 + i)}. {opt.text} {opt.isCorrect && <Badge variant="success" className="ml-2 text-[10px]">Correct</Badge>}
                    </div>
                  ))}
                </div>
              )}
              {viewItem.correctAnswer && <p className="text-sm"><strong>Answer:</strong> {viewItem.correctAnswer}</p>}
              {viewItem.explanation && (
                <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3">
                  <p className="text-sm"><strong>Explanation:</strong> {viewItem.explanation}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Questions List */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-1">No questions found</h3>
            <p className="text-sm text-muted-foreground">
              {items.length === 0 ? "Add your first question to get started." : "Try adjusting your filters."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => (
            <Card key={item.id} className="hover:bg-muted/30 transition-colors">
              <CardContent className="py-4 px-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-2">{item.questionText}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge variant="outline" className="text-[10px]">{item.subject}</Badge>
                      <Badge className={`text-[10px] ${difficultyColors[item.difficulty]}`}>{item.difficulty}</Badge>
                      <Badge variant="secondary" className="text-[10px]">{typeLabels[item.questionType] || item.questionType}</Badge>
                      <span className="text-[10px] text-muted-foreground">{item.marks} mark{item.marks !== 1 ? "s" : ""}</span>
                      {item.timesUsed > 0 && <span className="text-[10px] text-muted-foreground">Used {item.timesUsed}x</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewItem(item)}>
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
