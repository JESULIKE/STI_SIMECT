import { prisma } from '~/server/utils/prisma'

// ── CATÁLOGO MAESTRO DE INSIGNIAS (Sección 9.3) ────────────────────────────
export const BADGE_CATALOG = [
  {
    nombre: 'Primer Paso',
    descripcion: 'Has comenzado tu viaje de pensamiento crítico. ¡Este es el primer paso hacia la conciencia ambiental!',
    icono: '🌱',
    condiciones: { type: 'FIRST_ACTIVITY' }
  },
  {
    nombre: 'Analista',
    descripcion: 'Dominas el análisis de información. Has demostrado capacidad para identificar hechos relevantes y separar datos de opiniones.',
    icono: '🔍',
    condiciones: { type: 'PHASE_COMPLETE', phase: 'ANALYSIS' }
  },
  {
    nombre: 'Evaluador Crítico',
    descripcion: 'Tu capacidad de evaluar información es sobresaliente. Puedes determinar la credibilidad de las fuentes con precisión.',
    icono: '⚖️',
    condiciones: { type: 'PHASE_COMPLETE', phase: 'EVALUATION' }
  },
  {
    nombre: 'Juez Razonado',
    descripcion: 'Formulas juicios argumentados con excelencia. Tu pensamiento crítico está plenamente desarrollado.',
    icono: '📝',
    condiciones: { type: 'PHASE_COMPLETE', phase: 'JUDGMENT' }
  },
  {
    nombre: 'Guardián del Bosque',
    descripcion: 'Has dominado el pensamiento básico sobre la deforestación y las inundaciones. ¡Eres un guardián de los ecosistemas!',
    icono: '🌲',
    condiciones: { type: 'LEVEL_COMPLETE', level: 'BASIC' }
  },
  {
    nombre: 'Defensor del Ecosistema',
    descripcion: 'Tu pensamiento crítico de nivel intermedio te permite analizar complejos problemas ambientales. ¡Eres un verdadero defensor!',
    icono: '🌿',
    condiciones: { type: 'LEVEL_COMPLETE', level: 'INTERMEDIATE' }
  },
  {
    nombre: 'Héroe Ambiental',
    descripcion: '¡Has alcanzado el dominio completo del pensamiento crítico ambiental! Eres un héroe de la conciencia ecológica de Montería.',
    icono: '🦸',
    condiciones: { type: 'LEVEL_COMPLETE', level: 'ADVANCED' }
  },
  {
    nombre: 'Mente Reflexiva',
    descripcion: 'La práctica constante de la metacognición te ha convertido en un pensador más consciente de sus propios procesos mentales.',
    icono: '🧘',
    condiciones: { type: 'REFLECTIONS_COUNT', count: 10 }
  },
  {
    nombre: 'Constante',
    descripcion: 'La disciplina y regularidad son tus fortalezas. Mantuviste 3 días consecutivos de práctica.',
    icono: '🔥',
    condiciones: { type: 'STREAK', days: 3 }
  },
  {
    nombre: 'Dedicado',
    descripcion: 'Tu compromiso sostenido con el aprendizaje es admirable. ¡7 días consecutivos de práctica intelectual!',
    icono: '💎',
    condiciones: { type: 'STREAK', days: 7 }
  },
  {
    nombre: 'Perfección',
    descripcion: 'Obtuviste el máximo desempeño posible en una actividad. ¡El análisis perfecto es una habilidad excepcional!',
    icono: '⭐',
    condiciones: { type: 'PERFECT_SCORE' }
  },
  {
    nombre: 'Mente Ágil',
    descripcion: 'Tu velocidad combinada con precisión es impresionante. Completaste 5 actividades en menos de 90 segundos con más del 85% de acierto.',
    icono: '⚡',
    condiciones: { type: 'SPEED_ACCURACY', count: 5, maxSeconds: 90, minScore: 85 }
  },
  {
    nombre: 'Persistente',
    descripcion: 'Superaste una actividad de refuerzo en tu primer intento. ¡La resiliencia cognitiva es tu poder!',
    icono: '💪',
    condiciones: { type: 'REINFORCEMENT_FIRST_TRY', minScore: 80 }
  },
  {
    nombre: 'Autoconocimiento',
    descripcion: 'Tu calibración metacognitiva precisa y consistente demuestra un alto nivel de autoconocimiento intelectual.',
    icono: '🪞',
    condiciones: { type: 'PRECISE_CALIBRATION', count: 5 }
  }
]

/**
 * Verifica y otorga insignias basadas en el desempeño actual y el historial (Sección 9.3)
 */
export async function checkAndAwardBadges(
  studentProfileId: string,
  activityResult: any,
  context?: {
    isPhaseComplete?: boolean
    completedPhase?: string
    isLevelComplete?: boolean
    completedLevel?: string
    isReinforcement?: boolean
  }
) {
  const newBadges: any[] = []

  try {
    // 1. Obtener historial mínimo necesario (solo campos usados en las reglas de insignias)
    const [profile, allBadges] = await Promise.all([
      prisma.studentProfile.findUnique({
        where: { id: studentProfileId },
        select: {
          id: true,
          currentStreak: true,
          attempts: {
            select: {
              puntajeObtenido: true,
              tiempoSegundos: true,
              activityId: true,
              feedbackRecibido: true
            }
          },
          earnedBadges: {
            select: { badgeId: true }
          },
          reflections: {
            select: { id: true }
          }
        }
      }),
      prisma.badge.findMany()
    ])

    if (!profile) return []

    const alreadyEarnedIds = profile.earnedBadges.map((eb: any) => eb.badgeId)
    const scoreDetails = activityResult?.scoreDetails || activityResult
    const basePoints = scoreDetails?.basePoints || 0

    // Helper para registrar insignia si aún no la tiene
    const tryAward = (badgeName: string) => {
      const badge = allBadges.find(b => b.nombre === badgeName)
      if (badge && !alreadyEarnedIds.includes(badge.id)) {
        newBadges.push(badge)
        alreadyEarnedIds.push(badge.id) // Evitar duplicados en la misma sesión
      }
    }

    // ── REGLA 1: Primer Paso ─────────────────────────────────────────────
    const successfulAttempts = profile.attempts.filter(a => (a.puntajeObtenido || 0) >= 10)
    if (successfulAttempts.length >= 1) {
      tryAward('Primer Paso')
    }

    // ── REGLA 2, 3 & 4: Completar Fase ───────────────────────────────────
    if (context?.isPhaseComplete && context.completedPhase) {
      if (context.completedPhase === 'ANALYSIS') tryAward('Analista')
      if (context.completedPhase === 'EVALUATION') tryAward('Evaluador Crítico')
      if (context.completedPhase === 'JUDGMENT') tryAward('Juez Razonado')
    }

    // ── REGLA 5, 6 & 7: Completar Nivel ──────────────────────────────────
    if (context?.isLevelComplete && context.completedLevel) {
      if (context.completedLevel === 'BASIC') tryAward('Guardián del Bosque')
      if (context.completedLevel === 'INTERMEDIATE') tryAward('Defensor del Ecosistema')
      if (context.completedLevel === 'ADVANCED') tryAward('Héroe Ambiental')
    }

    // ── REGLA 8: Mente Reflexiva (10 reflexiones sustanciales) ────────────
    if (profile.reflections.length >= 10) {
      tryAward('Mente Reflexiva')
    }

    // ── REGLA 9 & 10: Rachas ─────────────────────────────────────────────
    if (profile.currentStreak >= 7) {
      tryAward('Dedicado')
      tryAward('Constante')
    } else if (profile.currentStreak >= 3) {
      tryAward('Constante')
    }

    // ── REGLA 11: Perfección (100% en actividad principal) ────────────────
    if (basePoints >= 100) {
      tryAward('Perfección')
    }

    // ── REGLA 12: Mente Ágil (5 actividades < 90s con > 85%) ─────────────
    const speedAccurateAttempts = profile.attempts.filter(a =>
      (a.tiempoSegundos || 999) < 90 && (a.puntajeObtenido || 0) > 85
    )
    if (speedAccurateAttempts.length >= 5) {
      tryAward('Mente Ágil')
    }

    // ── REGLA 13: Persistente (Actividad de refuerzo, primer intento > 80%) ─
    if (context?.isReinforcement && basePoints > 80) {
      const activityId = activityResult?.activityId
      if (activityId) {
        const previousAttempts = profile.attempts.filter(a => a.activityId === activityId)
        if (previousAttempts.length <= 1) {
          tryAward('Persistente')
        }
      }
    }

    // ── REGLA 14: Autoconocimiento (5 calibraciones precisas) ─────────────
    const preciseCalibrationsCount = profile.attempts.filter(a => {
      const feedback = a.feedbackRecibido as any
      const calibration = feedback?.scoreDetails?.sessionCalibration
      return calibration !== undefined && calibration >= 85
    }).length

    if (preciseCalibrationsCount >= 5) {
      tryAward('Autoconocimiento')
    }

    // ── GUARDAR EN BD LAS NUEVAS INSIGNIAS ───────────────────────────────
    if (newBadges.length > 0) {
      await prisma.earnedBadge.createMany({
        data: newBadges.map(b => ({
          studentProfileId,
          badgeId: b.id
        })),
        skipDuplicates: true
      })
      console.log(`[Gamification] Insignias otorgadas: ${newBadges.map(b => b.nombre).join(', ')}`)
    }

    return newBadges.map(b => ({
      id: b.id,
      nombre: b.nombre,
      descripcion: b.descripcion,
      icono: b.icono
    }))

  } catch (error) {
    console.error('Error en motor de insignias:', error)
    return []
  }
}
