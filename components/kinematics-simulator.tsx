"use client"

import { useState, useCallback, useMemo } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Cpu } from "lucide-react"

// Robot arm segment lengths
const L1 = 100 // Base to shoulder
const L2 = 130 // Shoulder to elbow
const L3 = 130 // Elbow to end effector

export function KinematicsSimulator() {
  const [targetX, setTargetX] = useState(150)
  const [targetY, setTargetY] = useState(150)

  // Inverse kinematics calculation
  const calculateAngles = useCallback((x: number, y: number) => {
    // Distance from base to target
    const dist = Math.sqrt(x * x + y * y)

    // Clamp to reachable space
    const maxReach = L2 + L3
    const minReach = Math.abs(L2 - L3)

    if (dist > maxReach || dist < minReach) {
      // Normalize to max reach if out of bounds
      const scale = dist > maxReach ? maxReach / dist : minReach / dist
      x = x * scale * 0.95
      y = y * scale * 0.95
    }

    // Base angle (rotation around Z-axis)
    const baseAngle = Math.atan2(x, y)

    // Distance in the arm plane
    const r = Math.sqrt(x * x + y * y)

    // Using law of cosines for the two-link arm
    const cosElbow = (r * r - L2 * L2 - L3 * L3) / (2 * L2 * L3)
    const clampedCosElbow = Math.max(-1, Math.min(1, cosElbow))
    const elbowAngle = Math.acos(clampedCosElbow)

    // Shoulder angle
    const shoulderAngle = Math.atan2(y, x) - Math.atan2(L3 * Math.sin(elbowAngle), L2 + L3 * Math.cos(elbowAngle))

    return {
      base: (baseAngle * 180) / Math.PI,
      shoulder: (shoulderAngle * 180) / Math.PI,
      elbow: (elbowAngle * 180) / Math.PI,
    }
  }, [])

  const angles = useMemo(() => calculateAngles(targetX, targetY), [targetX, targetY, calculateAngles])

  // Calculate joint positions for SVG
  const jointPositions = useMemo(() => {
    const shoulderRad = (angles.shoulder * Math.PI) / 180
    const elbowRad = (angles.elbow * Math.PI) / 180

    // Base position (center of SVG)
    const baseX = 200
    const baseY = 350

    // Shoulder joint (end of L1)
    const shoulderX = baseX
    const shoulderY = baseY - L1

    // Elbow joint (end of L2)
    const elbowX = shoulderX + L2 * Math.cos(Math.PI / 2 - shoulderRad)
    const elbowY = shoulderY - L2 * Math.sin(Math.PI / 2 - shoulderRad)

    // End effector (end of L3)
    const combinedAngle = shoulderRad - (Math.PI - elbowRad)
    const endX = elbowX + L3 * Math.cos(Math.PI / 2 - combinedAngle)
    const endY = elbowY - L3 * Math.sin(Math.PI / 2 - combinedAngle)

    return { baseX, baseY, shoulderX, shoulderY, elbowX, elbowY, endX, endY }
  }, [angles])

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
            Interactivo
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Simulación de Cinemática Inversa</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Controla la posición del efector final y observa cómo el brazo calcula los ángulos necesarios
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* SVG Visualization */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <svg viewBox="0 0 400 400" className="w-full h-auto bg-card" style={{ maxHeight: "400px" }}>
                  {/* Grid lines */}
                  <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path
                        d="M 20 0 L 0 0 0 20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="0.5"
                        className="text-primary/10"
                      />
                    </pattern>
                  </defs>
                  <rect width="400" height="400" fill="url(#grid)" />

                  {/* Base platform */}
                  <rect
                    x={jointPositions.baseX - 40}
                    y={jointPositions.baseY}
                    width="80"
                    height="20"
                    rx="4"
                    className="fill-muted stroke-primary"
                    strokeWidth="2"
                  />

                  {/* Arm segments */}
                  {/* Segment 1: Base to Shoulder */}
                  <motion.line
                    x1={jointPositions.baseX}
                    y1={jointPositions.baseY}
                    x2={jointPositions.shoulderX}
                    y2={jointPositions.shoulderY}
                    className="stroke-muted-foreground"
                    strokeWidth="12"
                    strokeLinecap="round"
                    initial={false}
                    animate={{
                      x2: jointPositions.shoulderX,
                      y2: jointPositions.shoulderY,
                    }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                  />

                  {/* Segment 2: Shoulder to Elbow */}
                  <motion.line
                    x1={jointPositions.shoulderX}
                    y1={jointPositions.shoulderY}
                    x2={jointPositions.elbowX}
                    y2={jointPositions.elbowY}
                    className="stroke-primary"
                    strokeWidth="10"
                    strokeLinecap="round"
                    initial={false}
                    animate={{
                      x1: jointPositions.shoulderX,
                      y1: jointPositions.shoulderY,
                      x2: jointPositions.elbowX,
                      y2: jointPositions.elbowY,
                    }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                  />

                  {/* Segment 3: Elbow to End Effector */}
                  <motion.line
                    x1={jointPositions.elbowX}
                    y1={jointPositions.elbowY}
                    x2={jointPositions.endX}
                    y2={jointPositions.endY}
                    className="stroke-primary/70"
                    strokeWidth="8"
                    strokeLinecap="round"
                    initial={false}
                    animate={{
                      x1: jointPositions.elbowX,
                      y1: jointPositions.elbowY,
                      x2: jointPositions.endX,
                      y2: jointPositions.endY,
                    }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                  />

                  {/* Joints */}
                  <circle
                    cx={jointPositions.baseX}
                    cy={jointPositions.baseY}
                    r="8"
                    className="fill-secondary stroke-primary"
                    strokeWidth="2"
                  />
                  <motion.circle
                    cx={jointPositions.shoulderX}
                    cy={jointPositions.shoulderY}
                    r="7"
                    className="fill-secondary stroke-primary"
                    strokeWidth="2"
                    initial={false}
                    animate={{
                      cx: jointPositions.shoulderX,
                      cy: jointPositions.shoulderY,
                    }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                  />
                  <motion.circle
                    cx={jointPositions.elbowX}
                    cy={jointPositions.elbowY}
                    r="6"
                    className="fill-secondary stroke-primary"
                    strokeWidth="2"
                    initial={false}
                    animate={{
                      cx: jointPositions.elbowX,
                      cy: jointPositions.elbowY,
                    }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                  />

                  {/* End effector (gripper) */}
                  <motion.g
                    initial={false}
                    animate={{
                      x: jointPositions.endX - 200,
                      y: jointPositions.endY - 200,
                    }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                  >
                    <circle
                      cx="200"
                      cy="200"
                      r="10"
                      className="fill-primary stroke-primary-foreground"
                      strokeWidth="2"
                    />
                    <circle cx="200" cy="200" r="4" className="fill-primary-foreground" />
                  </motion.g>

                  {/* Target indicator */}
                  <motion.circle
                    cx={200 + targetX - 150}
                    cy={350 - targetY}
                    r="6"
                    className="fill-none stroke-primary/50"
                    strokeWidth="2"
                    strokeDasharray="4 2"
                    initial={false}
                    animate={{
                      cx: 200 + (targetX - 150) * 0.8,
                      cy: 350 - targetY * 0.8,
                    }}
                  />
                </svg>
              </CardContent>
            </Card>
          </motion.div>

          {/* Controls and Data */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Sliders */}
            <Card>
              <CardHeader>
                <CardTitle>Controles de Posición</CardTitle>
                <CardDescription>Ajusta las coordenadas del efector final</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">Eje X (Alcance)</label>
                    <span className="font-mono text-sm text-primary">{targetX} mm</span>
                  </div>
                  <Slider
                    value={[targetX]}
                    onValueChange={(value) => setTargetX(value[0])}
                    min={50}
                    max={250}
                    step={1}
                    className="w-full"
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">Eje Y (Altura)</label>
                    <span className="font-mono text-sm text-primary">{targetY} mm</span>
                  </div>
                  <Slider
                    value={[targetY]}
                    onValueChange={(value) => setTargetY(value[0])}
                    min={50}
                    max={300}
                    step={1}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Calculated Angles */}
            <Card>
              <CardHeader>
                <CardTitle>Ángulos Calculados</CardTitle>
                <CardDescription>Resultado de la cinemática inversa</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 rounded-lg bg-secondary">
                    <p className="text-xs text-muted-foreground mb-1">Ángulo Base</p>
                    <p className="font-mono text-2xl text-primary">{angles.base.toFixed(1)}°</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-secondary">
                    <p className="text-xs text-muted-foreground mb-1">Ángulo Hombro</p>
                    <p className="font-mono text-2xl text-primary">{angles.shoulder.toFixed(1)}°</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-secondary">
                    <p className="text-xs text-muted-foreground mb-1">Ángulo Codo</p>
                    <p className="font-mono text-2xl text-primary">{angles.elbow.toFixed(1)}°</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Formula */}
            <Card className="border-primary/30">
              <CardContent className="py-4">
                <p className="text-xs text-muted-foreground mb-2">Fórmula de Cinemática Inversa:</p>
                <code className="text-sm font-mono text-primary">θ₂ = arccos((x² + y² - L₂² - L₃²) / 2L₂L₃)</code>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
