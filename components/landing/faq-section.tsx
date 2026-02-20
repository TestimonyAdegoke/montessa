"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "Can parents access reports and updates?",
    answer: "Yes! Parents get their own secure portal where they can view real-time progress reports, attendance records, photos, videos, and communicate directly with teachers. They receive instant notifications for important updates.",
  },
  {
    question: "Does Montessa support multiple campuses?",
    answer: "Absolutely. Our multi-tenant architecture allows you to manage multiple campuses or schools under one account, each with complete data isolation and customizable settings while maintaining centralized oversight.",
  },
  {
    question: "Is my school data secure?",
    answer: "Security is our top priority. We use bank-level AES-256 encryption, complete tenant data isolation, regular security audits, and compliance with GDPR and FERPA regulations. All data is backed up daily with 99.9% uptime guarantee.",
  },
  {
    question: "Can I import existing student data?",
    answer: "Yes! We provide easy data import tools that support CSV, Excel, and direct database migrations. Our onboarding team helps ensure a smooth transition with zero data loss.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, bank transfers, and offer invoice billing for annual plans. All payments are processed securely through Stripe with PCI compliance.",
  },
  {
    question: "Do you offer training for staff?",
    answer: "Yes! All plans include comprehensive onboarding training, video tutorials, and documentation. Growth and Enterprise plans get dedicated training sessions and ongoing support from our education specialists.",
  },
  {
    question: "Can I customize the platform for my school?",
    answer: "Absolutely! You can customize branding, logos, colors, email templates, report formats, and even create custom fields. Enterprise plans offer advanced customization and white-labeling options.",
  },
  {
    question: "What happens after my free trial?",
    answer: "Your 14-day free trial includes full access to all features. After the trial, you can choose a plan that fits your needs. No credit card required to start the trial, and you can cancel anytime.",
  },
]

export default function FAQSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="relative py-24 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
      <div className="container max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4 mb-16"
        >
          <span className="inline-block text-sm font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
            FAQ
          </span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-muted-foreground">
            Everything you need to know about Montessa
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border rounded-lg px-6 bg-white dark:bg-gray-950 shadow-sm hover:shadow-md transition-shadow"
              >
                <AccordionTrigger className="text-left font-semibold hover:no-underline py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12 p-8 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-2xl border"
        >
          <h3 className="text-2xl font-bold mb-4">Still have questions?</h3>
          <p className="text-muted-foreground mb-6">
            Our team is here to help you get started
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg">
              Contact Support
            </Button>
            <Button size="lg" variant="outline">
              Schedule a Demo
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
