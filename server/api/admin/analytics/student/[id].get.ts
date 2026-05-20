import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session.user || (session.user.role !== 'ADMIN' && session.user.role !== 'TEACHER')) {
    throw createError({ statusCode: 403, statusMessage: 'No autorizado' })
  }

  const studentId = event.context.params?.id

  try {
    const student = await prisma.studentProfile.findUnique({
      where: { codigoEstudiantil: studentId },
      include: {
        user: { select: { name: true, email: true, role: true } },

        // Diagnóstico inicial completo
        checklists: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            createdAt: true,
            queSe: true,                    // Plan de resolución (q1)
            queEsperoAprender: true,        // Expectativa (q2)
            confianzaInicial: true,         // Confianza 1-5 (q3)
            estrategias: true,              // Estrategia elegida (q4)
            entornoSinDistracciones: true,  // Confirmó entorno (q5)
          }
        },

        // Reflexiones con todas las dimensiones
        reflections: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            createdAt: true,
            // Dimensiones de estrella individuales
            claridadMonteria: true,
            hechosOpiniones: true,
            datosConcretosStar: true,
            sigueEstrategia: true,
            autoEvaluacion: true,
            // Respuestas abiertas
            transferencia: true,
            queFueDificil: true,
            queHariaDiferente: true,
          }
        },

        // Intentos con todos los datos pedagógicos
        attempts: {
          include: {
            activity: {
              select: {
                titulo: true,
                subPhase: true,
                fase: true,
                nivel: true,
                claveRespuestas: true,   // Para saber si acertó
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },

        progresses: {
          orderBy: [{ phase: 'asc' }, { subPhase: 'asc' }]
        }
      }
    })

    if (!student) {
      throw createError({ statusCode: 404, statusMessage: 'Estudiante no encontrado' })
    }

    // Calcular resumen de rendimiento
    const totalAttempts = student.attempts.length
    const successfulAttempts = student.attempts.filter(a => (a.puntajeObtenido || 0) >= 10).length
    const avgTime = totalAttempts > 0
      ? Math.round(student.attempts.reduce((acc, a) => acc + (a.tiempoSegundos || 0), 0) / totalAttempts)
      : 0
    const avgScore = totalAttempts > 0
      ? Math.round(student.attempts.reduce((acc, a) => acc + (a.puntajeObtenido || 0), 0) / totalAttempts)
      : 0

    // Calcular promedios de reflexión
    const reflWithStars = student.reflections.filter(r => r.autoEvaluacion !== null)
    const avgAutoEval = reflWithStars.length > 0
      ? (reflWithStars.reduce((acc, r) => acc + (r.autoEvaluacion || 0), 0) / reflWithStars.length).toFixed(1)
      : null

    return {
      success: true,
      data: {
        ...student,
        summary: {
          totalAttempts,
          successfulAttempts,
          successRate: totalAttempts > 0 ? Math.round((successfulAttempts / totalAttempts) * 100) : 0,
          avgTimeSeconds: avgTime,
          avgScore,
          avgAutoEval,
          reflectionsCount: student.reflections.length
        }
      }
    }

  } catch (error) {
    console.error('Error al obtener detalle:', error)
    throw createError({ statusCode: 500, statusMessage: 'Error al cargar ficha del estudiante' })
  }
})
