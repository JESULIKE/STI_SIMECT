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
    const checklist = await prisma.metacognitionChecklist.create({
      data: {
        studentProfileId,
        queSe: body.q1 || '',
        queEsperoAprender: body.q2 || '',
        confianzaInicial: parseInt(body.q3) || 1,
        estrategias: body.q4 && body.q5 ? [body.q4, `Tiempo estimado: ${body.q5}`] : [],
        entornoSinDistracciones: body.q6 === true
      }
    })

    return { success: true, checklist }
  } catch (error) {
    console.error('Error al guardar checklist:', error)
    throw createError({ statusCode: 500, statusMessage: 'Error al guardar planificación' })
  }
})
