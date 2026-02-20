"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  Search, Filter, Download, Trash2, Eye, CheckCircle2, XCircle,
  Clock, FileText, ChevronRight, BarChart3, Users, AlertCircle,
} from "lucide-react"
import {
  getSubmission, updateSubmissionStatus, deleteSubmission,
  approveSubmission, rejectSubmission, exportSubmissions,
  bulkDeleteSubmissions, bulkUpdateSubmissionStatus,
} from "@/lib/actions/form-builder-submissions"
import type { FBSubmissionData } from "@/lib/form-builder/types"

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  DRAFT: { label: "Draft", color: "bg-gray-100 text-gray-700", icon: FileText },
  SUBMITTED: { label: "Submitted", color: "bg-blue-100 text-blue-700", icon: Clock },
  UNDER_REVIEW: { label: "Under Review", color: "bg-amber-100 text-amber-700", icon: Eye },
  APPROVED: { label: "Approved", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  REJECTED: { label: "Rejected", color: "bg-red-100 text-red-700", icon: XCircle },
  ARCHIVED: { label: "Archived", color: "bg-gray-100 text-gray-500", icon: FileText },
}

interface Props {
  submissions: any[]
  forms: { id: string; name: string; slug: string; category: string }[]
  total: number
  analytics?: {
    totalForms: number; activeForms: number; totalSubmissions: number
    totalApproved: number; totalRejected: number; pendingApprovals: number; recentCount: number
  }
}

export default function SubmissionsClient({ submissions: initial, forms, total, analytics }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [submissions, setSubmissions] = useState(initial)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [formFilter, setFormFilter] = useState("ALL")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [detailSub, setDetailSub] = useState<any>(null)
  const [showDetail, setShowDetail] = useState(false)

  const filtered = submissions.filter((s: any) => {
    if (statusFilter !== "ALL" && s.status !== statusFilter) return false
    if (formFilter !== "ALL" && s.formId !== formFilter) return false
    if (search) {
      const q = search.toLowerCase()
      const name = (s.submitterName || "").toLowerCase()
      const email = (s.submitterEmail || "").toLowerCase()
      const formName = (s.form?.name || "").toLowerCase()
      if (!name.includes(q) && !email.includes(q) && !formName.includes(q)) return false
    }
    return true
  })

  function toggleSelect(id: string) {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
  }

  function toggleSelectAll() {
    if (selectedIds.length === filtered.length) setSelectedIds([])
    else setSelectedIds(filtered.map((s: any) => s.id))
  }

  async function openDetail(subId: string) {
    startTransition(async () => {
      try {
        const sub = await getSubmission(subId)
        setDetailSub(sub)
        setShowDetail(true)
      } catch { /* ignore */ }
    })
  }

  async function handleStatusChange(subId: string, status: string) {
    startTransition(async () => {
      try {
        await updateSubmissionStatus(subId, status)
        setSubmissions((prev) => prev.map((s: any) => s.id === subId ? { ...s, status } : s))
        if (detailSub?.id === subId) setDetailSub({ ...detailSub, status })
      } catch { /* ignore */ }
    })
  }

  async function handleApprove(subId: string, comments?: string) {
    startTransition(async () => {
      try {
        await approveSubmission(subId, comments)
        setSubmissions((prev) => prev.map((s: any) => s.id === subId ? { ...s, status: "APPROVED" } : s))
        setShowDetail(false)
        router.refresh()
      } catch { /* ignore */ }
    })
  }

  async function handleReject(subId: string, comments?: string) {
    startTransition(async () => {
      try {
        await rejectSubmission(subId, comments)
        setSubmissions((prev) => prev.map((s: any) => s.id === subId ? { ...s, status: "REJECTED" } : s))
        setShowDetail(false)
        router.refresh()
      } catch { /* ignore */ }
    })
  }

  async function handleDelete(subId: string) {
    if (!confirm("Delete this submission?")) return
    startTransition(async () => {
      try {
        await deleteSubmission(subId)
        setSubmissions((prev) => prev.filter((s: any) => s.id !== subId))
        setShowDetail(false)
      } catch { /* ignore */ }
    })
  }

  async function handleBulkDelete() {
    if (selectedIds.length === 0 || !confirm(`Delete ${selectedIds.length} submissions?`)) return
    startTransition(async () => {
      try {
        await bulkDeleteSubmissions(selectedIds)
        setSubmissions((prev) => prev.filter((s: any) => !selectedIds.includes(s.id)))
        setSelectedIds([])
      } catch { /* ignore */ }
    })
  }

  async function handleBulkStatus(status: string) {
    if (selectedIds.length === 0) return
    startTransition(async () => {
      try {
        await bulkUpdateSubmissionStatus(selectedIds, status)
        setSubmissions((prev) => prev.map((s: any) => selectedIds.includes(s.id) ? { ...s, status } : s))
        setSelectedIds([])
      } catch { /* ignore */ }
    })
  }

  async function handleExport(formId: string, format: "json" | "csv") {
    startTransition(async () => {
      try {
        const result = await exportSubmissions(formId, format)
        const blob = new Blob([result.data], { type: result.mimeType })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url; a.download = result.filename; a.click()
        URL.revokeObjectURL(url)
      } catch { /* ignore */ }
    })
  }

  return (
    <div className="space-y-6">
      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <Card><CardContent className="pt-4 pb-3 px-4">
            <p className="text-[10px] font-medium text-muted-foreground uppercase">Forms</p>
            <p className="text-2xl font-bold">{analytics.totalForms}</p>
          </CardContent></Card>
          <Card><CardContent className="pt-4 pb-3 px-4">
            <p className="text-[10px] font-medium text-muted-foreground uppercase">Active</p>
            <p className="text-2xl font-bold text-green-600">{analytics.activeForms}</p>
          </CardContent></Card>
          <Card><CardContent className="pt-4 pb-3 px-4">
            <p className="text-[10px] font-medium text-muted-foreground uppercase">Submissions</p>
            <p className="text-2xl font-bold">{analytics.totalSubmissions}</p>
          </CardContent></Card>
          <Card><CardContent className="pt-4 pb-3 px-4">
            <p className="text-[10px] font-medium text-muted-foreground uppercase">Approved</p>
            <p className="text-2xl font-bold text-green-600">{analytics.totalApproved}</p>
          </CardContent></Card>
          <Card><CardContent className="pt-4 pb-3 px-4">
            <p className="text-[10px] font-medium text-muted-foreground uppercase">Rejected</p>
            <p className="text-2xl font-bold text-red-600">{analytics.totalRejected}</p>
          </CardContent></Card>
          <Card><CardContent className="pt-4 pb-3 px-4">
            <p className="text-[10px] font-medium text-muted-foreground uppercase">Pending</p>
            <p className="text-2xl font-bold text-amber-600">{analytics.pendingApprovals}</p>
          </CardContent></Card>
          <Card><CardContent className="pt-4 pb-3 px-4">
            <p className="text-[10px] font-medium text-muted-foreground uppercase">This Week</p>
            <p className="text-2xl font-bold text-blue-600">{analytics.recentCount}</p>
          </CardContent></Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9 h-9" placeholder="Search submissions..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px] h-9"><Filter className="h-3 w-3 mr-1" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={formFilter} onValueChange={setFormFilter}>
          <SelectTrigger className="w-[180px] h-9"><SelectValue placeholder="All Forms" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Forms</SelectItem>
            {forms.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
          </SelectContent>
        </Select>
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{selectedIds.length} selected</Badge>
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => handleBulkStatus("APPROVED")}>Approve</Button>
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => handleBulkStatus("REJECTED")}>Reject</Button>
            <Button variant="outline" size="sm" className="h-8 text-xs text-destructive" onClick={handleBulkDelete}><Trash2 className="h-3 w-3 mr-1" />Delete</Button>
          </div>
        )}
        {formFilter !== "ALL" && (
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => handleExport(formFilter, "csv")}>
            <Download className="h-3 w-3 mr-1" />Export CSV
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="w-10 px-3 py-2"><input type="checkbox" checked={selectedIds.length === filtered.length && filtered.length > 0} onChange={toggleSelectAll} className="rounded" /></th>
              <th className="text-left px-3 py-2 font-medium">Submitter</th>
              <th className="text-left px-3 py-2 font-medium">Form</th>
              <th className="text-left px-3 py-2 font-medium">Status</th>
              <th className="text-left px-3 py-2 font-medium">Date</th>
              <th className="w-20 px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((sub: any) => {
              const sc = STATUS_CONFIG[sub.status] || STATUS_CONFIG.SUBMITTED
              const StatusIcon = sc.icon
              return (
                <tr key={sub.id} className="border-t hover:bg-muted/30 transition-colors">
                  <td className="px-3 py-2"><input type="checkbox" checked={selectedIds.includes(sub.id)} onChange={() => toggleSelect(sub.id)} className="rounded" /></td>
                  <td className="px-3 py-2">
                    <p className="font-medium">{sub.submitterName || "Anonymous"}</p>
                    <p className="text-xs text-muted-foreground">{sub.submitterEmail || ""}</p>
                  </td>
                  <td className="px-3 py-2">
                    <p className="font-medium">{sub.form?.name || "—"}</p>
                    <p className="text-xs text-muted-foreground">{sub.form?.category || ""}</p>
                  </td>
                  <td className="px-3 py-2">
                    <Badge variant="secondary" className={`text-[10px] ${sc.color}`}>
                      <StatusIcon className="h-3 w-3 mr-1" />{sc.label}
                    </Badge>
                  </td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">{new Date(sub.createdAt).toLocaleDateString()}</td>
                  <td className="px-3 py-2">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openDetail(sub.id)}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-3 py-12 text-center text-muted-foreground">No submissions found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Dialog */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {detailSub && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>Submission Detail</span>
                  <Badge variant="secondary" className={STATUS_CONFIG[detailSub.status]?.color || ""}>
                    {STATUS_CONFIG[detailSub.status]?.label || detailSub.status}
                  </Badge>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                {/* Submitter Info */}
                <div className="grid grid-cols-2 gap-3">
                  <div><p className="text-xs text-muted-foreground">Name</p><p className="text-sm font-medium">{detailSub.submitterName || "Anonymous"}</p></div>
                  <div><p className="text-xs text-muted-foreground">Email</p><p className="text-sm font-medium">{detailSub.submitterEmail || "—"}</p></div>
                  <div><p className="text-xs text-muted-foreground">Role</p><p className="text-sm font-medium">{detailSub.submitterRole || "—"}</p></div>
                  <div><p className="text-xs text-muted-foreground">Submitted</p><p className="text-sm font-medium">{new Date(detailSub.createdAt).toLocaleString()}</p></div>
                  {detailSub.completionTime && <div><p className="text-xs text-muted-foreground">Completion Time</p><p className="text-sm font-medium">{Math.round(detailSub.completionTime / 60)}m {detailSub.completionTime % 60}s</p></div>}
                </div>

                <Separator />

                {/* Response Data */}
                <div>
                  <p className="text-sm font-semibold mb-2">Responses</p>
                  <div className="space-y-2">
                    {detailSub.form?.fields?.map((field: any) => {
                      if (["SECTION_BREAK", "PAGE_BREAK", "HEADING", "PARAGRAPH", "DIVIDER", "HIDDEN"].includes(field.type)) return null
                      const data = typeof detailSub.data === "string" ? JSON.parse(detailSub.data) : detailSub.data
                      const val = data[field.name]
                      if (val === undefined || val === null) return null
                      return (
                        <div key={field.id} className="flex justify-between items-start py-1.5 border-b last:border-0">
                          <p className="text-xs text-muted-foreground">{field.label}</p>
                          <p className="text-sm font-medium text-right max-w-[60%]">
                            {typeof val === "object" ? JSON.stringify(val) : String(val)}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Approval Chain */}
                {detailSub.approvals && detailSub.approvals.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-semibold mb-2">Approval Chain</p>
                      <div className="space-y-2">
                        {detailSub.approvals.map((a: any) => (
                          <div key={a.id} className="flex items-center justify-between p-2 rounded-md border">
                            <div>
                              <p className="text-xs font-medium">Step {a.step}: {a.approverName || a.approverRole || "Pending"}</p>
                              {a.comments && <p className="text-xs text-muted-foreground mt-0.5">{a.comments}</p>}
                            </div>
                            <Badge variant="secondary" className={`text-[10px] ${
                              a.status === "APPROVED" ? "bg-green-100 text-green-700"
                              : a.status === "REJECTED" ? "bg-red-100 text-red-700"
                              : a.status === "ESCALATED" ? "bg-orange-100 text-orange-700"
                              : "bg-gray-100 text-gray-600"
                            }`}>{a.status}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Attachments */}
                {detailSub.attachments && detailSub.attachments.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-semibold mb-2">Attachments</p>
                      <div className="space-y-1">
                        {detailSub.attachments.map((att: any) => (
                          <div key={att.id} className="flex items-center justify-between p-2 rounded-md border">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-xs font-medium">{att.filename}</p>
                                <p className="text-[10px] text-muted-foreground">{(att.size / 1024).toFixed(1)} KB</p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
                              <a href={att.url} target="_blank" rel="noopener noreferrer">View</a>
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Status History */}
                {detailSub.statusHistory && (() => {
                  const history = typeof detailSub.statusHistory === "string" ? JSON.parse(detailSub.statusHistory) : detailSub.statusHistory
                  if (!Array.isArray(history) || history.length === 0) return null
                  return (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm font-semibold mb-2">Status History</p>
                        <div className="space-y-1">
                          {history.map((h: any, i: number) => (
                            <div key={i} className="flex items-center justify-between text-xs py-1">
                              <span className="font-medium">{h.status}</span>
                              <span className="text-muted-foreground">{h.by || "System"} • {new Date(h.at).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )
                })()}

                {/* Actions */}
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Select value={detailSub.status} onValueChange={(v) => handleStatusChange(detailSub.id, v)}>
                      <SelectTrigger className="h-8 w-[160px] text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(STATUS_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    {detailSub.status === "UNDER_REVIEW" && (
                      <>
                        <Button size="sm" className="h-8 text-xs bg-green-600 hover:bg-green-700" onClick={() => handleApprove(detailSub.id)}>
                          <CheckCircle2 className="h-3 w-3 mr-1" />Approve
                        </Button>
                        <Button size="sm" variant="destructive" className="h-8 text-xs" onClick={() => handleReject(detailSub.id)}>
                          <XCircle className="h-3 w-3 mr-1" />Reject
                        </Button>
                      </>
                    )}
                    <Button size="sm" variant="outline" className="h-8 text-xs text-destructive" onClick={() => handleDelete(detailSub.id)}>
                      <Trash2 className="h-3 w-3 mr-1" />Delete
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
