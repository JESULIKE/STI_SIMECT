import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Activity ID missing' })
  }

  try {
    const activity = await prisma.activity.findUnique({
      where: { id },
      select: {
        id: true,
        titulo: true,
        descripcion: true,
        tipo: true,
        nivel: true,
        fase: true,
        contenido: true,
        puntajeMaximo: true
        // ¡IMPORTANTE! No devolvemos `claveRespuestas` al frontend
      }
    })

    if (!activity) {
      throw createError({ statusCode: 404, statusMessage: 'Actividad no encontrada' })
    }

    return {
      success: true,
      data: activity
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Error al obtener la actividad',
      message: error.message
    })
  }
})
