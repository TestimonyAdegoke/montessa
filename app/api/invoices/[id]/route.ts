import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const id = params.id
    const { billedTo, billedToEmail, items, subtotal, taxAmount, discount, totalAmount, status, dueDate, notes } = await request.json()

    const before = await prisma.invoice.findUnique({ where: { id } })

    const updated = await prisma.invoice.update({
      where: { id },
      data: {
        billedTo: billedTo ?? undefined,
        billedToEmail: billedToEmail ?? undefined,
        items: Array.isArray(items) ? items : undefined,
        subtotal: typeof subtotal === "number" ? subtotal : undefined,
        taxAmount: typeof taxAmount === "number" ? taxAmount : undefined,
        discount: typeof discount === "number" ? discount : undefined,
        totalAmount: typeof totalAmount === "number" ? totalAmount : undefined,
        status: status ?? undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        notes: notes ?? undefined,
      },
    })

    await prisma.auditLog.create({
      data: {
        tenantId: session.user.tenantId,
        userId: session.user.id,
        action: "UPDATE",
        entity: "Invoice",
        entityId: id,
        oldValues: before as any,
        newValues: updated as any,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Update invoice error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const id = params.id
    const before = await prisma.invoice.findUnique({ where: { id } })
    if (!before) return NextResponse.json({ error: "Not found" }, { status: 404 })

    await prisma.invoice.delete({ where: { id } })

    await prisma.auditLog.create({
      data: {
        tenantId: session.user.tenantId,
        userId: session.user.id,
        action: "DELETE",
        entity: "Invoice",
        entityId: id,
        oldValues: before as any,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Delete invoice error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
