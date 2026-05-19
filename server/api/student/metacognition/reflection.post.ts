import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session.user) {
    throw createError({ statusCode: 401, statusMessage: 'No autorizado' })
  }

  const studentProfileId = session.user.studentProfileId
  const body = await readBody(event)

  try {
    const queAprendiResumen = `Claridad: ${body.clarity}/5 | Hechos/Opiniones: ${body.factsOpinions}/5 | Datos Concretos: ${body.concreteData}/5 | Estrategia: ${body.followedStrategy}/5`
    const autoEvalAvg = Math.round((body.clarity + body.factsOpinions + body.concreteData + body.followedStrategy) / 4)

    const textCombined = `${queAprendiResumen} ${body.difficult || ''} ${body.transfer || ''} ${body.differentNext || ''}`.trim()
    const isSubstantial = textCombined.length >= 40
    let pointsAwarded = 0

    const result = await prisma.$transaction(async (tx) => {
      const reflection = await tx.reflection.create({
        data: {
          studentProfileId,
          activityAttemptId: body.activityAttemptId,
          queAprendi: queAprendiResumen,
          queFueDificil: body.difficult,
          autoEvaluacion: autoEvalAvg,
          transferencia: body.transfer,
          queHariaDiferente: body.differentNext
        }
      })

      if (isSubstantial) {
        pointsAwarded = 10
        await tx.studentProfile.update({
          where: { id: studentProfileId },
          data: {
            totalPoints: { increment: 10 }
          }
        })
      }

      return { reflection }
    })

    return { success: true, reflection: result.reflection, pointsAwarded }
  } catch (error) {
    console.error('Error al guardar reflexión:', error)
    throw createError({ statusCode: 500, statusMessage: 'Error al guardar reflexión' })
  }
})
