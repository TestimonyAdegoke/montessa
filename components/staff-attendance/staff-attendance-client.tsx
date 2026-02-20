"use client"

import { useState, useTransition } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, UserCheck, Clock, Loader2 } from "lucide-react"
import { markStaffAttendance } from "@/lib/actions/staff-attendance"
import { useToast } from "@/components/ui/use-toast"

interface StaffData {
  id: string
  name: string
  email: string
  role: string
  image: string | null
}

interface AttendanceEntry {
  status: string
  checkIn: string | null
  checkOut: string | null
}

const statusOptions = [
  { value: "PRESENT", label: "Present", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  { value: "ABSENT", label: "Absent", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
  { value: "LATE", label: "Late", color: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200" },
  { value: "HALF_DAY", label: "Half Day", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  { value: "WORK_FROM_HOME", label: "WFH", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" },
  { value: "ON_LEAVE", label: "On Leave", color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200" },
]

function getStatusBadge(status: string) {
  const opt = statusOptions.find((o) => o.value === status)
  return <Badge className={`text-xs ${opt?.color || ""}`}>{opt?.label || status}</Badge>
}

export function StaffAttendanceClient({
  staff,
  attendanceMap,
}: {
  staff: StaffData[]
  attendanceMap: Record<string, AttendanceEntry>
}) {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState("")
  const [localMap, setLocalMap] = useState(attendanceMap)

  const filtered = staff.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    s.role.toLowerCase().includes(search.toLowerCase())
  )

  const handleMark = (userId: string, userName: string, status: string) => {
    setLocalMap((prev) => ({
      ...prev,
      [userId]: { status, checkIn: prev[userId]?.checkIn || new Date().toISOString(), checkOut: null },
    }))

    startTransition(async () => {
      try {
        await markStaffAttendance({ userId, date: new Date().toISOString().split("T")[0], status })
        toast({ title: "Marked", description: `${userName} marked as ${status.replace("_", " ")}` })
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
          <Input placeholder="Search staff..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead className="text-right">Mark Attendance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => {
                const entry = localMap[s.id]
                return (
                  <TableRow key={s.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {s.image ? (
                          <img src={s.image} alt={s.name} className="h-8 w-8 rounded-full object-cover" />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                            {s.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{s.name}</div>
                          <div className="text-xs text-muted-foreground">{s.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">{s.role}</Badge>
                    </TableCell>
                    <TableCell>
                      {entry ? getStatusBadge(entry.status) : <span className="text-xs text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="text-sm">
                      {entry?.checkIn
                        ? new Date(entry.checkIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Select
                        value={entry?.status || ""}
                        onValueChange={(val) => handleMark(s.id, s.name, val)}
                        disabled={isPending}
                      >
                        <SelectTrigger className="w-[130px] h-8 text-xs">
                          <SelectValue placeholder="Mark..." />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((o) => (
                            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
