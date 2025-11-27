"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Mail } from "lucide-react"

const teamMembers = [
  { name: "Eduardo S. Millones Vasquez", email: "N00337782@upn.pe", role: "Desarrollador" },
  { name: "Marcos J. Vicente Bautista", email: "N00382222@upn.pe", role: "Desarrollador" },
  { name: "Cristopher V. Atahuaman Carhuaricra", email: "N00386627@upn.pe", role: "Desarrollador" },
  { name: "Saeit S. Askaya Ramirez", email: "N00384866@upn.pe", role: "Desarrollador" },
]

export function TeamSection() {
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
            <Users className="w-4 h-4 mr-2" />
            Colaboradores
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Nuestro Equipo</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Estudiantes de Ingeniería Mecatrónica - Universidad Privada del Norte
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="h-full hover:border-primary/50 transition-colors">
                <CardContent className="p-6 text-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center border-2 border-primary/30">
                    <span className="text-2xl font-bold text-primary">
                      {member.name.split(" ")[0][0]}
                      {member.name.split(" ")[2]?.[0] || member.name.split(" ")[1][0]}
                    </span>
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{member.name}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{member.role}</p>
                  <a
                    href={`mailto:${member.email}`}
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <Mail className="w-3 h-3" />
                    {member.email}
                  </a>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
