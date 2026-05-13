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
    const reflection = await prisma.reflection.create({
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

    return { success: true, reflection }
  } catch (error) {
    console.error('Error al guardar reflexión:', error)
    throw createError({ statusCode: 500, statusMessage: 'Error al guardar reflexión' })
  }
})
