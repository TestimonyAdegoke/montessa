"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  UserCheck,
  Users,
  BarChart3,
  Shield,
  Lightbulb,
  MessageSquare,
  BookOpen,
  TrendingUp,
  Bell,
} from "lucide-react"

const features = [
  {
    icon: UserCheck,
    title: "Smart Attendance & Check-In",
    description: "AI-powered daily tracking with QR codes, biometric systems, and guardian verification for secure check-ins and check-outs.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Users,
    title: "Parent & Student Portal",
    description: "Personalized dashboards for every stakeholder with real-time progress tracking, messaging, and multimedia updates.",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: BookOpen,
    title: "Montessori-Style Progress Reports",
    description: "Visual growth journeys and skill-based analytics tailored to Montessori education principles.",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    icon: Shield,
    title: "Multi-Tenant SaaS Model",
    description: "Complete data isolation with schools having separate, secure environments under unified infrastructure.",
    gradient: "from-orange-500 to-red-500",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics Dashboard",
    description: "Deep insights into attendance patterns, performance metrics, and engagement levels with predictive analytics.",
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    icon: Lightbulb,
    title: "Individual Learning Plans",
    description: "Customized learning paths with activity tracking, observations, and multi-sensory assessments.",
    gradient: "from-yellow-500 to-orange-500",
  },
  {
    icon: MessageSquare,
    title: "Unified Communication",
    description: "Seamless messaging between teachers, parents, and administrators with announcements and notifications.",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    icon: TrendingUp,
    title: "Performance Tracking",
    description: "Real-time monitoring of student progress with automated reports and milestone achievements.",
    gradient: "from-teal-500 to-green-500",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "Automated alerts for important events, absences, achievements, and payment reminders.",
    gradient: "from-violet-500 to-purple-500",
  },
]

export default function FeaturesSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="relative py-32 bg-slate-950 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:40px_40px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-slate-950 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />

      <div className="container relative z-10 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center space-y-6 mb-24"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-primary uppercase tracking-widest">
            <Sparkles className="w-3 h-3" />
            Capabilities
          </span>
          <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-tight">
            Everything Your <br />
            <span className="text-gradient">School Needs.</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto font-medium">
            Discover a comprehensive suite of professional tools designed to elevate education management to a new standard of excellence.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <div className="premium-card group h-full cursor-default select-none bg-slate-900/40 hover:bg-slate-900/60 transition-all border-white/5 hover:border-primary/20">
                  <div className="relative mb-6">
                    <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} text-white shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                      <Icon className="h-7 w-7" />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-primary transition-colors duration-300">
                    {feature.title}
                  </h3>

                  <p className="text-slate-400 font-medium leading-relaxed mb-6 group-hover:text-slate-300 transition-colors">
                    {feature.description}
                  </p>

                  <div className="mt-auto flex items-center gap-2 text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                    Explore Feature <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

import { Sparkles, ArrowRight } from "lucide-react"

