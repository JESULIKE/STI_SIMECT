import { defineStore } from 'pinia'
import type { Level, Phase } from '@prisma/client'

export interface StudentProgress {
  // 1. Progreso Estructural
  level: Level
  phase: Phase
  subPhase: string | null
  activitiesCompleted: number
  activitiesAttempted: number
  totalPoints: number
  sessionPoints: number
  
  // 2. Desempeño
  performance: {
    successRate: number
    avgResponseTime: number
    criticalThinkingScore: number
    metacognitionScore: number
  }

  // 3. Estado Metacognitivo
  metacognitiveState: {
    confidenceLevel: number
    calibrationScore: number
    strategiesUsed: string[]
  }

  // 4. Patrones de Error y Gamificación
  errorPatterns: {
    frequentErrorTypes: string[]
    weaknesses: string[]
    strengths: string[]
  }
  currentStreak: number
  longestStreak: number
  earnedBadges: string[]
  
  // 5. Indicadores de UI — dinámicos (Sección 9.4)
  currentActivityProgress: number  // 0-100: Progreso dentro de subfase actual
  currentPhaseProgress: number     // 0-100: Progreso dentro de la fase actual
  currentLevelProgress: number     // 0-100: Progreso total del nivel

  // Control de Flujo
  studentProfileId: string | null
  needsMetacognitiveChecklist: boolean
  lastFeedbackMessage: string | null
  activitiesSinceLastPause: number
  needsConsciousPause: boolean
}

export const useStudentStore = defineStore('student', () => {
  // Estado inicial — valores de UI en 0 (se rellenan desde la DB)
  const progress = ref<StudentProgress>({
    level: 'BASIC',
    phase: 'ANALYSIS',
    subPhase: null,
    activitiesCompleted: 0,
    activitiesAttempted: 0,
    totalPoints: 0,
    sessionPoints: 0,
    
    performance: {
      successRate: 0,
      avgResponseTime: 0,
      criticalThinkingScore: 0,
      metacognitionScore: 0
    },

    metacognitiveState: {
      confidenceLevel: 3,
      calibrationScore: 0,
      strategiesUsed: []
    },

    errorPatterns: {
      frequentErrorTypes: [],
      weaknesses: [],
      strengths: []
    },

    currentStreak: 0,
    longestStreak: 0,
    earnedBadges: [],
    
    // Estos valores ahora empiezan en 0 y se actualizan dinámicamente
    currentActivityProgress: 0,
    currentPhaseProgress: 0,
    currentLevelProgress: 0,

    studentProfileId: null,
    needsMetacognitiveChecklist: true,
    lastFeedbackMessage: null,
    activitiesSinceLastPause: 0,
    needsConsciousPause: false,
  })

  // Getters
  const isChecklistPending = computed(() => progress.value.needsMetacognitiveChecklist)
  const isPausePending = computed(() => progress.value.needsConsciousPause)
  
  const currentLevelLabel = computed(() => {
    const map = { BASIC: 'Básico', INTERMEDIATE: 'Intermedio', ADVANCED: 'Avanzado' }
    return map[progress.value.level] || progress.value.level
  })

  // Acciones
  const setProgress = (newProgress: Partial<StudentProgress>) => {
    progress.value = { ...progress.value, ...newProgress }
  }

  const addPoints = (points: number) => {
    progress.value.totalPoints += points
    progress.value.sessionPoints += points
  }

  const addBadge = (badgeId: string) => {
    if (!progress.value.earnedBadges.includes(badgeId)) {
      progress.value.earnedBadges.push(badgeId)
    }
  }

  const updateStreak = (streak: number) => {
    progress.value.currentStreak = streak
    if (streak > progress.value.longestStreak) {
      progress.value.longestStreak = streak
    }
  }

  const requestChecklist = (message?: string) => {
    progress.value.needsMetacognitiveChecklist = true
    if (message) progress.value.lastFeedbackMessage = message
  }

  const completeChecklist = () => {
    progress.value.needsMetacognitiveChecklist = false
    progress.value.lastFeedbackMessage = null
  }

  const incrementActivityCount = () => {
    progress.value.activitiesCompleted += 1
    progress.value.activitiesSinceLastPause += 1
    if (progress.value.activitiesSinceLastPause >= 3) {
      progress.value.needsConsciousPause = true
    }
  }

  const completeConsciousPause = () => {
    progress.value.needsConsciousPause = false
    progress.value.activitiesSinceLastPause = 0
  }

  /**
   * Actualiza las barras de progreso de la UI con datos frescos del servidor.
   * Debe llamarse después de cada submit exitoso.
   */
  const updateProgressBars = (bars: { activity: number, phase: number, level: number }) => {
    progress.value.currentActivityProgress = bars.activity
    progress.value.currentPhaseProgress = bars.phase
    progress.value.currentLevelProgress = bars.level
  }

  return {
    progress,
    isChecklistPending,
    isPausePending,
    currentLevelLabel,
    setProgress,
    addPoints,
    addBadge,
    updateStreak,
    requestChecklist,
    completeChecklist,
    incrementActivityCount,
    completeConsciousPause,
    updateProgressBars
  }
})
