"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, Wallet, Shield, GraduationCap, CheckCircle2 } from "lucide-react"

const impacts = [
  {
    icon: Wallet,
    title: "Accesibilidad",
    description: "Uso de componentes estándar y bajo costo.",
    color: "text-green-500",
  },
  {
    icon: Shield,
    title: "Seguridad",
    description: "Reducción directa de la carga física sobre operarios.",
    color: "text-blue-500",
  },
  {
    icon: GraduationCap,
    title: "Educación y Desarrollo",
    description: "Plataforma base para futuras mejoras industriales.",
    color: "text-purple-500",
  },
]

export function JustificationSection() {
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
            <Lightbulb className="w-4 h-4 mr-2" />
            Fundamento
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Justificación e Impacto</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Razones que respaldan el desarrollo de este proyecto
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {impacts.map((impact, index) => (
            <motion.div
              key={impact.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="h-full hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                      <impact.icon className={`w-6 h-6 ${impact.color}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <h3 className="font-semibold">{impact.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">{impact.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
