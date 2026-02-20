import { NextResponse } from "next/server"
import { headers } from "next/headers"
import Stripe from "stripe"
import { prisma } from "@/lib/prisma"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "")

export async function POST(request: Request) {
  const body = await request.text()
  const headersList = headers()
  const signature = headersList.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    )
  } catch (err: any) {
    console.error("Stripe webhook signature verification failed:", err.message)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const invoiceId = session.metadata?.invoiceId
        const userId = session.metadata?.userId
        const amount = session.amount_total ? session.amount_total / 100 : 0

        if (invoiceId) {
          const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: { Payment: true },
          })

          if (invoice) {
            const existingPaid = (invoice as any).Payment
              .filter((p: any) => p.status === "COMPLETED")
              .reduce((sum: number, p: any) => sum + p.amount, 0)
            const totalPaid = existingPaid + amount
            const newStatus = totalPaid >= invoice.totalAmount ? "PAID" : "PENDING"

            await prisma.$transaction([
              prisma.payment.create({
                data: {
                  invoiceId: invoice.id,
                  amount,
                  method: "CREDIT_CARD",
                  status: "COMPLETED",
                  stripePaymentId: typeof session.payment_intent === "string" ? session.payment_intent : null,
                  paidAt: new Date(),
                },
              }),
              prisma.invoice.update({
                where: { id: invoiceId },
                data: {
                  status: newStatus,
                  stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : undefined,
                  paidAt: newStatus === "PAID" ? new Date() : undefined,
                },
              }),
              prisma.auditLog.create({
                data: {
                  tenantId: invoice.tenantId,
                  userId: userId || "system",
                  action: "PAYMENT_RECEIVED",
                  entity: "Payment",
                  entityId: invoiceId,
                  newValues: {
                    amount,
                    method: "CREDIT_CARD",
                    stripeSessionId: session.id,
                    paymentIntent: typeof session.payment_intent === "string" ? session.payment_intent : null,
                  },
                },
              }),
            ])
          }
        }
        break
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.error("Payment failed:", paymentIntent.id, paymentIntent.last_payment_error?.message)
        break
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        const tenantId = subscription.metadata?.tenantId

        if (tenantId) {
          const status = subscription.status === "active" ? "ACTIVE" : "SUSPENDED"
          await prisma.tenant.update({
            where: { id: tenantId },
            data: { status },
          })
        }
        break
      }

      default:
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Stripe webhook processing error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
