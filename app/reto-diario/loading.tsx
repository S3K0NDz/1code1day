"use client"

import { Loader2 } from "lucide-react"
import InteractiveGridBackground from "@/components/interactive-grid-background"
import { motion } from "framer-motion"

export default function Loading() {
  return (
    <InteractiveGridBackground>
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          className="text-center bg-black/30 backdrop-blur-sm p-8 rounded-xl border border-gray-800/50 shadow-2xl"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="flex items-center justify-center mb-6"
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-white text-black px-4 py-2 text-3xl font-bold">1code</div>
            <div className="text-white text-3xl font-bold px-2">1day</div>
          </motion.div>
          <motion.div
            className="flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-75 animate-pulse"></div>
              <Loader2 className="h-10 w-10 animate-spin mr-2 relative" />
            </div>
            <span className="text-lg ml-3">Cargando el reto diario...</span>
          </motion.div>
        </motion.div>
      </div>
    </InteractiveGridBackground>
  )
}

