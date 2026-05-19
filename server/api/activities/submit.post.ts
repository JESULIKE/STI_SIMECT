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

    // 3. Obtener el estado actual del estudiante (intentos previos y totales)
    // IMPORTANTE: No filtramos por nivel — todos responden los 6 reactivos de cada subfase
    const [successfulAttempts, phaseTotal, totalAllActivities, subPhaseTotalDb] = await Promise.all([
      prisma.activityAttempt.findMany({
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
      }),
      // Total en esta fase (sin filtro de nivel)
      prisma.activity.count({
        where: { fase: activity.fase, isPublished: true }
      }),
      // Total de todas las actividades (para barra de nivel global)
      prisma.activity.count({
        where: { isPublished: true }
      }),
      // Total dinámico en esta subfase (sin filtro de nivel)
      prisma.activity.count({
        where: { fase: activity.fase, subPhase: activity.subPhase, isPublished: true }
      }),
    ])

    const isFirstSuccess = !successfulAttempts.some(a => a.activityId === activityId) && evaluation.scoreDetails.totalGained >= 10

    // 4. Calcular progreso dinámico si es primera vez exitosa
    let subPhaseUnlocked: string | null = null
    let progressPercent = 0
    let bonusPointsAwarded = 0
    let bonusMessage: string | null = null

    if (isFirstSuccess && activity.subPhase) {
      const config = SUBPHASE_CONFIG[activity.subPhase]
      
      // Contar cuántas actividades de esta subfase ya completó (sin filtro de nivel — todos responden los 6)
      const completedInSubPhase = successfulAttempts.filter(
        a => a.activity.fase === activity.fase &&
             a.activity.subPhase === activity.subPhase &&
             a.activityId !== activityId
      ).length
      
      const completedAfterThis = completedInSubPhase + 1
      const total = subPhaseTotalDb > 0 ? subPhaseTotalDb : (config?.totalActivities || 6)
      progressPercent = Math.min((completedAfterThis / total) * 100, 100)

      console.log(`[Submit] Subfase ${activity.subPhase}: ${completedAfterThis}/${total} completadas`)

      // Verificar si ya completó la subfase completa
      if (completedAfterThis >= total) {
        if (config?.nextSubPhase) {
          subPhaseUnlocked = config.nextSubPhase
          console.log(`[Submit] ¡Subfase ${activity.subPhase} completada! Desbloqueando ${subPhaseUnlocked}`)
        } else {
          // Si nextSubPhase es null, significa que completó toda la Fase!
          bonusPointsAwarded += 50
          bonusMessage = "¡Fase completada exitosamente! +50 Puntos Bonus 🎉"
          console.log(`[Submit] ¡Fase ${activity.fase} completada! Otorgando 50 puntos de bonus.`)
          
          if (activity.subPhase === '3.2') {
            bonusPointsAwarded += 150
            bonusMessage = "¡Nivel completado! ¡Eres un pensador crítico de élite! +200 Puntos Bonus 🎉"
            console.log(`[Submit] ¡Subfase 3.2 completada! Otorgando 150 puntos adicionales (Total bonus: 200).`)
          }
        }
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
            puntajeObtenido: evaluation.scoreDetails.totalGained + bonusPointsAwarded,
            tiempoSegundos,
            confianzaPrevia,
            feedbackRecibido: evaluation as any
          }
        })

        // B. Actualizar progreso de subfase
        if (isFirstSuccess && activity.subPhase) {
          const pointsToAdd = evaluation.scoreDetails.totalGained + bonusPointsAwarded

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
              accumulatedScore: { increment: pointsToAdd },
              percentCompleted: progressPercent
            },
            create: {
              studentProfileId,
              level: activity.nivel,
              phase: activity.fase,
              subPhase: activity.subPhase,
              accumulatedScore: pointsToAdd,
              percentCompleted: progressPercent
            }
          })

          await tx.studentProfile.update({
            where: { id: studentProfileId },
            data: {
              totalPoints: { increment: pointsToAdd },
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

    // 6. Verificar Insignias (con contexto de fase/nivel completado)
    const isLevelCompleteContext = activity.subPhase === '3.2' && bonusPointsAwarded >= 150
    const newBadges = await checkAndAwardBadges(studentProfileId, evaluation, {
      isPhaseComplete: bonusPointsAwarded > 0 || !!subPhaseUnlocked === false && bonusMessage !== null,
      completedPhase: (bonusPointsAwarded > 0 && !isLevelCompleteContext) ? activity.fase : undefined,
      isLevelComplete: isLevelCompleteContext,
      completedLevel: isLevelCompleteContext ? activity.nivel : undefined,
      isReinforcement: false // TODO: detectar si era actividad de refuerzo desde el body
    })

    // 7. Calcular barras de progreso actualizadas para el frontend (usando datos en memoria)
    // Añadimos la actividad actual a la lista de exitosas si fue su primer éxito
    if (isFirstSuccess) {
      successfulAttempts.push({
        activityId,
        activity: {
          fase: activity.fase,
          nivel: activity.nivel,
          subPhase: activity.subPhase
        }
      })
    }

    // Calcular barras de progreso sin filtro de nivel
    const phaseCompleted = successfulAttempts.filter(
      a => a.activity.fase === activity.fase
    ).length

    const totalAllCompleted = successfulAttempts.length

    // Progreso de la actividad dentro de la subfase actual (sin filtro de nivel)
    const subPhaseCompleted = successfulAttempts.filter(
      a => a.activity.fase === activity.fase &&
           a.activity.subPhase === activity.subPhase
    ).length

    const totalForBar = subPhaseTotalDb > 0 ? subPhaseTotalDb : 6
    const activityProgressBar = Math.min(Math.round((subPhaseCompleted / totalForBar) * 100), 100)
    const phaseProgressBar = phaseTotal > 0 ? Math.min(Math.round((phaseCompleted / phaseTotal) * 100), 100) : 0
    const levelProgressBar = totalAllActivities > 0 ? Math.min(Math.round((totalAllCompleted / totalAllActivities) * 100), 100) : 0

    return {
      success: true,
      decision: {
        ...evaluation,
        scoreDetails: {
          ...evaluation.scoreDetails,
          totalGained: isFirstSuccess ? (evaluation.scoreDetails.totalGained + bonusPointsAwarded) : 0,
          bonusPoints: bonusPointsAwarded,
          bonusMessage: bonusMessage
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
