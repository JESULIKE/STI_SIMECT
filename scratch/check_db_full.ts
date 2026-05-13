import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function check() {
  const activities = await prisma.activity.findMany()
  console.log('--- TODAS LAS ACTIVIDADES ---')
  activities.forEach(a => {
    console.log(`ID: ${a.id} | Titulo: ${a.titulo} | Nivel: ${a.nivel} | Fase: ${a.fase} | subPhase: ${a.subPhase} | isPublished: ${a.isPublished}`)
  })
}

check().finally(() => prisma.$disconnect())
