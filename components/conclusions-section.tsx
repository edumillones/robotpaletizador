"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileCheck, Zap, Shield, Coins } from "lucide-react"

const conclusions = [
  {
    icon: Zap,
    title: "Eficiencia Energética",
    description: "Fuente de 12V con convertidor reductor superior a fuentes directas de 6V.",
    color: "text-yellow-500",
    borderColor: "border-yellow-500/30",
  },
  {
    icon: Shield,
    title: "Robustez",
    description: "Separación de circuitos de potencia y control eliminó ruido eléctrico.",
    color: "text-blue-500",
    borderColor: "border-blue-500/30",
  },
  {
    icon: Coins,
    title: "Viabilidad Económica",
    description: "Validación de sistema funcional con componentes genéricos.",
    color: "text-green-500",
    borderColor: "border-green-500/30",
  },
]

export function ConclusionsSection() {
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
          <Badge variant="outline" className="mb-4 border-primary/50 text-primary">
            <FileCheck className="w-4 h-4 mr-2" />
            Resultados
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Conclusiones del Proyecto</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Hallazgos principales tras el diseño e implementación del sistema
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {conclusions.map((conclusion, index) => (
            <motion.div
              key={conclusion.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className={`h-full ${conclusion.borderColor}`}>
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center`}>
                    <conclusion.icon className={`w-8 h-8 ${conclusion.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{conclusion.title}</h3>
                  <p className="text-sm text-muted-foreground">{conclusion.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
