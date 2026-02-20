"use client"

import { useState, useTransition } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
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
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle,
  Clock,
  SkipForward,
  Plus,
  Layers,
  Target,
  Loader2,
  ExternalLink,
} from "lucide-react"
import { createCurriculumMap, addCurriculumUnit, addCurriculumTopic, updateTopicStatus } from "@/lib/actions/curriculum"
import { useToast } from "@/components/ui/use-toast"

interface Topic {
  id: string
  title: string
  description: string | null
  orderIndex: number
  content: string | null
  resources: string[]
  activities: string[]
  assessmentCriteria: string[]
  estimatedHours: number | null
  status: string
}

interface Unit {
  id: string
  title: string
  description: string | null
  orderIndex: number
  estimatedWeeks: number | null
  learningOutcomes: string[]
  topics: Topic[]
}

interface CurriculumMapData {
  id: string
  title: string
  subject: string
  grade: string
  academicYear: string
  description: string | null
  board: string | null
  status: string
  totalTopics: number
  completedTopics: number
  progressPercent: number
  units: Unit[]
}

const statusIcons: Record<string, any> = {
  NOT_STARTED: Circle,
  IN_PROGRESS: Clock,
  COMPLETED: CheckCircle2,
  SKIPPED: SkipForward,
}

const statusColors: Record<string, string> = {
  NOT_STARTED: "text-muted-foreground",
  IN_PROGRESS: "text-blue-500",
  COMPLETED: "text-green-500",
  SKIPPED: "text-amber-500",
}

export function CurriculumClient({
  initialMaps,
  canEdit,
  userRole,
}: {
  initialMaps: CurriculumMapData[]
  canEdit: boolean
  userRole: string
}) {
  const { toast } = useToast()
  const [maps, setMaps] = useState(initialMaps)
  const [expandedMaps, setExpandedMaps] = useState<Set<string>>(new Set(initialMaps.length > 0 ? [initialMaps[0].id] : []))
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set())
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  const [isPending, startTransition] = useTransition()

  // New curriculum form
  const [showNewForm, setShowNewForm] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newSubject, setNewSubject] = useState("")
  const [newGrade, setNewGrade] = useState("")
  const [newYear, setNewYear] = useState(new Date().getFullYear().toString())
  const [newBoard, setNewBoard] = useState("")
  const [newDesc, setNewDesc] = useState("")

  // New unit form
  const [addingUnitTo, setAddingUnitTo] = useState<string | null>(null)
  const [newUnitTitle, setNewUnitTitle] = useState("")

  // New topic form
  const [addingTopicTo, setAddingTopicTo] = useState<string | null>(null)
  const [newTopicTitle, setNewTopicTitle] = useState("")

  const toggleMap = (id: string) => {
    const next = new Set(expandedMaps)
    if (next.has(id)) next.delete(id); else next.add(id)
    setExpandedMaps(next)
  }

  const toggleUnit = (id: string) => {
    const next = new Set(expandedUnits)
    if (next.has(id)) next.delete(id); else next.add(id)
    setExpandedUnits(next)
  }

  const handleCreateMap = () => {
    if (!newTitle || !newSubject || !newGrade) return
    startTransition(async () => {
      try {
        await createCurriculumMap({
          title: newTitle, subject: newSubject, grade: newGrade,
          academicYear: newYear, board: newBoard || undefined, description: newDesc || undefined,
        })
        toast({ title: "Created!", description: "Curriculum map created." })
        setShowNewForm(false)
        setNewTitle(""); setNewSubject(""); setNewGrade(""); setNewDesc("")
      } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }) }
    })
  }

  const handleAddUnit = (curriculumId: string) => {
    if (!newUnitTitle) return
    startTransition(async () => {
      try {
        await addCurriculumUnit(curriculumId, { title: newUnitTitle })
        toast({ title: "Unit added!" })
        setAddingUnitTo(null); setNewUnitTitle("")
      } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }) }
    })
  }

  const handleAddTopic = (unitId: string) => {
    if (!newTopicTitle) return
    startTransition(async () => {
      try {
        await addCurriculumTopic(unitId, { title: newTopicTitle })
        toast({ title: "Topic added!" })
        setAddingTopicTo(null); setNewTopicTitle("")
      } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }) }
    })
  }

  const handleTopicStatus = (topicId: string, status: string) => {
    startTransition(async () => {
      try {
        await updateTopicStatus(topicId, status)
        toast({ title: "Status updated!" })
      } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }) }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Curriculum & Syllabus</h1>
          <p className="text-muted-foreground">Interactive curriculum maps with progress tracking</p>
        </div>
        {canEdit && (
          <Button onClick={() => setShowNewForm(true)}>
            <Plus className="h-4 w-4 mr-2" /> New Curriculum
          </Button>
        )}
      </div>

      {/* New Curriculum Dialog */}
      <Dialog open={showNewForm} onOpenChange={setShowNewForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Curriculum Map</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Title</Label><Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="e.g. Mathematics Grade 5" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Subject</Label><Input value={newSubject} onChange={(e) => setNewSubject(e.target.value)} placeholder="Mathematics" /></div>
              <div><Label>Grade</Label><Input value={newGrade} onChange={(e) => setNewGrade(e.target.value)} placeholder="Grade 5" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Academic Year</Label><Input value={newYear} onChange={(e) => setNewYear(e.target.value)} /></div>
              <div><Label>Board/Framework</Label><Input value={newBoard} onChange={(e) => setNewBoard(e.target.value)} placeholder="e.g. Common Core, IB, Montessori" /></div>
            </div>
            <div><Label>Description</Label><Textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} rows={2} /></div>
            <Button onClick={handleCreateMap} disabled={isPending || !newTitle || !newSubject || !newGrade} className="w-full">
              {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Create
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Curriculum Maps */}
      {maps.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-1">No curriculum maps yet</h3>
            <p className="text-sm text-muted-foreground">Create your first curriculum map to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {maps.map((map) => (
            <Card key={map.id}>
              <CardHeader className="cursor-pointer" onClick={() => toggleMap(map.id)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {expandedMaps.has(map.id) ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                    <div>
                      <CardTitle className="text-lg">{map.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{map.subject}</Badge>
                        <Badge variant="outline">{map.grade}</Badge>
                        <Badge variant="outline">{map.academicYear}</Badge>
                        {map.board && <Badge variant="secondary">{map.board}</Badge>}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <div className="text-sm">
                      <span className="font-semibold">{map.progressPercent}%</span>
                      <span className="text-muted-foreground ml-1">complete</span>
                    </div>
                    <Progress value={map.progressPercent} className="w-24 h-2" />
                  </div>
                </div>
              </CardHeader>

              {expandedMaps.has(map.id) && (
                <CardContent className="pt-0">
                  {map.description && <p className="text-sm text-muted-foreground mb-4">{map.description}</p>}

                  <div className="space-y-3">
                    {map.units.map((unit) => {
                      const unitCompleted = unit.topics.filter((t) => t.status === "COMPLETED").length
                      const unitTotal = unit.topics.length

                      return (
                        <div key={unit.id} className="border rounded-lg">
                          <div
                            className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50"
                            onClick={() => toggleUnit(unit.id)}
                          >
                            <div className="flex items-center gap-2">
                              {expandedUnits.has(unit.id) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                              <Layers className="h-4 w-4 text-primary" />
                              <span className="font-medium text-sm">Unit {unit.orderIndex + 1}: {unit.title}</span>
                              {unit.estimatedWeeks && (
                                <Badge variant="outline" className="text-[10px]">{unit.estimatedWeeks}w</Badge>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">{unitCompleted}/{unitTotal} topics</span>
                          </div>

                          {expandedUnits.has(unit.id) && (
                            <div className="px-3 pb-3 space-y-1">
                              {unit.learningOutcomes.length > 0 && (
                                <div className="mb-2 pl-6">
                                  <span className="text-xs font-semibold text-muted-foreground">Learning Outcomes:</span>
                                  <ul className="text-xs text-muted-foreground list-disc pl-4 mt-1">
                                    {unit.learningOutcomes.map((lo, i) => <li key={i}>{lo}</li>)}
                                  </ul>
                                </div>
                              )}

                              {unit.topics.map((topic) => {
                                const StatusIcon = statusIcons[topic.status] || Circle
                                const colorClass = statusColors[topic.status] || ""

                                return (
                                  <div key={topic.id} className="flex items-center justify-between pl-6 py-1.5 hover:bg-muted/30 rounded">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                      <StatusIcon className={`h-4 w-4 shrink-0 ${colorClass}`} />
                                      <button
                                        className="text-sm text-left truncate hover:underline"
                                        onClick={() => setSelectedTopic(topic)}
                                      >
                                        {topic.title}
                                      </button>
                                      {topic.estimatedHours && (
                                        <span className="text-[10px] text-muted-foreground">{topic.estimatedHours}h</span>
                                      )}
                                    </div>
                                    {canEdit && (
                                      <Select value={topic.status} onValueChange={(v) => handleTopicStatus(topic.id, v)}>
                                        <SelectTrigger className="h-7 w-32 text-xs"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="NOT_STARTED">Not Started</SelectItem>
                                          <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                          <SelectItem value="COMPLETED">Completed</SelectItem>
                                          <SelectItem value="SKIPPED">Skipped</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    )}
                                  </div>
                                )
                              })}

                              {canEdit && (
                                <div className="pl-6 pt-2">
                                  {addingTopicTo === unit.id ? (
                                    <div className="flex gap-2">
                                      <Input value={newTopicTitle} onChange={(e) => setNewTopicTitle(e.target.value)} placeholder="Topic title" className="h-8 text-sm" />
                                      <Button size="sm" className="h-8" onClick={() => handleAddTopic(unit.id)} disabled={isPending}>Add</Button>
                                      <Button size="sm" variant="ghost" className="h-8" onClick={() => setAddingTopicTo(null)}>Cancel</Button>
                                    </div>
                                  ) : (
                                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setAddingTopicTo(unit.id)}>
                                      <Plus className="h-3 w-3 mr-1" /> Add Topic
                                    </Button>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}

                    {canEdit && (
                      <div className="pt-2">
                        {addingUnitTo === map.id ? (
                          <div className="flex gap-2">
                            <Input value={newUnitTitle} onChange={(e) => setNewUnitTitle(e.target.value)} placeholder="Unit title" className="h-9" />
                            <Button size="sm" onClick={() => handleAddUnit(map.id)} disabled={isPending}>Add Unit</Button>
                            <Button size="sm" variant="ghost" onClick={() => setAddingUnitTo(null)}>Cancel</Button>
                          </div>
                        ) : (
                          <Button variant="outline" size="sm" onClick={() => setAddingUnitTo(map.id)}>
                            <Plus className="h-3.5 w-3.5 mr-1" /> Add Unit
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Topic Detail Dialog */}
      <Dialog open={!!selectedTopic} onOpenChange={() => setSelectedTopic(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{selectedTopic?.title}</DialogTitle></DialogHeader>
          {selectedTopic && (
            <div className="space-y-4">
              {selectedTopic.description && <p className="text-sm">{selectedTopic.description}</p>}
              {selectedTopic.content && (
                <div><Label className="text-xs text-muted-foreground">Content</Label><p className="text-sm mt-1">{selectedTopic.content}</p></div>
              )}
              {selectedTopic.resources.length > 0 && (
                <div>
                  <Label className="text-xs text-muted-foreground">Resources</Label>
                  <ul className="mt-1 space-y-1">
                    {selectedTopic.resources.map((r, i) => (
                      <li key={i} className="text-sm flex items-center gap-1">
                        <ExternalLink className="h-3 w-3" />
                        <a href={r} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">{r}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {selectedTopic.activities.length > 0 && (
                <div>
                  <Label className="text-xs text-muted-foreground">Suggested Activities</Label>
                  <ul className="mt-1 list-disc pl-4 text-sm space-y-0.5">
                    {selectedTopic.activities.map((a, i) => <li key={i}>{a}</li>)}
                  </ul>
                </div>
              )}
              {selectedTopic.assessmentCriteria.length > 0 && (
                <div>
                  <Label className="text-xs text-muted-foreground">Assessment Criteria</Label>
                  <ul className="mt-1 list-disc pl-4 text-sm space-y-0.5">
                    {selectedTopic.assessmentCriteria.map((c, i) => <li key={i}>{c}</li>)}
                  </ul>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Badge className={statusColors[selectedTopic.status]}>{selectedTopic.status.replace(/_/g, " ")}</Badge>
                {selectedTopic.estimatedHours && <span className="text-sm text-muted-foreground">{selectedTopic.estimatedHours} hours</span>}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
