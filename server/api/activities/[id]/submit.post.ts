import { PrismaClient } from '@prisma/client'
import { evaluateActivity } from '../../../utils/pedagogicalEngine'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const activityId = getRouterParam(event, 'id')
  if (!activityId) throw createError({ statusCode: 400, message: 'Falta activity ID' })

  const body = await readBody(event)
  const studentProfileId = body.studentProfileId || 'demo-profile'
  const respuestaEstudiante = body.respuesta 
  const timeSpentSeconds = body.timeSpentSeconds || 0
  const priorConfidence = body.priorConfidence || 3
  const reflectionLengthChars = body.reflectionLengthChars || 0

  try {
    if (activityId === 'demo-activity-1') {
      const mappingCorrecto: Record<string, string> = { 
        item1: 'direct', 
        item3: 'direct', 
        item4: 'direct', 
        item2: 'indirect' 
      }

      let totalItems = Object.keys(mappingCorrecto).length
      let correctItems = 0
      const errorsCommitted: any[] = []

      if (respuestaEstudiante && typeof respuestaEstudiante === 'object') {
        Object.keys(mappingCorrecto).forEach(itemId => {
          const categoriaCorrecta = mappingCorrecto[itemId]
          const fueCorrecto = respuestaEstudiante[categoriaCorrecta]?.includes(itemId)
          if (fueCorrecto) correctItems++
          else errorsCommitted.push(itemId)
        })
      }

      const score = Math.round((correctItems / totalItems) * 100)
      
      // ── ALINEACIÓN CON EL MOTOR PEDAGÓGICO ──
      
      const result = {
        activityId: 'demo-activity-1',
        baseScore: score,
        timeSpentSeconds: timeSpentSeconds,
        priorConfidence: priorConfidence,
        reflectionLengthChars: reflectionLengthChars,
        errorsCommitted: errorsCommitted as any[]
      }

      const studentModel = {
        id: studentProfileId,
        level: 'BASIC' as any,
        phase: 'ANALYSIS' as any,
        activitiesCompleted: 5,
        activitiesAttempted: 6,
        totalPoints: 1200,
        currentStreakDays: 3,
        performance: {
          successRate: 80,
          avgResponseTime: 45,
          criticalThinkingScore: 70,
          metacognitionScore: 40 // Para probar la regla de guía de estrategias
        },
        metacognitiveState: {
          confidenceLevel: priorConfidence,
          calibrationScore: 0
        },
        errorPatterns: {
          frequentErrorTypes: [],
          weaknesses: [],
          strengths: []
        }
      }

      // Llamada al motor con los objetos correctos
      const evaluation = evaluateActivity(result, studentModel)

      return {
        message: 'Actividad evaluada con éxito',
        decision: {
          ...evaluation.decision,
          evaluationDetail: {
            correct: correctItems,
            total: totalItems,
            errors: errorsCommitted,
            correctMapping: mappingCorrecto
          },
          newBadges: evaluation.updatedStudent.errorPatterns.strengths
            .filter(s => s === 'CONSTANCIA')
            .map(s => ({ id: s, name: 'Constancia' }))
        }
      }
    }

    return { message: 'Lógica real no implementada' }

  } catch (error: any) {
    console.error('Error en evaluación:', error)
    throw createError({ statusCode: 500, message: 'Error interno en el Motor Pedagógico' })
  }
})
