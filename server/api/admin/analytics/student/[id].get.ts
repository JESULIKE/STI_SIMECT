import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session.user || (session.user.role !== 'ADMIN' && session.user.role !== 'TEACHER')) {
    throw createError({ statusCode: 403, statusMessage: 'No autorizado' })
  }

  const studentId = event.context.params?.id

  try {
    const student = await prisma.studentProfile.findUnique({
      where: { codigoEstudiantil: studentId }, // O por ID si prefieres
      include: {
        user: true,
        checklists: { orderBy: { createdAt: 'desc' } },
        reflections: { orderBy: { createdAt: 'desc' } },
        attempts: {
          include: { activity: true },
          orderBy: { createdAt: 'desc' }
        },
        progresses: true
      }
    })

    if (!student) {
      throw createError({ statusCode: 404, statusMessage: 'Estudiante no encontrado' })
    }

    return {
      success: true,
      data: student
    }

  } catch (error) {
    console.error('Error al obtener detalle:', error)
    throw createError({ statusCode: 500, statusMessage: 'Error al cargar ficha del estudiante' })
  }
})
