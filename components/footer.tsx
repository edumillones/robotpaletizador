"use client"

import { motion } from "framer-motion"
import { Bot } from "lucide-react"

export function Footer() {
  return (
    <footer className="py-12 px-4 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-2">
            <Bot className="w-6 h-6 text-primary" />
            <span className="font-semibold">Brazo Robótico Paletizador</span>
          </div>

          <p className="text-sm text-muted-foreground text-center">© 2025 Grupo 3 - UPN. Ingeniería Mecatrónica.</p>

          <p className="text-xs text-muted-foreground font-mono">Lima, Perú</p>
        </motion.div>
      </div>
    </footer>
  )
}
