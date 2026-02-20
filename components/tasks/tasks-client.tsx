"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle2, Circle, Clock, Plus, Trash2, ListTodo } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { createTask, updateTaskStatus, deleteTask } from "@/lib/actions/tasks"
import { useRouter } from "next/navigation"

const STATUSES = ["TODO", "IN_PROGRESS", "REVIEW", "DONE", "CANCELLED"]
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"]
const CATEGORIES = ["GENERAL", "ACADEMIC", "ADMINISTRATIVE", "MAINTENANCE", "EVENT", "COMMUNICATION", "FINANCE"]
const STATUS_ICONS: Record<string, any> = { TODO: Circle, IN_PROGRESS: Clock, REVIEW: Clock, DONE: CheckCircle2, CANCELLED: Circle }
const PRIORITY_COLORS: Record<string, string> = { LOW: "secondary", MEDIUM: "outline", HIGH: "default", URGENT: "destructive" }

interface Props { tasks: any[]; users: any[]; currentUserId: string }

export function TasksClient({ tasks, users, currentUserId }: Props) {
  const { toast } = useToast()
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState("ALL")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [assignedTo, setAssignedTo] = useState("")
  const [category, setCategory] = useState("GENERAL")
  const [priority, setPriority] = useState("MEDIUM")
  const [dueDate, setDueDate] = useState("")

  const filtered = filter === "ALL" ? tasks : filter === "MY" ? tasks.filter((t: any) => t.assignedTo === currentUserId) : tasks.filter((t: any) => t.status === filter)

  const handleCreate = async () => {
    if (!title || !assignedTo) return
    try {
      await createTask({ title, description, assignedTo, category, priority, dueDate: dueDate || undefined })
      toast({ title: "Task Created" })
      setShowForm(false)
      setTitle("")
      setDescription("")
      router.refresh()
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }) }
  }

  const handleStatus = async (id: string, status: string) => {
    try {
      await updateTaskStatus(id, status)
      toast({ title: `Task marked ${status.replace(/_/g, " ")}` })
      router.refresh()
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }) }
  }

  const handleDelete = async (id: string) => {
    try { await deleteTask(id); toast({ title: "Task Deleted" }); router.refresh() }
    catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }) }
  }

  const userMap: Record<string, string> = {}
  users.forEach((u: any) => { userMap[u.id] = u.name || u.email })

  const todo = tasks.filter((t: any) => t.status === "TODO").length
  const inProgress = tasks.filter((t: any) => t.status === "IN_PROGRESS").length
  const done = tasks.filter((t: any) => t.status === "DONE").length

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardDescription>To Do</CardDescription><CardTitle className="text-3xl">{todo}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>In Progress</CardDescription><CardTitle className="text-3xl">{inProgress}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Done</CardDescription><CardTitle className="text-3xl">{done}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Total</CardDescription><CardTitle className="text-3xl">{tasks.length}</CardTitle></CardHeader></Card>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Tasks</SelectItem>
            <SelectItem value="MY">My Tasks</SelectItem>
            {STATUSES.map(s => <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-2" />New Task</Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle className="text-base">Create Task</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div><Label>Title *</Label><Input value={title} onChange={e => setTitle(e.target.value)} /></div>
              <div><Label>Assign To *</Label><Select value={assignedTo} onValueChange={setAssignedTo}><SelectTrigger><SelectValue placeholder="Select user" /></SelectTrigger><SelectContent>{users.map((u: any) => <SelectItem key={u.id} value={u.id}>{u.name || u.email} ({u.role})</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Category</Label><Select value={category} onValueChange={setCategory}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Priority</Label><Select value={priority} onValueChange={setPriority}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Due Date</Label><Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} /></div>
            </div>
            <div><Label>Description</Label><Input value={description} onChange={e => setDescription(e.target.value)} /></div>
            <div className="flex gap-2"><Button onClick={handleCreate}>Create</Button><Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button></div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground"><ListTodo className="h-8 w-8 mx-auto mb-2 opacity-50" />No tasks found.</CardContent></Card>
        ) : filtered.map((t: any) => {
          const Icon = STATUS_ICONS[t.status] || Circle
          return (
            <Card key={t.id}>
              <CardContent className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon className={`h-5 w-5 ${t.status === "DONE" ? "text-green-500" : t.status === "IN_PROGRESS" ? "text-blue-500" : "text-muted-foreground"}`} />
                  <div>
                    <p className={`font-medium ${t.status === "DONE" ? "line-through text-muted-foreground" : ""}`}>{t.title}</p>
                    <p className="text-xs text-muted-foreground">{userMap[t.assignedTo] || "Unassigned"}{t.dueDate ? ` · Due ${new Date(t.dueDate).toLocaleDateString()}` : ""}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{t.category}</Badge>
                  <Badge variant={(PRIORITY_COLORS[t.priority] || "outline") as any}>{t.priority}</Badge>
                  <Select value={t.status} onValueChange={(v) => handleStatus(t.id, v)}>
                    <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
                  </Select>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
