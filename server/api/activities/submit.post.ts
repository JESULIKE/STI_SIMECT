import { prisma } from '~/server/utils/prisma'
import { evaluateActivity } from '~/server/utils/pedagogicalEngine'
import { checkAndAwardBadges } from '~/server/utils/gamification'
import { subirNivel, bajarNivel } from '~/server/utils/levelEngine'

// Mapa de subfases: cuántas actividades se necesitan para completar cada subfase y qué sigue
const SUBPHASE_CONFIG: Record<string, { totalActivities: number, nextSubPhase: string | null }> = {
  '1.1': { totalActivities: 2, nextSubPhase: '1.2' },
  '1.2': { totalActivities: 2, nextSubPhase: null }, // null = completó la fase
  '2.1': { totalActivities: 2, nextSubPhase: '2.2' },
  '2.2': { totalActivities: 2, nextSubPhase: null },
  '3.1': { totalActivities: 2, nextSubPhase: '3.2' },
  '3.2': { totalActivities: 2, nextSubPhase: null },
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
    // 3. Obtener el estado actual del estudiante (intentos previos exitosos)
    const successfulAttempts = await prisma.activityAttempt.findMany({
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

    const isFirstSuccess = !successfulAttempts.some(a => a.activityId === activityId) && evaluation.scoreDetails.totalGained >= 10

    // 4. Calcular progreso dinámico si es primera vez exitosa
    let subPhaseUnlocked: string | null = null
    let progressPercent = 0
    let bonusPointsAwarded = 0
    let bonusMessage: string | null = null
    let isSubPhaseComplete = false

    if (isFirstSuccess && activity.subPhase) {
      const config = SUBPHASE_CONFIG[activity.subPhase]

      // Contar cuántas actividades de esta subfase ya completó (sin filtro de nivel — todos responden los 6)
      const completedInSubPhase = successfulAttempts.filter(
        a => a.activity.fase === activity.fase &&
          a.activity.subPhase === activity.subPhase &&
          a.activityId !== activityId
      ).length

      const completedAfterThis = completedInSubPhase + 1
      const total = config?.totalActivities || 1
      progressPercent = Math.min((completedAfterThis / total) * 100, 100)

      console.log(`[Submit] Subfase ${activity.subPhase}: ${completedAfterThis}/${total} completadas`)

      // Verificar si ya completó la subfase completa
      if (completedAfterThis >= total) {
        isSubPhaseComplete = true
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
        let newLevel = profile.nivelActual;
        let levelChanged = false;

        const isIncorrect = evaluation.scoreDetails.basePoints < 50;

        if (isIncorrect) {
          // Respuesta incorrecta -> Baja un nivel inmediatamente
          const loweredLevel = bajarNivel(profile.nivelActual as any);
          if (loweredLevel !== profile.nivelActual) {
            newLevel = loweredLevel;
            levelChanged = true;
            console.log(`[Submit] Respuesta incorrecta (${evaluation.scoreDetails.basePoints}%). Descendiendo nivel de ${profile.nivelActual} a ${newLevel}`);
          }
        } else {
          // Respuesta correcta -> Verificar si son 2 correctas seguidas para subir de nivel
          const lastAttempt = await tx.activityAttempt.findFirst({
            where: { studentProfileId },
            orderBy: { createdAt: 'desc' }
          });

          const wasLastAttemptCorrect = lastAttempt && 
            (lastAttempt.feedbackRecibido as any)?.scoreDetails?.basePoints >= 50;

          if (wasLastAttemptCorrect) {
            const raisedLevel = subirNivel(profile.nivelActual as any);
            if (raisedLevel !== profile.nivelActual) {
              newLevel = raisedLevel;
              levelChanged = true;
              console.log(`[Submit] 2 correctas seguidas. Subiendo nivel de ${profile.nivelActual} a ${newLevel}`);
            }
          }
        }

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

        // B. Registrar ErrorPattern si es incorrecto (Para Analítica Docente)
        if (isIncorrect) {
          // Mapear el error a un ErrorType válido de Prisma
          let tipoError: any = 'CONCEPTUAL'
          if (activity.fase === 'EVALUATION') tipoError = 'LOGICAL'
          if (activity.fase === 'ANALYSIS') tipoError = 'READING_COMPREHENSION'
            
          await tx.errorPattern.create({
            data: {
              studentProfileId,
              activityAttemptId: attempt.id,
              tipoError,
              descripcion: `Falla en SF ${activity.subPhase || 'General'}: El estudiante falló la actividad "${activity.titulo}". Base Score: ${evaluation.scoreDetails.basePoints}`
            }
          })
        }

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
              lastActivityAt: new Date(),
              nivelActual: levelChanged ? newLevel : undefined
            }
          })
        } else if (!isFirstSuccess) {
          await tx.studentProfile.update({
            where: { id: studentProfileId },
            data: { 
              lastActivityAt: new Date(),
              nivelActual: levelChanged ? newLevel : undefined
            }
          })
        }

        return { attempt, newLevel }
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

    // Calcular barras de progreso basadas en subfases completadas (2 actividades por subfase)
    const completedSubPhases = new Set<string>()
    const subPhaseCounts: Record<string, number> = {}

    for (const attempt of successfulAttempts) {
      if (attempt.activity.subPhase) {
        subPhaseCounts[attempt.activity.subPhase] = (subPhaseCounts[attempt.activity.subPhase] || 0) + 1
      }
    }

    for (const sp in subPhaseCounts) {
      const config = SUBPHASE_CONFIG[sp]
      if (subPhaseCounts[sp] >= (config?.totalActivities || 2)) {
        completedSubPhases.add(sp)
      }
    }

    const SUBPHASE_ORDER = ['1.1', '1.2', '2.1', '2.2', '3.1', '3.2']
    const SUBPHASE_PHASE_MAP: Record<string, string> = {
      '1.1': 'ANALYSIS', '1.2': 'ANALYSIS',
      '2.1': 'EVALUATION', '2.2': 'EVALUATION',
      '3.1': 'JUDGMENT', '3.2': 'JUDGMENT',
    }

    // Progreso de la actividad dentro de la subfase actual
    const currentSpCount = activity.subPhase ? (subPhaseCounts[activity.subPhase] || 0) : 0
    const configSp = activity.subPhase ? SUBPHASE_CONFIG[activity.subPhase] : null
    const activityProgressBar = configSp ? Math.min(Math.round((currentSpCount / configSp.totalActivities) * 100), 100) : 0

    // Progreso de fase
    const subPhasesForPhase = SUBPHASE_ORDER.filter(sp => SUBPHASE_PHASE_MAP[sp] === activity.fase)
    const phaseCompletedCount = subPhasesForPhase.filter(sp => completedSubPhases.has(sp)).length
    const phaseTotalCount = subPhasesForPhase.length
    const phaseProgressBar = phaseTotalCount > 0 ? Math.min(Math.round((phaseCompletedCount / phaseTotalCount) * 100), 100) : 0

    // Progreso de nivel
    const totalAllCompletedCount = completedSubPhases.size
    const totalAllSubPhasesCount = SUBPHASE_ORDER.length
    const levelProgressBar = Math.min(Math.round((totalAllCompletedCount / totalAllSubPhasesCount) * 100), 100)

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
        currentLevel: result.newLevel,
        newBadges,
        isRepeat: !isFirstSuccess,
        subPhaseUnlocked,
        isSubPhaseComplete,
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
