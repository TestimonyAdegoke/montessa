"use client"

import { useState, useTransition } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { Plus, Loader2, CheckCircle2, Bell, Search, Heart } from "lucide-react"
import { createHealthIncident, resolveIncident, notifyParent } from "@/lib/actions/health"
import { useToast } from "@/components/ui/use-toast"

interface IncidentData {
  id: string
  studentId: string
  type: string
  description: string
  severity: string
  treatment: string | null
  medication: string | null
  parentNotified: boolean
  parentPickedUp: boolean
  reportedBy: string
  incidentTime: string
  resolvedAt: string | null
  notes: string | null
}

const severityColors: Record<string, string> = {
  MINOR: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  MODERATE: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  SEVERE: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  EMERGENCY: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
}

const typeLabels: Record<string, string> = {
  ILLNESS: "Illness",
  INJURY: "Injury",
  ALLERGY_REACTION: "Allergy",
  FEVER: "Fever",
  STOMACH: "Stomach",
  HEADACHE: "Headache",
  FALL: "Fall",
  CUT_WOUND: "Cut/Wound",
  OTHER: "Other",
}

export function HealthClient({
  incidents,
  students,
}: {
  incidents: IncidentData[]
  students: Array<{ id: string; name: string }>
}) {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [showCreate, setShowCreate] = useState(false)
  const [search, setSearch] = useState("")
  const [filterSeverity, setFilterSeverity] = useState("all")

  const [studentId, setStudentId] = useState("")
  const [type, setType] = useState("ILLNESS")
  const [description, setDescription] = useState("")
  const [severity, setSeverity] = useState("MINOR")
  const [treatment, setTreatment] = useState("")
  const [medication, setMedication] = useState("")
  const [notes, setNotes] = useState("")

  const filtered = incidents.filter((i) => {
    if (search && !i.description.toLowerCase().includes(search.toLowerCase())) return false
    if (filterSeverity !== "all" && i.severity !== filterSeverity) return false
    return true
  })

  const getStudentName = (id: string) => students.find((s) => s.id === id)?.name || "Unknown"

  const handleCreate = () => {
    if (!studentId || !description) return
    startTransition(async () => {
      try {
        await createHealthIncident({ studentId, type, description, severity, treatment: treatment || undefined, medication: medication || undefined, notes: notes || undefined })
        toast({ title: "Incident Logged", description: "Health incident has been recorded." })
        setShowCreate(false)
        setStudentId(""); setDescription(""); setTreatment(""); setMedication(""); setNotes("")
      } catch (e: any) {
        toast({ title: "Error", description: e.message, variant: "destructive" })
      }
    })
  }

  const handleResolve = (id: string) => {
    startTransition(async () => {
      try {
        await resolveIncident(id, {})
        toast({ title: "Resolved" })
      } catch (e: any) {
        toast({ title: "Error", description: e.message, variant: "destructive" })
      }
    })
  }

  const handleNotify = (id: string) => {
    startTransition(async () => {
      try {
        await notifyParent(id)
        toast({ title: "Parent Notified" })
      } catch (e: any) {
        toast({ title: "Error", description: e.message, variant: "destructive" })
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search incidents..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterSeverity} onValueChange={setFilterSeverity}>
          <SelectTrigger className="w-[130px]"><SelectValue placeholder="Severity" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="MINOR">Minor</SelectItem>
            <SelectItem value="MODERATE">Moderate</SelectItem>
            <SelectItem value="SEVERE">Severe</SelectItem>
            <SelectItem value="EMERGENCY">Emergency</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-2" /> Log Incident
        </Button>
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Log Health Incident</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Student *</Label>
              <Select value={studentId} onValueChange={setStudentId}>
                <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                <SelectContent>
                  {students.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(typeLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Severity</Label>
                <Select value={severity} onValueChange={setSeverity}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MINOR">Minor</SelectItem>
                    <SelectItem value="MODERATE">Moderate</SelectItem>
                    <SelectItem value="SEVERE">Severe</SelectItem>
                    <SelectItem value="EMERGENCY">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Description *</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Describe the incident..." /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Treatment</Label><Input value={treatment} onChange={(e) => setTreatment(e.target.value)} placeholder="First aid applied..." /></div>
              <div><Label>Medication</Label><Input value={medication} onChange={(e) => setMedication(e.target.value)} placeholder="Paracetamol, etc." /></div>
            </div>
            <div><Label>Notes</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} /></div>
            <Button onClick={handleCreate} disabled={isPending || !studentId || !description} className="w-full">
              {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Log Incident
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-1">No incidents</h3>
            <p className="text-sm text-muted-foreground">Health incidents will appear here when logged.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell className="font-medium">{getStudentName(i.studentId)}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{typeLabels[i.type] || i.type}</Badge></TableCell>
                    <TableCell className="max-w-[200px] truncate">{i.description}</TableCell>
                    <TableCell><Badge className={`text-xs ${severityColors[i.severity]}`}>{i.severity}</Badge></TableCell>
                    <TableCell className="text-sm">{new Date(i.incidentTime).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</TableCell>
                    <TableCell>
                      {i.resolvedAt ? (
                        <Badge variant="success" className="text-xs">Resolved</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">Open</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {!i.parentNotified && (
                          <Button variant="ghost" size="sm" onClick={() => handleNotify(i.id)} disabled={isPending} title="Notify Parent">
                            <Bell className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {!i.resolvedAt && (
                          <Button variant="ghost" size="sm" onClick={() => handleResolve(i.id)} disabled={isPending} title="Resolve">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
