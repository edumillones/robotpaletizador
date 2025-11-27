"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Bot, Check, X } from "lucide-react"

const manualProblems = [
  "Riesgo de lesiones musculoesqueléticas",
  "Proceso lento e ineficiente",
  "Errores frecuentes en apilamiento",
  "Alto costo de mano de obra",
]

const roboticBenefits = [
  "Alta precisión y repetibilidad",
  "Seguridad laboral garantizada",
  "Bajo costo (< $100 USD)",
  "Fácil mantenimiento",
]

export function ComparisonSection() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">¿Por qué automatizar?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Comparativa entre el proceso manual tradicional y nuestra solución robótica
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Manual Palletizing Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="h-full border-destructive/30 bg-destructive/5">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-destructive/10">
                    <AlertTriangle className="w-6 h-6 text-destructive" />
                  </div>
                  <CardTitle className="text-2xl">Paletizado Manual</CardTitle>
                </div>
                <CardDescription>Proceso tradicional con múltiples desventajas</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {manualProblems.map((problem, index) => (
                    <motion.li
                      key={problem}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <X className="w-5 h-5 text-destructive shrink-0" />
                      <span className="text-muted-foreground">{problem}</span>
                    </motion.li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          {/* Robotic Solution Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="h-full border-primary/30 bg-primary/5">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Bot className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">Solución Robótica</CardTitle>
                </div>
                <CardDescription>Automatización accesible para PYMES</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {roboticBenefits.map((benefit, index) => (
                    <motion.li
                      key={benefit}
                      initial={{ opacity: 0, x: 10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <Check className="w-5 h-5 text-primary shrink-0" />
                      <span className="text-muted-foreground">{benefit}</span>
                    </motion.li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
