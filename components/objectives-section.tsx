"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Target, CheckCircle2, Cog, Layers, Cpu, Code } from "lucide-react"

const specificObjectives = [
  {
    icon: Cog,
    text: "Diseñar estructura mecánica para cargas de 1kg.",
  },
  {
    icon: Layers,
    text: "Desarrollar sistema de deslizamiento y apilamiento controlado.",
  },
  {
    icon: Cpu,
    text: "Integrar electrónica de bajo costo (Arduino, Servos).",
  },
  {
    icon: Code,
    text: "Programar movimientos precisos y repetibles.",
  },
]

export function ObjectivesSection() {
  return (
    <section className="py-20 px-4 bg-secondary/30">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <Badge variant="outline" className="mb-4 border-primary/50 text-primary">
            <Target className="w-4 h-4 mr-2" />
            Metas
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Objetivos del Proyecto</h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="h-full border-primary/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-6 h-6 text-primary" />
                  Objetivo General
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Diseñar e implementar un prototipo de brazo robótico paletizador funcional, económico y capaz de
                  demostrar la viabilidad de la automatización a pequeña escala.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                  Objetivos Específicos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {specificObjectives.map((obj, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: 10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <obj.icon className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{obj.text}</span>
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
