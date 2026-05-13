import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function check() {
  const activities = await prisma.activity.findMany({
    where: { 
      nivel: 'BASIC', 
      fase: 'ANALYSIS'
    }
  })
  console.log('Actividades encontradas para BASIC/ANALYSIS:', activities.length)
  activities.forEach(a => {
    console.log(`- [${a.id}] ${a.titulo} (subPhase: ${a.subPhase})`)
  })
}

check().finally(() => prisma.$disconnect())
