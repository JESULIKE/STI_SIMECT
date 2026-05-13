import { prisma } from '~/server/utils/prisma'
import { evaluateActivity } from '~/server/utils/pedagogicalEngine'
import { checkAndAwardBadges } from '~/server/utils/gamification'

// Mapa de subfases: cuántas actividades se necesitan para completar cada subfase y qué sigue
const SUBPHASE_CONFIG: Record<string, { totalActivities: number, nextSubPhase: string | null }> = {
  '1.1': { totalActivities: 6, nextSubPhase: '1.2' },
  '1.2': { totalActivities: 6, nextSubPhase: null }, // null = completó la fase
  '2.1': { totalActivities: 6, nextSubPhase: '2.2' },
  '2.2': { totalActivities: 6, nextSubPhase: null },
  '3.1': { totalActivities: 6, nextSubPhase: '3.2' },
  '3.2': { totalActivities: 6, nextSubPhase: null },
}

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session.user) {
    throw createError({ statusCode: 401, statusMessage: 'No autorizado' })
  }

  const body = await readBody(event)
  const { activityId, respuesta, confianzaPrevia, tiempoSegundos } = body
  const studentProfileId = session.user.studentProfileId

  if (!studentProfileId) {
    throw createError({ statusCode: 400, statusMessage: 'Solo los estudiantes pueden enviar actividades' })
  }

  try {
    if (!activityId || !respuesta) {
      throw createError({ statusCode: 400, statusMessage: 'Faltan datos requeridos (activityId o respuesta)' })
    }

    // 1. Obtener la actividad y el perfil del estudiante
    const [activity, profile] = await Promise.all([
      prisma.activity.findUnique({ where: { id: activityId } }),
      prisma.studentProfile.findUnique({ 
        where: { id: studentProfileId },
        include: { progresses: true } 
      })
    ])

    if (!activity || !profile) {
      throw createError({ statusCode: 404, statusMessage: 'Actividad o Perfil no encontrado' })
    }

    console.log('[Submit] Iniciando evaluación para:', activity.titulo)

    // 2. Evaluar usando el Motor Pedagógico
    const evaluation = evaluateActivity(activity, respuesta, {
      priorConfidence: confianzaPrevia,
      timeSeconds: tiempoSegundos,
      student: {
        id: profile.id,
        level: activity.nivel,
        phase: activity.fase,
        currentStreakDays: profile.currentStreak || 1,
        totalPoints: profile.totalPoints,
        globalAccuracy: 0,
        ipc: 0,
        calibrationIndex: 0,
        progressionRate: 0,
        recoveryIndex: 0,
        helpRequestRate: 0,
        metacognitiveScore: 0
      }
    })

    console.log('[Submit] Evaluación completada. Puntaje:', evaluation.scoreDetails.totalGained)

    // 3. Verificar si ya completó esta actividad antes
    const previousSuccess = await prisma.activityAttempt.findFirst({
      where: { 
        studentProfileId, 
        activityId, 
        puntajeObtenido: { gte: 10 } 
      }
    })

    const isFirstSuccess = !previousSuccess && evaluation.scoreDetails.totalGained >= 10

    // 4. Calcular progreso dinámico si es primera vez exitosa
    let subPhaseUnlocked: string | null = null
    let progressPercent = 0

    if (isFirstSuccess && activity.subPhase) {
      const config = SUBPHASE_CONFIG[activity.subPhase]
      
      // Contar cuántas actividades de esta subfase ya completó (incluyendo esta)
      const completedInSubPhase = await prisma.activityAttempt.count({
        where: {
          studentProfileId,
          puntajeObtenido: { gte: 10 },
          activity: {
            fase: activity.fase,
            nivel: activity.nivel,
            subPhase: activity.subPhase,
            id: { not: activityId } // Excluir la actual (aún no guardada)
          }
        }
      })
      
      const completedAfterThis = completedInSubPhase + 1
      const total = config?.totalActivities || 6
      progressPercent = Math.min((completedAfterThis / total) * 100, 100)

      // Verificar si ya completó la subfase completa
      if (completedAfterThis >= total && config?.nextSubPhase) {
        subPhaseUnlocked = config.nextSubPhase
        console.log(`[Submit] ¡Subfase ${activity.subPhase} completada! Desbloqueando ${subPhaseUnlocked}`)
      }
    }

    // 5. TRANSACCIÓN ATÓMICA
    const result = await prisma.$transaction(async (tx) => {
      try {
        // A. Registrar el intento
        const attempt = await tx.activityAttempt.create({
          data: {
            studentProfileId,
            activityId,
            respuesta,
            puntajeObtenido: evaluation.scoreDetails.totalGained,
            tiempoSegundos,
            confianzaPrevia,
            feedbackRecibido: evaluation as any
          }
        })

        // B. Actualizar progreso de subfase
        if (isFirstSuccess && activity.subPhase) {
          await tx.progress.upsert({
            where: {
              studentProfileId_level_phase_subPhase: { 
                studentProfileId, 
                level: activity.nivel, 
                phase: activity.fase,
                subPhase: activity.subPhase
              }
            },
            update: {
              accumulatedScore: { increment: evaluation.scoreDetails.totalGained },
              percentCompleted: progressPercent
            },
            create: {
              studentProfileId,
              level: activity.nivel,
              phase: activity.fase,
              subPhase: activity.subPhase,
              accumulatedScore: evaluation.scoreDetails.totalGained,
              percentCompleted: progressPercent
            }
          })

          await tx.studentProfile.update({
            where: { id: studentProfileId },
            data: {
              totalPoints: { increment: evaluation.scoreDetails.totalGained },
              lastActivityAt: new Date()
            }
          })
        } else if (!isFirstSuccess) {
          await tx.studentProfile.update({
            where: { id: studentProfileId },
            data: { lastActivityAt: new Date() }
          })
        }

        return { attempt }
      } catch (innerError: any) {
        console.error('[Submit] Error dentro de la transacción:', innerError)
        throw innerError
      }
    })

    // 6. Verificar Insignias
    const newBadges = await checkAndAwardBadges(studentProfileId, evaluation)

    // 7. Calcular barras de progreso actualizadas para el frontend
    const [phaseCompleted, phaseTotal, levelCompleted, levelTotal] = await Promise.all([
      // Completadas en esta fase (todas las subfases)
      prisma.activityAttempt.count({
        where: {
          studentProfileId,
          puntajeObtenido: { gte: 10 },
          activity: { fase: activity.fase, nivel: activity.nivel }
        }
      }),
      // Total en esta fase
      prisma.activity.count({
        where: { fase: activity.fase, nivel: activity.nivel, isPublished: true }
      }),
      // Completadas en el nivel completo
      prisma.activityAttempt.count({
        where: {
          studentProfileId,
          puntajeObtenido: { gte: 10 },
          activity: { nivel: activity.nivel }
        }
      }),
      // Total en el nivel
      prisma.activity.count({
        where: { nivel: activity.nivel, isPublished: true }
      }),
    ])

    // Progreso de la actividad dentro de la subfase actual
    const subPhaseConfig = activity.subPhase ? SUBPHASE_CONFIG[activity.subPhase] : null
    const subPhaseCompleted = await prisma.activityAttempt.count({
      where: {
        studentProfileId,
        puntajeObtenido: { gte: 10 },
        activity: { fase: activity.fase, nivel: activity.nivel, subPhase: activity.subPhase }
      }
    })

    const activityProgressBar = subPhaseConfig 
      ? Math.min(Math.round((subPhaseCompleted / subPhaseConfig.totalActivities) * 100), 100)
      : 0
    const phaseProgressBar = phaseTotal > 0 ? Math.min(Math.round((phaseCompleted / phaseTotal) * 100), 100) : 0
    const levelProgressBar = levelTotal > 0 ? Math.min(Math.round((levelCompleted / levelTotal) * 100), 100) : 0

    return {
      success: true,
      decision: {
        ...evaluation,
        scoreDetails: {
          ...evaluation.scoreDetails,
          totalGained: isFirstSuccess ? evaluation.scoreDetails.totalGained : 0
        },
        attemptId: result.attempt.id,
        newBadges,
        isRepeat: !isFirstSuccess,
        subPhaseUnlocked,
        progressBars: {
          activity: activityProgressBar,
          phase: phaseProgressBar,
          level: levelProgressBar
        }
      }
    }

  } catch (error: any) {
    console.error('--- ERROR CRÍTICO EN SUBMIT ---')
    console.error('Mensaje:', error.message)
    console.error('Stack:', error.stack)
    if (error.code) console.error('Prisma Code:', error.code)
    if (error.meta) console.error('Prisma Meta:', error.meta)
    
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusCode ? error.statusMessage : `Error interno: ${error.message}`
    })
  }
})
