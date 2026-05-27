import { prisma } from '~/server/utils/prisma'
import type { Level } from '@prisma/client'

/**
 * Calcula el nivel inicial del estudiante a partir de las respuestas JOL.
 * Excluye jol3 (tiempo estimado) ya que es una estimación, no una medida de habilidad.
 *
 * Escala:
 *   promedio >= 4.0  → ADVANCED
 *   promedio >= 2.5  → INTERMEDIATE
 *   promedio  < 2.5  → BASIC
 */
export function calcularNivelDesdeJOL(jol: {
  jol1?: number | null
  jol2?: number | null
  jol4?: number | null
  jol5?: number | null
}): Level {
  const scores = [
    jol.jol1,
    jol.jol2,
    jol.jol4,
    jol.jol5
  ].filter((v): v is number => typeof v === 'number' && v > 0)

  if (scores.length === 0) return 'BASIC'

  const promedio = scores.reduce((a, b) => a + b, 0) / scores.length

  if (promedio >= 4.0) return 'ADVANCED'
  if (promedio >= 2.5) return 'INTERMEDIATE'
  return 'BASIC'
}

/**
 * Asciende o desciende un nivel.
 */
export function subirNivel(nivel: Level): Level {
  if (nivel === 'BASIC') return 'INTERMEDIATE'
  if (nivel === 'INTERMEDIATE') return 'ADVANCED'
  return 'ADVANCED'
}

export function bajarNivel(nivel: Level): Level {
  if (nivel === 'ADVANCED') return 'INTERMEDIATE'
  if (nivel === 'INTERMEDIATE') return 'BASIC'
  return 'BASIC'
}

export const NIVEL_LABELS: Record<Level, { label: string; emoji: string; color: string; description: string }> = {
  BASIC: {
    label: 'Básico',
    emoji: '🟢',
    color: 'emerald',
    description: 'Trabajarás con preguntas que te ayudarán a construir tu comprensión del tema paso a paso.'
  },
  INTERMEDIATE: {
    label: 'Intermedio',
    emoji: '🔵',
    color: 'indigo',
    description: 'Enfrentarás preguntas que requieren analizar y relacionar información de varias fuentes.'
  },
  ADVANCED: {
    label: 'Avanzado',
    emoji: '🔴',
    color: 'red',
    description: 'Te esperan preguntas complejas que pondrán a prueba tu pensamiento crítico al máximo.'
  }
}
