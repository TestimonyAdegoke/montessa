"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { Building2, Users, TrendingUp, ArrowRight } from "lucide-react"

const steps = [
  {
    number: "01",
    icon: Building2,
    title: "Register Your School",
    description: "Sign up in minutes and set up your school's profile with custom branding and settings.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    number: "02",
    icon: Users,
    title: "Set Up Classes & Guardians",
    description: "Add students, teachers, and guardians. Configure classes, schedules, and learning plans.",
    color: "from-purple-500 to-pink-500",
  },
  {
    number: "03",
    icon: TrendingUp,
    title: "Monitor, Analyze & Grow",
    description: "Track progress, engage parents, and leverage analytics to continuously improve outcomes.",
    color: "from-green-500 to-emerald-500",
  },
]

export default function HowItWorks() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="relative py-24 bg-white dark:bg-gray-950">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4 mb-20"
        >
          <span className="inline-block text-sm font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
            How It Works
          </span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Get Started in Three Simple Steps
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From setup to success, we make school management effortless
          </p>
        </motion.div>

        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-300 via-purple-300 to-green-300 dark:from-blue-700 dark:via-purple-700 dark:to-green-700 -translate-y-1/2" />

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="relative"
                >
                  {/* Step Number Circle */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={isInView ? { scale: 1 } : {}}
                    transition={{ duration: 0.5, delay: index * 0.2 + 0.3, type: "spring" }}
                    className="relative z-10 mx-auto w-32 h-32 mb-6"
                  >
                    <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${step.color} opacity-20 blur-xl animate-pulse`} />
                    <div className={`relative w-full h-full rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center shadow-2xl`}>
                      <Icon className="w-12 h-12 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-white dark:bg-gray-900 shadow-lg flex items-center justify-center font-bold text-sm">
                      {step.number}
                    </div>
                  </motion.div>

                  <div className="text-center space-y-3">
                    <h3 className="text-2xl font-bold">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {/* Arrow between steps (except last) */}
                  {index < steps.length - 1 && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={isInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.5, delay: index * 0.2 + 0.5 }}
                      className="hidden md:block absolute top-16 -right-6 lg:-right-8"
                    >
                      <ArrowRight className="w-12 h-12 text-purple-300 dark:text-purple-700" />
                    </motion.div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
