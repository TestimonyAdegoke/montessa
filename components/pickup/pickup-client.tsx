"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Search, ShieldCheck, ShieldAlert, UserCheck, Phone, Clock } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface GuardianInfo {
  id: string
  name: string
  phone: string | null
  relationship: string
  image: string | null
}

interface StudentData {
  id: string
  name: string
  admissionNumber: string
  className: string
  emergencyContact: string | null
  emergencyPhone: string | null
  guardians: GuardianInfo[]
}

interface PickupLog {
  studentName: string
  guardianName: string
  relationship: string
  time: string
  verified: boolean
}

export function PickupClient({ students }: { students: StudentData[] }) {
  const { toast } = useToast()
  const [search, setSearch] = useState("")
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null)
  const [pickupLog, setPickupLog] = useState<PickupLog[]>([])

  const filtered = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.admissionNumber.toLowerCase().includes(search.toLowerCase()) ||
    s.className.toLowerCase().includes(search.toLowerCase())
  )

  const handleVerifyPickup = (student: StudentData, guardian: GuardianInfo) => {
    const entry: PickupLog = {
      studentName: student.name,
      guardianName: guardian.name,
      relationship: guardian.relationship,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      verified: true,
    }
    setPickupLog((prev) => [entry, ...prev])
    setSelectedStudent(null)
    toast({
      title: "Pickup Verified",
      description: `${student.name} released to ${guardian.name} (${guardian.relationship})`,
    })
  }

  const handleUnauthorizedPickup = (student: StudentData, personName: string) => {
    const entry: PickupLog = {
      studentName: student.name,
      guardianName: personName,
      relationship: "UNAUTHORIZED",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      verified: false,
    }
    setPickupLog((prev) => [entry, ...prev])
    setSelectedStudent(null)
    toast({
      title: "Unauthorized Pickup Attempt",
      description: `${personName} is NOT authorized to pick up ${student.name}`,
      variant: "destructive",
    })
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{students.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pickups Today</CardTitle>
            <ShieldCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{pickupLog.filter((l) => l.verified).length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unauthorized Attempts</CardTitle>
            <ShieldAlert className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-red-600">{pickupLog.filter((l) => !l.verified).length}</div></CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search student by name or admission number..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Verify Pickup — {selectedStudent?.name}</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{selectedStudent.className}</span> · {selectedStudent.admissionNumber}
              </div>

              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-green-500" /> Authorized Guardians
                </h4>
                {selectedStudent.guardians.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No guardians linked to this student.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedStudent.guardians.map((g) => (
                      <div key={g.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {g.image ? (
                            <img src={g.image} alt={g.name} className="h-10 w-10 rounded-full object-cover" />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                              {g.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{g.name}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                              <Badge variant="outline" className="text-[10px]">{g.relationship}</Badge>
                              {g.phone && <span className="flex items-center gap-0.5"><Phone className="h-3 w-3" />{g.phone}</span>}
                            </div>
                          </div>
                        </div>
                        <Button size="sm" onClick={() => handleVerifyPickup(selectedStudent, g)}>
                          <ShieldCheck className="h-3.5 w-3.5 mr-1" /> Release
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedStudent.emergencyContact && (
                <div className="p-3 border rounded-lg bg-amber-50 dark:bg-amber-950">
                  <h5 className="text-sm font-semibold flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" /> Emergency Contact
                  </h5>
                  <p className="text-sm">{selectedStudent.emergencyContact} — {selectedStudent.emergencyPhone}</p>
                </div>
              )}

              <div className="border-t pt-3">
                <h4 className="font-semibold mb-2 flex items-center gap-2 text-red-600">
                  <ShieldAlert className="h-4 w-4" /> Report Unauthorized Person
                </h4>
                <div className="flex gap-2">
                  <Input
                    placeholder="Name of unauthorized person"
                    id="unauthorized-name"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      const input = document.getElementById("unauthorized-name") as HTMLInputElement
                      if (input?.value) {
                        handleUnauthorizedPickup(selectedStudent, input.value)
                        input.value = ""
                      }
                    }}
                  >
                    Report
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Students</CardTitle>
            <CardDescription>Click a student to verify pickup</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Guardians</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.slice(0, 50).map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <div className="font-medium">{s.name}</div>
                      <div className="text-xs text-muted-foreground font-mono">{s.admissionNumber}</div>
                    </TableCell>
                    <TableCell>{s.className}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">{s.guardians.length} linked</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => setSelectedStudent(s)}>
                        Verify Pickup
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pickup Log</CardTitle>
            <CardDescription>Today&apos;s pickup activity</CardDescription>
          </CardHeader>
          <CardContent>
            {pickupLog.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">No pickups recorded yet today.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {pickupLog.map((log, i) => (
                  <div key={i} className={`flex items-center justify-between p-3 rounded-lg border ${log.verified ? "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800" : "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800"}`}>
                    <div>
                      <div className="font-medium text-sm">{log.studentName}</div>
                      <div className="text-xs text-muted-foreground">
                        {log.guardianName} ({log.relationship})
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{log.time}</span>
                      {log.verified ? (
                        <Badge variant="success" className="text-[10px]">Verified</Badge>
                      ) : (
                        <Badge variant="destructive" className="text-[10px]">Unauthorized</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
