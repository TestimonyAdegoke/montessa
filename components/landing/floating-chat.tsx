"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Chat Bubble */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 2, type: "spring" }}
        className="fixed bottom-8 right-8 z-50"
      >
        <Button
          size="icon"
          className="w-14 h-14 rounded-full shadow-2xl bg-gradient-to-br from-purple-600 to-blue-600 hover:shadow-purple-500/50"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <MessageCircle className="h-6 w-6" />
          )}
        </Button>

        {/* Ping Animation */}
        {!isOpen && (
          <span className="absolute top-0 right-0 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
          </span>
        )}
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-28 right-8 w-80 sm:w-96 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 text-white">
              <h3 className="font-semibold">Chat with us</h3>
              <p className="text-xs opacity-90">We typically reply in a few minutes</p>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                <p className="text-sm">
                  👋 Hi there! How can we help you today?
                </p>
              </div>
              <div className="text-center text-sm text-muted-foreground">
                <p className="mb-4">This is a demo chat widget</p>
                <div className="flex flex-col gap-2">
                  <Button variant="outline" size="sm" className="w-full">
                    Schedule a Demo
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    View Documentation
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    Contact Sales
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
