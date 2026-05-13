export enum ActionType {
  NEXT_ACTIVITY = 'NEXT_ACTIVITY',
  REINFORCEMENT = 'REINFORCEMENT',
  STRATEGY_GUIDE = 'STRATEGY_GUIDE',
  METACOGNITIVE_ALERT = 'METACOGNITIVE_ALERT',
  CHALLENGE_UNLOCK = 'CHALLENGE_UNLOCK',
  GO_BACK_TO_PHASE_1 = 'GO_BACK_TO_PHASE_1'
}

export interface StudentModel {
  id: string
  level: 'BASIC' | 'INTERMEDIATE' | 'ADVANCED'
  phase: 'ANALYSIS' | 'EVALUATION' | 'JUDGMENT' | 'FINISHED'
  currentStreakDays: number
  // Indicadores de Aprendizaje (Sección 11.2)
  globalAccuracy: number
  ipc: number               // Índice de Pensamiento Crítico (Ponderado 30/35/35)
  calibrationIndex: number  // Precisión en autoevaluación
  progressionRate: number
  recoveryIndex: number     // Éxito en refuerzos
  helpRequestRate: number
  metacognitiveScore: number
  subPhase?: string
  totalPoints: number
  lastSessionDate?: string
  // Seguimiento de errores para algoritmo adaptativo
  subPhaseErrorCount?: number
  subPhaseConsecutiveErrors?: number
}

export interface ActivityResult {
  activityId: string
  baseScore: number
  timeSpentSeconds: number
  priorConfidenceStars: number
  reflectionText?: string
  helpRequestsCount: number // Nivel 2: Microinteracciones (11.1.2)
  subPhase?: string
  metacognitiveAnswers?: {
    before?: string
    during?: string
    after?: string
  }
}

export interface ScoreDetails {
  basePoints: number
  speedBonus: number
  metacognitiveBonus: number
  streakMultiplier: number
  totalGained: number
  // Nuevos indicadores de la sesión
  sessionIPC: number
  sessionCalibration: number
}

export interface PedagogicalDecision {
  action: ActionType
  secondaryActions: ActionType[]
  message: string
  scoreDetails: ScoreDetails
  cognitiveLevel: 'RECORDAR' | 'COMPRENDER' | 'ANALIZAR' | 'APLICAR' | 'EVALUAR' | 'CREAR'
  temporaryDifficultyReduction: boolean
  unlockChapter?: number
}
