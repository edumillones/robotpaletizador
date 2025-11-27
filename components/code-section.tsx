"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Code2, Copy, Check } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

const arduinoCode = `#include <Wire.h>
#include <Adafruit_PWMServoDriver.h>

Adafruit_PWMServoDriver pwm = Adafruit_PWMServoDriver();

// Longitudes de segmentos (mm)
#define L1 100  // Base a hombro
#define L2 130  // Hombro a codo
#define L3 130  // Codo a efector

// Canales de servos en PCA9685
#define SERVO_BASE    0
#define SERVO_HOMBRO  1
#define SERVO_CODO    2
#define SERVO_GARRA   3

void setup() {
  Serial.begin(9600);
  pwm.begin();
  pwm.setPWMFreq(50);  // Frecuencia estándar para servos
}

// Función principal de cinemática inversa
void irACoordenada(float x, float y, float z) {
  // Calcular ángulo de base (rotación en plano XY)
  float anguloBase = atan2(x, y) * (180.0 / PI);
  
  // Distancia en el plano del brazo
  float r = sqrt(x*x + y*y);
  
  // Ley de cosenos para ángulo del codo
  float cosTheta2 = (r*r - L2*L2 - L3*L3) / (2*L2*L3);
  cosTheta2 = constrain(cosTheta2, -1.0, 1.0);
  float anguloCodo = acos(cosTheta2) * (180.0 / PI);
  
  // Calcular ángulo del hombro
  float anguloHombro = (atan2(y, r) - 
    atan2(L3*sin(anguloCodo*PI/180), 
          L2 + L3*cos(anguloCodo*PI/180))) * (180.0/PI);
  
  // Mover servos a posiciones calculadas
  moverServo(SERVO_BASE, anguloBase);
  moverServo(SERVO_HOMBRO, anguloHombro);
  moverServo(SERVO_CODO, anguloCodo);
  
  Serial.print("Moviendo a: X=");
  Serial.print(x);
  Serial.print(" Y=");
  Serial.print(y);
  Serial.println();
}

void moverServo(int canal, float angulo) {
  // Mapear ángulo (0-180) a pulso PWM (150-600)
  int pulso = map(angulo, 0, 180, 150, 600);
  pwm.setPWM(canal, 0, pulso);
}

void loop() {
  // Ejemplo: mover a posición de paletizado
  irACoordenada(150, 150, 0);
  delay(2000);
  
  irACoordenada(100, 200, 0);
  delay(2000);
}`

export function CodeSection() {
  const [copied, setCopied] = useState(false)

  const copyCode = () => {
    navigator.clipboard.writeText(arduinoCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <Badge variant="outline" className="mb-4 border-primary/50 text-primary">
            <Code2 className="w-4 h-4 mr-2" />
            Código
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Lógica de Control (C++)</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Implementación de cinemática inversa para Arduino con PCA9685
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border bg-secondary/50">
              <div>
                <CardTitle className="text-lg font-mono">main.ino</CardTitle>
                <CardDescription>Arduino Sketch</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={copyCode} className="gap-2 bg-transparent">
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copiar
                  </>
                )}
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <pre className="p-6 overflow-x-auto text-sm">
                <code className="font-mono text-muted-foreground">
                  {arduinoCode.split("\n").map((line, index) => (
                    <div key={index} className="flex">
                      <span className="w-8 text-right pr-4 text-muted-foreground/50 select-none">{index + 1}</span>
                      <span
                        className={
                          line.startsWith("//") || line.includes("//")
                            ? "text-green-500"
                            : line.startsWith("#")
                              ? "text-yellow-500"
                              : line.includes("void") || line.includes("float") || line.includes("int")
                                ? "text-primary"
                                : ""
                        }
                      >
                        {line || " "}
                      </span>
                    </div>
                  ))}
                </code>
              </pre>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
