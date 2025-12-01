"use client"

import { useState, useCallback, useMemo, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, RotateCcw, Box, RefreshCw, AlertCircle, ArrowRightLeft } from "lucide-react"

// --- DIMENSIONES MECÁNICAS ---
const L1 = 80   // Base (Pedestal fijo)
const L2 = 120  // Eslabón Hombro
const L3 = 110  // Eslabón Codo

// --- COORDENADAS CILÍNDRICAS (R, Y, Theta) ---
// R: Radio (Distancia del centro)
// Y: Altura
// Theta: Ángulo de la base

const HOME_POS = { r: 100, y: 150, theta: 0 } 
const SUGAR_POS = { r: 160, y: 15, theta: -45 }  // Zona Carga (Izquierda)
const PALLET_POS = { r: 160, y: 50, theta: 45 }  // Zona Descarga (Derecha)

const SAFE_HEIGHT = 180 // Altura de seguridad para viajar

type CycleState = 
  | "idle" 
  | "start_sequence"
  | "rotate_to_sugar" | "descend_sugar" | "grab_sugar" | "lift_sugar" 
  | "rotate_to_pallet" 
  | "descend_pallet" | "drop_sugar" | "lift_pallet" | "return_home"

const stateLabels: Record<CycleState, string> = {
  idle: "Sistema Listo",
  start_sequence: "Iniciando Secuencia...",
  rotate_to_sugar: "Girando a Zona Carga (-45°)",
  descend_sugar: "Aproximando a Mesa",
  grab_sugar: "Sujetando Bolsa",
  lift_sugar: "Elevando Carga",
  rotate_to_pallet: "Girando a Pallet (+45°)",
  descend_pallet: "Posicionando Descarga",
  drop_sugar: "Liberando Carga",
  lift_pallet: "Retirada Segura",
  return_home: "Regresando a Home",
}

export function PalletizingDemo() {
  const [cycleState, setCycleState] = useState<CycleState>("idle")
  
  // Estado del Robot (Posición Actual)
  const [currentPos, setCurrentPos] = useState(HOME_POS)
  
  // Estado del Gripper y Bolsa
  const [isGripping, setIsGripping] = useState(false)
  const [bagLocation, setBagLocation] = useState<"origin" | "gripper" | "pallet">("origin")
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // --- 1. CINEMÁTICA INVERSA (IK) ---
  const calculateIK = useCallback((r: number, y: number) => {
    const dy = y - L1 
    const dx = r 
    const dist = Math.sqrt(dx * dx + dy * dy)
    
    // Limits Check & Scaling
    const maxReach = L2 + L3
    let safeR = dx
    let safeY = dy

    if (dist > maxReach * 0.99) {
       const scale = (maxReach * 0.99) / dist
       safeR = dx * scale
       safeY = dy * scale
    }

    // Ley de cosenos (Codo Arriba)
    const h = Math.sqrt(safeR * safeR + safeY * safeY)
    if (h < 1) return { shoulder: 90, elbow: 0 } 

    const cosElbow = (h * h - L2 * L2 - L3 * L3) / (2 * L2 * L3)
    const elbowRad = -Math.acos(Math.max(-1, Math.min(1, cosElbow)))

    const alpha = Math.atan2(safeY, safeR)
    const beta = Math.atan2(L3 * Math.sin(elbowRad), L2 + L3 * Math.cos(elbowRad))
    const shoulderRad = alpha - beta

    return {
      shoulder: (shoulderRad * 180) / Math.PI,
      elbow: (elbowRad * 180) / Math.PI
    }
  }, [])

  const angles = useMemo(() => calculateIK(currentPos.r, currentPos.y), [currentPos, calculateIK])

  // --- 2. CINEMÁTICA VISUAL (SVG) ---
  const jointPos = useMemo(() => {
    const sRad = (angles.shoulder * Math.PI) / 180
    const eRad = (angles.elbow * Math.PI) / 180

    const originX = 80 // Movemos el robot a la izquierda para tener espacio a la derecha
    const originY = 320 

    const shX = originX
    const shY = originY - L1

    const elX = shX + L2 * Math.cos(sRad)
    const elY = shY - L2 * Math.sin(sRad)

    const absElbow = sRad + eRad
    const eeX = elX + L3 * Math.cos(absElbow)
    const eeY = elY - L3 * Math.sin(absElbow)

    return { originX, originY, shX, shY, elX, elY, eeX, eeY }
  }, [angles])

  // --- 3. SECUENCIA DE AUTOMATIZACIÓN ---
  const runSequence = useCallback(() => {
    // Definimos tiempos y posiciones clave
    const steps: { 
      state: CycleState, 
      pos: typeof HOME_POS, 
      grip: boolean, 
      time: number,
      action?: () => void 
    }[] = [
      // 1. Ir a Home primero (Reset visual)
      { state: "start_sequence", pos: HOME_POS, grip: false, time: 800 },
      
      // 2. GIRO: Rotar hacia la bolsa (-45°) MANTENIENDO ALTURA
      { state: "rotate_to_sugar", pos: { ...SUGAR_POS, y: SAFE_HEIGHT }, grip: false, time: 1200 },
      
      // 3. BAJAR: Descender verticalmente sobre la bolsa
      { state: "descend_sugar", pos: SUGAR_POS, grip: false, time: 800 },
      
      // 4. AGARRAR: Activar solenoide (Sin moverse)
      { state: "grab_sugar", pos: SUGAR_POS, grip: true, time: 500, action: () => setBagLocation("gripper") },
      
      // 5. SUBIR: Elevar con carga
      { state: "lift_sugar", pos: { ...SUGAR_POS, y: SAFE_HEIGHT }, grip: true, time: 800 },
      
      // 6. GIRO LARGO: Rotar hacia el pallet (+45°)
      { state: "rotate_to_pallet", pos: { ...PALLET_POS, y: SAFE_HEIGHT }, grip: true, time: 1500 },
      
      // 7. BAJAR: Posicionar sobre pallet
      { state: "descend_pallet", pos: PALLET_POS, grip: true, time: 800 },
      
      // 8. SOLTAR: Desactivar gripper
      { state: "drop_sugar", pos: PALLET_POS, grip: false, time: 500, action: () => setBagLocation("pallet") },
      
      // 9. SUBIR VACÍO
      { state: "lift_pallet", pos: { ...PALLET_POS, y: SAFE_HEIGHT }, grip: false, time: 800 },
      
      // 10. RETORNO: Volver a 0°
      { state: "return_home", pos: HOME_POS, grip: false, time: 1000 },
      
      { state: "idle", pos: HOME_POS, grip: false, time: 0 },
    ]

    let stepIdx = 0
    const execute = () => {
      if (stepIdx >= steps.length) return
      const step = steps[stepIdx]
      
      setCycleState(step.state)
      setCurrentPos(step.pos)
      setIsGripping(step.grip)
      if (step.action) step.action()

      stepIdx++
      if (stepIdx < steps.length) {
        timeoutRef.current = setTimeout(execute, step.time)
      }
    }
    execute()
  }, [])

  const start = () => {
    if (cycleState !== "idle") return
    setBagLocation("origin")
    runSequence()
  }

  const reset = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setCycleState("idle")
    setCurrentPos(HOME_POS)
    setIsGripping(false)
    setBagLocation("origin")
  }

  // --- LÓGICA DE VISIBILIDAD DE OBJETOS (CÁMARA INTELIGENTE) ---
  // Solo mostramos el objeto "estático" si el robot está mirando hacia su zona.
  // Esto evita el "teletransporte visual".
  
  // Posición visual en X de los objetos (Basada en su Radio R=160)
  // OrigenX (80) + Radio (160) = 240
  const visualTargetX = 80 + 160 

  const showSugarStand = currentPos.theta < -10 // Visible solo si miramos a la izquierda (< -10°)
  const showPallet = currentPos.theta > 10     // Visible solo si miramos a la derecha (> 10°)

  // Posición de la bolsa
  const bagRenderPos = useMemo(() => {
    if (bagLocation === "gripper") {
        return { x: jointPos.eeX, y: jointPos.eeY + 15, opacity: 1, rotate: 0 }
    }
    if (bagLocation === "origin") {
        // Coordenada exacta del 'SUGAR_POS' visual
        return { x: visualTargetX, y: 320 - SUGAR_POS.y + 15, opacity: showSugarStand ? 1 : 0, rotate: 0 }
    }
    if (bagLocation === "pallet") {
        // Coordenada exacta del 'PALLET_POS' visual
        return { x: visualTargetX, y: 320 - PALLET_POS.y - 10, opacity: showPallet ? 1 : 0, rotate: 0 }
    }
    return { x: 0, y: 0, opacity: 0, rotate: 0 }
  }, [bagLocation, jointPos.eeX, jointPos.eeY, showSugarStand, showPallet, visualTargetX])

  return (
    <div className="w-full bg-slate-950 p-6 rounded-xl border border-slate-900 text-slate-200">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
            <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                <Box className="text-blue-500" /> 
                Paletizador 3-Ejes v2.0
            </h2>
            <p className="text-slate-400 text-sm">Simulación con Rotación y Perspectiva Corregida</p>
        </div>
        <Badge variant="outline" className={`${cycleState !== "idle" ? "bg-blue-900/20 text-blue-400 border-blue-800 animate-pulse" : "text-slate-500"}`}>
            {stateLabels[cycleState]}
        </Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* --- VISTA LATERAL (SVG) --- */}
        <Card className="lg:col-span-2 bg-slate-900 border-slate-800 overflow-hidden relative shadow-inner shadow-black/50">
            <div className="absolute top-3 left-3 z-10 bg-slate-950/80 backdrop-blur px-2 py-1 rounded border border-slate-800 text-[10px] text-slate-400 font-mono">
                CÁMARA: VISTA RADIAL (R-Y)
            </div>
            
            <CardContent className="p-0">
                <svg viewBox="0 0 400 350" className="w-full h-[400px]">
                    <defs>
                        <pattern id="grid2" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>
                        </pattern>
                    </defs>
                    <rect width="400" height="350" fill="url(#grid2)" />
                    
                    {/* SUELO */}
                    <line x1="0" y1="320" x2="400" y2="320" stroke="#334155" strokeWidth="2" />

                    {/* OBJETOS FANTASMA (Solo visibles según ángulo) */}
                    
                    {/* MESA DE CARGA (Visible si theta < 0) */}
                    <AnimatePresence>
                        {showSugarStand && (
                            <motion.g 
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }} 
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <rect x={visualTargetX - 20} y="305" width="40" height="15" className="fill-slate-700 stroke-slate-600" />
                                <text x={visualTargetX} y="340" textAnchor="middle" className="text-[10px] fill-slate-500 font-mono">ZONA CARGA</text>
                            </motion.g>
                        )}
                    </AnimatePresence>

                    {/* PALLET (Visible si theta > 0) */}
                    <AnimatePresence>
                        {showPallet && (
                            <motion.g 
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }} 
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <rect x={visualTargetX - 40} y={320 - PALLET_POS.y} width="80" height={PALLET_POS.y} className="fill-amber-900/30 stroke-amber-800" rx="2" />
                                <text x={visualTargetX} y="340" textAnchor="middle" className="text-[10px] fill-amber-700 font-mono">PALLET</text>
                            </motion.g>
                        )}
                    </AnimatePresence>


                    {/* ROBOT */}
                    {/* Base */}
                    <rect x={jointPos.originX - 15} y={jointPos.shY} width="30" height={L1} className="fill-slate-800 stroke-slate-600" strokeWidth="2" />
                    
                    {/* Brazos */}
                    <motion.line 
                        animate={{ x1: jointPos.shX, y1: jointPos.shY, x2: jointPos.elX, y2: jointPos.elY }}
                        transition={{ type: "spring", stiffness: 100, damping: 25 }}
                        className="stroke-blue-600" strokeWidth="12" strokeLinecap="round" 
                    />
                    <motion.line 
                        animate={{ x1: jointPos.elX, y1: jointPos.elY, x2: jointPos.eeX, y2: jointPos.eeY }}
                        transition={{ type: "spring", stiffness: 100, damping: 25 }}
                        className="stroke-blue-400" strokeWidth="10" strokeLinecap="round" 
                    />

                    {/* Joints */}
                    <circle cx={jointPos.shX} cy={jointPos.shY} r="5" className="fill-white" />
                    <motion.circle animate={{ cx: jointPos.elX, cy: jointPos.elY }} transition={{ type: "spring", stiffness: 100, damping: 25 }} r="4" className="fill-white" />

                    {/* Gripper */}
                    <motion.g animate={{ x: jointPos.eeX, y: jointPos.eeY }} transition={{ type: "spring", stiffness: 100, damping: 25 }}>
                        <rect x="-8" y="-4" width="16" height="8" className="fill-slate-400" rx="1" />
                        <line x1="-6" y1="4" x2="-6" y2="14" stroke={isGripping ? "red" : "white"} strokeWidth="2" />
                        <line x1="6" y1="4" x2="6" y2="14" stroke={isGripping ? "red" : "white"} strokeWidth="2" />
                    </motion.g>

                    {/* BOLSA DE AZÚCAR (Elemento Único que se mueve) */}
                    <motion.g
                        animate={{ 
                            x: bagRenderPos.x, 
                            y: bagRenderPos.y, 
                            opacity: bagRenderPos.opacity 
                        }}
                        transition={bagLocation === "gripper" 
                            ? { type: "spring", stiffness: 100, damping: 25 } // Pegada al robot
                            : { duration: 0 } // Teletransporte instantáneo solo cuando se oculta/muestra
                        }
                    >
                         {/* Bolsa blanca */}
                        <path d="M -12 0 L -10 -20 L 10 -20 L 12 0 Z" className="fill-slate-100 stroke-slate-300" strokeWidth="1" />
                        <rect x="-8" y="-14" width="16" height="6" className="fill-blue-600" />
                        <text x="0" y="-10" textAnchor="middle" className="text-[5px] fill-white font-bold">AZÚCAR</text>
                    </motion.g>

                </svg>
            </CardContent>

             {/* Controles flotantes */}
             <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                <Button onClick={start} disabled={cycleState !== "idle"} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold">
                    {cycleState === "idle" ? <><Play className="w-4 h-4 mr-2" /> Iniciar Ciclo</> : <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Procesando...</>}
                </Button>
                <Button onClick={reset} disabled={cycleState !== "idle"} variant="secondary" className="bg-slate-800 text-slate-300 hover:bg-slate-700">
                    <RotateCcw className="w-4 h-4" />
                </Button>
            </div>
        </Card>

        {/* --- VISTA SUPERIOR (RADAR) & DATOS --- */}
        <div className="space-y-6">
            
            {/* RADAR */}
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="pb-2 pt-4">
                    <CardTitle className="text-xs text-slate-400 font-mono flex justify-between">
                        <span>VISTA SUPERIOR (EJE Z)</span>
                        <ArrowRightLeft className="w-3 h-3" />
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center p-6">
                    <div className="relative w-48 h-48 rounded-full border border-slate-800 bg-slate-950 shadow-inner shadow-black">
                        {/* Guías de ángulos */}
                        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-slate-800/50" />
                        <div className="absolute top-0 left-1/2 w-[1px] h-full bg-slate-800/50" />
                        
                        {/* ZONA IN (-45°) */}
                        <div className="absolute w-full h-full rotate-[-45deg]">
                            <div className="absolute top-2 left-1/2 -translate-x-1/2 flex flex-col items-center">
                                <div className={`w-10 h-10 border border-dashed rounded flex items-center justify-center transition-colors duration-300 ${showSugarStand ? "border-blue-500 bg-blue-500/10" : "border-slate-700"}`}>
                                    <span className="text-[8px] text-slate-500">IN</span>
                                </div>
                            </div>
                        </div>

                        {/* ZONA OUT (+45°) */}
                        <div className="absolute w-full h-full rotate-[45deg]">
                            <div className="absolute top-2 left-1/2 -translate-x-1/2 flex flex-col items-center">
                                <div className={`w-12 h-12 border rounded flex items-center justify-center transition-colors duration-300 ${showPallet ? "border-amber-600 bg-amber-900/20" : "border-slate-700"}`}>
                                    <span className="text-[8px] text-slate-500">OUT</span>
                                </div>
                            </div>
                        </div>

                        {/* BRAZO (AGUJA) */}
                        <motion.div 
                            className="absolute top-1/2 left-1/2 w-[2px] h-[50%] bg-blue-500 origin-top shadow-[0_0_15px_rgba(59,130,246,0.6)]"
                            animate={{ rotate: currentPos.theta + 180 }}
                            transition={{ type: "spring", stiffness: 60, damping: 20 }}
                        >
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full" />
                        </motion.div>
                        
                        {/* Centro */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-slate-800 rounded-full border-2 border-slate-600 z-10" />
                    </div>
                </CardContent>
            </Card>

            {/* TELEMETRÍA */}
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="pb-2 pt-4">
                    <CardTitle className="text-xs text-slate-400 font-mono flex items-center gap-2">
                        <AlertCircle className="w-3 h-3" /> DATOS EN TIEMPO REAL
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                        <div className="bg-black/40 p-2 rounded border border-slate-800">
                            <span className="text-[10px] text-slate-500 block">Ángulo Base (J1)</span>
                            <span className="text-lg font-mono text-yellow-400">{currentPos.theta.toFixed(1)}°</span>
                        </div>
                        <div className="bg-black/40 p-2 rounded border border-slate-800">
                            <span className="text-[10px] text-slate-500 block">Radio (R)</span>
                            <span className="text-lg font-mono text-blue-400">{currentPos.r.toFixed(0)}mm</span>
                        </div>
                    </div>
                    
                    <div className="bg-black/40 p-2 rounded border border-slate-800 flex justify-between items-center">
                        <span className="text-xs text-slate-400">Estado Gripper</span>
                        <Badge variant={isGripping ? "destructive" : "secondary"} className="text-[10px]">
                            {isGripping ? "CERRADO" : "ABIERTO"}
                        </Badge>
                    </div>

                    <div className="pt-2 border-t border-slate-800">
                        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                            <span>J2: {angles.shoulder.toFixed(1)}°</span>
                            <span>J3: {angles.elbow.toFixed(1)}°</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

        </div>
      </div>
    </div>
  )
}