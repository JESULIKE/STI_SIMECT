import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const ACTIVITIES_PER_SUBPHASE = 6

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session.user || session.user.role !== 'STUDENT') {
    throw createError({ statusCode: 401, statusMessage: 'No autorizado' })
  }

  const studentProfileId = session.user.studentProfileId

  try {
    const profile = await prisma.studentProfile.findUnique({
      where: { id: studentProfileId },
      include: {
        earnedBadges: {
          include: { badge: true }
        }
      }
    })

    if (!profile) {
      throw createError({ statusCode: 404, statusMessage: 'Perfil no encontrado' })
    }

    // Obtener todos los intentos exitosos del estudiante
    const successfulAttempts = await prisma.activityAttempt.findMany({
      where: { studentProfileId, puntajeObtenido: { gte: 10 } },
      include: { activity: { select: { fase: true, nivel: true, subPhase: true } } },
      distinct: ['activityId'] // Contar cada actividad solo una vez
    })

    // Definición de la estructura de fases y subfases
    const phaseDefinitions = [
      {
        name: 'ANÁLISIS DE INFORMACIÓN',
        code: 'ANALYSIS',
        icon: '🔍',
        subPhases: [
          { name: 'Identificación de hechos relevantes', code: '1.1' },
          { name: 'Identificación de opciones y argumentos', code: '1.2' }
        ]
      },
      {
        name: 'EVALUACIÓN DE INFORMACIÓN',
        code: 'EVALUATION',
        icon: '⚖️',
        subPhases: [
          { name: 'Credibilidad de las fuentes', code: '2.1' },
          { name: 'Lógica de argumentos', code: '2.2' }
        ]
      },
      {
        name: 'FORMULACIÓN DE JUICIOS',
        code: 'JUDGMENT',
        icon: '📝',
        subPhases: [
          { name: 'Consideraciones propias', code: '3.1' },
          { name: 'Consideración de perspectivas', code: '3.2' }
        ]
      }
    ]

    // Calcular el progreso de cada fase y subfase desde los intentos reales
    const phases = phaseDefinitions.map((p, phaseIdx) => {
      const subPhasesData = p.subPhases.map((sp, spIdx) => {
        const completedInSp = successfulAttempts.filter(
          a => a.activity.fase === p.code && a.activity.subPhase === sp.code
        ).length

        const percent = Math.min((completedInSp / ACTIVITIES_PER_SUBPHASE) * 100, 100)

        // Una subfase está desbloqueada si:
        // - Es la primera de la primera fase (siempre desbloqueada)
        // - O la subfase anterior está completa
        let status: string
        if (percent === 100) {
          status = 'Completado'
        } else if (completedInSp > 0) {
          status = 'En curso'
        } else {
          // Verificar si está desbloqueada
          const isFirstSubPhase = phaseIdx === 0 && spIdx === 0
          if (isFirstSubPhase) {
            status = 'En curso' // Siempre disponible la primera
          } else {
            // La anterior debe estar completada para desbloquearse
            const prevSpCompleted = spIdx > 0
              ? successfulAttempts.filter(
                  a => a.activity.fase === p.code && a.activity.subPhase === p.subPhases[spIdx - 1].code
                ).length >= ACTIVITIES_PER_SUBPHASE
              : phaseIdx > 0
                ? successfulAttempts.filter(
                    a => a.activity.fase === phaseDefinitions[phaseIdx - 1].code
                  ).length >= ACTIVITIES_PER_SUBPHASE * 2
                : false
            status = prevSpCompleted ? 'Pendiente' : 'Bloqueado'
          }
        }

        return {
          name: sp.name,
          code: sp.code,
          progress: Math.round(percent),
          completed: completedInSp,
          total: ACTIVITIES_PER_SUBPHASE,
          status
        }
      })

      const phaseCompleted = successfulAttempts.filter(a => a.activity.fase === p.code).length
      const phaseTotal = p.subPhases.length * ACTIVITIES_PER_SUBPHASE
      const phasePercent = Math.min((phaseCompleted / phaseTotal) * 100, 100)

      let phaseStatus: string
      if (phasePercent === 100) phaseStatus = 'Completado'
      else if (phaseCompleted > 0) phaseStatus = 'En curso'
      else if (phaseIdx === 0) phaseStatus = 'En curso'
      else {
        const prevPhaseComplete = successfulAttempts.filter(
          a => a.activity.fase === phaseDefinitions[phaseIdx - 1].code
        ).length >= phaseDefinitions[phaseIdx - 1].subPhases.length * ACTIVITIES_PER_SUBPHASE
        phaseStatus = prevPhaseComplete ? 'Pendiente' : 'Bloqueado'
      }

      return {
        name: p.name,
        code: p.code,
        icon: p.icon,
        progress: Math.round(phasePercent),
        status: phaseStatus,
        subPhases: subPhasesData
      }
    })

    return {
      points: profile.totalPoints,
      streak: profile.currentStreak,
      phases,
      badges: profile.earnedBadges.map(eb => eb.badge)
    }

  } catch (error) {
    console.error('Error al obtener progreso:', error)
    throw createError({ statusCode: 500, statusMessage: 'Error interno al cargar Dashboard' })
  }
})
