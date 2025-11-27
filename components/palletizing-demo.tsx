"use client"

import { useState, useCallback, useMemo, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, RotateCcw, Package, Layers } from "lucide-react"

// Robot arm segment lengths
const L1 = 80
const L2 = 100
const L3 = 100

const GROUND_LEVEL = 20 // Y coordinate where the floor is (in arm coordinate system, lower Y = lower position)
const FORK_OFFSET = 25 // Visual offset so forks appear just above ground
const PALLET_HEIGHT = 40 // Height of pallet surface above ground

// Scene positions - recalculated for proper ground-level interaction
const HOME_POS = { x: 150, y: 180 }
const BAG_X = 80 // X position of bag origin
const PALLET_X = 280 // X position of pallet

const APPROACH_X = BAG_X - 30 // Position before scooping (left of bag)
const LIFT_HEIGHT = 160 // Height when transporting

type CycleState =
  | "idle"
  | "pre_position"
  | "lowering_to_floor"
  | "scooping"
  | "lifting"
  | "traveling_to_pallet"
  | "lowering_to_pallet"
  | "retracting"
  | "returning"
  | "complete"

const stateLabels: Record<CycleState, string> = {
  idle: "Esperando",
  pre_position: "Pre-posicionando",
  lowering_to_floor: "Descendiendo al piso",
  scooping: "Insertando horquilla",
  lifting: "Elevando carga",
  traveling_to_pallet: "Trasladando a pallet",
  lowering_to_pallet: "Descendiendo a pallet",
  retracting: "Retrayendo horquilla",
  returning: "Regresando a inicio",
  complete: "Ciclo completado",
}

export function PalletizingDemo() {
  const [cycleState, setCycleState] = useState<CycleState>("idle")
  const [targetPos, setTargetPos] = useState(HOME_POS)
  const [isCarrying, setIsCarrying] = useState(false)
  const [bagDropped, setBagDropped] = useState(false)
  const [bagFinalPos, setBagFinalPos] = useState({ x: BAG_X, y: 0 })
  const [floorReached, setFloorReached] = useState(false)
  const [actionLog, setActionLog] = useState("Sistema listo. Presione iniciar.")
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Inverse kinematics calculation
  const calculateAngles = useCallback((x: number, y: number) => {
    const dist = Math.sqrt(x * x + y * y)
    const maxReach = L2 + L3
    const minReach = Math.abs(L2 - L3)

    let adjX = x
    let adjY = y

    if (dist > maxReach || dist < minReach) {
      const scale = dist > maxReach ? maxReach / dist : minReach / dist
      adjX = x * scale * 0.95
      adjY = y * scale * 0.95
    }

    const baseAngle = Math.atan2(adjX, adjY)
    const r = Math.sqrt(adjX * adjX + adjY * adjY)
    const cosElbow = (r * r - L2 * L2 - L3 * L3) / (2 * L2 * L3)
    const clampedCosElbow = Math.max(-1, Math.min(1, cosElbow))
    const elbowAngle = Math.acos(clampedCosElbow)
    const shoulderAngle = Math.atan2(adjY, adjX) - Math.atan2(L3 * Math.sin(elbowAngle), L2 + L3 * Math.cos(elbowAngle))

    return {
      base: (baseAngle * 180) / Math.PI,
      shoulder: (shoulderAngle * 180) / Math.PI,
      elbow: (elbowAngle * 180) / Math.PI,
    }
  }, [])

  const angles = useMemo(() => calculateAngles(targetPos.x, targetPos.y), [targetPos, calculateAngles])

  // Calculate joint positions for SVG
  const jointPositions = useMemo(() => {
    const shoulderRad = (angles.shoulder * Math.PI) / 180
    const elbowRad = (angles.elbow * Math.PI) / 180

    const baseX = 180
    const baseY = 320

    const shoulderX = baseX
    const shoulderY = baseY - L1

    const elbowX = shoulderX + L2 * Math.cos(Math.PI / 2 - shoulderRad)
    const elbowY = shoulderY - L2 * Math.sin(Math.PI / 2 - shoulderRad)

    const combinedAngle = shoulderRad - (Math.PI - elbowRad)
    const endX = elbowX + L3 * Math.cos(Math.PI / 2 - combinedAngle)
    const endY = elbowY - L3 * Math.sin(Math.PI / 2 - combinedAngle)

    return { baseX, baseY, shoulderX, shoulderY, elbowX, elbowY, endX, endY }
  }, [angles])

  const runCycle = useCallback(() => {
    const sequence: {
      state: CycleState
      pos: { x: number; y: number }
      carrying: boolean
      delay: number
      floor: boolean
    }[] = [
      // Step 1: Pre-position - hover above and left of bag
      {
        state: "pre_position",
        pos: { x: APPROACH_X, y: GROUND_LEVEL + FORK_OFFSET + 60 },
        carrying: false,
        delay: 800,
        floor: false,
      },
      // Step 2: Lower to floor level - forks at ground
      {
        state: "lowering_to_floor",
        pos: { x: APPROACH_X, y: GROUND_LEVEL + FORK_OFFSET },
        carrying: false,
        delay: 700,
        floor: true,
      },
      // Step 3: Scoop - slide forks under bag horizontally
      {
        state: "scooping",
        pos: { x: BAG_X + 15, y: GROUND_LEVEL + FORK_OFFSET },
        carrying: true, // CRITICAL: Attach bag here
        delay: 900,
        floor: true,
      },
      // Step 4: Lift with bag (slower - loaded)
      {
        state: "lifting",
        pos: { x: BAG_X + 15, y: LIFT_HEIGHT },
        carrying: true,
        delay: 1000,
        floor: false,
      },
      // Step 5: Travel horizontally to pallet (base rotation simulation)
      {
        state: "traveling_to_pallet",
        pos: { x: PALLET_X, y: LIFT_HEIGHT },
        carrying: true,
        delay: 1200,
        floor: false,
      },
      // Step 6: Lower to pallet height
      {
        state: "lowering_to_pallet",
        pos: { x: PALLET_X, y: GROUND_LEVEL + PALLET_HEIGHT + FORK_OFFSET },
        carrying: true,
        delay: 1000,
        floor: false,
      },
      // Step 7: Retract forks - pull out horizontally, bag stays
      {
        state: "retracting",
        pos: { x: PALLET_X - 40, y: GROUND_LEVEL + PALLET_HEIGHT + FORK_OFFSET },
        carrying: false, // CRITICAL: Detach bag here
        delay: 800,
        floor: false,
      },
      // Step 8: Return home
      {
        state: "returning",
        pos: HOME_POS,
        carrying: false,
        delay: 900,
        floor: false,
      },
      { state: "complete", pos: HOME_POS, carrying: false, delay: 0, floor: false },
    ]

    let currentStep = 0

    const executeStep = () => {
      if (currentStep >= sequence.length) return

      const step = sequence[currentStep]
      setCycleState(step.state)
      setTargetPos(step.pos)
      setFloorReached(step.floor)

      if (step.carrying && !isCarrying) {
        setIsCarrying(true) // Attach bag to gripper
      }
      if (!step.carrying && currentStep > 0 && sequence[currentStep - 1]?.carrying) {
        // Detaching - save bag position at pallet
        setIsCarrying(false)
        setBagDropped(true)
        setBagFinalPos({ x: PALLET_X, y: PALLET_HEIGHT })
      }

      setActionLog(`Acción: ${stateLabels[step.state]} → X:${step.pos.x.toFixed(0)} Y:${step.pos.y.toFixed(0)}`)

      currentStep++
      if (currentStep < sequence.length) {
        timeoutRef.current = setTimeout(executeStep, step.delay)
      }
    }

    executeStep()
  }, [isCarrying])

  const startCycle = () => {
    if (cycleState !== "idle" && cycleState !== "complete") return
    // Reset states
    setIsCarrying(false)
    setBagDropped(false)
    setBagFinalPos({ x: BAG_X, y: 0 })
    setFloorReached(false)
    setCycleState("idle")
    setTimeout(() => runCycle(), 100)
  }

  const resetCycle = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setCycleState("idle")
    setTargetPos(HOME_POS)
    setIsCarrying(false)
    setBagDropped(false)
    setBagFinalPos({ x: BAG_X, y: 0 })
    setFloorReached(false)
    setActionLog("Sistema reiniciado. Listo para iniciar.")
  }

  // Cleanup
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const isRunning = cycleState !== "idle" && cycleState !== "complete"

  const bagSvgPos = useMemo(() => {
    if (bagDropped) {
      // Bag is on pallet - fixed position
      return { x: PALLET_X + 15, y: 278 } // On top of pallet
    }
    if (isCarrying) {
      // Bag follows the gripper end effector
      return { x: jointPositions.endX + 25, y: jointPositions.endY - 25 }
    }
    // Bag at origin
    return { x: BAG_X, y: 300 }
  }, [isCarrying, bagDropped, jointPositions.endX, jointPositions.endY])

  return (
    <section id="demo-ciclo" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <Badge variant="outline" className="mb-4 border-primary/50 text-primary">
            <Layers className="w-4 h-4 mr-2" />
            Demostración
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ciclo Automático de Paletizado</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Observa cómo el brazo robótico ejecuta un ciclo completo: desciende al piso, inserta la horquilla bajo la
            bolsa, y la transporta al pallet
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
                <svg viewBox="0 0 400 380" className="w-full h-auto bg-card" style={{ maxHeight: "420px" }}>
                  {/* Grid */}
                  <defs>
                    <pattern id="grid-demo" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path
                        d="M 20 0 L 0 0 0 20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="0.5"
                        className="text-primary/10"
                      />
                    </pattern>
                  </defs>
                  <rect width="400" height="380" fill="url(#grid-demo)" />

                  {/* Ground line */}
                  <line x1="0" y1="340" x2="400" y2="340" className="stroke-muted-foreground/30" strokeWidth="2" />
                  <text x="10" y="355" className="fill-muted-foreground/50 text-[9px] font-mono">
                    PISO (Y=0)
                  </text>

                  {/* Pallet */}
                  <g>
                    <rect
                      x="240"
                      y="300"
                      width="100"
                      height="40"
                      rx="2"
                      className="fill-amber-900/60 stroke-amber-700"
                      strokeWidth="1.5"
                    />
                    {/* Fork slots on pallet */}
                    <rect x="250" y="300" width="10" height="6" className="fill-amber-950/80" />
                    <rect x="275" y="300" width="10" height="6" className="fill-amber-950/80" />
                    <rect x="300" y="300" width="10" height="6" className="fill-amber-950/80" />
                    {/* Pallet slats */}
                    <line x1="265" y1="308" x2="265" y2="340" className="stroke-amber-700/50" strokeWidth="1" />
                    <line x1="290" y1="308" x2="290" y2="340" className="stroke-amber-700/50" strokeWidth="1" />
                    <line x1="315" y1="308" x2="315" y2="340" className="stroke-amber-700/50" strokeWidth="1" />
                    <text x="290" y="358" textAnchor="middle" className="fill-muted-foreground text-xs font-mono">
                      PALLET
                    </text>
                  </g>

                  {/* Origin zone marker */}
                  {!bagDropped && !isCarrying && (
                    <g>
                      <rect
                        x={BAG_X - 25}
                        y="330"
                        width="50"
                        height="10"
                        rx="2"
                        className="fill-primary/10 stroke-primary/30"
                        strokeWidth="1"
                        strokeDasharray="3,3"
                      />
                      <text x={BAG_X} y="358" textAnchor="middle" className="fill-muted-foreground text-xs font-mono">
                        ORIGEN
                      </text>
                    </g>
                  )}

                  <motion.g
                    animate={{
                      x: bagSvgPos.x - BAG_X,
                      y: bagSvgPos.y - 300,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: isCarrying ? 60 : 120,
                      damping: isCarrying ? 25 : 20,
                    }}
                  >
                    {/* Bag body - rounded sack shape */}
                    <ellipse
                      cx={BAG_X}
                      cy="300"
                      rx="20"
                      ry="24"
                      className="fill-amber-100 stroke-amber-300"
                      strokeWidth="2"
                    />
                    {/* Bag tie/top */}
                    <rect
                      x={BAG_X - 7}
                      y="274"
                      width="14"
                      height="7"
                      rx="2"
                      className="fill-amber-200 stroke-amber-400"
                      strokeWidth="1"
                    />
                    {/* Bag texture lines */}
                    <path
                      d={`M ${BAG_X - 12} 295 Q ${BAG_X} 290 ${BAG_X + 12} 295`}
                      className="stroke-amber-300/60"
                      strokeWidth="1"
                      fill="none"
                    />
                    <path
                      d={`M ${BAG_X - 10} 310 Q ${BAG_X} 305 ${BAG_X + 10} 310`}
                      className="stroke-amber-300/60"
                      strokeWidth="1"
                      fill="none"
                    />
                    <text x={BAG_X} y="303" textAnchor="middle" className="fill-amber-700 text-[9px] font-bold">
                      1 kg
                    </text>
                    {/* Bag label */}
                    {!isCarrying && !bagDropped && (
                      <text
                        x={BAG_X}
                        y="340"
                        textAnchor="middle"
                        className="fill-amber-500 text-[10px] font-mono font-semibold"
                      >
                        BOLSA
                      </text>
                    )}
                  </motion.g>

                  {/* Base platform */}
                  <rect
                    x={jointPositions.baseX - 35}
                    y={jointPositions.baseY}
                    width="70"
                    height="18"
                    rx="3"
                    className="fill-muted stroke-primary"
                    strokeWidth="2"
                  />

                  {/* Arm segments - slower transition when loaded */}
                  <motion.line
                    x1={jointPositions.baseX}
                    y1={jointPositions.baseY}
                    x2={jointPositions.shoulderX}
                    y2={jointPositions.shoulderY}
                    className="stroke-muted-foreground"
                    strokeWidth="10"
                    strokeLinecap="round"
                    animate={{
                      x2: jointPositions.shoulderX,
                      y2: jointPositions.shoulderY,
                    }}
                    transition={{ type: "spring", stiffness: isCarrying ? 50 : 80, damping: isCarrying ? 22 : 18 }}
                  />

                  <motion.line
                    x1={jointPositions.shoulderX}
                    y1={jointPositions.shoulderY}
                    x2={jointPositions.elbowX}
                    y2={jointPositions.elbowY}
                    className="stroke-primary"
                    strokeWidth="8"
                    strokeLinecap="round"
                    animate={{
                      x1: jointPositions.shoulderX,
                      y1: jointPositions.shoulderY,
                      x2: jointPositions.elbowX,
                      y2: jointPositions.elbowY,
                    }}
                    transition={{ type: "spring", stiffness: isCarrying ? 50 : 80, damping: isCarrying ? 22 : 18 }}
                  />

                  <motion.line
                    x1={jointPositions.elbowX}
                    y1={jointPositions.elbowY}
                    x2={jointPositions.endX}
                    y2={jointPositions.endY}
                    className="stroke-primary/70"
                    strokeWidth="6"
                    strokeLinecap="round"
                    animate={{
                      x1: jointPositions.elbowX,
                      y1: jointPositions.elbowY,
                      x2: jointPositions.endX,
                      y2: jointPositions.endY,
                    }}
                    transition={{ type: "spring", stiffness: isCarrying ? 50 : 80, damping: isCarrying ? 22 : 18 }}
                  />

                  {/* Joints */}
                  <circle
                    cx={jointPositions.baseX}
                    cy={jointPositions.baseY}
                    r="7"
                    className="fill-secondary stroke-primary"
                    strokeWidth="2"
                  />
                  <motion.circle
                    r="6"
                    className="fill-secondary stroke-primary"
                    strokeWidth="2"
                    animate={{
                      cx: jointPositions.shoulderX,
                      cy: jointPositions.shoulderY,
                    }}
                    transition={{ type: "spring", stiffness: isCarrying ? 50 : 80, damping: isCarrying ? 22 : 18 }}
                  />
                  <motion.circle
                    r="5"
                    className="fill-secondary stroke-primary"
                    strokeWidth="2"
                    animate={{
                      cx: jointPositions.elbowX,
                      cy: jointPositions.elbowY,
                    }}
                    transition={{ type: "spring", stiffness: isCarrying ? 50 : 80, damping: isCarrying ? 22 : 18 }}
                  />

                  {/* Gripper / Fork assembly */}
                  <motion.g
                    animate={{
                      x: jointPositions.endX - 180,
                      y: jointPositions.endY - 240,
                    }}
                    transition={{ type: "spring", stiffness: isCarrying ? 50 : 80, damping: isCarrying ? 22 : 18 }}
                  >
                    {/* Wrist mount */}
                    <rect
                      x="175"
                      y="232"
                      width="12"
                      height="18"
                      rx="2"
                      className="fill-primary stroke-primary-foreground"
                      strokeWidth="1"
                    />

                    {/* Fork base plate */}
                    <rect
                      x="172"
                      y="250"
                      width="18"
                      height="8"
                      rx="1"
                      className="fill-zinc-600 stroke-zinc-500"
                      strokeWidth="1"
                    />

                    {/* Fork tines - 3 horizontal prongs extending forward */}
                    <rect
                      x="190"
                      y="250"
                      width="35"
                      height="5"
                      rx="1"
                      className="fill-zinc-500 stroke-zinc-400"
                      strokeWidth="0.5"
                    />
                    <rect
                      x="190"
                      y="242"
                      width="35"
                      height="5"
                      rx="1"
                      className="fill-zinc-500 stroke-zinc-400"
                      strokeWidth="0.5"
                    />
                    <rect
                      x="190"
                      y="258"
                      width="35"
                      height="5"
                      rx="1"
                      className="fill-zinc-500 stroke-zinc-400"
                      strokeWidth="0.5"
                    />

                    {/* Tine tips */}
                    <circle cx="225" cy="244.5" r="2.5" className="fill-zinc-400" />
                    <circle cx="225" cy="252.5" r="2.5" className="fill-zinc-400" />
                    <circle cx="225" cy="260.5" r="2.5" className="fill-zinc-400" />
                  </motion.g>

                  {floorReached && (
                    <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <circle cx="30" cy="30" r="8" className="fill-green-500" />
                      <text x="45" y="34" className="fill-green-400 text-[10px] font-mono font-bold">
                        PISO ALCANZADO
                      </text>
                    </motion.g>
                  )}

                  {/* Load indicator when carrying */}
                  {isCarrying && (
                    <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <rect
                        x="300"
                        y="15"
                        width="90"
                        height="22"
                        rx="4"
                        className="fill-amber-600/20 stroke-amber-500"
                        strokeWidth="1"
                      />
                      <text x="345" y="31" textAnchor="middle" className="fill-amber-400 text-xs font-mono font-bold">
                        CARGA: 1kg
                      </text>
                    </motion.g>
                  )}
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
            {/* Status */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Estado del Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">Estado:</span>
                  <Badge
                    variant={isRunning ? "default" : cycleState === "complete" ? "secondary" : "outline"}
                    className={isRunning ? "animate-pulse" : ""}
                  >
                    {stateLabels[cycleState]}
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">Horquilla:</span>
                  <Badge variant={isCarrying ? "default" : "outline"}>{isCarrying ? "Bajo carga" : "Libre"}</Badge>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">Carga:</span>
                  <Badge variant={isCarrying ? "default" : "outline"} className={isCarrying ? "bg-amber-600" : ""}>
                    {isCarrying ? "1 kg (Bolsa)" : bagDropped ? "Entregada" : "Sin carga"}
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">Piso:</span>
                  <Badge variant={floorReached ? "default" : "outline"} className={floorReached ? "bg-green-600" : ""}>
                    {floorReached ? "Alcanzado (Y≈0)" : "No alcanzado"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Controls */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Controles</CardTitle>
                <CardDescription>Inicia o reinicia el ciclo de paletizado</CardDescription>
              </CardHeader>
              <CardContent className="flex gap-4">
                <Button size="lg" className="flex-1 gap-2" onClick={startCycle} disabled={isRunning}>
                  <Play className="w-5 h-5" />
                  Iniciar Ciclo Automático
                </Button>
                <Button size="lg" variant="outline" onClick={resetCycle} disabled={isRunning}>
                  <RotateCcw className="w-5 h-5" />
                </Button>
              </CardContent>
            </Card>

            {/* Real-time Log */}
            <Card className="border-primary/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Registro en Tiempo Real</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-mono text-sm p-3 rounded bg-secondary/50 border border-border">
                  <span className="text-primary">&gt;</span> {actionLog}
                </div>
              </CardContent>
            </Card>

            {/* Calculated Angles */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Ángulos Actuales (Cinemática Inversa)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 rounded-lg bg-secondary">
                    <p className="text-xs text-muted-foreground mb-1">Base</p>
                    <p className="font-mono text-lg text-primary">{angles.base.toFixed(1)}°</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-secondary">
                    <p className="text-xs text-muted-foreground mb-1">Hombro</p>
                    <p className="font-mono text-lg text-primary">{angles.shoulder.toFixed(1)}°</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-secondary">
                    <p className="text-xs text-muted-foreground mb-1">Codo</p>
                    <p className="font-mono text-lg text-primary">{angles.elbow.toFixed(1)}°</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-border flex justify-between text-xs font-mono text-muted-foreground">
                  <span>Target X: {targetPos.x}</span>
                  <span>Target Y: {targetPos.y}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
