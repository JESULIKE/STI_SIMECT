import { prisma } from '~/server/utils/prisma'
import { getTutorTone } from '~/server/utils/pedagogicalEngine'
import { NIVEL_LABELS } from '~/server/utils/levelEngine'
import type { Level, Phase } from '@prisma/client'

/**
 * Secuencia de subfases en orden de avance.
 */
const SUBPHASE_ORDER = ['1.1', '1.2', '2.1', '2.2', '3.1', '3.2']

const SUBPHASE_PHASE_MAP: Record<string, Phase> = {
  '1.1': 'ANALYSIS',
  '1.2': 'ANALYSIS',
  '2.1': 'EVALUATION',
  '2.2': 'EVALUATION',
  '3.1': 'JUDGMENT',
  '3.2': 'JUDGMENT',
}

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const studentProfileId = session.user?.studentProfileId
  const query = getQuery(event)
  const phase = ((query.phase as string) || 'ANALYSIS').toUpperCase() as Phase

  try {
    // 0. Verificar sesión válida
    let studentProfile: { nivelActual: Level } | null = null
    if (studentProfileId) {
      studentProfile = await prisma.studentProfile.findUnique({
        where: { id: studentProfileId },
        select: { id: true, nivelActual: true } as any
      }) as any

      if (!studentProfile) {
        console.warn(`Sesión huérfana detectada para ID: ${studentProfileId}`)
        return {
          success: false,
          error: 'SESSION_ORPHAN',
          message: 'Tu sesión ha expirado. Por favor, cierra sesión e ingresa nuevamente.'
        }
      }
    }

    // El nivel del estudiante viene de su perfil en BD (ajustado adaptativamente)
    const studentLevel: Level = (studentProfile as any)?.nivelActual || 'BASIC'

    // 1. Intentos exitosos del estudiante (solo los de su nivel actual, para calcular progreso)
    const successfulAttempts = studentProfileId
      ? await prisma.activityAttempt.findMany({
          where: { studentProfileId, puntajeObtenido: { gte: 10 } },
          select: {
            activityId: true,
            activity: { select: { fase: true, nivel: true, subPhase: true } }
          },
          distinct: ['activityId']
        })
      : []

    const completedActivityIds = successfulAttempts.map(a => a.activityId)

    // 2. Obtener TODAS las actividades del nivel actual del estudiante
    //    (1 actividad por subfase × nivel = 6 actividades en total)
    const [activitiesForLevel, pedagogicalContextSource] = await Promise.all([
      prisma.activity.findMany({
        where: { isPublished: true, nivel: studentLevel },
        select: {
          id: true, subPhase: true, fase: true, nivel: true, titulo: true,
          descripcion: true, tipo: true, puntajeMaximo: true, contenido: true,
          claveRespuestas: true, createdAt: true
        },
        orderBy: [{ subPhase: 'asc' }, { createdAt: 'asc' }]
      }),
      studentProfileId
        ? prisma.metacognitionChecklist.findFirst({
            where: { studentProfileId },
            orderBy: { createdAt: 'desc' }
          })
        : Promise.resolve(null)
    ])

    // 3. Calcular qué subfases del nivel actual ya están completas
    //    (1 actividad por subfase → si la completó en cualquier nivel, la subfase está completa)
    const completedSubPhases = new Set<string>()
    for (const attempt of successfulAttempts) {
      if (attempt.activity.subPhase) {
        completedSubPhases.add(attempt.activity.subPhase)
      }
    }

    // 4. Encontrar la primera subfase activa (incompleta y con actividad disponible)
    let activeSubPhase: string | null = null
    for (const sp of SUBPHASE_ORDER) {
      const hasActivity = activitiesForLevel.some(a => a.subPhase === sp)
      if (hasActivity && !completedSubPhases.has(sp)) {
        activeSubPhase = sp
        break
      }
    }

    // 5. Obtener la actividad de esa subfase para el nivel actual
    //    (solo la primera no completada — con el modelo de 1/subfase, suele ser la única)
    const activities = activitiesForLevel.filter(act =>
      act.subPhase === activeSubPhase &&
      !completedActivityIds.includes(act.id)
    )

    // 6. Barras de progreso
    // — actividad: % dentro de la subfase activa (0 o 100 con 1 actividad por subfase)
    const subPhaseCompleted = activeSubPhase && completedSubPhases.has(activeSubPhase) ? 1 : 0
    const subPhaseTotal = 1 // 1 actividad por subfase

    // — fase: % de subfases completadas que pertenecen a esta fase
    const subPhasesForPhase = SUBPHASE_ORDER.filter(sp => SUBPHASE_PHASE_MAP[sp] === phase)
    const phaseCompletedCount = subPhasesForPhase.filter(sp => completedSubPhases.has(sp)).length
    const phaseTotal = subPhasesForPhase.length

    // — nivel: total de subfases completadas / total de subfases
    const totalAllCompleted = completedSubPhases.size
    const totalAllSubPhases = SUBPHASE_ORDER.length

    const progressBars = {
      activity: subPhaseCompleted >= subPhaseTotal ? 100 : 0,
      phase: phaseTotal > 0 ? Math.min(Math.round((phaseCompletedCount / phaseTotal) * 100), 100) : 0,
      level: Math.min(Math.round((totalAllCompleted / totalAllSubPhases) * 100), 100)
    }

    // 7. Contexto pedagógico del tutor
    const pedagogicalContext = getTutorTone(pedagogicalContextSource)
    const firstActivity = activities[0] || null
    const nivelInfo = NIVEL_LABELS[studentLevel]

    console.log(`[available] Nivel: ${studentLevel} | Subfase activa: ${activeSubPhase} | Actividad: ${firstActivity?.titulo || 'ninguna'}`)

    return {
      success: true,
      data: activities,
      firstActivity,
      context: pedagogicalContext,
      progressBars,
      activeSubPhase,
      // Nivel actual del estudiante (para mostrar badge en UI)
      studentLevel: {
        code: studentLevel,
        label: nivelInfo.label,
        emoji: nivelInfo.emoji,
        color: nivelInfo.color
      }
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Error al obtener actividades disponibles',
      message: error.message
    })
  }
})
