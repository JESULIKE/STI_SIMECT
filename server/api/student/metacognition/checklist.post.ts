import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session.user) {
    throw createError({ statusCode: 401, statusMessage: 'No autorizado' })
  }

  const studentProfileId = session.user.studentProfileId
  const body = await readBody(event)

  try {
    const checklist = await prisma.metacognitionChecklist.create({
      data: {
        studentProfileId,
        queSe:              body.q1 || '',                 // Plan de resolución elegido
        queEsperoAprender:  body.q2 || '',                 // Expectativa de aprendizaje
        confianzaInicial:   parseInt(body.q3) || 1,        // Confianza 1-5
        estrategias:        body.q4 ? [body.q4] : [],      // Estrategia seleccionada
        entornoSinDistracciones: body.q5 === true          // Confirmación de entorno (antes q6)
        // q5 (tiempo estimado) eliminado — el estudiante no sabe qué actividades vendrán
      }
    })

    return { success: true, checklist }
  } catch (error) {
    console.error('Error al guardar checklist:', error)
    throw createError({ statusCode: 500, statusMessage: 'Error al guardar planificación' })
  }
})
