import { prisma } from '~/server/utils/prisma'
import { getTutorTone } from '~/server/utils/pedagogicalEngine'
import type { Level, Phase } from '@prisma/client'

const SUBPHASE_ORDER = ['1.1', '1.2', '2.1', '2.2', '3.1', '3.2']
const SUBPHASE_TOTAL: Record<string, number> = {
  '1.1': 6, '1.2': 6,
  '2.1': 6, '2.2': 6,
  '3.1': 6, '3.2': 6
}

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const studentProfileId = session.user?.studentProfileId
  const query = getQuery(event)

  const level = ((query.level as string) || 'BASIC').toUpperCase() as Level
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

    // 1. Una sola query para traer todos los intentos exitosos del estudiante (reemplaza el bucle serial)
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

    // 2. Determinar la subfase activa filtrando en memoria (sin más queries)
    // También cargamos todos los totales de una vez
    const [allActivitiesForLevel, pedagogicalContextSource] = await Promise.all([
      prisma.activity.findMany({
        where: { nivel: level, fase: phase, isPublished: true },
        select: { id: true, subPhase: true, titulo: true, descripcion: true, tipo: true, puntajeMaximo: true, contenido: true, claveRespuestas: true, materialApoyo: true, createdAt: true }
      }),
      studentProfileId
        ? prisma.metacognitionChecklist.findFirst({
            where: { studentProfileId },
            orderBy: { createdAt: 'desc' }
          })
        : Promise.resolve(null)
    ])

    // Calcular totales por subfase en memoria
    const totalBySubphase: Record<string, number> = {}
    const completedBySubphase: Record<string, number> = {}

    for (const act of allActivitiesForLevel) {
      const sp = act.subPhase || ''
      totalBySubphase[sp] = (totalBySubphase[sp] || 0) + 1
    }

    for (const attempt of successfulAttempts) {
      if (attempt.activity.fase === phase && attempt.activity.nivel === level) {
        const sp = attempt.activity.subPhase || ''
        completedBySubphase[sp] = (completedBySubphase[sp] || 0) + 1
      }
    }

    // Encontrar la primera subfase que no esté completa
    let activeSubPhase: string | null = null
    for (const sp of SUBPHASE_ORDER) {
      const total = totalBySubphase[sp] || 0
      const completed = completedBySubphase[sp] || 0
      if (total > 0 && completed < total) {
        activeSubPhase = sp
        break
      }
    }

    // 3. Filtrar actividades no completadas de la subfase activa
    const activities = allActivitiesForLevel
      .filter(act =>
        act.subPhase === activeSubPhase &&
        !completedActivityIds.includes(act.id)
      )
      .sort((a, b) => a.createdAt > b.createdAt ? 1 : -1)

    // 4. Calcular barras de progreso en memoria (sin queries adicionales)
    const phaseCompleted = successfulAttempts.filter(
      a => a.activity.fase === phase && a.activity.nivel === level
    ).length
    const phaseTotal = allActivitiesForLevel.length

    const levelCompletedCount = successfulAttempts.filter(
      a => a.activity.nivel === level
    ).length
    const levelTotal = await prisma.activity.count({
      where: { nivel: level, isPublished: true }
    })

    const subPhaseCompleted = activeSubPhase ? (completedBySubphase[activeSubPhase] || 0) : 0
    const subPhaseTotal = activeSubPhase ? (SUBPHASE_TOTAL[activeSubPhase] || 6) : 6

    const progressBars = {
      activity: Math.min(Math.round((subPhaseCompleted / subPhaseTotal) * 100), 100),
      phase: phaseTotal > 0 ? Math.min(Math.round((phaseCompleted / phaseTotal) * 100), 100) : 0,
      level: levelTotal > 0 ? Math.min(Math.round((levelCompletedCount / levelTotal) * 100), 100) : 0
    }

    // 5. Contexto pedagógico
    const pedagogicalContext = getTutorTone(pedagogicalContextSource)

    // 6. Incluir la primera actividad completa en la respuesta (elimina el double-fetch del cliente)
    const firstActivity = activities[0] || null

    return {
      success: true,
      data: activities,
      firstActivity,       // <- datos completos de la primera actividad para el cliente
      context: pedagogicalContext,
      progressBars
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Error al obtener actividades disponibles',
      message: error.message
    })
  }
})
