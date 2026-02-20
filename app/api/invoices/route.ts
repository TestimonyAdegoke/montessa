import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

function generateInvoiceNumber() {
  const rand = Math.floor(Math.random() * 9000 + 1000)
  return `INV-${Date.now()}-${rand}`
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { studentId, dueDate, description, items, status } = await request.json()

    if (!studentId || !dueDate || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "studentId, dueDate and items are required" }, { status: 400 })
    }

    const rawStudent = await prisma.student.findFirst({
      where: { id: String(studentId), tenantId: session.user.tenantId },
      include: {
        User: { select: { name: true, email: true } },
        Class: { select: { name: true } },
      },
    })

    if (!rawStudent) return NextResponse.json({ error: "Student not found" }, { status: 404 })
    const student = { ...rawStudent, user: rawStudent.User, currentClass: rawStudent.Class }

    const subtotal = items.reduce((sum: number, item: any) => sum + (item.quantity || 0) * (item.unitPrice || 0), 0)
    const taxAmount = 0
    const discount = 0
    const totalAmount = subtotal + taxAmount - discount

    const invoice = await prisma.invoice.create({
      data: {
        tenantId: session.user.tenantId,
        invoiceNumber: generateInvoiceNumber(),
        billedTo: student.legalName,
        billedToEmail: student.user.email || undefined,
        subtotal,
        taxAmount,
        discount,
        totalAmount,
        status: status || "PENDING",
        dueDate: new Date(dueDate),
        notes: description || undefined,
        items,
      },
    })

    // Audit log
    await prisma.auditLog.create({
      data: {
        tenantId: session.user.tenantId,
        userId: session.user.id,
        action: "CREATE",
        entity: "Invoice",
        entityId: invoice.id,
        newValues: invoice as any,
      },
    })

    return NextResponse.json(invoice, { status: 201 })
  } catch (error) {
    console.error("Create invoice error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
