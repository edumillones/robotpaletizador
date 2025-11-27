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

// --- Antes calibrado ---
// Estos valores los uso porque ya comprobé que colocan al servo MG946R
// exactamente en 0° y 180°. Con esto garantizo precisión en el movimiento.
int SERVOMIN = 110;   // Pulso que corresponde a 0°
int SERVOMAX = 500;   // Pulso que corresponde a 180°

int servo1 = 0;   // Servo de la BASE
int servo2 = 1;   // Servo del BRAZO
int servo3 = 2;   // Servo del HOMBRO

// Esta función transforma un ángulo (0 a 180°)
// en el pulso real que el PCA9685 necesita.
// La hice así para no repetir cálculos y mantener el código limpio.
int angleToPulse(int ang){
  return map(ang, 0, 180, SERVOMIN, SERVOMAX);
}

void setup() {
  Serial.begin(9600);

  // Inicializo el módulo PCA9685 y configuro su frecuencia en 50 Hz,
  // que es la frecuencia estándar para servomotores.
  pwm.begin();
  pwm.setPWMFreq(50);

  delay(500); // Le doy un pequeño respiro antes de empezar.
}

// Aquí programé una función para mover los 3 servos al mismo tiempo.
// Lo que hago es calcular el pulso equivalente al ángulo deseado
// y enviarlo a los 3 canales simultáneamente.
void mover3Servos(int angulo){
  int pulso = angleToPulse(angulo);

  pwm.setPWM(servo1, 0, pulso);  // Muevo la base
  pwm.setPWM(servo2, 0, pulso);  // Muevo el brazo
  pwm.setPWM(servo3, 0, pulso);  // Muevo el hombro
}

void loop() {

  // En esta secuencia hago que los 3 servos se muevan juntos.
  // Es como una pequeña coreografía mecánica.
  
  mover3Servos(0);    // Los pongo en su posición inicial (0°)
  delay(2000);        // Los dejo ahí 2 segundos

  mover3Servos(90);   // Los llevo al centro (90°)
  delay(2000);

  mover3Servos(180);  // Los llevo al extremo opuesto (180°)
  delay(2000);

  mover3Servos(90);   // Regresan al centro
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
