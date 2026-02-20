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
import { Plus, Loader2, Trash2, Tag } from "lucide-react"
import { createDiscount, deleteDiscount } from "@/lib/actions/discounts"
import { useToast } from "@/components/ui/use-toast"

interface DiscountData {
  id: string
  name: string
  description: string | null
  type: string
  value: number
  isPercentage: boolean
  applicableTo: string | null
  maxUses: number | null
  currentUses: number
  startDate: string | null
  endDate: string | null
  isActive: boolean
  createdAt: string
}

const typeLabels: Record<string, string> = {
  SCHOLARSHIP: "Scholarship",
  SIBLING_DISCOUNT: "Sibling Discount",
  STAFF_CHILD: "Staff Child",
  NEED_BASED: "Need-Based",
  EARLY_PAYMENT: "Early Payment",
  PROMOTIONAL: "Promotional",
  CUSTOM: "Custom",
}

export function DiscountClient({ discounts }: { discounts: DiscountData[] }) {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState("")
  const [desc, setDesc] = useState("")
  const [type, setType] = useState("SCHOLARSHIP")
  const [value, setValue] = useState("")
  const [isPct, setIsPct] = useState(true)
  const [maxUses, setMaxUses] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const handleCreate = () => {
    if (!name || !value) return
    startTransition(async () => {
      try {
        await createDiscount({
          name, description: desc || undefined, type,
          value: parseFloat(value), isPercentage: isPct,
          maxUses: maxUses ? parseInt(maxUses) : undefined,
          startDate: startDate || undefined, endDate: endDate || undefined,
        })
        toast({ title: "Created", description: "Discount has been created." })
        setShowCreate(false)
        setName(""); setDesc(""); setValue(""); setMaxUses(""); setStartDate(""); setEndDate("")
      } catch (e: any) {
        toast({ title: "Error", description: e.message, variant: "destructive" })
      }
    })
  }

  const handleDelete = (id: string) => {
    if (!confirm("Delete this discount?")) return
    startTransition(async () => {
      try {
        await deleteDiscount(id)
        toast({ title: "Deleted" })
      } catch (e: any) {
        toast({ title: "Error", description: e.message, variant: "destructive" })
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-2" /> New Discount
        </Button>
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Create Discount</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name *</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Merit Scholarship 2026" /></div>
            <div><Label>Description</Label><Textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={2} /></div>
            <div>
              <Label>Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(typeLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Value *</Label><Input type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder={isPct ? "10" : "5000"} /></div>
              <div>
                <Label>Type</Label>
                <Select value={isPct ? "pct" : "fixed"} onValueChange={(v) => setIsPct(v === "pct")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pct">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Max Uses</Label><Input type="number" value={maxUses} onChange={(e) => setMaxUses(e.target.value)} placeholder="Unlimited" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Start Date</Label><Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></div>
              <div><Label>End Date</Label><Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></div>
            </div>
            <Button onClick={handleCreate} disabled={isPending || !name || !value} className="w-full">
              {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Create Discount
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {discounts.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-1">No discounts</h3>
            <p className="text-sm text-muted-foreground">Create your first discount or scholarship.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Validity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {discounts.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell>
                      <div className="font-medium">{d.name}</div>
                      {d.description && <div className="text-xs text-muted-foreground truncate max-w-[200px]">{d.description}</div>}
                    </TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{typeLabels[d.type] || d.type}</Badge></TableCell>
                    <TableCell className="font-semibold">{d.isPercentage ? `${d.value}%` : `$${d.value.toFixed(2)}`}</TableCell>
                    <TableCell className="text-sm">{d.currentUses}{d.maxUses ? ` / ${d.maxUses}` : ""}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {d.startDate && d.endDate ? `${new Date(d.startDate).toLocaleDateString()} - ${new Date(d.endDate).toLocaleDateString()}` : "Always"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={d.isActive ? "success" : "secondary"} className="text-xs">
                        {d.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(d.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
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
