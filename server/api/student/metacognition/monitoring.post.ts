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
      // Registrar o actualizar el monitoreo para la subfase 1.1
      const monitoring = await tx.metacognitionMonitoring.upsert({
        where: {
          studentProfileId_subPhase: {
            studentProfileId,
            subPhase: '1.1'
          }
        },
        update: {
          atencionDetalle:    body.atencionDetalle,
          filtroInformacion:  body.filtroInformacion,
          conexionPlaneacion: body.conexionPlaneacion,
          esfuerzoCognitivo:  body.esfuerzoCognitivo,
          confianzaActual:    body.confianzaActual
        },
        create: {
          studentProfileId,
          subPhase: '1.1',
          atencionDetalle:    body.atencionDetalle,
          filtroInformacion:  body.filtroInformacion,
          conexionPlaneacion: body.conexionPlaneacion,
          esfuerzoCognitivo:  body.esfuerzoCognitivo,
          confianzaActual:    body.confianzaActual
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
