"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ArrowLeft,
  Inbox,
  Search,
  Trash2,
  Eye,
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
  UserCheck,
  CalendarCheck,
  FileText,
  Filter,
} from "lucide-react"
import { updateSubmissionStatus, deleteSubmission } from "@/lib/actions/website-builder-forms"

interface SubmissionData {
  id: string
  formId: string
  data: any
  files: any
  status: string
  notes: string | null
  ipAddress: string | null
  createdAt: string
  form: { name: string; slug: string }
}

interface FormData {
  id: string
  name: string
  slug: string
}

interface Props {
  submissions: SubmissionData[]
  forms: FormData[]
  initialFormId: string | null
}

const STATUS_OPTIONS = [
  { value: "ALL", label: "All Statuses", icon: Filter },
  { value: "NEW", label: "New", icon: Inbox },
  { value: "CONTACTED", label: "Contacted", icon: MessageSquare },
  { value: "SCHEDULED", label: "Scheduled", icon: CalendarCheck },
  { value: "APPLIED", label: "Applied", icon: FileText },
  { value: "ENROLLED", label: "Enrolled", icon: CheckCircle2 },
  { value: "REJECTED", label: "Rejected", icon: XCircle },
  { value: "ARCHIVED", label: "Archived", icon: Clock },
]

const STATUS_COLORS: Record<string, string> = {
  NEW: "bg-blue-500/10 text-blue-700 border-blue-200",
  CONTACTED: "bg-amber-500/10 text-amber-700 border-amber-200",
  SCHEDULED: "bg-purple-500/10 text-purple-700 border-purple-200",
  APPLIED: "bg-indigo-500/10 text-indigo-700 border-indigo-200",
  ENROLLED: "bg-green-500/10 text-green-700 border-green-200",
  REJECTED: "bg-red-500/10 text-red-700 border-red-200",
  ARCHIVED: "bg-gray-500/10 text-gray-500 border-gray-200",
}

export default function SubmissionsClient({ submissions, forms, initialFormId }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [formFilter, setFormFilter] = useState(initialFormId || "ALL")

  // Detail dialog
  const [detailSub, setDetailSub] = useState<SubmissionData | null>(null)
  const [newStatus, setNewStatus] = useState("")
  const [notes, setNotes] = useState("")

  const filtered = submissions.filter((s) => {
    if (formFilter !== "ALL" && s.formId !== formFilter) return false
    if (statusFilter !== "ALL" && s.status !== statusFilter) return false
    if (search) {
      const q = search.toLowerCase()
      const dataStr = typeof s.data === "string" ? s.data : JSON.stringify(s.data)
      if (!dataStr.toLowerCase().includes(q) && !s.form.name.toLowerCase().includes(q)) return false
    }
    return true
  })

  // Pipeline counts
  const counts: Record<string, number> = {}
  for (const s of submissions) {
    counts[s.status] = (counts[s.status] || 0) + 1
  }

  function openDetail(sub: SubmissionData) {
    setDetailSub(sub)
    setNewStatus(sub.status)
    setNotes(sub.notes || "")
    setError("")
  }

  function handleStatusUpdate() {
    if (!detailSub) return
    startTransition(async () => {
      try {
        await updateSubmissionStatus(detailSub.id, newStatus, notes || undefined)
        setDetailSub(null)
        router.refresh()
      } catch (e: any) {
        setError(e.message)
      }
    })
  }

  const subData = (sub: SubmissionData) => {
    try {
      return typeof sub.data === "string" ? JSON.parse(sub.data) : sub.data
    } catch {
      return sub.data
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Inbox className="h-6 w-6 text-primary" />
            Submissions
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            CRM pipeline for form submissions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/website-builder/forms"><ArrowLeft className="h-4 w-4 mr-1" /> Forms</Link>
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}

      {/* Pipeline Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {STATUS_OPTIONS.filter((s) => s.value !== "ALL").map((s) => {
          const Icon = s.icon
          return (
            <button
              key={s.value}
              className={`p-3 rounded-lg border text-center transition-all hover:shadow-sm ${statusFilter === s.value ? "ring-2 ring-primary" : ""}`}
              onClick={() => setStatusFilter(statusFilter === s.value ? "ALL" : s.value)}
            >
              <Icon className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-lg font-bold">{counts[s.value] || 0}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </button>
          )
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search submissions..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={formFilter} onValueChange={setFormFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Forms" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Forms</SelectItem>
            {forms.map((f) => (
              <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Submissions List */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Inbox className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
            <p className="font-medium">No submissions found</p>
            <p className="text-sm text-muted-foreground mt-1">
              {submissions.length === 0 ? "Submissions will appear here when visitors fill out your forms" : "Try adjusting your filters"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {filtered.map((sub) => {
                const data = subData(sub)
                const preview = typeof data === "object" && data !== null
                  ? Object.entries(data).slice(0, 3).map(([k, v]) => `${k}: ${v}`).join(" • ")
                  : String(data)

                return (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => openDetail(sub)}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <Badge variant="outline" className={`text-[10px] ${STATUS_COLORS[sub.status] || ""}`}>
                          {sub.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{sub.form.name}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">{new Date(sub.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm truncate text-muted-foreground">{preview}</p>
                    </div>
                    <div className="flex items-center gap-1 ml-4">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); openDetail(sub) }}>
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost" size="icon" className="h-8 w-8 text-destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (!confirm("Delete this submission?")) return
                          startTransition(async () => {
                            try { await deleteSubmission(sub.id); router.refresh() } catch (e: any) { setError(e.message) }
                          })
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!detailSub} onOpenChange={() => setDetailSub(null)}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              Submission Details
            </DialogTitle>
            <DialogDescription>
              {detailSub?.form.name} • {detailSub ? new Date(detailSub.createdAt).toLocaleString() : ""}
            </DialogDescription>
          </DialogHeader>
          {detailSub && (
            <div className="space-y-4">
              {/* Data */}
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Form Data</Label>
                <div className="border rounded-lg divide-y">
                  {Object.entries(subData(detailSub)).map(([key, value]) => (
                    <div key={key} className="flex justify-between px-3 py-2">
                      <span className="text-xs font-medium text-muted-foreground">{key}</span>
                      <span className="text-xs text-right max-w-[60%] break-words">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Update */}
              <div className="space-y-2">
                <Label className="text-xs">Update Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.filter((s) => s.value !== "ALL").map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Notes</Label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-md border bg-background resize-y min-h-[60px]"
                  placeholder="Add notes about this submission..."
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailSub(null)}>Close</Button>
            <Button onClick={handleStatusUpdate} disabled={isPending}>
              {isPending ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
