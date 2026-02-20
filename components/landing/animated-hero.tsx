"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Play, TrendingUp, Users, CheckCircle, Sparkles, ShieldCheck, Zap } from "lucide-react"

export default function AnimatedHero() {
  const floatingAnimation = {
    y: [0, -20, 0],
    transition: {
      duration: 5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }

  const metrics = [
    { label: "Students Managed", value: "24,000+", icon: Users, color: "text-blue-500" },
    { label: "Daily Check-ins", value: "8,500+", icon: CheckCircle, color: "text-emerald-500" },
    { label: "Success Rate", value: "99.9%", icon: TrendingUp, color: "text-violet-500" },
  ]

  return (
    <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden bg-slate-950">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 -left-1/4 w-[100%] h-[100%] bg-primary/20 rounded-full blur-[140px] opacity-20 animate-pulse" />
        <div className="absolute bottom-0 -right-1/4 w-[100%] h-[100%] bg-indigo-600/20 rounded-full blur-[140px] opacity-20 animate-pulse delay-700" />

        {/* Abstract Grid Pattern */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:50px_50px]" />
      </div>

      <div className="container relative z-10 px-6 py-20 md:py-32">
        <div className="grid lg:grid-cols-12 gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7 space-y-10"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl"
            >
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">
                The Future of School Management
              </span>
            </motion.div>

            <div className="space-y-6">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-6xl md:text-8xl font-black tracking-tighter text-white leading-[0.9]"
              >
                Education <br />
                <span className="text-gradient">Redefined.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-slate-400 max-w-xl font-medium leading-relaxed"
              >
                Experience the most powerful, intuitive, and beautiful school management platform ever built. Optimized for growth, designed for excellence.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-5"
            >
              <Link href="/signup">
                <Button size="lg" className="h-16 px-10 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                  Launch Platform
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/demo">
                <Button size="lg" variant="outline" className="h-16 px-10 rounded-2xl border-white/10 bg-white/5 text-white backdrop-blur-sm hover:bg-white/10 font-bold text-lg transition-all">
                  <Play className="mr-2 h-5 w-5 fill-current" />
                  Watch Demo
                </Button>
              </Link>
            </motion.div>

            {/* Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-12 pt-10 border-t border-white/5"
            >
              {metrics.map((metric, index) => {
                const Icon = metric.icon
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center gap-2 text-3xl font-black text-white tracking-tighter">
                      {metric.value}
                    </div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{metric.label}</div>
                  </div>
                )
              })}
            </motion.div>
          </motion.div>

          {/* Right Content - Visual Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: 5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5 relative hidden lg:block"
          >
            <div className="relative z-10">
              {/* Main App Frame */}
              <motion.div
                animate={floatingAnimation}
                className="relative glass-card border-white/10 p-4 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] bg-slate-900/40"
              >
                <div className="bg-slate-950/80 rounded-[2rem] p-6 aspect-[4/5] overflow-hidden relative">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
                    </div>
                    <div className="h-4 w-32 bg-white/5 rounded-full" />
                  </div>

                  <div className="space-y-6">
                    <div className="h-10 w-2/3 bg-white/10 rounded-xl" />
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-24 bg-primary/20 rounded-2xl border border-primary/20 p-4">
                        <div className="w-8 h-8 rounded-lg bg-primary/40 mb-2" />
                        <div className="h-3 w-12 bg-white/20 rounded-full" />
                      </div>
                      <div className="h-24 bg-indigo-500/20 rounded-2xl border border-indigo-500/20 p-4">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/40 mb-2" />
                        <div className="h-3 w-12 bg-white/20 rounded-full" />
                      </div>
                    </div>
                    <div className="space-y-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                          <div className="w-10 h-10 rounded-full bg-white/10" />
                          <div className="flex-1 space-y-2">
                            <div className="h-3 w-1/2 bg-white/20 rounded-full" />
                            <div className="h-2 w-1/3 bg-white/10 rounded-full" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                </div>
              </motion.div>

              {/* Decorative components */}
              <motion.div
                animate={{
                  y: [-10, 10, -10],
                  transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                }}
                className="absolute -top-12 -right-12 glass p-4 rounded-3xl shadow-2xl border-white/20"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-slate-800 dark:text-white">Active Users</div>
                    <div className="text-xl font-black text-emerald-600">8.5k+</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{
                  y: [10, -10, 10],
                  transition: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }
                }}
                className="absolute -bottom-12 -left-12 glass p-4 rounded-3xl shadow-2xl border-white/20"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-slate-800 dark:text-white">Live Data</div>
                    <div className="text-xl font-black text-primary">Real-time</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden md:block"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 rounded-full border-2 border-white/10 flex items-start justify-center p-2 backdrop-blur-sm">
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-primary"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  )
}

