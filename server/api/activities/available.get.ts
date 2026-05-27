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
    //    (2 actividades por subfase × nivel = 12 actividades en total)
    const [activitiesForLevel, studentChecklists] = await Promise.all([
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
        ? prisma.metacognitionChecklist.findMany({
            where: { studentProfileId },
            orderBy: { createdAt: 'desc' }
          })
        : Promise.resolve([])
    ])

    // 3. Calcular qué subfases del nivel actual ya están completas
    //    (2 actividades por subfase → si las completó, la subfase está completa)
    const subPhaseCounts: Record<string, number> = {}
    for (const attempt of successfulAttempts) {
      if (attempt.activity.subPhase) {
        subPhaseCounts[attempt.activity.subPhase] = (subPhaseCounts[attempt.activity.subPhase] || 0) + 1
      }
    }

    const completedSubPhases = new Set<string>()
    for (const sp in subPhaseCounts) {
      if (subPhaseCounts[sp] >= 2) {
        completedSubPhases.add(sp)
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
    //    (obtenemos la primera no completada para que se la muestre al estudiante)
    const activities = activitiesForLevel.filter(act =>
      act.subPhase === activeSubPhase &&
      !completedActivityIds.includes(act.id)
    )

    // 6. Barras de progreso
    // — actividad: % dentro de la subfase activa (0, 50, o 100 con 2 actividades por subfase)
    const subPhaseCompleted = activeSubPhase ? (subPhaseCounts[activeSubPhase] || 0) : 0
    const subPhaseTotal = 2 // 2 actividades por subfase

    // — fase: % de subfases completadas que pertenecen a esta fase
    const subPhasesForPhase = SUBPHASE_ORDER.filter(sp => SUBPHASE_PHASE_MAP[sp] === phase)
    const phaseCompletedCount = subPhasesForPhase.filter(sp => completedSubPhases.has(sp)).length
    const phaseTotal = subPhasesForPhase.length

    // — nivel: total de subfases completadas / total de subfases
    const totalAllCompleted = completedSubPhases.size
    const totalAllSubPhases = SUBPHASE_ORDER.length

    const progressBars = {
      activity: Math.min(Math.round((subPhaseCompleted / subPhaseTotal) * 100), 100),
      phase: phaseTotal > 0 ? Math.min(Math.round((phaseCompletedCount / phaseTotal) * 100), 100) : 0,
      level: Math.min(Math.round((totalAllCompleted / totalAllSubPhases) * 100), 100)
    }

    // 7. Contexto pedagógico del tutor
    const activePhase = activeSubPhase ? SUBPHASE_PHASE_MAP[activeSubPhase] : 'ANALYSIS'
    const checklistForPhase = studentChecklists.find(c => c.fase === activePhase) || null

    const pedagogicalContext = getTutorTone(checklistForPhase)
    const firstActivity = activities[0] || null
    const nivelInfo = NIVEL_LABELS[studentLevel]

    // 8. Flujos metacognitivos pendientes (para reanudar en recargas)
    const hasCompletedOnboarding = studentChecklists.length > 0;
    
    // Verificar si falta monitoreo de las subfases .1 completadas
    let pendingMonitoringSubPhase: string | null = null;
    const monitorings = studentProfileId 
      ? await prisma.metacognitionMonitoring.findMany({ where: { studentProfileId } })
      : [];
    for (const sp of ['1.1', '2.1', '3.1']) {
      if (completedSubPhases.has(sp) && !monitorings.some(m => m.subPhase === sp)) {
        pendingMonitoringSubPhase = sp;
        break; // Solo pedimos el primero que falte
      }
    }

    // Verificar si falta reflexión de las subfases .2 completadas
    let pendingReflectionSubPhase: string | null = null;
    const reflections = studentProfileId
      ? await prisma.reflection.findMany({ where: { studentProfileId }, include: { activityAttempt: { include: { activity: true } } } })
      : [];
    for (const sp of ['1.2', '2.2', '3.2']) {
      if (completedSubPhases.has(sp)) {
        // Buscar si hay una reflexión que pertenezca a un intento de una actividad de esta subfase
        const hasRef = reflections.some(r => r.activityAttempt?.activity?.subPhase === sp);
        if (!hasRef) {
          pendingReflectionSubPhase = sp;
          break;
        }
      }
    }

    console.log(`[available] Nivel: ${studentLevel} | Subfase activa: ${activeSubPhase} | Actividad: ${firstActivity?.titulo || 'ninguna'}`)

    return {
      success: true,
      data: activities,
      firstActivity,
      context: pedagogicalContext,
      progressBars,
      activeSubPhase,
      activePhase,
      hasCompletedChecklist: !!checklistForPhase,
      hasCompletedOnboarding,
      pendingMonitoringSubPhase,
      pendingReflectionSubPhase,
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
