import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

function toCSV(headers: string[], rows: string[][]): string {
  const escape = (val: string) => {
    if (val.includes(",") || val.includes('"') || val.includes("\n")) {
      return `"${val.replace(/"/g, '""')}"`
    }
    return val
  }
  const lines = [headers.map(escape).join(",")]
  for (const row of rows) {
    lines.push(row.map((v) => escape(v ?? "")).join(","))
  }
  return lines.join("\n")
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (!["SUPER_ADMIN", "TENANT_ADMIN", "FINANCE", "HR", "HOD"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const tenantId = session.user.tenantId
    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type")

    let csv = ""
    let filename = ""

    switch (type) {
      case "students": {
        const rawStudents = await prisma.student.findMany({
          where: { tenantId },
          include: { Class: { select: { name: true } } },
          orderBy: { legalName: "asc" },
        })
        const students = rawStudents.map(({ Class, ...rest }) => ({ ...rest, currentClass: Class }))
        const headers = ["Admission #", "Legal Name", "Preferred Name", "Gender", "DOB", "Class", "Status", "Admission Date"]
        const rows = students.map((s: any) => [
          s.admissionNumber,
          s.legalName,
          s.preferredName || "",
          s.gender || "",
          s.dateOfBirth ? new Date(s.dateOfBirth).toISOString().split("T")[0] : "",
          s.currentClass?.name || "",
          s.studentStatus,
          s.admissionDate ? new Date(s.admissionDate).toISOString().split("T")[0] : "",
        ])
        csv = toCSV(headers, rows)
        filename = `students-export-${new Date().toISOString().split("T")[0]}.csv`
        break
      }

      case "attendance": {
        const dateFrom = searchParams.get("from")
        const dateTo = searchParams.get("to")
        const where: any = { tenantId }
        if (dateFrom) where.date = { ...where.date, gte: new Date(dateFrom) }
        if (dateTo) where.date = { ...where.date, lte: new Date(dateTo) }

        const rawRecords = await prisma.attendanceRecord.findMany({
          where,
          include: {
            Student: { select: { legalName: true, admissionNumber: true } },
          },
          orderBy: { date: "desc" },
          take: 10000,
        })
        const records = rawRecords.map(({ Student, ...rest }) => ({ ...rest, student: Student }))
        const headers = ["Date", "Admission #", "Student Name", "Status", "Remarks"]
        const rows = records.map((r: any) => [
          new Date(r.date).toISOString().split("T")[0],
          r.student?.admissionNumber || "",
          r.student?.legalName || "",
          r.status,
          r.remarks || "",
        ])
        csv = toCSV(headers, rows)
        filename = `attendance-export-${new Date().toISOString().split("T")[0]}.csv`
        break
      }

      case "invoices": {
        const invoices = await prisma.invoice.findMany({
          where: { tenantId },
          orderBy: { createdAt: "desc" },
          take: 10000,
        })
        const headers = ["Invoice #", "Billed To", "Email", "Subtotal", "Tax", "Discount", "Total", "Status", "Due Date", "Paid At"]
        const rows = invoices.map((inv: any) => [
          inv.invoiceNumber,
          inv.billedTo,
          inv.billedToEmail || "",
          String(inv.subtotal),
          String(inv.taxAmount),
          String(inv.discount),
          String(inv.totalAmount),
          inv.status,
          new Date(inv.dueDate).toISOString().split("T")[0],
          inv.paidAt ? new Date(inv.paidAt).toISOString().split("T")[0] : "",
        ])
        csv = toCSV(headers, rows)
        filename = `invoices-export-${new Date().toISOString().split("T")[0]}.csv`
        break
      }

      case "staff": {
        const staff = await prisma.user.findMany({
          where: { tenantId, role: { in: ["TEACHER", "HOD", "HR", "FINANCE"] } },
          select: { name: true, email: true, phone: true, role: true, isActive: true, createdAt: true },
          orderBy: { name: "asc" },
        })
        const headers = ["Name", "Email", "Phone", "Role", "Active", "Joined"]
        const rows = staff.map((s: any) => [
          s.name || "",
          s.email,
          s.phone || "",
          s.role,
          s.isActive ? "Yes" : "No",
          new Date(s.createdAt).toISOString().split("T")[0],
        ])
        csv = toCSV(headers, rows)
        filename = `staff-export-${new Date().toISOString().split("T")[0]}.csv`
        break
      }

      case "staff-attendance": {
        const dateFrom = searchParams.get("from")
        const dateTo = searchParams.get("to")
        const where: any = { tenantId }
        if (dateFrom) where.date = { ...where.date, gte: new Date(dateFrom) }
        if (dateTo) where.date = { ...where.date, lte: new Date(dateTo) }

        const records = await prisma.staffAttendance.findMany({
          where,
          orderBy: { date: "desc" },
          take: 10000,
        })

        const userIds = Array.from(new Set(records.map((r: any) => r.userId)))
        const users = await prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, name: true, email: true },
        })
        const userMap: Record<string, { name: string; email: string }> = {}
        users.forEach((u: any) => { userMap[u.id] = { name: u.name || "", email: u.email } })

        const headers = ["Date", "Staff Name", "Email", "Status", "Check In", "Check Out", "Notes"]
        const rows = records.map((r: any) => [
          new Date(r.date).toISOString().split("T")[0],
          userMap[r.userId]?.name || "",
          userMap[r.userId]?.email || "",
          r.status,
          r.checkIn ? new Date(r.checkIn).toLocaleTimeString() : "",
          r.checkOut ? new Date(r.checkOut).toLocaleTimeString() : "",
          r.notes || "",
        ])
        csv = toCSV(headers, rows)
        filename = `staff-attendance-export-${new Date().toISOString().split("T")[0]}.csv`
        break
      }

      default:
        return NextResponse.json({ error: "Invalid export type. Use: students, attendance, invoices, staff, staff-attendance" }, { status: 400 })
    }

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
