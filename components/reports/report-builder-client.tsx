"use client"

import { useState } from "react"
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
import { FileDown, FileSpreadsheet, Users, Calendar, DollarSign, UserCog, Download } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface ReportTemplate {
  id: string
  name: string
  description: string
  type: string
  icon: React.ReactNode
  fields: string[]
}

const reportTemplates: ReportTemplate[] = [
  {
    id: "students",
    name: "Student Directory",
    description: "Export all student records with class, gender, status, and admission details",
    type: "students",
    icon: <Users className="h-5 w-5" />,
    fields: ["Admission #", "Legal Name", "Preferred Name", "Gender", "DOB", "Class", "Status", "Admission Date"],
  },
  {
    id: "attendance",
    name: "Attendance Report",
    description: "Student attendance records with date range filtering",
    type: "attendance",
    icon: <Calendar className="h-5 w-5" />,
    fields: ["Date", "Admission #", "Student Name", "Status", "Remarks"],
  },
  {
    id: "invoices",
    name: "Invoice Report",
    description: "All invoices with amounts, status, and payment details",
    type: "invoices",
    icon: <DollarSign className="h-5 w-5" />,
    fields: ["Invoice #", "Billed To", "Email", "Subtotal", "Tax", "Discount", "Total", "Status", "Due Date", "Paid At"],
  },
  {
    id: "staff",
    name: "Staff Directory",
    description: "Staff members with roles, contact info, and status",
    type: "staff",
    icon: <UserCog className="h-5 w-5" />,
    fields: ["Name", "Email", "Phone", "Role", "Active", "Joined"],
  },
  {
    id: "staff-attendance",
    name: "Staff Attendance",
    description: "Staff attendance records with check-in/out times",
    type: "staff-attendance",
    icon: <Calendar className="h-5 w-5" />,
    fields: ["Date", "Staff Name", "Email", "Status", "Check In", "Check Out", "Notes"],
  },
]

export function ReportBuilderClient() {
  const { toast } = useToast()
  const [selectedReport, setSelectedReport] = useState<string | null>(null)
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async (type: string) => {
    setIsExporting(true)
    try {
      let url = `/api/export?type=${type}`
      if (dateFrom) url += `&from=${dateFrom}`
      if (dateTo) url += `&to=${dateTo}`

      const res = await fetch(url)
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Export failed")
      }

      const blob = await res.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = downloadUrl
      a.download = res.headers.get("Content-Disposition")?.split("filename=")[1]?.replace(/"/g, "") || `${type}-export.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(downloadUrl)

      toast({ title: "Export Complete", description: `${type} report downloaded successfully.` })
    } catch (err: any) {
      toast({ title: "Export Failed", description: err.message, variant: "destructive" })
    } finally {
      setIsExporting(false)
    }
  }

  const selected = reportTemplates.find((r) => r.id === selectedReport)

  return (
    <div className="space-y-6">
      {/* Date Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Date Range Filter</CardTitle>
          <CardDescription>Optional — applies to attendance and time-based reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <Label>From</Label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div className="flex-1">
              <Label>To</Label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
            {(dateFrom || dateTo) && (
              <Button variant="ghost" size="sm" onClick={() => { setDateFrom(""); setDateTo("") }}>
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Report Templates */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reportTemplates.map((report) => (
          <Card
            key={report.id}
            className={`cursor-pointer transition-all hover:shadow-md ${selectedReport === report.id ? "ring-2 ring-primary" : ""}`}
            onClick={() => setSelectedReport(report.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  {report.icon}
                </div>
                {selectedReport === report.id && <Badge variant="default">Selected</Badge>}
              </div>
              <CardTitle className="text-base mt-2">{report.name}</CardTitle>
              <CardDescription className="text-xs">{report.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1">
                {report.fields.map((f) => (
                  <Badge key={f} variant="outline" className="text-[10px]">{f}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Export Action */}
      {selected && (
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4" /> {selected.name}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {selected.fields.length} columns · CSV format
                  {dateFrom && ` · From ${dateFrom}`}
                  {dateTo && ` · To ${dateTo}`}
                </p>
              </div>
              <Button onClick={() => handleExport(selected.type)} disabled={isExporting} size="lg">
                <Download className="h-4 w-4 mr-2" />
                {isExporting ? "Exporting..." : "Download CSV"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
