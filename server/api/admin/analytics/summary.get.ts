import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session.user || (session.user.role !== 'ADMIN' && session.user.role !== 'TEACHER')) {
    throw createError({ statusCode: 403, statusMessage: 'Acceso denegado: Se requiere rol administrativo o docente' })
  }

  try {
    // 1. Obtener todos los estudiantes con sus progresos e intentos
    const studentProfiles = await prisma.studentProfile.findMany({
      include: {
        user: true,
        progresses: true,
        attempts: true
      }
    })

    // 2. Calcular KPIs del grupo (Sección 11.2)
    const activeCount = studentProfiles.length
    let totalIPC = 0
    let totalLevelsCompleted = 0

    const studentsList = studentProfiles.map(profile => {
      const avgScore = profile.attempts.length > 0 
        ? profile.attempts.reduce((acc, curr) => acc + (curr.puntajeObtenido || 0), 0) / profile.attempts.length
        : 0
      
      totalIPC += avgScore
      
      // Contar niveles completados (fases al 100%)
      totalLevelsCompleted += profile.progresses.filter(p => p.percentCompleted === 100).length

      return {
        id: profile.codigoEstudiantil || profile.id,
        name: profile.user.name,
        level: profile.progresses[0]?.level || 'BASIC',
        ipc: Math.round(avgScore),
        progress: profile.progresses[0]?.percentCompleted || 0
      }
    })

    const groupIPC = activeCount > 0 ? Math.round(totalIPC / activeCount) : 0

    // 3. Obtener errores frecuentes (Sección 11.3)
    const errorStats = await prisma.errorPattern.groupBy({
      by: ['tipoError'],
      _count: {
        _all: true
      },
      orderBy: {
        _count: {
          tipoError: 'desc'
        }
      },
      take: 3
    })

    const frequentErrors = errorStats.map(err => ({
      type: err.tipoError,
      count: err._count._all,
      phase: 'Múltiples'
    }))

    return {
      groupStats: [
        { label: 'Promedio IPC Grupo', value: groupIPC.toString(), icon: '🧠' },
        { label: 'Estudiantes Activos', value: activeCount.toString(), icon: '👥' },
        { label: 'Hitos Alcanzados', value: totalLevelsCompleted.toString(), icon: '🏆' }
      ],
      students: studentsList,
      frequentErrors
    }

  } catch (error) {
    console.error('Error en Analítica:', error)
    throw createError({ statusCode: 500, statusMessage: 'Error al procesar analítica grupal' })
  }
})
