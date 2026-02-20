"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowRightLeft, RotateCcw, Search } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface Props { students: any[]; classes: any[] }

export function TransferClient({ students, classes }: Props) {
  const { toast } = useToast()
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [action, setAction] = useState<"transfer" | "readmit" | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<string>("")
  const [reason, setReason] = useState("")
  const [targetSchool, setTargetSchool] = useState("")
  const [targetClass, setTargetClass] = useState("")

  const classMap: Record<string, string> = {}
  classes.forEach((c: any) => { classMap[c.id] = c.name })

  const filtered = students.filter((s: any) =>
    s.legalName.toLowerCase().includes(search.toLowerCase()) ||
    s.admissionNumber?.toLowerCase().includes(search.toLowerCase())
  )

  const handleTransfer = async () => {
    if (!selectedStudent || !reason) return
    try {
      const res = await fetch("/api/students/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: selectedStudent, reason, targetSchool, action: "transfer" }),
      })
      if (!res.ok) throw new Error("Failed")
      toast({ title: "Student Transferred" })
      setAction(null)
      setSelectedStudent("")
      setReason("")
      setTargetSchool("")
      router.refresh()
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }) }
  }

  const handleReadmit = async () => {
    if (!selectedStudent || !targetClass) return
    try {
      const res = await fetch("/api/students/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: selectedStudent, classId: targetClass, reason, action: "readmit" }),
      })
      if (!res.ok) throw new Error("Failed")
      toast({ title: "Student Re-admitted" })
      setAction(null)
      setSelectedStudent("")
      setReason("")
      setTargetClass("")
      router.refresh()
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }) }
  }

  const active = students.filter((s: any) => s.status === "ACTIVE").length
  const transferred = students.filter((s: any) => s.status === "TRANSFERRED").length
  const withdrawn = students.filter((s: any) => s.status === "WITHDRAWN").length

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardDescription>Active</CardDescription><CardTitle className="text-3xl text-green-600">{active}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Transferred</CardDescription><CardTitle className="text-3xl text-orange-500">{transferred}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Withdrawn</CardDescription><CardTitle className="text-3xl text-red-500">{withdrawn}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Total</CardDescription><CardTitle className="text-3xl">{students.length}</CardTitle></CardHeader></Card>
      </div>

      <div className="flex gap-2">
        <Button onClick={() => setAction("transfer")} variant={action === "transfer" ? "default" : "outline"}><ArrowRightLeft className="h-4 w-4 mr-2" />Transfer Out</Button>
        <Button onClick={() => setAction("readmit")} variant={action === "readmit" ? "default" : "outline"}><RotateCcw className="h-4 w-4 mr-2" />Re-Admit</Button>
      </div>

      {action === "transfer" && (
        <Card>
          <CardHeader><CardTitle className="text-base">Transfer Student Out</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Student *</Label>
                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                  <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                  <SelectContent>{students.filter((s: any) => s.status === "ACTIVE").map((s: any) => <SelectItem key={s.id} value={s.id}>{s.legalName} ({s.admissionNumber})</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Destination School</Label><Input value={targetSchool} onChange={e => setTargetSchool(e.target.value)} placeholder="Name of receiving school" /></div>
            </div>
            <div><Label>Reason *</Label><Textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Reason for transfer..." /></div>
            <div className="flex gap-2"><Button onClick={handleTransfer}>Confirm Transfer</Button><Button variant="outline" onClick={() => setAction(null)}>Cancel</Button></div>
          </CardContent>
        </Card>
      )}

      {action === "readmit" && (
        <Card>
          <CardHeader><CardTitle className="text-base">Re-Admit Student</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Student *</Label>
                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                  <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                  <SelectContent>{students.filter((s: any) => ["TRANSFERRED", "WITHDRAWN", "GRADUATED"].includes(s.status)).map((s: any) => <SelectItem key={s.id} value={s.id}>{s.legalName} ({s.admissionNumber}) — {s.status}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Assign to Class *</Label>
                <Select value={targetClass} onValueChange={setTargetClass}>
                  <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                  <SelectContent>{classes.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Notes</Label><Textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Re-admission notes..." /></div>
            <div className="flex gap-2"><Button onClick={handleReadmit}>Confirm Re-Admission</Button><Button variant="outline" onClick={() => setAction(null)}>Cancel</Button></div>
          </CardContent>
        </Card>
      )}

      <div>
        <div className="relative mb-4"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        <div className="space-y-2">
          {filtered.map((s: any) => (
            <Card key={s.id}>
              <CardContent className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium">{s.legalName}</p>
                  <p className="text-sm text-muted-foreground">{s.admissionNumber}{s.classId ? ` · ${classMap[s.classId] || ""}` : ""}</p>
                </div>
                <Badge variant={s.status === "ACTIVE" ? "default" : s.status === "TRANSFERRED" ? "secondary" : "outline"}>{s.status}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
