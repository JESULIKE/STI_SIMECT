import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session.user) {
    throw createError({ statusCode: 401, statusMessage: 'No autorizado' })
  }

  const studentProfileId = session.user.studentProfileId
  const body = await readBody(event)

  try {
    const pointsAwarded = 5

    const result = await prisma.$transaction(async (tx) => {
      // Registrar o actualizar el monitoreo para la subfase actual
      const subPhase = body.subPhase || '1.1'
      
      const monitoring = await tx.metacognitionMonitoring.upsert({
        where: {
          studentProfileId_subPhase: {
            studentProfileId,
            subPhase: subPhase
          }
        },
        update: {
          monitoreo1: body.monitoreo1,
          monitoreo2: body.monitoreo2,
          monitoreo3: body.monitoreo3
        },
        create: {
          studentProfileId,
          subPhase: subPhase,
          monitoreo1: body.monitoreo1,
          monitoreo2: body.monitoreo2,
          monitoreo3: body.monitoreo3
        }
      })

      // Otorgar puntos de gamificación por autoregulación activa
      await tx.studentProfile.update({
        where: { id: studentProfileId },
        data: { totalPoints: { increment: pointsAwarded } }
      })

      return { monitoring }
    })

    return { 
      success: true, 
      monitoring: result.monitoring, 
      pointsAwarded 
    }
  } catch (error) {
    console.error('Error al guardar monitoreo metacognitivo:', error)
    throw createError({ statusCode: 500, statusMessage: 'Error al guardar monitoreo' })
  }
})
