"use client"

import { useState, useCallback, useMemo } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Cpu, AlertCircle } from "lucide-react"

// Dimensiones del brazo (en mm o unidades relativas)
const L1 = 100 // Base (altura fija del suelo al hombro)
const L2 = 130 // Hombro a Codo
const L3 = 130 // Codo a Efector Final

export function KinematicsSimulator() {
  // Estado inicial: Posición X, Y deseada desde el origen (suelo, centro)
  const [targetX, setTargetX] = useState(150)
  const [targetY, setTargetY] = useState(150)

  // --- LÓGICA DE CINEMÁTICA INVERSA (IK) ---
  const calculateAngles = useCallback((x: number, y: number) => {
    // 1. Transformación de Coordenadas: Del Mundo al Hombro
    // Restamos L1 para trabajar en el sistema de referencia del hombro (Joint 2)
    const dy = y - L1 
    const dx = x 

    // Distancia desde el hombro al objetivo
    const dist = Math.sqrt(dx * dx + dy * dy)

    // Límites mecánicos
    const maxReach = L2 + L3
    const minReach = Math.abs(L2 - L3)
    let safeX = dx
    let safeY = dy

    // Si el objetivo está fuera de alcance, proyectamos al punto más cercano válido
    if (dist > maxReach || dist < 0.1) { // 0.1 evita división por cero
      const scale = (dist > maxReach ? maxReach : minReach) / dist
      safeX = dx * scale * 0.99 // 0.99 para evitar singularidad numérica extrema
      safeY = dy * scale * 0.99
    }

    // Recalculamos distancia segura
    const r = Math.sqrt(safeX * safeX + safeY * safeY)

    // 2. Ley de Cosenos para el Codo (Theta 2)
    // c² = a² + b² - 2ab cos(C)
    const cosElbow = (r * r - L2 * L2 - L3 * L3) / (2 * L2 * L3)
    // Clamp para seguridad matemática
    const clampedCosElbow = Math.max(-1, Math.min(1, cosElbow)) 
    // Configuración "Codo Arriba" (negativo) o "Codo Abajo" (positivo). Usamos codo abajo (positivo).
    const elbowAngleRad = -Math.acos(clampedCosElbow) 

    // 3. Cálculo del Hombro (Theta 1)
    // Ángulo geométrico al punto (atan2) +/- corrección por la flexión del codo
    const alpha = Math.atan2(safeY, safeX)
    const beta = Math.atan2(L3 * Math.sin(elbowAngleRad), L2 + L3 * Math.cos(elbowAngleRad))
    const shoulderAngleRad = alpha - beta

    return {
      shoulder: shoulderAngleRad, // Radianes para cálculos internos
      elbow: elbowAngleRad,       // Radianes para cálculos internos
      shoulderDeg: (shoulderAngleRad * 180) / Math.PI, // Grados para UI
      elbowDeg: (elbowAngleRad * 180) / Math.PI,       // Grados para UI
      isUnreachable: dist > maxReach
    }
  }, [])

  const ikResult = useMemo(() => calculateAngles(targetX, targetY), [targetX, targetY, calculateAngles])

  // --- CÁLCULO DE POSICIONES PARA SVG (FORWARD KINEMATICS PARA DIBUJAR) ---
  const jointPositions = useMemo(() => {
    const { shoulder, elbow } = ikResult

    // Origen del SVG (Centro inferior)
    const baseX = 200
    const baseY = 350 // "Suelo" visual

    // Posición del Hombro (fijo sobre la base L1)
    // Nota: En SVG, Y crece hacia abajo, por eso restamos para ir "arriba"
    const shoulderX = baseX
    const shoulderY = baseY - L1

    // Posición del Codo
    // x = x0 + L * cos(theta)
    // y = y0 - L * sin(theta) (Menos porque Y SVG es invertido)
    const elbowX = shoulderX + L2 * Math.cos(shoulder)
    const elbowY = shoulderY - L2 * Math.sin(shoulder)

    // Posición del Efector Final
    // El ángulo absoluto del antebrazo es (theta1 + theta2)
    const absoluteElbowAngle = shoulder + elbow
    const endX = elbowX + L3 * Math.cos(absoluteElbowAngle)
    const endY = elbowY - L3 * Math.sin(absoluteElbowAngle)

    return { baseX, baseY, shoulderX, shoulderY, elbowX, elbowY, endX, endY }
  }, [ikResult])

  return (
    <section id="simulador" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <Badge variant="outline" className="mb-4 border-primary/50 text-primary">
            <Cpu className="w-4 h-4 mr-2" />
            Ingeniería Mecatrónica
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Simulador de Brazo 2-DOF</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Cinemática Inversa en tiempo real con corrección de sistema de referencia.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* VISUALIZACIÓN */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="overflow-hidden bg-slate-950 border-slate-800">
              <CardContent className="p-0 relative">
                {/* Indicador de error si está fuera de alcance */}
                {ikResult.isUnreachable && (
                  <div className="absolute top-4 right-4 bg-red-500/10 text-red-500 px-3 py-1 rounded-full text-xs font-bold flex items-center border border-red-500/20">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Fuera de Alcance
                  </div>
                )}
                
                <svg viewBox="0 0 400 400" className="w-full h-auto" style={{ maxHeight: "400px" }}>
                  {/* Grid */}
                  <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="400" height="400" fill="url(#grid)" />

                  {/* Eje Y (Suelo) */}
                  <line x1="0" y1="350" x2="400" y2="350" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />

                  {/* L1: Base Estática */}
                  <rect
                    x={jointPositions.baseX - 15}
                    y={jointPositions.shoulderY}
                    width="30"
                    height={L1}
                    className="fill-slate-800 stroke-slate-600"
                    strokeWidth="2"
                  />
                   {/* Base Foot */}
                   <rect
                    x={jointPositions.baseX - 30}
                    y={jointPositions.baseY - 5}
                    width="60"
                    height="10"
                    className="fill-slate-700"
                    rx="2"
                  />

                  {/* L2: Hombro a Codo */}
                  <motion.line
                    animate={{
                      x1: jointPositions.shoulderX,
                      y1: jointPositions.shoulderY,
                      x2: jointPositions.elbowX,
                      y2: jointPositions.elbowY,
                    }}
                    className="stroke-blue-500"
                    strokeWidth="12"
                    strokeLinecap="round"
                  />

                  {/* L3: Codo a Efector */}
                  <motion.line
                    animate={{
                      x1: jointPositions.elbowX,
                      y1: jointPositions.elbowY,
                      x2: jointPositions.endX,
                      y2: jointPositions.endY,
                    }}
                    className="stroke-indigo-400"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />

                  {/* Joints (Articulaciones) */}
                  <circle cx={jointPositions.shoulderX} cy={jointPositions.shoulderY} r="6" fill="white" />
                  <motion.circle 
                    animate={{ cx: jointPositions.elbowX, cy: jointPositions.elbowY }} 
                    r="5" 
                    fill="white" 
                  />

                  {/* Efector Final */}
                  <motion.circle 
                    animate={{ cx: jointPositions.endX, cy: jointPositions.endY }} 
                    r="8" 
                    className="fill-green-400 stroke-white" 
                    strokeWidth="2"
                  />

                  {/* TARGET VISUAL (Objetivo) */}
                  {/* Ahora mapea 1:1 con las coordenadas matemáticas */}
                  <motion.g
                     animate={{
                      x: 200 + targetX, // 200 es el centro X
                      y: 350 - targetY  // 350 es el suelo Y
                    }}
                  >
                    <circle r="5" className="fill-none stroke-green-500" strokeWidth="2" strokeDasharray="2 2" />
                    <line x1="-5" y1="0" x2="5" y2="0" className="stroke-green-500/50" />
                    <line x1="0" y1="-5" x2="0" y2="5" className="stroke-green-500/50" />
                  </motion.g>

                  {/* Línea guía fantasma al objetivo */}
                  <motion.line
                    animate={{
                      x1: jointPositions.endX,
                      y1: jointPositions.endY,
                      x2: 200 + targetX,
                      y2: 350 - targetY
                    }}
                    stroke="rgba(0, 255, 0, 0.2)"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />

                </svg>
              </CardContent>
            </Card>
          </motion.div>

          {/* CONTROLES */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle>Control de Coordenadas</CardTitle>
                <CardDescription>Cinemática Inversa (X, Y → Ángulos)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Slider X */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">Distancia X (Alcance)</label>
                    <span className="font-mono text-sm text-primary">{targetX} mm</span>
                  </div>
                  <Slider
                    value={[targetX]}
                    onValueChange={(v) => setTargetX(v[0])}
                    min={-200} // Permitir ir hacia atrás
                    max={250}
                    step={1}
                  />
                </div>

                {/* Slider Y */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">Altura Y (desde el suelo)</label>
                    <span className="font-mono text-sm text-primary">{targetY} mm</span>
                  </div>
                  <Slider
                    value={[targetY]}
                    onValueChange={(v) => setTargetY(v[0])}
                    min={0}
                    max={350}
                    step={1}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Resultados Numéricos */}
            <Card className="bg-secondary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Datos del Robot</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-background rounded border">
                    <p className="text-xs text-muted-foreground">Theta 1 (Hombro)</p>
                    <p className="text-xl font-mono font-bold text-blue-500">
                      {ikResult.shoulderDeg.toFixed(1)}°
                    </p>
                  </div>
                  <div className="p-3 bg-background rounded border">
                    <p className="text-xs text-muted-foreground">Theta 2 (Codo)</p>
                    <p className="text-xl font-mono font-bold text-indigo-500">
                      {ikResult.elbowDeg.toFixed(1)}°
                    </p>
                  </div>
                </div>
                <div className="mt-4 text-xs font-mono text-muted-foreground">
                  <p>L1 (Base): {L1}mm</p>
                  <p>L2 (Brazo): {L2}mm</p>
                  <p>L3 (Antebrazo): {L3}mm</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  )
}