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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { UserPlus, Loader2, LogOut, Search, UserCheck, UserX, Clock } from "lucide-react"
import { checkInVisitor, checkOutVisitor } from "@/lib/actions/visitors"
import { useToast } from "@/components/ui/use-toast"

interface VisitorData {
  id: string
  fullName: string
  phone: string | null
  email: string | null
  company: string | null
  purpose: string
  hostName: string
  hostDepartment: string | null
  badgeNumber: string | null
  status: string
  checkInTime: string
  checkOutTime: string | null
  notes: string | null
}

function statusBadge(status: string) {
  switch (status) {
    case "CHECKED_IN": return <Badge variant="success">On-Site</Badge>
    case "CHECKED_OUT": return <Badge variant="secondary">Left</Badge>
    case "DENIED": return <Badge variant="destructive">Denied</Badge>
    case "EXPECTED": return <Badge variant="outline">Expected</Badge>
    default: return <Badge variant="outline">{status}</Badge>
  }
}

export function VisitorClient({ visitors }: { visitors: VisitorData[] }) {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [showCheckIn, setShowCheckIn] = useState(false)
  const [search, setSearch] = useState("")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [company, setCompany] = useState("")
  const [purpose, setPurpose] = useState("")
  const [hostName, setHostName] = useState("")
  const [hostDept, setHostDept] = useState("")
  const [badge, setBadge] = useState("")

  const filtered = visitors.filter((v) =>
    v.fullName.toLowerCase().includes(search.toLowerCase()) ||
    v.hostName.toLowerCase().includes(search.toLowerCase()) ||
    v.purpose.toLowerCase().includes(search.toLowerCase())
  )

  const handleCheckIn = () => {
    if (!name || !purpose || !hostName) return
    startTransition(async () => {
      try {
        await checkInVisitor({
          fullName: name, phone: phone || undefined, email: email || undefined,
          company: company || undefined, purpose, hostName, hostDepartment: hostDept || undefined,
          badgeNumber: badge || undefined,
        })
        toast({ title: "Checked In", description: `${name} has been checked in.` })
        setShowCheckIn(false)
        setName(""); setPhone(""); setEmail(""); setCompany(""); setPurpose(""); setHostName(""); setHostDept(""); setBadge("")
      } catch (e: any) {
        toast({ title: "Error", description: e.message, variant: "destructive" })
      }
    })
  }

  const handleCheckOut = (id: string, visitorName: string) => {
    startTransition(async () => {
      try {
        await checkOutVisitor(id)
        toast({ title: "Checked Out", description: `${visitorName} has been checked out.` })
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
          <Input placeholder="Search visitors..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button onClick={() => setShowCheckIn(true)}>
          <UserPlus className="h-4 w-4 mr-2" /> Check In Visitor
        </Button>
      </div>

      <Dialog open={showCheckIn} onOpenChange={setShowCheckIn}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Check In Visitor</DialogTitle>
            <DialogDescription>Enter visitor details to check them in.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Full Name *</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" /></div>
              <div><Label>Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+234..." /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Email</Label><Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" /></div>
              <div><Label>Company</Label><Input value={company} onChange={(e) => setCompany(e.target.value)} /></div>
            </div>
            <div><Label>Purpose of Visit *</Label><Input value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="Parent meeting, delivery, etc." /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Host Name *</Label><Input value={hostName} onChange={(e) => setHostName(e.target.value)} placeholder="Who are they visiting?" /></div>
              <div><Label>Department</Label><Input value={hostDept} onChange={(e) => setHostDept(e.target.value)} /></div>
            </div>
            <div><Label>Badge Number</Label><Input value={badge} onChange={(e) => setBadge(e.target.value)} placeholder="V-001" /></div>
            <Button onClick={handleCheckIn} disabled={isPending || !name || !purpose || !hostName} className="w-full">
              {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserCheck className="h-4 w-4 mr-2" />} Check In
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <UserPlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-1">No visitors</h3>
            <p className="text-sm text-muted-foreground">Check in your first visitor to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Visitor</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Host</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell>
                      <div className="font-medium">{v.fullName}</div>
                      {v.company && <div className="text-xs text-muted-foreground">{v.company}</div>}
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate">{v.purpose}</TableCell>
                    <TableCell>
                      <div>{v.hostName}</div>
                      {v.hostDepartment && <div className="text-xs text-muted-foreground">{v.hostDepartment}</div>}
                    </TableCell>
                    <TableCell className="text-sm">{new Date(v.checkInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</TableCell>
                    <TableCell className="text-sm">{v.checkOutTime ? new Date(v.checkOutTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}</TableCell>
                    <TableCell>{statusBadge(v.status)}</TableCell>
                    <TableCell className="text-right">
                      {v.status === "CHECKED_IN" && (
                        <Button variant="outline" size="sm" onClick={() => handleCheckOut(v.id, v.fullName)} disabled={isPending}>
                          <LogOut className="h-3.5 w-3.5 mr-1" /> Out
                        </Button>
                      )}
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
