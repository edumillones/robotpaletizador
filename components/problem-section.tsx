"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Hourglass, DollarSign, Quote } from "lucide-react"

const problems = [
  {
    icon: AlertTriangle,
    title: "Riesgos de Salud",
    description: "El paletizado manual causa lesiones en espalda y articulaciones debido a movimientos repetitivos.",
    color: "text-red-500",
    borderColor: "border-red-500/30",
  },
  {
    icon: Hourglass,
    title: "Ineficiencia",
    description: "El proceso manual es lento, impreciso y propenso a errores humanos.",
    color: "text-yellow-500",
    borderColor: "border-yellow-500/30",
  },
  {
    icon: DollarSign,
    title: "Costo de Barrera",
    description: "Los robots industriales actuales son extremadamente costosos para las PYMES.",
    color: "text-orange-500",
    borderColor: "border-orange-500/30",
  },
]

export function ProblemSection() {
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
          <Badge variant="outline" className="mb-4 border-red-500/50 text-red-500">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Contexto
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Realidad Problemática</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Desafíos actuales en la industria del paletizado que motivan este proyecto
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {problems.map((problem, index) => (
            <motion.div
              key={problem.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className={`h-full ${problem.borderColor}`}>
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center`}>
                    <problem.icon className={`w-8 h-8 ${problem.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{problem.title}</h3>
                  <p className="text-sm text-muted-foreground">{problem.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <Quote className="w-10 h-10 text-primary flex-shrink-0 mt-1" />
                <blockquote className="text-lg md:text-xl italic text-foreground">
                  "La automatización es clave para reducir riesgos y aumentar la competitividad, pero falta
                  accesibilidad."
                </blockquote>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
