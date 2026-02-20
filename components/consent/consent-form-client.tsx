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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FileText, CheckCircle2, XCircle, Clock, Plus, Loader2, Eye } from "lucide-react"
import { createConsentForm, respondToConsentForm, closeConsentForm } from "@/lib/actions/consent"
import { useToast } from "@/components/ui/use-toast"
import { formatDate } from "@/lib/utils"

interface ConsentFormData {
  id: string
  title: string
  description: string
  content: string
  audience: string
  dueDate: string | null
  isActive: boolean
  createdAt: string
  consented: number
  declined: number
  totalResponses: number
  responseRate: number
  userHasResponded: boolean
  userConsented: boolean | null
}

export function ConsentFormClient({
  forms,
  isAdmin,
  isGuardian,
  userId,
}: {
  forms: ConsentFormData[]
  isAdmin: boolean
  isGuardian: boolean
  userId: string
}) {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [showCreate, setShowCreate] = useState(false)
  const [viewForm, setViewForm] = useState<ConsentFormData | null>(null)
  const [newTitle, setNewTitle] = useState("")
  const [newDesc, setNewDesc] = useState("")
  const [newContent, setNewContent] = useState("")
  const [newDueDate, setNewDueDate] = useState("")

  const handleCreate = () => {
    if (!newTitle || !newDesc || !newContent) return
    startTransition(async () => {
      try {
        await createConsentForm({
          title: newTitle,
          description: newDesc,
          content: newContent,
          dueDate: newDueDate || undefined,
        })
        toast({ title: "Created!", description: "Consent form created and parents notified." })
        setShowCreate(false)
        setNewTitle(""); setNewDesc(""); setNewContent(""); setNewDueDate("")
      } catch (e: any) {
        toast({ title: "Error", description: e.message, variant: "destructive" })
      }
    })
  }

  const handleRespond = (formId: string, consented: boolean) => {
    startTransition(async () => {
      try {
        await respondToConsentForm(formId, { consented })
        toast({ title: consented ? "Consent Given" : "Consent Declined", description: "Your response has been recorded." })
        setViewForm(null)
      } catch (e: any) {
        toast({ title: "Error", description: e.message, variant: "destructive" })
      }
    })
  }

  const handleClose = (formId: string) => {
    startTransition(async () => {
      try {
        await closeConsentForm(formId)
        toast({ title: "Closed", description: "Consent form has been closed." })
      } catch (e: any) {
        toast({ title: "Error", description: e.message, variant: "destructive" })
      }
    })
  }

  return (
    <div className="space-y-4">
      {isAdmin && (
        <div className="flex justify-end">
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4 mr-2" /> New Consent Form
          </Button>
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Create Consent Form</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Title</Label><Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="e.g. Field Trip Permission" /></div>
            <div><Label>Description</Label><Textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Brief description..." rows={2} /></div>
            <div><Label>Full Content / Terms</Label><Textarea value={newContent} onChange={(e) => setNewContent(e.target.value)} placeholder="Detailed terms and conditions..." rows={5} /></div>
            <div><Label>Due Date (optional)</Label><Input type="date" value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)} /></div>
            <Button onClick={handleCreate} disabled={isPending || !newTitle || !newDesc || !newContent} className="w-full">
              {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Create & Notify Parents
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View/Respond Dialog */}
      <Dialog open={!!viewForm} onOpenChange={() => setViewForm(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{viewForm?.title}</DialogTitle></DialogHeader>
          {viewForm && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{viewForm.description}</p>
              <div className="bg-muted/50 rounded-lg p-4 text-sm whitespace-pre-wrap">{viewForm.content}</div>
              {viewForm.dueDate && (
                <p className="text-sm text-muted-foreground">Due by: <strong>{formatDate(new Date(viewForm.dueDate))}</strong></p>
              )}

              {isGuardian && !viewForm.userHasResponded && (
                <div className="flex gap-3 pt-2">
                  <Button onClick={() => handleRespond(viewForm.id, true)} disabled={isPending} className="flex-1">
                    <CheckCircle2 className="h-4 w-4 mr-2" /> I Consent
                  </Button>
                  <Button variant="outline" onClick={() => handleRespond(viewForm.id, false)} disabled={isPending} className="flex-1">
                    <XCircle className="h-4 w-4 mr-2" /> I Decline
                  </Button>
                </div>
              )}

              {isGuardian && viewForm.userHasResponded && (
                <div className="text-center py-2">
                  <Badge variant={viewForm.userConsented ? "success" : "destructive"} className="text-sm px-4 py-1">
                    {viewForm.userConsented ? "You have consented" : "You have declined"}
                  </Badge>
                </div>
              )}

              {isAdmin && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Response Rate</span>
                    <span className="font-semibold">{viewForm.responseRate}%</span>
                  </div>
                  <Progress value={viewForm.responseRate} className="h-2" />
                  <div className="flex gap-4 text-sm">
                    <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> {viewForm.consented} consented</span>
                    <span className="flex items-center gap-1"><XCircle className="h-3.5 w-3.5 text-red-500" /> {viewForm.declined} declined</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Forms List */}
      {forms.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-1">No consent forms</h3>
            <p className="text-sm text-muted-foreground">
              {isAdmin ? "Create a consent form to get started." : "No consent forms require your attention."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {forms.map((form) => (
            <Card key={form.id} className={!form.isActive ? "opacity-60" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{form.title}</CardTitle>
                    <CardDescription className="mt-1">{form.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-1">
                    {form.isActive ? (
                      <Badge variant="success" className="text-[10px]">Active</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px]">Closed</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {form.dueDate && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Due: {formatDate(new Date(form.dueDate))}
                  </p>
                )}

                {isAdmin && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span>{form.totalResponses} responses</span>
                      <span>{form.responseRate}%</span>
                    </div>
                    <Progress value={form.responseRate} className="h-1.5" />
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-0.5"><CheckCircle2 className="h-3 w-3 text-green-500" /> {form.consented}</span>
                      <span className="flex items-center gap-0.5"><XCircle className="h-3 w-3 text-red-500" /> {form.declined}</span>
                    </div>
                  </div>
                )}

                {isGuardian && (
                  <div>
                    {form.userHasResponded ? (
                      <Badge variant={form.userConsented ? "success" : "destructive"} className="text-xs">
                        {form.userConsented ? "Consented" : "Declined"}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                        Action Required
                      </Badge>
                    )}
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <Button variant="outline" size="sm" onClick={() => setViewForm(form)}>
                    <Eye className="h-3.5 w-3.5 mr-1" /> View
                  </Button>
                  {isAdmin && form.isActive && (
                    <Button variant="ghost" size="sm" onClick={() => handleClose(form.id)} disabled={isPending}>
                      Close Form
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
