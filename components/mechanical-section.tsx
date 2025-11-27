"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wrench, Play } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const parts = [
  { codigo: "G.I.1 / G.C.1", pieza: "Garra Inferior/Central", funcion: "Sujeción del objeto" },
  { codigo: "E.C.1 / E.S.1", pieza: "Engranajes", funcion: "Transmisión de fuerza" },
  { codigo: "B.P.1 / B.G.1", pieza: "Base Principal/Giratoria", funcion: "Soporte y Articulación" },
  { codigo: "E.B.1 / E.B.2", pieza: "Engranaje Brazo", funcion: "Movimiento articular" },
  { codigo: "B.E.P.1 / B.E.S.1", pieza: "Barras de Engranaje", funcion: "Conexión mecánica" },
]

export function MechanicalSection() {
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
            <Wrench className="w-4 h-4 mr-2" />
            Diseño CAD
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ingeniería Mecánica</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Estructura modelada en Autodesk Inventor para soportar cargas de 1kg
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-primary" />
                  Listado de Piezas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Pieza</TableHead>
                      <TableHead>Función</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parts.map((part) => (
                      <TableRow key={part.codigo}>
                        <TableCell className="font-mono text-xs text-primary">{part.codigo}</TableCell>
                        <TableCell className="text-sm">{part.pieza}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{part.funcion}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
                  <Play className="w-5 h-5 text-primary" />
                  Ensamblaje 3D
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
                  <iframe
                    src="https://www.youtube.com/embed/oKrxEgu-hVk"
                    title="Ensamblaje 3D del Brazo Robótico"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-4 text-center">
                  Video del ensamblaje completo modelado en Autodesk Inventor
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
