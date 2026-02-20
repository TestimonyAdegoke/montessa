"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Sparkles } from "lucide-react"
import Link from "next/link"

const plans = [
  {
    name: "Starter",
    description: "Perfect for small schools getting started",
    monthlyPrice: 49,
    yearlyPrice: 490,
    features: [
      "Up to 50 students",
      "Basic student management",
      "Attendance tracking",
      "Parent portal",
      "Email support",
      "5GB storage",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Growth",
    description: "Ideal for growing schools",
    monthlyPrice: 149,
    yearlyPrice: 1490,
    features: [
      "Up to 200 students",
      "Advanced analytics",
      "Individual learning plans",
      "Assessment & grading",
      "Billing & invoicing",
      "Priority support",
      "50GB storage",
      "Custom branding",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    description: "For large institutions",
    monthlyPrice: null,
    yearlyPrice: null,
    features: [
      "Unlimited students",
      "All Growth features",
      "Dedicated account manager",
      "Custom integrations",
      "SLA guarantee",
      "Advanced security",
      "Unlimited storage",
      "On-premise option",
    ],
    cta: "Contact Sales",
    popular: false,
  },
]

export default function PricingSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [isYearly, setIsYearly] = useState(false)

  return (
    <section ref={ref} className="relative py-24 bg-white dark:bg-gray-950">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4 mb-16"
        >
          <span className="inline-block text-sm font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
            Pricing
          </span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your school&apos;s needs. All plans include a 14-day free trial.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 pt-4">
            <span className={`text-sm font-medium ${!isYearly ? "text-foreground" : "text-muted-foreground"}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className="relative w-14 h-7 rounded-full bg-gray-200 dark:bg-gray-700 transition-colors"
            >
              <motion.div
                className="absolute top-1 left-1 w-5 h-5 rounded-full bg-purple-600 shadow-lg"
                animate={{ x: isYearly ? 28 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
            <span className={`text-sm font-medium ${isYearly ? "text-foreground" : "text-muted-foreground"}`}>
              Yearly
              <span className="ml-2 inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 px-2 py-0.5 text-xs text-green-700 dark:text-green-400">
                Save 17%
              </span>
            </span>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              {plan.popular && (
                <div className="absolute -top-5 left-0 right-0 flex justify-center">
                  <span className="inline-flex items-center gap-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg">
                    <Sparkles className="w-4 h-4" />
                    Most Popular
                  </span>
                </div>
              )}

              <Card className={`relative h-full transition-all duration-300 hover:shadow-2xl ${
                plan.popular ? "border-2 border-purple-500 shadow-xl scale-105" : "hover:-translate-y-2"
              }`}>
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                  <CardDescription className="text-base">{plan.description}</CardDescription>
                  
                  <div className="pt-6">
                    {plan.monthlyPrice ? (
                      <>
                        <div className="flex items-baseline justify-center gap-2">
                          <span className="text-5xl font-bold">
                            ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                          </span>
                          <span className="text-muted-foreground">
                            /{isYearly ? "year" : "month"}
                          </span>
                        </div>
                        {isYearly && (
                          <div className="text-sm text-muted-foreground mt-2">
                            ${(plan.yearlyPrice! / 12).toFixed(0)}/month billed annually
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-3xl font-bold">Custom</div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Link href="/signup" className="w-full">
                    <Button
                      className="w-full"
                      size="lg"
                      variant={plan.popular ? "default" : "outline"}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardFooter>

                {plan.popular && (
                  <div className="absolute inset-0 -z-10 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg blur-xl" />
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
