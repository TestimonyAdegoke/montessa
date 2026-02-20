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
  Plus,
  Trash2,
  Target,
  ArrowRight,
  FileText,
  ClipboardList,
  CreditCard,
  CalendarCheck,
  CheckCircle2,
  ShoppingCart,
} from "lucide-react"
import { createFunnel, addFunnelStep, deleteFunnel } from "@/lib/actions/website-builder-forms"

interface FunnelStep {
  id: string
  title: string
  type: string
  sortOrder: number
  page: { title: string; slug: string } | null
}

interface FunnelData {
  id: string
  name: string
  slug: string
  description: string | null
  isActive: boolean
  conversionGoal: string | null
  steps: FunnelStep[]
}

interface PageRef {
  id: string
  title: string
  slug: string
}

interface Props {
  funnels: FunnelData[]
  pages: PageRef[]
}

const STEP_TYPES = [
  { value: "LANDING", label: "Landing Page", icon: FileText },
  { value: "FORM", label: "Form", icon: ClipboardList },
  { value: "CONFIRMATION", label: "Confirmation", icon: CheckCircle2 },
  { value: "UPSELL", label: "Upsell", icon: ShoppingCart },
  { value: "PAYMENT", label: "Payment", icon: CreditCard },
  { value: "BOOKING", label: "Booking", icon: CalendarCheck },
]

const STEP_COLORS: Record<string, string> = {
  LANDING: "bg-blue-500/10 text-blue-700 border-blue-200",
  FORM: "bg-purple-500/10 text-purple-700 border-purple-200",
  CONFIRMATION: "bg-green-500/10 text-green-700 border-green-200",
  UPSELL: "bg-amber-500/10 text-amber-700 border-amber-200",
  PAYMENT: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
  BOOKING: "bg-indigo-500/10 text-indigo-700 border-indigo-200",
}

export default function FunnelsClient({ funnels, pages }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")

  // Create funnel
  const [createOpen, setCreateOpen] = useState(false)
  const [funnelName, setFunnelName] = useState("")
  const [funnelSlug, setFunnelSlug] = useState("")
  const [funnelDesc, setFunnelDesc] = useState("")
  const [funnelGoal, setFunnelGoal] = useState("")

  // Add step
  const [addStepFunnelId, setAddStepFunnelId] = useState<string | null>(null)
  const [stepTitle, setStepTitle] = useState("")
  const [stepType, setStepType] = useState("LANDING")
  const [stepPageId, setStepPageId] = useState("")

  function openCreate() {
    setFunnelName(""); setFunnelSlug(""); setFunnelDesc(""); setFunnelGoal(""); setError("")
    setCreateOpen(true)
  }

  function openAddStep(funnelId: string) {
    setAddStepFunnelId(funnelId)
    setStepTitle(""); setStepType("LANDING"); setStepPageId(""); setError("")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            Funnels
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Build conversion funnels for admissions, events, and lead capture
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/website-builder"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Link>
          </Button>
          <Button size="sm" className="gap-1" onClick={openCreate}>
            <Plus className="h-4 w-4" /> New Funnel
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}

      {funnels.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
            <p className="font-medium">No funnels yet</p>
            <p className="text-sm text-muted-foreground mt-1">Create a funnel to guide visitors through a conversion flow</p>
            <Button className="mt-4 gap-1" onClick={openCreate}><Plus className="h-4 w-4" /> Create Funnel</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {funnels.map((funnel) => (
            <Card key={funnel.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      {funnel.name}
                      <Badge variant="outline" className={`text-[10px] ${funnel.isActive ? "bg-green-500/10 text-green-700 border-green-200" : "bg-gray-500/10 text-gray-500"}`}>
                        {funnel.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="flex items-center gap-3 mt-1">
                      <span>/{funnel.slug}</span>
                      {funnel.conversionGoal && <><span>•</span><span>Goal: {funnel.conversionGoal}</span></>}
                      <span>•</span>
                      <span>{funnel.steps.length} steps</span>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openAddStep(funnel.id)} title="Add Step">
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost" size="icon" className="h-8 w-8 text-destructive"
                      onClick={() => {
                        if (!confirm(`Delete funnel "${funnel.name}"?`)) return
                        startTransition(async () => {
                          try { await deleteFunnel(funnel.id); router.refresh() } catch (e: any) { setError(e.message) }
                        })
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {funnel.steps.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">No steps yet. Add steps to build the funnel flow.</p>
                ) : (
                  <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    {funnel.steps.map((step, i) => {
                      const StepIcon = STEP_TYPES.find((t) => t.value === step.type)?.icon || FileText
                      return (
                        <div key={step.id} className="flex items-center gap-2 shrink-0">
                          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${STEP_COLORS[step.type] || "bg-gray-50"}`}>
                            <StepIcon className="h-4 w-4 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs font-semibold truncate">{step.title}</p>
                              <p className="text-[10px] opacity-70">{step.type}{step.page ? ` → /${step.page.slug}` : ""}</p>
                            </div>
                          </div>
                          {i < funnel.steps.length - 1 && (
                            <ArrowRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Funnel Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Plus className="h-5 w-5 text-primary" /> New Funnel</DialogTitle>
            <DialogDescription>Create a conversion funnel</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Funnel Name</Label>
              <Input
                value={funnelName}
                onChange={(e) => {
                  setFunnelName(e.target.value)
                  setFunnelSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, ""))
                }}
                placeholder="e.g. Admissions Funnel"
              />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input value={funnelSlug} onChange={(e) => setFunnelSlug(e.target.value)} placeholder="admissions-funnel" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={funnelDesc} onChange={(e) => setFunnelDesc(e.target.value)} placeholder="Optional description" />
            </div>
            <div className="space-y-2">
              <Label>Conversion Goal</Label>
              <Input value={funnelGoal} onChange={(e) => setFunnelGoal(e.target.value)} placeholder="e.g. Form submission, Payment" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button
              disabled={isPending || !funnelName.trim() || !funnelSlug.trim()}
              onClick={() => {
                startTransition(async () => {
                  try {
                    await createFunnel({ name: funnelName.trim(), slug: funnelSlug.trim(), description: funnelDesc || undefined, conversionGoal: funnelGoal || undefined })
                    setCreateOpen(false)
                    router.refresh()
                  } catch (e: any) { setError(e.message) }
                })
              }}
            >
              {isPending ? "Creating..." : "Create Funnel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Step Dialog */}
      <Dialog open={!!addStepFunnelId} onOpenChange={() => setAddStepFunnelId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Plus className="h-5 w-5 text-primary" /> Add Step</DialogTitle>
            <DialogDescription>Add a step to the funnel</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Step Title</Label>
              <Input value={stepTitle} onChange={(e) => setStepTitle(e.target.value)} placeholder="e.g. Landing Page" />
            </div>
            <div className="space-y-2">
              <Label>Step Type</Label>
              <Select value={stepType} onValueChange={setStepType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STEP_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Linked Page (optional)</Label>
              <Select value={stepPageId} onValueChange={setStepPageId}>
                <SelectTrigger><SelectValue placeholder="Select a page" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No page</SelectItem>
                  {pages.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.title} (/{p.slug})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddStepFunnelId(null)}>Cancel</Button>
            <Button
              disabled={isPending || !stepTitle.trim()}
              onClick={() => {
                if (!addStepFunnelId) return
                startTransition(async () => {
                  try {
                    await addFunnelStep(addStepFunnelId, {
                      title: stepTitle.trim(),
                      type: stepType,
                      pageId: stepPageId && stepPageId !== "none" ? stepPageId : undefined,
                    })
                    setAddStepFunnelId(null)
                    router.refresh()
                  } catch (e: any) { setError(e.message) }
                })
              }}
            >
              {isPending ? "Adding..." : "Add Step"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
