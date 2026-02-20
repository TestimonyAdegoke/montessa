import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || ""

function verifyPaystackSignature(body: string, signature: string): boolean {
  const hash = crypto.createHmac("sha512", PAYSTACK_SECRET_KEY).update(body).digest("hex")
  return hash === signature
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get("x-paystack-signature") || ""

    if (!verifyPaystackSignature(body, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    const event = JSON.parse(body)

    switch (event.event) {
      case "charge.success": {
        const data = event.data
        const metadata = data.metadata || {}
        const invoiceId = metadata.invoiceId

        if (!invoiceId) break

        const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } })
        if (!invoice || invoice.status === "PAID") break

        // Record payment
        await prisma.payment.create({
          data: {
            invoiceId: invoice.id,
            amount: data.amount / 100, // Convert from kobo
            method: "ONLINE",
            status: "COMPLETED",
            reference: data.reference,
            paidAt: new Date(data.paid_at || Date.now()),
            notes: `Paystack payment - Channel: ${data.channel || "unknown"}`,
          },
        })

        // Update invoice status
        await prisma.invoice.update({
          where: { id: invoice.id },
          data: { status: "PAID", paidAt: new Date(data.paid_at || Date.now()) },
        })

        console.log(`[Paystack] Payment recorded for invoice ${invoice.invoiceNumber}: ${data.amount / 100}`)
        break
      }

      case "charge.failed": {
        const data = event.data
        const metadata = data.metadata || {}
        console.log(`[Paystack] Payment failed for invoice ${metadata.invoiceId}: ${data.gateway_response}`)
        break
      }

      default:
        console.log(`[Paystack] Unhandled event: ${event.event}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Paystack webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
