import { ActionType } from './types'
import type { StudentModel, ScoreDetails, ActivityResult, PedagogicalDecision } from './types'

// ── MOTOR PEDAGÓGICO CORE ──────────────────────────────────────────────────

/**
 * Calcula el puntaje base comparando la respuesta del estudiante con la clave (Sección 11.1.1)
 */
export function calculateBaseScore(activity: any, respuesta: any): number {
  if (!respuesta || !activity.claveRespuestas) return 0

  // 1. Manejo de Opción Múltiple (MULTIPLE_CHOICE_REASONED)
  if (activity.tipo === 'MULTIPLE_CHOICE_REASONED') {
    const studentChoice = respuesta.selectedId || respuesta
    return studentChoice === activity.claveRespuestas.correcta ? 100 : 0
  }

  // 2. Manejo de Texto Libre (TEXT_MARKUP)
  if (activity.tipo === 'TEXT_MARKUP') {
    const studentText = (respuesta.text || respuesta || '').toString().trim().toLowerCase()
    const correctText = (activity.claveRespuestas.respuestaExacta || '').toString().trim().toLowerCase()
    return studentText === correctText ? 100 : 0
  }

  // 3. Manejo de Drag and Drop (DRAG_AND_DROP) - Lógica existente normalizada
  const mapping = activity.claveRespuestas.mapping || {}
  const studentMapping = respuesta.mapping || respuesta

  const isCategoryKeyed = Object.values(studentMapping).some(v => Array.isArray(v))
  let flatStudentMap: Record<string, string> = {}
  if (isCategoryKeyed) {
    for (const [catId, items] of Object.entries(studentMapping)) {
      if (Array.isArray(items)) {
        items.forEach((itemId: string) => {
          flatStudentMap[itemId] = catId
        })
      }
    }
  } else {
    flatStudentMap = studentMapping as Record<string, string>
  }

  const items = activity.contenido.items || []
  if (items.length === 0) return 0

  let correctCount = 0
  items.forEach((item: any) => {
    if (flatStudentMap[item.id] && flatStudentMap[item.id] === mapping[item.id]) {
      correctCount++
    }
  })

  return Math.round((correctCount / items.length) * 100)
}

/**
 * Función Maestra: Evalúa una actividad y produce una decisión pedagógica
 */
export function evaluateActivity(activity: any, respuesta: any, context: { priorConfidence: number, timeSeconds: number, student?: StudentModel }) {
  // 1. Calcular Desempeño Base
  let baseScore = calculateBaseScore(activity, respuesta)
  
  // Escalar por puntajeMaximo si es menor a 100 (ej. Actividad de Refuerzo de 40-70 puntos)
  if (activity.puntajeMaximo && activity.puntajeMaximo < 100) {
    baseScore = Math.round((baseScore * activity.puntajeMaximo) / 100)
  }
  
  // 1.5 Extraer justificación específica del contenido si existe (MULTIPLE_CHOICE)
  let specificJustification = ''
  if (activity.tipo === 'MULTIPLE_CHOICE_REASONED') {
    const studentChoice = respuesta.selectedId || respuesta
    const option = activity.contenido.opciones?.find((o: any) => o.id === studentChoice)
    if (option?.justa) {
      specificJustification = option.justa
    }
  }

  // 2. Preparar Resultado para el motor
  const result: ActivityResult = {
    activityId: activity.id,
    baseScore: baseScore,
    timeSpentSeconds: context.timeSeconds,
    priorConfidenceStars: context.priorConfidence,
    helpRequestsCount: 0 
  }

  // 3. Crear un modelo de estudiante temporal (si no existe) para el cálculo
  const student = context.student || {
    id: 'unknown',
    level: activity.nivel,
    phase: activity.fase,
    currentStreakDays: 1,
    globalAccuracy: 0,
    ipc: 0,
    calibrationIndex: 0,
    progressionRate: 0,
    recoveryIndex: 0,
    helpRequestRate: 0,
    metacognitiveScore: 0,
    totalPoints: 0
  }

  // 4. Calcular Puntuación Detallada (Bonos, Racha, etc)
  const scoreDetails = calculateScore(student, result)
  
  // 5. Determinar Acción Siguiente y Mensaje
  const decision = getNextAction(student, result, scoreDetails, specificJustification)
  
  return decision
}

/**
 * Calcula la puntuación final basada en el desempeño, velocidad y metacognición (Sección 8.3)
 */
export function calculateScore(student: StudentModel, result: ActivityResult): ScoreDetails {
  const baseScore = result.baseScore
  let speedBonus = 0
  let metacognitiveBonus = 0
  
  // 1. Bono por velocidad (Solo si baseScore >= 70%)
  if (baseScore >= 70) {
    if (result.timeSpentSeconds < 60) speedBonus = 20
    else if (result.timeSpentSeconds < 120) speedBonus = 10
  }

  // 2. Bono Metacognitivo (Reflexión > 40 chars + Calibración < 15%)
  if ((result.reflectionText || '').length >= 40) {
    metacognitiveBonus += 10
  }
  
  // La calibración mide la diferencia entre la confianza (1-3 estrellas -> 33-100%) y el resultado real
  const confidencePercent = (result.priorConfidenceStars || 0) * 33.3
  const calibrationError = Math.abs(confidencePercent - baseScore)
  
  if (calibrationError < 15) {
    metacognitiveBonus += 5
  }

  const subtotal = baseScore + speedBonus + metacognitiveBonus
  
  // 3. Multiplicador de Racha (Sección 8.3)
  let streakMultiplier = 1
  if (student.currentStreakDays >= 7) streakMultiplier = 1.5
  else if (student.currentStreakDays >= 3) streakMultiplier = 1.2

  const totalGained = Math.round(subtotal * streakMultiplier)

  // Indicadores de Aprendizaje de la Sesión (Sección 11.2)
  const sessionIPC = baseScore // En una actividad individual, el IPC es su baseScore
  const sessionCalibration = Math.max(0, 100 - calibrationError) // Escala 0-100 para promediar después

  return {
    basePoints: baseScore,
    speedBonus,
    metacognitiveBonus,
    streakMultiplier,
    totalGained,
    sessionIPC,
    sessionCalibration
  }
}

/**
 * Determina el tono de Manuel basado en la metacognición inicial (Sección 4.2)
 */
export function getTutorTone(lastChecklist: any) {
  if (!lastChecklist) return { tone: 'NORMAL', message: '¡Hola! Vamos a empezar el reto de hoy.' }

  const lowConfidence = lastChecklist.confianzaInicial <= 2
  const sentiment = (lastChecklist.queSe || '').toLowerCase()
  const isStruggling = sentiment.includes('difícil') || sentiment.includes('cansado') || sentiment.includes('no sé')

  if (lowConfidence || isStruggling) {
    return {
      tone: 'SUPPORTIVE',
      message: 'He notado que este tema te genera dudas. No te preocupes, estoy aquí para guiarte paso a paso. ¡Tómate tu tiempo!',
      extraHelp: true
    }
  }

  return {
    tone: 'ENCOURAGING',
    message: '¡Excelente actitud! Veo que vienes con todo para este reto. ¡A por ello!',
    extraHelp: false
  }
}

/**
 * Determina la siguiente acción pedagógica basada en el resultado y el historial (Sección 8.2)
 */
export function getNextAction(student: StudentModel, result: ActivityResult, scoreDetails: ScoreDetails, specificJustification?: string): PedagogicalDecision {
  const secondaryActions: ActionType[] = []
  let message = specificJustification || '¡Muy bien! Has completado la actividad.'
  let action = ActionType.NEXT_ACTIVITY
  let difficultyReduction = false
  
  // Paso 9: Evaluación del resultado (Puntajes granulares)
  const isExcellent = result.baseScore >= 90
  const needsImprovement = result.baseScore < 70
  const hasDifficulties = result.baseScore < 50

  // Paso 11: Consulta del historial (Simulado: si viene de racha baja)
  const isStrugglingInGeneral = (student.averageScore || 100) < 60

  // Paso 12: Aplicación de reglas pedagógicas adaptativas (Requerimiento Paul & Elder)
  const isHighLevel = student.level === 'ADVANCED'

  if (hasDifficulties) {
    let pedagogicalMessage = ''
    // Si falla en nivel Alto -> Proponer nivel Medio de la misma sub-fase
    if (isHighLevel) {
      action = ActionType.REINFORCEMENT
      pedagogicalMessage = 'Este desafío requiere un nivel de precisión mayor. ¿Tu análisis actual es lo suficientemente "Claro" y "Profundo"? Vamos a intentar un ejercicio intermedio para fortalecer tu lógica.'
      difficultyReduction = true
    } 
    // Si el error es recurrente (ej. 2 veces fallando en la misma sub-fase) -> Volver a Fase 1
    else if ((student.subPhaseConsecutiveErrors || 0) >= 1) {
      action = ActionType.GO_BACK_TO_PHASE_1
      pedagogicalMessage = 'He notado que persisten algunas dudas en esta etapa. Para construir un juicio sólido, es vital volver a la IDENTIFICACIÓN DE HECHOS. Reforcemos las bases antes de avanzar.'
    }
    else {
      action = ActionType.REINFORCEMENT
      pedagogicalMessage = 'Antes de continuar, reflexiona: ¿Tu respuesta es lo suficientemente "Precisa"? Un buen pensador crítico verifica sus fuentes. Hagamos un refuerzo rápido.'
      difficultyReduction = true
    }
    
    // Combinar con la justificación específica del reactivo
    message = specificJustification ? `${specificJustification} ${pedagogicalMessage}` : pedagogicalMessage

  } else if (needsImprovement) {
    secondaryActions.push(ActionType.STRATEGY_GUIDE)
    const pedagogicalMessage = 'Vas por buen camino. Sin embargo, ¿has considerado si tu argumento es "Lógico" y "Relevante"? Revisa esta guía de estándares intelectuales.'
    message = specificJustification ? `${specificJustification} ${pedagogicalMessage}` : pedagogicalMessage
  }

  // REGLA: Desbloqueo de Narrativa (Sección 4.2)
  let unlockChapter: number | undefined = undefined
  if (student.level === 'BASIC' && result.baseScore >= 60) {
    if (student.phase === 'ANALYSIS') unlockChapter = 1
    if (student.phase === 'EVALUATION') unlockChapter = 2
    if (student.phase === 'JUDGMENT') unlockChapter = 3
  }

  // REGLA: Progresión de Nivel y Umbrales (Sección 7)
  const levelThreshold = student.level === 'ADVANCED' ? 75 : 70
  // Aquí se usaría el promedio real del nivel, usamos scoreDetails para la demo
  if (scoreDetails.totalGained < levelThreshold && action === ActionType.NEXT_ACTIVITY) {
    // Si el desempeño es bajo, sugerir pausa o revisión
    secondaryActions.push(ActionType.METACOGNITIVE_ALERT)
  }

  return {
    action,
    secondaryActions,
    message,
    scoreDetails,
    cognitiveLevel: result.baseScore > 80 ? 'ANALIZAR' : 'COMPRENDER',
    temporaryDifficultyReduction: difficultyReduction,
    unlockChapter
  }
}
