import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function check() {
  const attempts = await prisma.activityAttempt.findMany()
  console.log('Intentos encontrados:', attempts.length)
  attempts.forEach(a => {
    console.log(`- Estudiante: ${a.studentProfileId} | Actividad: ${a.activityId} | Puntaje: ${a.puntajeObtenido}`)
  })
}

check().finally(() => prisma.$disconnect())
