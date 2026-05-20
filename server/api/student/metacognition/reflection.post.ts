import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session.user) {
    throw createError({ statusCode: 401, statusMessage: 'No autorizado' })
  }

  const studentProfileId = session.user.studentProfileId
  const body = await readBody(event)

  try {
    // Calcular promedio de las 4 dimensiones de estrella
    const autoEvalAvg = Math.round(
      (body.clarity + body.factsOpinions + body.concreteData + body.followedStrategy) / 4
    )

    // Resumen textual compacto (para búsqueda rápida en panel docente)
    const queAprendiResumen = [
      `Claridad Montería: ${body.clarity}/5`,
      `Hechos/Opiniones: ${body.factsOpinions}/5`,
      `Datos Concretos: ${body.concreteData}/5`,
      `Siguió Estrategia: ${body.followedStrategy}/5`,
      `Transferencia: ${body.transfer || '—'}`
    ].join(' | ')

    const textCombined = `${queAprendiResumen} ${body.difficult || ''} ${body.differentNext || ''}`.trim()
    const isSubstantial = textCombined.length >= 40
    let pointsAwarded = 0

    const result = await prisma.$transaction(async (tx) => {
      const reflection = await tx.reflection.create({
        data: {
          studentProfileId,
          activityAttemptId: body.activityAttemptId || null,

          // Resumen textual
          queAprendi:       queAprendiResumen,
          queFueDificil:    body.difficult    || null,
          autoEvaluacion:   autoEvalAvg,
          transferencia:    body.transfer     || null,
          queHariaDiferente: body.differentNext || null,

          // Dimensiones individuales (Meta-Reflexión de Flavell)
          claridadMonteria:   body.clarity          || null,
          hechosOpiniones:    body.factsOpinions     || null,
          datosConcretosStar: body.concreteData      || null,
          sigueEstrategia:    body.followedStrategy  || null,
        }
      })

      if (isSubstantial) {
        pointsAwarded = 10
        await tx.studentProfile.update({
          where: { id: studentProfileId },
          data: { totalPoints: { increment: 10 } }
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
