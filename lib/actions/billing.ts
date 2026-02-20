"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createInvoice(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)) {
      return { success: false, error: "Unauthorized" }
    }

    const studentId = formData.get("studentId") as string
    const description = formData.get("description") as string
    const subtotal = parseFloat(formData.get("subtotal") as string)
    const taxAmount = parseFloat(formData.get("taxAmount") as string) || 0
    const discountAmount = parseFloat(formData.get("discountAmount") as string) || 0
    const dueDate = new Date(formData.get("dueDate") as string)
    const lineItems = formData.get("lineItems") ? JSON.parse(formData.get("lineItems") as string) : []

    // Get student details
    const rawStudent = await prisma.student.findUnique({
      where: { id: studentId },
      include: { User: true },
    })

    if (!rawStudent) {
      return { success: false, error: "Student not found" }
    }

    const totalAmount = subtotal + taxAmount - discountAmount
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`

    const invoice = await prisma.invoice.create({
      data: {
        tenantId: session.user.tenantId,
        invoiceNumber,
        billedTo: rawStudent.legalName,
        billedToEmail: rawStudent.User.email,
        subtotal,
        taxAmount,
        discount: discountAmount,
        totalAmount,
        dueDate,
        status: "PENDING",
        items: lineItems,
      },
    })

    revalidatePath("/dashboard/billing")
    return { success: true, data: invoice }
  } catch (error: any) {
    console.error("Create invoice error:", error)
    return { success: false, error: error.message || "Failed to create invoice" }
  }
}

export async function createPayment(invoiceId: string, amount: number, method: string, transactionId?: string) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return { success: false, error: "Unauthorized" }
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    })

    if (!invoice) {
      return { success: false, error: "Invoice not found" }
    }

    const payment = await prisma.payment.create({
      data: {
        invoiceId,
        amount,
        method: method as any,
        reference: transactionId || null,
        paidAt: new Date(),
        status: "COMPLETED",
      },
    })

    // Update invoice status if fully paid
    const totalPaid = await prisma.payment.aggregate({
      where: { invoiceId, status: "COMPLETED" },
      _sum: { amount: true },
    })

    if (totalPaid._sum.amount && totalPaid._sum.amount >= invoice.totalAmount) {
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: { status: "PAID", paidAt: new Date() },
      })
    }

    revalidatePath("/dashboard/billing")
    return { success: true, data: payment }
  } catch (error: any) {
    console.error("Create payment error:", error)
    return { success: false, error: error.message || "Failed to process payment" }
  }
}

export async function getInvoices() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return []
    }

    const rawInvoices = await prisma.invoice.findMany({
      where: { tenantId: session.user.tenantId },
      include: {
        Payment: {
          select: {
            amount: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return rawInvoices.map(({ Payment, ...rest }) => ({ ...rest, payments: Payment }))
  } catch (error) {
    console.error("Get invoices error:", error)
    return []
  }
}
