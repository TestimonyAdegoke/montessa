"use client"

import { useState, useTransition, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { markAttendance } from "@/lib/actions/attendance"
import { QrCode, Search, UserCheck, UserX, Clock, Maximize2, Minimize2, CheckCircle2 } from "lucide-react"

interface StudentData {
  id: string
  name: string
  admissionNumber: string
  className: string
}

export function CheckInClient({
  students,
  todayAttendance,
  tenantId,
}: {
  students: StudentData[]
  todayAttendance: Record<string, string>
  tenantId: string
}) {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState("")
  const [kioskMode, setKioskMode] = useState(false)
  const [scanInput, setScanInput] = useState("")
  const [lastScanned, setLastScanned] = useState<{ name: string; status: string; time: string } | null>(null)
  const [localAttendance, setLocalAttendance] = useState<Record<string, string>>(todayAttendance)

  const filtered = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.admissionNumber.toLowerCase().includes(search.toLowerCase()) ||
    s.className.toLowerCase().includes(search.toLowerCase())
  )

  const checkedIn = Object.values(localAttendance).filter((s) => s === "PRESENT").length
  const absent = students.length - checkedIn

  const handleCheckIn = useCallback((studentId: string, studentName: string) => {
    const isAlreadyPresent = localAttendance[studentId] === "PRESENT"
    const newStatus = isAlreadyPresent ? "ABSENT" : "PRESENT"

    setLocalAttendance((prev) => ({ ...prev, [studentId]: newStatus }))

    startTransition(async () => {
      try {
        await markAttendance(studentId, new Date(), newStatus)
        setLastScanned({
          name: studentName,
          status: newStatus === "PRESENT" ? "Checked In" : "Checked Out",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        })
        toast({
          title: newStatus === "PRESENT" ? "Checked In" : "Checked Out",
          description: `${studentName} — ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
        })
      } catch (e: any) {
        setLocalAttendance((prev) => ({ ...prev, [studentId]: isAlreadyPresent ? "PRESENT" : "" }))
        toast({ title: "Error", description: e.message, variant: "destructive" })
      }
    })
  }, [localAttendance, startTransition, toast])

  const handleScan = useCallback(() => {
    if (!scanInput.trim()) return
    const student = students.find(
      (s) => s.admissionNumber.toLowerCase() === scanInput.trim().toLowerCase() ||
             s.id === scanInput.trim()
    )
    if (student) {
      handleCheckIn(student.id, student.name)
    } else {
      toast({ title: "Not Found", description: `No student found for: ${scanInput}`, variant: "destructive" })
    }
    setScanInput("")
  }, [scanInput, students, handleCheckIn, toast])

  if (kioskMode) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center p-8">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4"
          onClick={() => setKioskMode(false)}
        >
          <Minimize2 className="h-6 w-6" />
        </Button>

        <div className="text-center space-y-8 max-w-lg w-full">
          <div>
            <QrCode className="h-20 w-20 mx-auto text-primary mb-4" />
            <h1 className="text-4xl font-bold">Student Check-In</h1>
            <p className="text-xl text-muted-foreground mt-2">Scan QR code or enter admission number</p>
          </div>

          <div className="flex gap-3">
            <Input
              value={scanInput}
              onChange={(e) => setScanInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleScan()}
              placeholder="Scan or type admission number..."
              className="text-2xl h-16 text-center"
              autoFocus
            />
            <Button onClick={handleScan} className="h-16 px-8 text-lg" disabled={isPending}>
              <CheckCircle2 className="h-6 w-6 mr-2" /> Go
            </Button>
          </div>

          {lastScanned && (
            <Card className={`border-2 ${lastScanned.status === "Checked In" ? "border-green-500 bg-green-50 dark:bg-green-950" : "border-amber-500 bg-amber-50 dark:bg-amber-950"}`}>
              <CardContent className="py-8 text-center">
                <div className="text-3xl font-bold">{lastScanned.name}</div>
                <div className="text-xl mt-2">
                  <Badge variant={lastScanned.status === "Checked In" ? "success" : "secondary"} className="text-lg px-4 py-1">
                    {lastScanned.status}
                  </Badge>
                </div>
                <div className="text-lg text-muted-foreground mt-2">{lastScanned.time}</div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-2 gap-4 text-center">
            <Card>
              <CardContent className="py-4">
                <div className="text-4xl font-bold text-green-600">{checkedIn}</div>
                <div className="text-sm text-muted-foreground">Checked In</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4">
                <div className="text-4xl font-bold text-muted-foreground">{absent}</div>
                <div className="text-sm text-muted-foreground">Not Yet</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
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
            <CardTitle className="text-sm font-medium">Checked In</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{checkedIn}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Not Checked In</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{absent}</div></CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search students..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-2">
          <Input
            value={scanInput}
            onChange={(e) => setScanInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleScan()}
            placeholder="Scan QR / admission #"
            className="w-56"
          />
          <Button variant="outline" onClick={handleScan} disabled={isPending}>
            <QrCode className="h-4 w-4 mr-2" /> Scan
          </Button>
        </div>
        <Button onClick={() => setKioskMode(true)}>
          <Maximize2 className="h-4 w-4 mr-2" /> Kiosk Mode
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Admission #</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => {
                const status = localAttendance[s.id]
                const isPresent = status === "PRESENT"
                return (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell className="font-mono text-sm">{s.admissionNumber}</TableCell>
                    <TableCell>{s.className}</TableCell>
                    <TableCell>
                      {isPresent ? (
                        <Badge variant="success">Present</Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">—</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant={isPresent ? "outline" : "default"}
                        size="sm"
                        onClick={() => handleCheckIn(s.id, s.name)}
                        disabled={isPending}
                      >
                        {isPresent ? (
                          <><UserX className="h-3.5 w-3.5 mr-1" /> Check Out</>
                        ) : (
                          <><UserCheck className="h-3.5 w-3.5 mr-1" /> Check In</>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
