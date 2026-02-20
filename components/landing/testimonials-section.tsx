"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Star, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const testimonials = [
  {
    name: "Dr. Sarah Mitchell",
    role: "Head Teacher, Bloom Montessori School",
    content: "Montessa has transformed how we manage our school. The Individual Learning Plans feature perfectly aligns with our Montessori approach, and parents love the real-time updates.",
    rating: 5,
    stat: "+40% parent engagement",
    initials: "SM",
    color: "from-purple-500 to-pink-500",
  },
  {
    name: "Michael Chen",
    role: "Director, Little Explorers Academy",
    content: "The attendance system is a game-changer. QR codes and guardian verification give us peace of mind, and the analytics help us make data-driven decisions.",
    rating: 5,
    stat: "+25% operational efficiency",
    initials: "MC",
    color: "from-blue-500 to-cyan-500",
  },
  {
    name: "Emily Rodriguez",
    role: "Administrator, Sunshine Elementary",
    content: "We've been using Montessa for 6 months and couldn't be happier. The multi-tenant security ensures our data is safe, and the interface is incredibly intuitive.",
    rating: 5,
    stat: "100% uptime achieved",
    initials: "ER",
    color: "from-green-500 to-emerald-500",
  },
  {
    name: "James Wilson",
    role: "Principal, Cambridge Kids Academy",
    content: "The parent portal has significantly improved communication. Parents can track their child's progress, view photos, and message teachers all in one place.",
    rating: 5,
    stat: "+60% parent satisfaction",
    initials: "JW",
    color: "from-orange-500 to-red-500",
  },
]

export default function TestimonialsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [activeIndex, setActiveIndex] = useState(0)

  const next = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prev = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <section ref={ref} className="relative py-24 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300/20 dark:bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-300/20 dark:bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4 mb-16"
        >
          <span className="inline-block text-sm font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
            Testimonials
          </span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Trusted by Schools Worldwide
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            See what educators are saying about Montessa
          </p>
        </motion.div>

        {/* Desktop View - Grid */}
        <div className="hidden md:grid md:grid-cols-2 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-8 space-y-6">
                  {/* Rating */}
                  <div className="flex gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  {/* Content */}
                  <p className="text-lg leading-relaxed text-foreground">
                    &quot;{testimonial.content}&quot;
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-4 pt-4 border-t">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${testimonial.color} flex items-center justify-center text-white font-semibold shadow-lg`}>
                      {testimonial.initials}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                        {testimonial.stat}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Mobile View - Carousel */}
        <div className="md:hidden relative">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="shadow-xl">
              <CardContent className="p-6 space-y-6">
                <div className="flex gap-1">
                  {[...Array(testimonials[activeIndex].rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                <p className="text-base leading-relaxed">
                  &quot;{testimonials[activeIndex].content}&quot;
                </p>

                <div className="flex items-center gap-3 pt-4 border-t">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${testimonials[activeIndex].color} flex items-center justify-center text-white font-semibold text-sm`}>
                    {testimonials[activeIndex].initials}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{testimonials[activeIndex].name}</div>
                    <div className="text-xs text-muted-foreground">{testimonials[activeIndex].role}</div>
                  </div>
                </div>
                <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                  {testimonials[activeIndex].stat}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Navigation */}
          <div className="flex justify-center gap-4 mt-6">
            <Button variant="outline" size="icon" onClick={prev}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === activeIndex ? "w-8 bg-purple-600" : "bg-gray-300 dark:bg-gray-700"
                  }`}
                />
              ))}
            </div>
            <Button variant="outline" size="icon" onClick={next}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
