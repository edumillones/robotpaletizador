"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Zap, Cpu, CircuitBoard, Settings2, AlertCircle } from "lucide-react"

const components = [
  {
    id: "fuente",
    title: "Fuente 12V 10A",
    description: "Alimentación principal",
    tooltip: "Fuente conmutada que aísla al robot de fluctuaciones de red. Trabaja al 74% de capacidad.",
    icon: Zap,
    position: "left",
  },
  {
    id: "converter",
    title: "Convertidor DC-DC",
    description: "Step Down a 6V",
    tooltip: "Reduce voltaje de 12V a 6V aumentando la corriente disponible para mayor torque en los servos.",
    icon: Settings2,
    position: "center-left",
  },
  {
    id: "arduino",
    title: "Arduino UNO",
    description: "Microcontrolador",
    tooltip: "Cerebro del sistema. Aislado del circuito de potencia para evitar ruido eléctrico y reinicios.",
    icon: Cpu,
    position: "center",
  },
  {
    id: "pca9685",
    title: "PCA9685",
    description: "Driver I2C PWM",
    tooltip: "Controlador de 16 canales PWM. Permite controlar hasta 16 servos con solo 2 pines del Arduino.",
    icon: CircuitBoard,
    position: "center-right",
  },
  {
    id: "servos",
    title: "Servos MG946 & MG90S",
    description: "Actuadores",
    tooltip: "5x MG946 (13 kg·cm) para el brazo + 1x MG90S (1.8 kg·cm) para la garra con protección de diodo.",
    icon: Settings2,
    position: "right",
  },
]

export function ElectronicsSection() {
  const [activeComponent, setActiveComponent] = useState<string | null>(null)

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
            <CircuitBoard className="w-4 h-4 mr-2" />
            Electrónica
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Arquitectura Electrónica</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Sistema de alimentación distribuida que separa el circuito de potencia del control
          </p>
        </motion.div>

        {/* Flow Diagram */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Card>
            <CardContent className="p-6 md:p-8">
              <TooltipProvider>
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-2">
                  {components.map((component, index) => (
                    <div key={component.id} className="flex items-center gap-2 md:gap-4">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onHoverStart={() => setActiveComponent(component.id)}
                            onHoverEnd={() => setActiveComponent(null)}
                            className={`
                              relative p-4 md:p-6 rounded-lg border-2 cursor-pointer transition-colors
                              ${
                                activeComponent === component.id
                                  ? "border-primary bg-primary/10"
                                  : "border-border bg-secondary hover:border-primary/50"
                              }
                            `}
                          >
                            <component.icon className="w-6 h-6 md:w-8 md:h-8 text-primary mx-auto mb-2" />
                            <p className="text-xs md:text-sm font-medium text-center whitespace-nowrap">
                              {component.title}
                            </p>
                            <p className="text-[10px] md:text-xs text-muted-foreground text-center">
                              {component.description}
                            </p>
                          </motion.div>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="max-w-xs">
                          <p>{component.tooltip}</p>
                        </TooltipContent>
                      </Tooltip>

                      {/* Arrow connector */}
                      {index < components.length - 1 && (
                        <motion.svg
                          width="40"
                          height="24"
                          viewBox="0 0 40 24"
                          className="hidden md:block text-primary"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <path
                            d="M0 12 L30 12 M25 7 L30 12 L25 17"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </motion.svg>
                      )}
                    </div>
                  ))}
                </div>
              </TooltipProvider>
            </CardContent>
          </Card>
        </motion.div>

        {/* Additional Info Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  Cálculo de Consumo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground">Corriente pico total</span>
                  <span className="font-mono text-primary">13.3 A</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground">Potencia requerida (6V)</span>
                  <span className="font-mono text-primary">79.8 W</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground">Corriente desde fuente 12V</span>
                  <span className="font-mono text-primary">7.4 A</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">Capacidad utilizada</span>
                  <Badge variant="outline" className="border-green-500 text-green-500">
                    74%
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="border-yellow-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                  Protección del MG90S
                </CardTitle>
                <CardDescription>Truco del diodo para la garra</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  El servo MG90S de la garra opera a máximo 6V pero funciona óptimamente a 5V. Al conectar los MG946 a
                  6V para máximo torque, se implementa una protección:
                </p>
                <div className="p-4 rounded-lg bg-secondary font-mono text-sm">
                  <p className="text-yellow-500 mb-2">// Diodo 1N4007 en serie</p>
                  <p className="text-muted-foreground">
                    Voltaje entrada: <span className="text-primary">6.0V</span>
                  </p>
                  <p className="text-muted-foreground">
                    Caída del diodo: <span className="text-yellow-500">-0.7V</span>
                  </p>
                  <p className="text-foreground">
                    Voltaje al servo: <span className="text-green-500">5.3V</span> ✓
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
