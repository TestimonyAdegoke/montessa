"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FileSignature, Plus, Ban, PenTool } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { createContract, signContract, voidContract } from "@/lib/actions/contracts"
import { useRouter } from "next/navigation"

interface Props { contracts: any[]; userRole: string }

export function ContractsClient({ contracts, userRole }: Props) {
  const { toast } = useToast()
  const router = useRouter()
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ title: "", content: "", guardianName: "", guardianEmail: "", expiresAt: "" })
  const canManage = ["SUPER_ADMIN", "TENANT_ADMIN"].includes(userRole)

  const handleCreate = async () => {
    if (!form.title || !form.content || !form.guardianName || !form.guardianEmail) return
    try {
      await createContract(form)
      toast({ title: "Contract Created" })
      setShowCreate(false)
      setForm({ title: "", content: "", guardianName: "", guardianEmail: "", expiresAt: "" })
      router.refresh()
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }) }
  }

  const handleSign = async (id: string) => {
    try {
      await signContract(id, `signed-by-${Date.now()}`)
      toast({ title: "Contract Signed" })
      router.refresh()
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }) }
  }

  const handleVoid = async (id: string) => {
    try { await voidContract(id); toast({ title: "Contract Voided" }); router.refresh() }
    catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }) }
  }

  const pending = contracts.filter((c: any) => c.status === "PENDING").length
  const signed = contracts.filter((c: any) => c.status === "SIGNED").length

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardDescription>Total Contracts</CardDescription><CardTitle className="text-3xl">{contracts.length}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Pending Signature</CardDescription><CardTitle className="text-3xl text-orange-500">{pending}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Signed</CardDescription><CardTitle className="text-3xl text-green-600">{signed}</CardTitle></CardHeader></Card>
      </div>

      {canManage && <Button onClick={() => setShowCreate(!showCreate)}><Plus className="h-4 w-4 mr-2" />New Contract</Button>}

      {showCreate && (
        <Card>
          <CardHeader><CardTitle className="text-base">Create Enrollment Contract</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Enrollment Agreement 2025" /></div>
              <div><Label>Guardian Name *</Label><Input value={form.guardianName} onChange={e => setForm({ ...form, guardianName: e.target.value })} /></div>
              <div><Label>Guardian Email *</Label><Input type="email" value={form.guardianEmail} onChange={e => setForm({ ...form, guardianEmail: e.target.value })} /></div>
              <div><Label>Expires At</Label><Input type="date" value={form.expiresAt} onChange={e => setForm({ ...form, expiresAt: e.target.value })} /></div>
            </div>
            <div><Label>Contract Content *</Label><Textarea rows={6} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="Enter the full contract terms and conditions..." /></div>
            <div className="flex gap-2"><Button onClick={handleCreate}>Create</Button><Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button></div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {contracts.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground"><FileSignature className="h-8 w-8 mx-auto mb-2 opacity-50" />No contracts yet.</CardContent></Card>
        ) : contracts.map((c: any) => (
          <Card key={c.id}>
            <CardContent className="py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileSignature className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-semibold">{c.title}</p>
                  <p className="text-sm text-muted-foreground">{c.guardianName} ({c.guardianEmail}){c.signedAt ? ` · Signed ${new Date(c.signedAt).toLocaleDateString()}` : ""}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={c.status === "SIGNED" ? "default" : c.status === "VOIDED" ? "destructive" : "secondary"}>{c.status}</Badge>
                {c.status === "PENDING" && (
                  <>
                    <Button size="sm" variant="outline" onClick={() => handleSign(c.id)}><PenTool className="h-3 w-3 mr-1" />Sign</Button>
                    {canManage && <Button size="sm" variant="ghost" onClick={() => handleVoid(c.id)}><Ban className="h-3 w-3 mr-1 text-destructive" />Void</Button>}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
