import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Verifica y otorga insignias basadas en el desempeño actual y el historial
 */
export async function checkAndAwardBadges(studentProfileId: string, activityResult: any) {
  const newBadges = []

  try {
    // 1. Obtener historial y insignias ya ganadas
    const profile = await prisma.studentProfile.findUnique({
      where: { id: studentProfileId },
      include: { 
        attempts: true, 
        earnedBadges: true 
      }
    })

    if (!profile) return []

    const alreadyEarnedIds = profile.earnedBadges.map(eb => eb.badgeId)
    const allBadges = await prisma.badge.findMany()

    // 2. REGLA: Primera Actividad (Insignia "Primer Paso")
    const firstStepBadge = allBadges.find(b => b.nombre === 'Primer Paso')
    if (firstStepBadge && !alreadyEarnedIds.includes(firstStepBadge.id)) {
      if (profile.attempts.length >= 1) {
        newBadges.push(firstStepBadge)
      }
    }

    // 3. REGLA: Analista Estrella (IPC > 90 en una actividad)
    const analystBadge = allBadges.find(b => b.nombre === 'Analista Estrella')
    if (analystBadge && !alreadyEarnedIds.includes(analystBadge.id)) {
      if (activityResult.scoreDetails.basePoints >= 90) {
        newBadges.push(analystBadge)
      }
    }

    // 4. GUARDAR EN BD LAS NUEVAS INSIGNIAS
    if (newBadges.length > 0) {
      await prisma.earnedBadge.createMany({
        data: newBadges.map(b => ({
          studentProfileId,
          badgeId: b.id
        })),
        skipDuplicates: true
      })
    }

    return newBadges
  } catch (error) {
    console.error('Error en motor de insignias:', error)
    return []
  }
}
