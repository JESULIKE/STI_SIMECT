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
    const textCombined = `${body.queAprendi || ''} ${body.queFueDificil || ''} ${body.transferencia || ''} ${body.queHariaDiferente || ''}`.trim()
    const isSubstantial = textCombined.length >= 40
    let pointsAwarded = 0

    const result = await prisma.$transaction(async (tx) => {
      const reflection = await tx.reflection.create({
        data: {
          studentProfileId,
          activityAttemptId: body.activityAttemptId,
          queAprendi: body.queAprendi,
          queFueDificil: body.queFueDificil,
          autoEvaluacion: body.autoEvaluacion,
          transferencia: body.transferencia,
          queHariaDiferente: body.queHariaDiferente
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
