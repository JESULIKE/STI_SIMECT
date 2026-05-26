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
            seguridadSinAyuda: true,        // JOL 1
            seguridadTema: true,            // JOL 2
            tiempoEstimadoFase1: true,      // JOL 3
            atencionNumeros: true,          // JOL 4
            separacionArgumentos: true,     // JOL 5
            comprensionSIMECT: true,        // Onboarding 1
            familiaridadTema: true          // Onboarding 2
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

        attempts: {
          include: {
            activity: {
              select: {
                titulo: true,
                subPhase: true,
                fase: true,
                nivel: true,
                tipo: true,
                claveRespuestas: true,
                contenido: true,
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },

        progresses: {
          orderBy: [{ phase: 'asc' }, { subPhase: 'asc' }]
        },
        monitorings: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            subPhase: true,
            atencionDetalle: true,
            filtroInformacion: true,
            conexionPlaneacion: true,
            esfuerzoCognitivo: true,
            confianzaActual: true,
            createdAt: true
          }
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

    // Preparar datos para gráfica Radar de Metacognición
    const calcAvg = (key: string) => {
      const valid = student.reflections.filter(r => (r as any)[key] !== null)
      if (valid.length === 0) return 0
      return valid.reduce((acc, r) => acc + ((r as any)[key] || 0), 0) / valid.length
    }
    const metacognitionRadar = [
      calcAvg('claridadMonteria'),
      calcAvg('hechosOpiniones'),
      calcAvg('datosConcretosStar'),
      calcAvg('sigueEstrategia'),
      parseFloat(avgAutoEval || '0')
    ]

    // Preparar datos para gráfica Line de Evolución de Puntajes
    // Los intentos están ordenados 'desc', así que los invertimos para orden cronológico
    const scoreTimeline = [...student.attempts].reverse().map(a => ({
      date: a.createdAt,
      score: a.puntajeObtenido || 0,
      subPhase: a.activity?.subPhase || ''
    }))

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
        },
        scoreTimeline,
        metacognitionRadar
      }
    }

  } catch (error) {
    console.error('Error al obtener detalle:', error)
    throw createError({ statusCode: 500, statusMessage: 'Error al cargar ficha del estudiante' })
  }
})
