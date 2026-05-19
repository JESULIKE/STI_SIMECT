import { prisma } from '~/server/utils/prisma'
import { getTutorTone } from '~/server/utils/pedagogicalEngine'
import type { Level, Phase } from '@prisma/client'

/**
 * Motor de Secuenciación de Subfases.
 * Cada subfase tiene 6 actividades (B1, B2, M1, M2, A1, A2).
 * Los estudiantes responden TODAS independientemente de su nivel asignado.
 * El nivel afecta la retroalimentación pedagógica, no la visibilidad de los reactivos.
 */
const SUBPHASE_ORDER = ['1.1', '1.2', '2.1', '2.2', '3.1', '3.2']

// Mapa: ANALYSIS subfases → qué fase de la DB les corresponde
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

  // El parámetro phase guía cuál es la fase "raíz", pero la subfase activa puede ser cualquiera
  const phase = ((query.phase as string) || 'ANALYSIS').toUpperCase() as Phase

  try {
    // 0. Verificar que el perfil existe en la DB (sesión huérfana)
    if (studentProfileId) {
      const profileExists = await prisma.studentProfile.findUnique({
        where: { id: studentProfileId },
        select: { id: true }
      })
      if (!profileExists) {
        console.warn(`Sesión huérfana detectada para ID: ${studentProfileId}. Requiere re-login.`)
        return {
          success: false,
          error: 'SESSION_ORPHAN',
          message: 'Tu sesión ha expirado debido a un reinicio del sistema. Por favor, cierra sesión e ingresa nuevamente.'
        }
      }
    }

    // 1. Traer todos los intentos exitosos del estudiante (sin filtro de nivel)
    const successfulAttempts = studentProfileId
      ? await prisma.activityAttempt.findMany({
          where: {
            studentProfileId,
            puntajeObtenido: { gte: 10 }
          },
          select: {
            activityId: true,
            activity: {
              select: { fase: true, nivel: true, subPhase: true }
            }
          },
          distinct: ['activityId']
        })
      : []

    const completedActivityIds = successfulAttempts.map(a => a.activityId)

    // 2. Traer TODAS las actividades de TODAS las subfases de TODAS las fases
    //    sin filtrar por nivel — todos los estudiantes ven los mismos 6 reactivos por subfase
    const [allActivities, pedagogicalContextSource] = await Promise.all([
      prisma.activity.findMany({
        where: { isPublished: true },
        select: { id: true, subPhase: true, fase: true, nivel: true, titulo: true, descripcion: true, tipo: true, puntajeMaximo: true, contenido: true, claveRespuestas: true, createdAt: true },
        orderBy: [{ subPhase: 'asc' }, { createdAt: 'asc' }]
      }),
      studentProfileId
        ? prisma.metacognitionChecklist.findFirst({
            where: { studentProfileId },
            orderBy: { createdAt: 'desc' }
          })
        : Promise.resolve(null)
    ])

    // 3. Calcular totales y completados por subfase en memoria
    const totalBySubphase: Record<string, number> = {}
    const completedBySubphase: Record<string, number> = {}

    for (const act of allActivities) {
      const sp = act.subPhase || ''
      totalBySubphase[sp] = (totalBySubphase[sp] || 0) + 1
    }

    for (const attempt of successfulAttempts) {
      const sp = attempt.activity.subPhase || ''
      completedBySubphase[sp] = (completedBySubphase[sp] || 0) + 1
    }

    // 4. Encontrar la primera subfase activa (incompleta y con actividades)
    let activeSubPhase: string | null = null
    for (const sp of SUBPHASE_ORDER) {
      const total = totalBySubphase[sp] || 0
      const completed = completedBySubphase[sp] || 0
      if (total > 0 && completed < total) {
        activeSubPhase = sp
        break
      }
    }

    // 5. Filtrar actividades pendientes de la subfase activa, ordenadas por fecha de creación
    const activities = allActivities
      .filter(act =>
        act.subPhase === activeSubPhase &&
        !completedActivityIds.includes(act.id)
      )

    // 6. Calcular barras de progreso
    // — barra de actividad: % dentro de la subfase activa
    const subPhaseCompleted = activeSubPhase ? (completedBySubphase[activeSubPhase] || 0) : 0
    const subPhaseTotal = activeSubPhase ? (totalBySubphase[activeSubPhase] || 6) : 6

    // — barra de fase: % de las subfases que pertenecen a esta fase
    const subPhasesForPhase = SUBPHASE_ORDER.filter(sp => SUBPHASE_PHASE_MAP[sp] === phase)
    let phaseCompleted = 0
    let phaseTotal = 0
    for (const sp of subPhasesForPhase) {
      phaseCompleted += completedBySubphase[sp] || 0
      phaseTotal += totalBySubphase[sp] || 0
    }

    // — barra de nivel: todas las actividades completadas hasta ahora
    const totalAllActivities = allActivities.length
    const totalAllCompleted = successfulAttempts.length

    const progressBars = {
      activity: subPhaseTotal > 0 ? Math.min(Math.round((subPhaseCompleted / subPhaseTotal) * 100), 100) : 0,
      phase: phaseTotal > 0 ? Math.min(Math.round((phaseCompleted / phaseTotal) * 100), 100) : 0,
      level: totalAllActivities > 0 ? Math.min(Math.round((totalAllCompleted / totalAllActivities) * 100), 100) : 0
    }

    // 7. Contexto pedagógico del tutor
    const pedagogicalContext = getTutorTone(pedagogicalContextSource)

    const firstActivity = activities[0] || null

    console.log(`[available] Subfase activa: ${activeSubPhase} | Completadas: ${subPhaseCompleted}/${subPhaseTotal} | Total actividades pendientes: ${activities.length}`)

    return {
      success: true,
      data: activities,
      firstActivity,
      context: pedagogicalContext,
      progressBars,
      activeSubPhase
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Error al obtener actividades disponibles',
      message: error.message
    })
  }
})
