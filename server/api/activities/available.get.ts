import { PrismaClient, Level, Phase } from '@prisma/client'
import { getTutorTone } from '~/server/utils/pedagogicalEngine'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const studentProfileId = session.user?.studentProfileId
  const query = getQuery(event)
  
  const levelRaw = (query.level as string) || 'BASIC'
  const phaseRaw = (query.phase as string) || 'ANALYSIS'
  
  const level = levelRaw.toUpperCase() as Level
  const phase = phaseRaw.toUpperCase() as Phase

  try {
    // 0. Verificar que el perfil existe realmente en la DB
    if (studentProfileId) {
      const profileExists = await prisma.studentProfile.findUnique({ where: { id: studentProfileId } })
      if (!profileExists) {
         console.warn(`Sesión huérfana detectada para ID: ${studentProfileId}. Requiere re-login.`)
         return {
           success: false,
           error: 'SESSION_ORPHAN',
           message: 'Tu sesión ha expirado debido a un reinicio del sistema. Por favor, cierra sesión e ingresa nuevamente.'
         }
      }
    }

    // 1. Buscar intentos previos del estudiante para filtrar
    const completedActivityIds: string[] = []
    if (studentProfileId) {
      const attempts = await prisma.activityAttempt.findMany({
        where: { 
          studentProfileId,
          puntajeObtenido: { gte: 10 }
        },
        select: { activityId: true }
      })
      attempts.forEach(a => completedActivityIds.push(a.activityId))
    }

    // 2. Buscar actividades no completadas para el nivel actual del estudiante
    // Primero determinar la subfase activa (la primera que no esté completa)
    const subPhaseOrder = ['1.1', '1.2', '2.1', '2.2', '3.1', '3.2']
    let activeSubPhase: string | null = null

    if (studentProfileId) {
      for (const sp of subPhaseOrder) {
        const completedInSp = await prisma.activityAttempt.count({
          where: {
            studentProfileId,
            puntajeObtenido: { gte: 10 },
            activity: { fase: phase, nivel: level, subPhase: sp }
          }
        })
        const totalInSp = await prisma.activity.count({
          where: { fase: phase, nivel: level, subPhase: sp, isPublished: true }
        })
        if (totalInSp > 0 && completedInSp < totalInSp) {
          activeSubPhase = sp
          break
        }
      }
    }

    // 3. Buscar actividades no completadas de la subfase activa
    const activities = await prisma.activity.findMany({
      where: { 
        nivel: level, 
        fase: phase,
        subPhase: activeSubPhase || undefined,
        isPublished: true,
        id: { notIn: completedActivityIds }
      },
      orderBy: { createdAt: 'asc' }
    })

    // 4. Calcular progreso actual de la subfase para el frontend
    let subPhaseProgress = { completed: 0, total: 0, percent: 0, currentSubPhase: activeSubPhase }
    if (studentProfileId && activeSubPhase) {
      const completed = await prisma.activityAttempt.count({
        where: {
          studentProfileId,
          puntajeObtenido: { gte: 10 },
          activity: { fase: phase, nivel: level, subPhase: activeSubPhase }
        }
      })
      const total = await prisma.activity.count({
        where: { fase: phase, nivel: level, subPhase: activeSubPhase, isPublished: true }
      })
      subPhaseProgress = {
        completed,
        total,
        percent: total > 0 ? Math.round((completed / total) * 100) : 0,
        currentSubPhase: activeSubPhase
      }
    }

    // 5. Obtener contexto pedagógico reactivo
    let pedagogicalContext = { tone: 'NORMAL', message: '¡Hola! Vamos a empezar.' }
    if (studentProfileId) {
      const lastChecklist = await prisma.metacognitionChecklist.findFirst({
        where: { studentProfileId },
        orderBy: { createdAt: 'desc' }
      })
      pedagogicalContext = getTutorTone(lastChecklist)
    }

    return {
      success: true,
      data: activities,
      context: pedagogicalContext,
      subPhaseProgress
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Error al obtener actividades disponibles',
      message: error.message
    })
  }
})
