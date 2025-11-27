"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Settings, ExternalLink } from "lucide-react"

export function GearsSimulator() {
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
            <Settings className="w-4 h-4 mr-2" />
            Interactivo
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Mecánica Avanzada: Ejes Planetarios</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Comprende el funcionamiento interno de la transmisión mecánica. Interactúa con el simulador para explorar
            diferentes configuraciones de engranajes.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary animate-spin-slow" />
                  Simulador de Engranajes
                </span>
                <a
                  href="https://www.thecatalystis.com/gears/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
                >
                  Abrir en nueva pestaña
                  <ExternalLink className="w-4 h-4" />
                </a>
              </CardTitle>
              <CardDescription>
                Haz clic y arrastra los engranajes para modificar la configuración del tren de transmisión
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative w-full rounded-lg overflow-hidden bg-white" style={{ height: "600px" }}>
                <iframe
                  src="https://www.thecatalystis.com/gears/"
                  title="Simulador de Engranajes Planetarios"
                  className="absolute inset-0 w-full h-full border-0"
                  sandbox="allow-scripts allow-same-origin"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
