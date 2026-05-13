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
        queSe: body.queSe,
        queEsperoAprender: body.queEsperoAprender,
        confianzaInicial: body.confianzaInicial,
        estrategias: body.estrategias, // JSON con lista de estrategias
        entornoSinDistracciones: body.entornoSinDistracciones
      }
    })

    return { success: true, checklist }
  } catch (error) {
    console.error('Error al guardar checklist:', error)
    throw createError({ statusCode: 500, statusMessage: 'Error al guardar planificación' })
  }
})
