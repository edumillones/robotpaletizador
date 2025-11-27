"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Bot, ChevronDown, ChevronUp, BookOpen } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

const references = [
  {
    id: 1,
    author: "Larraioz Group",
    title: "¿Qué es un proceso de paletizado? ¿Cómo me beneficiaría?",
    year: "2022",
    url: "https://larraioz.com/blog/articulos-es/que-es-un-proceso-de-paletizado-como-me-beneficiaria",
  },
  {
    id: 2,
    author: "Frost Automation",
    title: "Brazo robótico industrial: características, tipos y aplicaciones",
    year: "2022",
    url: "https://frostautomation.com/brazo-robotico-industrial/",
  },
  {
    id: 3,
    author: "Neobotik",
    title: "Robótica de final de línea: automatización del empaquetado y paletización",
    year: "2023",
    url: "https://www.neobotik.com/robotica-de-final-de-linea-automatizacion-del-empaquetado-y-paletizacion/",
  },
  {
    id: 4,
    author: "R. L. Boylestad",
    title: "Introductory Circuit Analysis, 13th ed.",
    year: "2015",
    publisher: "Pearson",
  },
  {
    id: 5,
    author: "M. H. Rashid",
    title: "Power Electronics: Circuits, Devices, and Applications, 4th ed.",
    year: "2013",
    publisher: "Pearson",
  },
]

export function Footer() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <footer className="py-12 px-4 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full justify-center mb-4">
              <BookOpen className="w-4 h-4" />
              <span>Referencias Bibliográficas</span>
              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="bg-secondary/50 rounded-lg p-4 md:p-6">
                <ul className="space-y-3 text-xs md:text-sm text-muted-foreground">
                  {references.map((ref) => (
                    <li key={ref.id} className="flex gap-2">
                      <span className="text-primary font-mono">[{ref.id}]</span>
                      <span>
                        {ref.author}, "{ref.title}," {ref.publisher || ""} {ref.year}.
                        {ref.url && (
                          <>
                            {" "}
                            <a
                              href={ref.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline break-all"
                            >
                              {ref.url}
                            </a>
                          </>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </motion.div>

        {/* existing footer content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-2">
            <Bot className="w-6 h-6 text-primary" />
            <span className="font-semibold">Brazo Robótico Paletizador</span>
          </div>

          <p className="text-sm text-muted-foreground text-center">© 2025 Grupo 3 - UPN. Ingeniería Mecatrónica.</p>

          <p className="text-xs text-muted-foreground font-mono">Lima, Perú</p>
        </motion.div>
      </div>
    </footer>
  )
}
