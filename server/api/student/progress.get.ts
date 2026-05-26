import { prisma } from '~/server/utils/prisma'
import { NIVEL_LABELS } from '~/server/utils/levelEngine'

const ACTIVITIES_PER_SUBPHASE = 2

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
        earnedBadges: { include: { badge: true } }
      }
    })

    // nivelActual viene del campo en StudentProfile
    const nivelActual = (profile as any)?.nivelActual || 'BASIC'

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

    // Contar cuántas actividades completó por subfase
    const subPhaseCounts: Record<string, number> = {}
    for (const attempt of successfulAttempts) {
      if (attempt.activity.subPhase) {
        subPhaseCounts[attempt.activity.subPhase] = (subPhaseCounts[attempt.activity.subPhase] || 0) + 1
      }
    }

    // Conjunto de subfases completadas (por código) si tienen >= ACTIVITIES_PER_SUBPHASE
    const completedSubPhases = new Set<string>()
    for (const sp in subPhaseCounts) {
      if (subPhaseCounts[sp] >= ACTIVITIES_PER_SUBPHASE) {
        completedSubPhases.add(sp)
      }
    }

    // Calcular el progreso de cada fase y subfase desde los intentos reales
    const phases = phaseDefinitions.map((p, phaseIdx) => {
      const subPhasesData = p.subPhases.map((sp, spIdx) => {
        const isCompleted = completedSubPhases.has(sp.code)
        const completedInSp = Math.min(subPhaseCounts[sp.code] || 0, ACTIVITIES_PER_SUBPHASE)
        const percent = (completedInSp / ACTIVITIES_PER_SUBPHASE) * 100

        // Una subfase está desbloqueada si:
        // - Es la primera de la primera fase (siempre desbloqueada)
        // - O la subfase anterior está completa
        let status: string
        if (isCompleted) {
          status = 'Completado'
        } else {
          // Verificar si está desbloqueada
          const isFirstSubPhase = phaseIdx === 0 && spIdx === 0
          if (isFirstSubPhase) {
            status = 'En curso' // Siempre disponible la primera
          } else {
            // La anterior debe estar completada para desbloquearse
            const prevSpCompleted = spIdx > 0
              ? completedSubPhases.has(p.subPhases[spIdx - 1].code)
              : phaseIdx > 0
                ? phaseDefinitions[phaseIdx - 1].subPhases.every(prevSp => completedSubPhases.has(prevSp.code))
                : false
            status = prevSpCompleted ? 'En curso' : 'Bloqueado' // Si está desbloqueada y no completada, está en curso o pendiente. Usemos En curso/Pendiente.
            // Para mantener la lógica anterior:
            status = prevSpCompleted ? 'Pendiente' : 'Bloqueado'
            if (prevSpCompleted && !isCompleted) status = 'En curso'
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

      const phaseCompleted = p.subPhases.filter(sp => completedSubPhases.has(sp.code)).length
      const phaseTotal = p.subPhases.length
      const phasePercent = Math.min((phaseCompleted / phaseTotal) * 100, 100)

      let phaseStatus: string
      if (phasePercent === 100) phaseStatus = 'Completado'
      else if (phaseCompleted > 0) phaseStatus = 'En curso'
      else if (phaseIdx === 0) phaseStatus = 'En curso'
      else {
        const prevPhaseComplete = phaseDefinitions[phaseIdx - 1].subPhases.every(
          sp => completedSubPhases.has(sp.code)
        )
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

    const nivelInfo = NIVEL_LABELS[nivelActual as keyof typeof NIVEL_LABELS]

    return {
      points: profile.totalPoints,
      streak: profile.currentStreak,
      phases,
      badges: profile.earnedBadges.map(eb => eb.badge),
      // Nivel adaptativo actual del estudiante
      nivelActual: {
        code: nivelActual,
        label: nivelInfo?.label || nivelActual,
        emoji: nivelInfo?.emoji || '🟢',
        color: nivelInfo?.color || 'emerald'
      }
    }

  } catch (error) {
    console.error('Error al obtener progreso:', error)
    throw createError({ statusCode: 500, statusMessage: 'Error interno al cargar Dashboard' })
  }
})
