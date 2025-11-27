"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wrench, Play, FileImage, X, ChevronLeft, ChevronRight } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"

const parts = [
  { codigo: "G.I.1 / G.C.1", pieza: "Garra Inferior/Central", funcion: "Sujeción del objeto" },
  { codigo: "E.C.1 / E.S.1", pieza: "Engranajes", funcion: "Transmisión de fuerza" },
  { codigo: "B.P.1 / B.G.1", pieza: "Base Principal/Giratoria", funcion: "Soporte y Articulación" },
  { codigo: "E.B.1 / E.B.2", pieza: "Engranaje Brazo", funcion: "Movimiento articular" },
  { codigo: "B.E.P.1 / B.E.S.1", pieza: "Barras de Engranaje", funcion: "Conexión mecánica" },
]

const planos = [
  {
    id: 1,
    title: "Base Giratoria",
    description: "Base con múltiples soportes de montaje en forma de estrella",
    url: "/images/PLANO-1.jpeg",
  },
  {
    id: 2,
    title: "Carcasa del Brazo",
    description: "Pieza de alojamiento con ranuras y orificios de montaje",
    url: "/images/PLANO-2.jpeg",
  },
  {
    id: 3,
    title: "Carcasa del Brazo (Vista Alternativa)",
    description: "Vistas ortográficas adicionales de la carcasa",
    url: "/images/PLANO-3.jpeg",
  },
  {
    id: 4,
    title: "Garra / Horquilla",
    description: "Mecanismo de agarre tipo montacargas con dientes",
    url: "/images/PLANO-4.jpeg",
  },
]

export function MechanicalSection() {
  const [selectedPlano, setSelectedPlano] = useState<number | null>(null)

  const openLightbox = (index: number) => setSelectedPlano(index)
  const closeLightbox = () => setSelectedPlano(null)
  const nextPlano = () => setSelectedPlano((prev) => (prev !== null ? (prev + 1) % planos.length : 0))
  const prevPlano = () => setSelectedPlano((prev) => (prev !== null ? (prev - 1 + planos.length) % planos.length : 0))

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

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileImage className="w-5 h-5 text-primary" />
                Planos Técnicos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {planos.map((plano, index) => (
                  <motion.button
                    key={plano.id}
                    onClick={() => openLightbox(index)}
                    className="group relative aspect-[4/3] rounded-lg overflow-hidden border border-border bg-muted/50 hover:border-primary/50 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <img
                      src={plano.url || "/placeholder.svg"}
                      alt={plano.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                      <span className="text-white text-sm font-medium">{plano.title}</span>
                      <span className="text-white/70 text-xs">Plano {plano.id}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-4 text-center">
                Haz clic en cualquier plano para ver en detalle
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <AnimatePresence>
          {selectedPlano !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
              onClick={closeLightbox}
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 text-white hover:bg-white/10"
                onClick={closeLightbox}
              >
                <X className="w-6 h-6" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10"
                onClick={(e) => {
                  e.stopPropagation()
                  prevPlano()
                }}
              >
                <ChevronLeft className="w-8 h-8" />
              </Button>

              <motion.div
                key={selectedPlano}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="max-w-5xl max-h-[85vh] flex flex-col items-center"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={planos[selectedPlano].url || "/placeholder.svg"}
                  alt={planos[selectedPlano].title}
                  className="max-w-full max-h-[75vh] object-contain rounded-lg"
                />
                <div className="mt-4 text-center">
                  <h3 className="text-white text-lg font-semibold">
                    Plano {planos[selectedPlano].id}: {planos[selectedPlano].title}
                  </h3>
                  <p className="text-white/70 text-sm mt-1">{planos[selectedPlano].description}</p>
                </div>
              </motion.div>

              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10"
                onClick={(e) => {
                  e.stopPropagation()
                  nextPlano()
                }}
              >
                <ChevronRight className="w-8 h-8" />
              </Button>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {planos.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedPlano(index)
                    }}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === selectedPlano ? "bg-primary" : "bg-white/30 hover:bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
