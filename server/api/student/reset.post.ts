import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  
  // Solo permitir a docentes o al propio estudiante (aunque normalmente es para docentes)
  if (!session.user) {
    throw createError({ statusCode: 401, statusMessage: 'No autorizado' })
  }

  const body = await readBody(event)
  const { studentId } = body

  // Si no se provee studentId, el estudiante se resetea a sí mismo
  const targetUserId = studentId || session.user.id

  // Seguridad: Si un estudiante intenta resetear a otro, bloquear
  if (session.user.role === 'STUDENT' && targetUserId !== session.user.id) {
    throw createError({ statusCode: 403, statusMessage: 'No tienes permisos para resetear a otros estudiantes' })
  }

  try {
    // Buscar el perfil del estudiante
    const profile = await prisma.studentProfile.findUnique({
      where: { userId: targetUserId }
    })

    if (!profile) {
      throw createError({ statusCode: 404, statusMessage: 'Perfil de estudiante no encontrado' })
    }

    const studentProfileId = profile.id

    // Ejecutar limpieza en transacción
    await prisma.$transaction([
      // 1. Eliminar intentos de actividades
      prisma.activityAttempt.deleteMany({ where: { studentProfileId } }),
      // 2. Eliminar checklists metacognitivos
      prisma.metacognitionChecklist.deleteMany({ where: { studentProfileId } }),
      // 3. Eliminar reflexiones
      prisma.reflection.deleteMany({ where: { studentProfileId } }),
      // 4. Eliminar progreso por fases
      prisma.progress.deleteMany({ where: { studentProfileId } }),
      // 5. Eliminar insignias ganadas
      prisma.earnedBadge.deleteMany({ where: { studentProfileId } }),
      // 6. Eliminar patrones de error
      prisma.errorPattern.deleteMany({ where: { studentProfileId } }),
      // 7. Reiniciar estadísticas del perfil
      prisma.studentProfile.update({
        where: { id: studentProfileId },
        data: {
          totalPoints: 0,
          currentStreak: 0,
          lastActivityAt: null
        }
      })
    ])

    return { 
      success: true, 
      message: `Datos del estudiante ${targetUserId === session.user.id ? 'propios' : studentId} reseteados con éxito` 
    }

  } catch (error: any) {
    console.error('Error al resetear estudiante:', error)
    throw createError({
      statusCode: 500,
      statusMessage: `Error al resetear datos: ${error.message}`
    })
  }
})
