import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || ""
const PAYSTACK_BASE_URL = "https://api.paystack.co"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { invoiceId, email, callbackUrl } = await req.json()

    if (!PAYSTACK_SECRET_KEY) {
      return NextResponse.json({ error: "Paystack is not configured. Set PAYSTACK_SECRET_KEY in environment." }, { status: 500 })
    }

    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } })
    if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    if (invoice.status === "PAID") return NextResponse.json({ error: "Invoice already paid" }, { status: 400 })

    // Paystack amounts are in kobo (smallest currency unit)
    const amountInKobo = Math.round(invoice.totalAmount * 100)

    const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email || invoice.billedToEmail || session.user.email,
        amount: amountInKobo,
        reference: `INV-${invoice.invoiceNumber}-${Date.now()}`,
        callback_url: callbackUrl || `${process.env.NEXTAUTH_URL}/dashboard/billing`,
        metadata: {
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          tenantId: invoice.tenantId,
          userId: session.user.id,
        },
      }),
    })

    const data = await response.json()

    if (!data.status) {
      return NextResponse.json({ error: data.message || "Failed to initialize payment" }, { status: 400 })
    }

    return NextResponse.json({
      authorizationUrl: data.data.authorization_url,
      accessCode: data.data.access_code,
      reference: data.data.reference,
    })
  } catch (error) {
    console.error("Paystack init error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
