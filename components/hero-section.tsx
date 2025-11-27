"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bot, ChevronDown } from "lucide-react"

const authors = [
  "Eduardo S. Millones Vasquez",
  "Marcos J. Vicente Bautista",
  "Cristopher V. Atahuaman Carhuaricra",
  "Saeit S. Askaya Ramirez",
]

export function HeroSection() {
  const scrollToSimulator = () => {
    document.getElementById("simulador")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 2 }}
          className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 2, delay: 0.5 }}
          className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Badge variant="outline" className="mb-6 px-4 py-2 text-sm border-primary/50 text-primary">
            <Bot className="w-4 h-4 mr-2" />
            Proyecto T3 - Ingeniería Mecatrónica
          </Badge>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-balance"
        >
          Brazo Robótico <span className="text-primary">Paletizador</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl md:text-2xl text-muted-foreground mb-8 text-pretty"
        >
          Automatización accesible y de bajo costo para PYMES con Arduino
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-2 mb-10"
        >
          {authors.map((author, index) => (
            <span key={author} className="text-sm text-muted-foreground font-mono">
              {author}
              {index < authors.length - 1 && <span className="mx-2 text-primary">•</span>}
            </span>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Button size="lg" onClick={scrollToSimulator} className="gap-2 text-lg px-8">
            Ver Simulación
            <ChevronDown className="w-5 h-5" />
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 text-sm text-muted-foreground"
        >
          Universidad Privada del Norte (UPN) • Lima, Perú • 2025
        </motion.p>
      </div>
    </section>
  )
}
