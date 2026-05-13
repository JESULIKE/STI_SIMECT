import { Level, Phase, ErrorType } from '@prisma/client'
import { evaluateActivity } from '../../utils/pedagogicalEngine'
import type { StudentModel, ActivityResult } from '../../utils/types'

export default defineEventHandler(async (event) => {
  // Leer el body de la petición
  const body = await readBody(event)

  // Idealmente aquí se validaría el body con Zod, Joi, etc.
  // Por simplicidad, extraemos asumiendo la estructura correcta:
  
  const student: StudentModel = {
    id: body.student?.id || 'guest',
    level: body.student?.level || Level.BASIC,
    phase: body.student?.phase || Phase.ANALYSIS,
    totalPoints: body.student?.totalPoints || 0,
    currentStreakDays: body.student?.currentStreakDays || 0,
    recentErrors: body.student?.recentErrors || [],
    calibracionMetacognitiva: body.student?.calibracionMetacognitiva || 0
  }

  const result: ActivityResult = {
    activityId: body.result?.activityId || 'act-unknown',
    baseScore: body.result?.baseScore ?? 0,
    timeSpentSeconds: body.result?.timeSpentSeconds ?? 0,
    priorConfidence: body.result?.priorConfidence ?? 2,
    reflectionLengthChars: body.result?.reflectionLengthChars ?? 0,
    errorsCommitted: body.result?.errorsCommitted || []
  }

  try {
    // Llamada al motor pedagógico
    const evaluation = evaluateActivity(student, result)

    // Aquí (en futuras iteraciones) guardaríamos en la DB la actividad, la decisión, etc.

    return {
      success: true,
      data: evaluation
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Error evaluando la actividad',
      message: error.message
    })
  }
})
