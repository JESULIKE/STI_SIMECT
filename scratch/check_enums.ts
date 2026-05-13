import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function check() {
  const activities = await prisma.activity.findMany({ take: 1 })
  if (activities.length > 0) {
    console.log('Actividad:', activities[0].titulo)
    console.log('Nivel (tipo):', typeof activities[0].nivel, 'Valor:', activities[0].nivel)
    console.log('Fase (tipo):', typeof activities[0].fase, 'Valor:', activities[0].fase)
  }
}

check().finally(() => prisma.$disconnect())
