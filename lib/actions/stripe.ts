"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "")

export async function createCheckoutSession(invoiceId: string, amount: number) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return { success: false, error: "Unauthorized" }
    }

    // Verify invoice belongs to user's tenant
    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, tenantId: session.user.tenantId },
    })

    if (!invoice) {
      return { success: false, error: "Invoice not found" }
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Invoice Payment`,
              description: `Payment for invoice #${invoice.invoiceNumber}`,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=true&invoice=${invoiceId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?canceled=true`,
      metadata: {
        invoiceId,
        userId: session.user.id,
        tenantId: session.user.tenantId,
      },
    })

    return { success: true, url: checkoutSession.url }
  } catch (error: any) {
    console.error("Create checkout session error:", error)
    return { success: false, error: error.message || "Failed to create checkout session" }
  }
}

export async function createSubscriptionCheckout(tenantId: string, plan: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "SUPER_ADMIN" && session.user.role !== "TENANT_ADMIN") {
      return { success: false, error: "Unauthorized" }
    }

    const priceMap: Record<string, string> = {
      basic: process.env.STRIPE_BASIC_PRICE_ID || "",
      premium: process.env.STRIPE_PREMIUM_PRICE_ID || "",
      enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID || "",
    }

    const priceId = priceMap[plan]
    if (!priceId) {
      return { success: false, error: "Invalid plan" }
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?tab=tenant&success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?tab=tenant&canceled=true`,
      metadata: { tenantId, plan },
    })

    return { success: true, url: checkoutSession.url }
  } catch (error: any) {
    console.error("Create subscription checkout error:", error)
    return { success: false, error: error.message || "Failed to create subscription" }
  }
}
