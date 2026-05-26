import { PrismaClient } from '@prisma/client'

export default defineEventHandler(async (event) => {
  const prisma = new PrismaClient()
  try {
    const activities = await prisma.activity.findMany({
      orderBy: [{ fase: 'asc' }, { subPhase: 'asc' }, { nivel: 'asc' }],
      select: {
        id: true,
        titulo: true,
        fase: true,
        subPhase: true,
        nivel: true,
        tipo: true,
        contenido: true,
        claveRespuestas: true,
        puntajeMaximo: true,
        isPublished: true,
      }
    })
    return activities
  } finally {
    await prisma.$disconnect()
  }
})
